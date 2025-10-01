<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\ClassSchedule;
use App\Models\Hall;
use App\Models\Course;
use App\Models\User;

class ClassScheduleController extends Controller
{
   /* ───── helpers ───── */
    protected function isAdmin(Request $r): bool     { return $r->user()?->role === 'admin';      }
    protected function isLecturer(Request $r): bool  { return $r->user()?->role === 'lecturer';   }

    protected function forbid() {
        abort(response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN));
    }

    /* ───── validation rules shared by admin create / admin update ───── */
    private function baseRules(): array
    {
        return [
            'hall_id'     => 'required|integer|exists:halls,id',
            'course_id'   => 'required|integer|exists:courses,id',
            'start_time' => 'required|date_format:H:i',
             'end_time'   => 'required|date_format:H:i',
            'day'         => 'required|string',
        ];
    }

    /* ───── create (admin only) ───── */
    public function store(Request $r)
    {
        if (!$this->isAdmin($r)) $this->forbid();

        $data = $r->validate($this->baseRules());

        // validate time
        $start = \Carbon\Carbon::createFromFormat('H:i', $data['start_time']);
        $end   = \Carbon\Carbon::createFromFormat('H:i', $data['end_time']);

        if ($start->equalTo($end)) {
            return response()->json([
                'message' => 'Start time and end time cannot be the same'
            ], 422);
        }

        if ($start->greaterThan($end)) {
            return response()->json([
                'message' => 'End time must be after start time'
            ], 422);
        }

        // 1. hall conflict
        $hallBusy = ClassSchedule::where('hall_id', $data['hall_id'])
            ->where('day', $data['day'])
            ->where(function ($q) use ($data) {
                $q->where('start_time', '<', $data['end_time'])
                ->where('end_time',   '>', $data['start_time']);
            })
            ->exists();

        if ($hallBusy) {
            return response()->json(['message'=>'Hall is already booked for this time'], 422);
        }

        // 2. course once per day
        $courseOncePerDay = ClassSchedule::where('course_id', $data['course_id'])
            ->where('day', $data['day'])
            ->exists();

        if ($courseOncePerDay) {
            return response()->json(['message'=>'Course already scheduled for this day'], 422);
        }

        $schedule = ClassSchedule::create($data + ['status' => 'holding']);

        return response()->json([
            'message' => 'Class schedule created successfully',
            'data'    => $schedule
        ], Response::HTTP_CREATED);
    }

    /* ───── update ───── */
    public function update(Request $r, ClassSchedule $schedule)
    {
        if (!$this->isAdmin($r) && !$this->isLecturer($r)) $this->forbid();

        if ($this->isLecturer($r)) {
            // lecturer may change only status
            $data = $r->validate(['status' => 'required|string']);

            //validate time
          if (isset($data['start_time']) && isset($data['end_time'])) {
            $start = \Carbon\Carbon::createFromFormat('H:i', $data['start_time']);
            $end   = \Carbon\Carbon::createFromFormat('H:i', $data['end_time']);

            if ($start->equalTo($end)) {
                return response()->json([
                    'message' => 'Start time and end time cannot be the same'
                ], 422);
            }

            if ($start->greaterThan($end)) {
                return response()->json([
                    'message' => 'End time must be after start time'
                ], 422);
            }
        }  


            $schedule->update($data);
            return response()->json([
                'message' => 'Status updated successfully',
                'data'    => $schedule
            ]);
        }

        // admin: may edit all except status
        $rules = $this->baseRules();
        unset($rules['status']);

        $data = $r->validate($rules);

        // repeat conflict checks
        $timeChanged = isset($data['start_time']) || isset($data['end_time']) || isset($data['day']) || isset($data['hall_id']);
        if ($timeChanged) {
            $tmp = array_merge($schedule->toArray(), $data);

            $hallBusy = ClassSchedule::where('id', '!=', $schedule->id)
                ->where('hall_id', $tmp['hall_id'])
                ->where('day', $tmp['day'])
                ->where(function ($q) use ($tmp) {
                    $q->where('start_time', '<', $tmp['end_time'])
                    ->where('end_time',   '>', $tmp['start_time']);
                })
                ->exists();


            if ($hallBusy) {
                return response()->json(['message'=>'Hall conflict detected'], 422);
            }
        }

        $schedule->update($data);

        return response()->json([
            'message' => 'Class schedule updated successfully',
            'data'    => $schedule
        ]);
    }

    /* ───── delete (admin only) ───── */
    public function destroy(Request $r, ClassSchedule $schedule)
    {
        if (!$this->isAdmin($r)) $this->forbid();

        $schedule->delete();

        return response()->json([
            'message' => 'Class schedule deleted successfully',
            'data'    => null
        ]);
    }

    public function show(Request $r, ClassSchedule $schedule)
    {
        if (!$this->isAdmin($r) && !$this->isLecturer($r)) $this->forbid();

        // lecturers may only view their own course schedules
        if ($this->isLecturer($r) && $schedule->course->lecturer_id !== $r->user()->id) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $hall     = optional($schedule->hall);
        $course   = optional($schedule->course);
        $lecturer = optional($course->lecturer);

        return response()->json([
            'message' => 'Class schedule fetched',
            // 'data'    => [
            //     'id'           => $schedule->id,
            //      'course_id'    => $course->id,  
            //     'hall_name'    => $hall->hall_name,
            //     'course_title' => $course->course_title,
            //     'course_code'  => $course->course_code,
            //     'start_time'   => $schedule->start_time,
            //     'end_time'     => $schedule->end_time,
            //     'day'          => $schedule->day,
            //     'status'       => $schedule->status,
            //     'lecturer'     => $lecturer->first_name
            //                     ? $lecturer->first_name . ' ' . $lecturer->last_name
            //                     : null,
            // ]
            'data'    => [
                'id'           => $schedule->id,
                'course_id'    => $course->id,    // ✅ add this
                'hall_id'      => $hall->id,      // ✅ add this
                'hall_name'    => $hall->hall_name,
                'course_title' => $course->course_title,
                'course_code'  => $course->course_code,
                'start_time'   => $schedule->start_time,
                'end_time'     => $schedule->end_time,
                'day'          => $schedule->day,
                'status'       => $schedule->status,
                'lecturer'     => $lecturer->first_name
                                ? $lecturer->first_name . ' ' . $lecturer->last_name
                                : null,
            ]
        ]);
    }


    public function today(Request $r)
    {
        $user  = $r->user();
        $today = now()->format('l');   // Monday, Tuesday…

        $query = ClassSchedule::with([
            'hall:id,hall_name',
            'course:id,course_title,course_code,lecturer_id',
            'course.lecturer:id,first_name,last_name'
        ])->where('day', $today)
            ->orderBy('start_time'); // ✅ sort by time

    
        if ($this->isLecturer($r)) {
            $query->whereIn('course_id', $user->courses->pluck('id'));
        } elseif ($user->role === 'student') {
            $query->whereIn('course_id', $user->registeredCourses->pluck('id'));
        }

        $schedules = $query->get()->map(fn($s) => $this->mapSchedule($s));

        return response()->json([
            'message' => 'Today schedule fetched',
            'data'    => $schedules
        ]);
    }





    public function index(Request $r)
    {
        $user = $r->user();

        $query = ClassSchedule::with([
            'hall:id,hall_name',
            'course:id,course_title,course_code,lecturer_id',
            'course.lecturer:id,first_name,last_name'
        ]);

        if ($this->isLecturer($r)) {
            // lecturer: only schedules for their courses
            $query->whereIn('course_id', $user->courses->pluck('id'));
        } elseif ($user->role === 'student') {
            // student: only schedules for registered courses
            $query->whereIn('course_id', $user->registeredCourses->pluck('id'));
        }
         // 🔹 Filter by course_code if provided
        if ($r->has('course_code')) {
            $query->whereHas('course', function ($q) use ($r) {
                $q->where('course_code', $r->course_code);
            });
        }
        if ($r->has('course_id')) {
            $query->where('course_id', $r->course_id);
        }

        $schedules = $query->get()->map(fn($s) => $this->mapSchedule($s));

        return response()->json([
            'message' => 'All schedules fetched',
            'data'    => $schedules
        ]);
    }


 
    private function mapSchedule(ClassSchedule $s): array
    {
        
        $hall     = optional($s->hall);
        $course   = optional($s->course);
        $lecturer = optional($course->lecturer);

        return [
            'id'           => $s->id,
            'hall_name'    => $hall->hall_name,
            'course_title' => $course->course_title,
            'course_code'  => $course->course_code,
            'start_time'   => $s->start_time,
            'end_time'     => $s->end_time,
            'day'          => $s->day,
            'status'       => $s->status,
            'lecturer'     => $lecturer->first_name
                ? $lecturer->first_name . ' ' . $lecturer->last_name
                : null,
        ];
    }

}
