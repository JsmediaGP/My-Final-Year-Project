<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Attendance;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $students = [1, 8]; // student IDs
        $schedules = [2, 3, 4, 6]; // class_schedule IDs

        foreach ($students as $studentId) {
            foreach ($schedules as $scheduleId) {
                for ($i = 0; $i < 10; $i++) {
                    Attendance::create([
                        'student_id' => $studentId,
                        'class_schedule_id' => $scheduleId,
                        'date' => Carbon::now()->addDays($i), // sequential dates
                        // 'status' left null
                    ]);
                }
            }
        }
    }
}
