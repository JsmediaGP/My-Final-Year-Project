<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class CourseController extends Controller
{
     protected function checkAdmin(Request $request): void
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(
                response()->json(
                    ['message' => 'Unauthorized: Admin access required'],
                    Response::HTTP_FORBIDDEN
                )
            );
        }
    }

    // public function index(Request $request)
    // {
    //     $this->checkAdmin($request);
    //     return Course::with('lecturer:id,first_name,last_name')->get();
    // }
    public function availableCourses(Request $request)
    {
        $courses = Course::all();
        return response()->json([
            'message' => 'Courses fetched',
            'data'    => $courses
        ]);
    }

    public function index(Request $request)
    {
        // ⬇️ 1. Who is calling?
        $user = $request->user();

        // ⬇️ 2. Start the query (always eager‑load the lecturer’s basic info)
        $query = Course::with('lecturer:id,first_name,last_name');

        // ⬇️ 3. Filter by role
        switch ($user->role) {
            case 'lecturer':
                // lecturer: only his / her courses
                $query->where('lecturer_id', $user->id);
                break;

            case 'student':
                // student: only registered courses (pivot table course_registrations)
                $query->whereIn(
                    'id',
                    $user->registeredCourses()->pluck('courses.id')
                );
                break;

            case 'admin':
            default:
                // admin → no extra filter
                break;
        }

        // ⬇️ 4. Fetch and return with consistent JSON wrapper
        return response()->json([
            'message' => 'Courses fetched',
            'data'    => $query->get()
        ]);
    }


    public function store(Request $request)
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'course_title' => 'required|string',
            'course_code'  => 'required|string|unique:courses',
            'unit'         => 'required|integer|min:1',
            'lecturer_id'  => 'required|exists:users,id',
        ]);

        // ensure lecturer_id belongs to a lecturer
        $validLecturer = User::where('id', $data['lecturer_id'])
                             ->where('role', 'lecturer')
                             ->exists();

        if (!$validLecturer) {
            return response()->json(
                ['error' => 'lecturer_id must refer to a user with role lecturer'],
                422
            );
        }

        $course = Course::create($data);
        return response()->json(['course' => $course], 201);
    }

    public function show(Request $request, Course $course)
    {
        $this->checkAdmin($request);
        return $course->load('lecturer');
    }

    public function update(Request $request, Course $course)
    {
        $this->checkAdmin($request);

        $data = $request->validate([
            'course_title' => 'sometimes|string',
            'course_code'  => 'sometimes|string|unique:courses,course_code,' . $course->id,
            'unit'         => 'sometimes|integer|min:1',
            'lecturer_id'  => 'sometimes|exists:users,id',
        ]);

        if (isset($data['lecturer_id'])) {
            $validLecturer = User::where('id', $data['lecturer_id'])
                                 ->where('role', 'lecturer')
                                 ->exists();
            if (!$validLecturer) {
                return response()->json(
                    ['error' => 'lecturer_id must refer to a user with role lecturer'],
                    422
                );
            }
        }

        $course->update($data);
        return response()->json([
            'message'=> 'Course updated successfully',
            'course' => $course], Response::HTTP_OK);
    }

    public function destroy(Request $request, Course $course)
    {
        $this->checkAdmin($request);
        $course->delete();
        return response()->json(['message' => 'Course deleted']);
    }

    public function count(Request $request)
{
    $this->checkAdmin($request);
    $count = Course::count();
    return response()->json([
        'message' => 'Total courses fetched successfully',
        'data' => ['courses' => $count],
        ], Response::HTTP_OK);
}

    public function getCourseStudents(Request $request)
    {
        $courseId = $request->query('course_id');
        $user = $request->user();

        if (!$courseId) {
            return response()->json([
                'message' => 'Course ID is required',
                'data' => []
            ], 400);
        }

        // Ensure course belongs to this lecturer
        $course = Course::where('id', $courseId)
            ->where('lecturer_id', $user->id)
            ->with('students')
            ->first();

        if (!$course) {
            return response()->json([
                'message' => 'Course not found or not assigned to you',
                'data' => []
            ], 404);
        }

        $students = $course->students->map(function ($student) {
            return [
                'id' => $student->id,
                'matric_number' => $student->matric_number,
                'name' => $student->name ?? ($student->first_name . ' ' . $student->last_name)
            ];
        });

        return response()->json([
            'message' => 'Students fetched',
            'data' => $students
        ]);
    }



           
            


}
