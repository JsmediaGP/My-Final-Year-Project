<?php

namespace App\Services;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Models\Hall;
use App\Models\ClassSchedule;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Services\FacialRecognitionService; 


class AttendanceService
{
    
    protected $facialRecognitionService;

    public function __construct(FacialRecognitionService $facialRecognitionService)
    {
        $this->facialRecognitionService = $facialRecognitionService;
    }


    /**
     * Process attendance for a student
     *
     * @param User $user
     * @param string $hallName
     * @param string $imagePath
     * @return array
     */
    public function markAttendance(User $user, string $hallName, string $imagePath): array
    {
        $now = Carbon::now();

        // 1. Facial recognition check
        $match = $this->facialRecognitionService->compareFaces(
                  $imagePath, 
                  $user->picture 
    
        );

        if (!$match) {
            return [
                'status' => 'error',
                'message' => 'Facial recognition failed. Attendance not marked.',
                'status_code' => 403
            ];
        }

        // 2. Check if the hall exists
        $hall = Hall::where('hall_name', $hallName)->first();
        if (!$hall) {
            return [
                'status' => 'error',
                'message' => 'Invalid lecture hall.',
                'status_code' => 400
            ];
        }

        // 3. Check if a class is holding in this hall now
        $class = ClassSchedule::where('hall_id', $hall->id)
            ->where('day', $now->format('l'))
            ->whereTime('start_time', '<=', $now->format('H:i:s'))
            ->whereTime('end_time', '>=', $now->format('H:i:s'))
            ->where('status', 'holding')
            ->first();

        if (!$class) {
            return [
                'status' => 'error',
                'message' => 'No class is holding in this hall at this time.',
                'status_code' => 400
            ];
        }

        // 4. Check if attendance already marked
        $existing = Attendance::where('student_id', $user->id)
            ->where('class_schedule_id', $class->id)
            ->whereDate('created_at', $now->toDateString())
            ->exists();
           

        if ($existing) {
            return [
                'status' => 'success',
                'message' => "Attendance already marked for today.",
                'status_code' => 201
            ];
        }

        // 5. Mark attendance
        Attendance::create([
            'student_id' => $user->id,
            'class_schedule_id' => $class->id,
            'date' => $now
        ]);
        $courseName = $class->course ? $class->course->course_name : 'Unknown Course';

        return [
            'status' => 'success',
            'message' => " {$user->matric_number} Attendance marked successfully for {$courseName}  in hall {$hallName}.",
            'status_code' => 200
        ];
    }

   
    
}
