<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\Student;
use App\Models\Schedule;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;


class AttendanceController extends Controller
{
    // Fetch attendance with filters
    public function index(Request $request)
    {
        
         $user = $request->user(); // currently logged-in user
        $role = $user->role;

        // Base query with relationships
        $query = Attendance::with(['student','classSchedule.hall', 'classSchedule.course']);

        // Role-based filtering
        if ($role === 'lecturer') {
            // Lecturer sees only attendance for their courses
            $query->whereHas('classSchedule.course', function ($q) use ($user) {
                $q->where('lecturer_id', $user->id);
            });
        } elseif ($role === 'student') {
            // Student sees only their own attendance
            $query->where('student_id', $user->id);
        }
        // Admin sees all attendance — no additional filter

        // Optional filters
        if ($request->filled('matric_number')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('matric_number', $request->matric_number);
            });
        }

        if ($request->filled('course_code')) {
            $query->whereHas('classSchedule.course', function ($q) use ($request) {
                $q->where('course_code', $request->course_code);
            });
        }
        if ($request->filled('course_id')) {
            $query->whereHas('classSchedule.course', function ($q) use ($request) {
                $q->where('id', $request->course_id);
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Get results ordered by date
        $attendance = $query->orderBy('date', 'desc')->get();

        // Format response
        return response()->json([
            'message' => 'Attendance fetched',
            'data' => $attendance
        ]);
    }

    // Export CSV
    public function exportCsv(Request $request): StreamedResponse
    {
        $fileName = 'attendance.csv';
        $attendance = $this->getFilteredData($request);

        $headers = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
        ];

        $callback = function () use ($attendance) {
            $handle = fopen('php://output', 'w');

            // Header
            fputcsv($handle, ['Matric No', 'Name', 'Course', 'Day', 'Date', 'Status']);

            foreach ($attendance as $record) {
                fputcsv($handle, [
                    $record->student->matric_number,
                    $record->student->name,
                    $record->schedule->course->course_code . ' - ' . $record->schedule->course->course_title,
                    $record->schedule->day,
                    $record->date,
                    $record->status,
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    // Export PDF
    public function exportPdf(Request $request)
    {
        $attendance = $this->getFilteredData($request);

        $pdf = Pdf::loadView('attendance.export', ['attendance' => $attendance]);

        return $pdf->download('attendance.pdf');
    }

    // Helper for filters
    private function getFilteredData(Request $request)
    {
        $query = Attendance::with(['student', 'schedule.course']);

        if ($request->matric_number) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('matric_number', $request->matric_number);
            });
        }

        if ($request->course_code) {
            $query->whereHas('schedule.course', function ($q) use ($request) {
                $q->where('course_code', $request->course_code);
            });
        }

        if ($request->date) {
            $query->whereDate('date', $request->date);
        }

        return $query->orderBy('date', 'desc')->get();
    }
}
