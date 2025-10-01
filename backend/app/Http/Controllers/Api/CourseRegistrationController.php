<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CourseRegistration;
use App\Models\Course;
use App\Models\User;

class CourseRegistrationController extends Controller
{
     public function index()
    {
        $registrations = CourseRegistration::with(['student', 'course'])->get();

        return response()->json([
            'message' => 'Course registrations fetched',
            'data' => $registrations
        ], 200);
    }

    /**
     * Register a student to a course
     */
    
    public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'course_id'  => 'required|exists:courses,id',
        ]);

        // Prevent duplicate registration
        $exists = CourseRegistration::where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Student already registered for this course'
            ], 400);
        }

        $registration = CourseRegistration::create($validated);

        return response()->json([
            'message' => 'Course registered successfully',
            'data'    => $registration->load(['student', 'course'])
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors'  => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Server error',
            'error'   => $e->getMessage()
        ], 500);
    }
}


    /**
     * Get all courses for a student
     */
    public function getByStudent($studentId)
    {
        $student = User::find($studentId);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $courses = CourseRegistration::where('student_id', $studentId)
            ->with('course')
            ->get();

        return response()->json([
            'message' => 'Courses fetched successfully',
            'student' => $student,
            'courses' => $courses
        ], 200);
    }

    /**
     * Remove a student from a course
     */
    public function destroy($id)
    {
        $registration = CourseRegistration::find($id);

        if (!$registration) {
            return response()->json(['message' => 'Course registration not found'], 404);
        }

        $registration->delete();

        return response()->json(['message' => 'Course registration removed successfully'], 200);
    }
}
