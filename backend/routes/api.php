<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HallController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ClassScheduleController;
use App\Http\Controllers\Api\MarkAttendanceController;
use App\Http\Controllers\Api\CourseRegistrationController;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/students/count', [UserController::class, 'countStudents']);
    Route::get('/users/lecturers/count', [UserController::class, 'countLecturers']);
    Route::get('/users/lecturers', [UserController::class, 'listLecturers']);
    Route::post('/users/store', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

   

    // ───── Course Routes ─────
    Route::get('/courses', [CourseController::class, 'index']);           // list all
    Route::post('/courses/store', [CourseController::class, 'store']);          // create new
     Route::get('/courses/count', [CourseController::class, 'count']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);   // view one
    Route::put('/courses/{course}', [CourseController::class, 'update']); // update
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']); // delete

    // ----- Halls -----
    Route::get('halls/count',   [HallController::class, 'count']);   // keep first
    Route::get('halls',         [HallController::class, 'index']);
    Route::post('halls',        [HallController::class, 'store']);
    Route::get('halls/{hall}',  [HallController::class, 'show']);
    Route::put('halls/{hall}',  [HallController::class, 'update']);
    Route::delete('halls/{hall}', [HallController::class, 'destroy']);

    
      // ----- Class schedule -----
    Route::get('class-schedules/today', [ClassScheduleController::class, 'today']);
    Route::get('class-schedules', [ClassScheduleController::class, 'index']);
    Route::post('class-schedules',      [ClassScheduleController::class, 'store']);
    Route::get('class-schedules/{schedule}', [ClassScheduleController::class, 'show']);
    Route::put('class-schedules/{schedule}',  [ClassScheduleController::class, 'update']);
    Route::delete('class-schedules/{schedule}', [ClassScheduleController::class, 'destroy']);


    //------------ Attendnace Route -------
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::get('/attendance/export/csv', [AttendanceController::class, 'exportCsv']);
    Route::get('/attendance/export/pdf', [AttendanceController::class, 'exportPdf']);



 
});

Route::prefix('lecturer')->middleware('auth:sanctum')->group(function () {

    Route::get('/courses', [CourseController::class, 'index']);    
    Route::get('/course-students', [CourseController::class, 'getCourseStudents']);

    //class schedule 
    Route::get('class-schedules/today', [ClassScheduleController::class, 'today']);
    Route::get('class-schedules', [ClassScheduleController::class, 'index']);
    Route::put('class-schedules/{schedule}',  [ClassScheduleController::class, 'update']);
    // Route::get('class-schedules/{schedule}', [ClassScheduleController::class, 'show']);



    //attendance 
    Route::get('/attendance', [AttendanceController::class, 'index']);




});

 
Route::prefix('student')->middleware('auth:sanctum')->group(function () {

     Route::get('class-schedules/today', [ClassScheduleController::class, 'today']);
     Route::get('class-schedules', [ClassScheduleController::class, 'index']);
     Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/availableCourses', [CourseController::class, 'availableCourses']);
     
     

     Route::get('/course-registrations', [CourseRegistrationController::class, 'index']);
     Route::post('/course-registrations', [CourseRegistrationController::class, 'store']);
     Route::get('/course-registrations/student/{id}', [CourseRegistrationController::class, 'getByStudent']);
     Route::delete('/course-registrations/{id}', [CourseRegistrationController::class, 'destroy']);



    Route::get('/attendance', [AttendanceController::class, 'index']);



});

//here goes the controller to mark attendance 

Route::post('/rfid-scan', [MarkAttendanceController::class, 'scan']);

// Route::post('/rfid-scan', function (Request $request) {

// // Validate required fields
//         $request->validate([
//             'uid'       => 'required|string',
//             'hall_name' => 'required|string',
//             'image'     => 'required|file|mimes:jpg,jpeg,png|max:2048',
//         ]);

//         // Check if the UID exists in the users table
//         $userExists = User::where('rfid_uid', $request->input('uid'))->exists();

//         if ($userExists) {
//             // User exists → save the image
//             $uid       = $request->input('uid');
//             $extension = 'jpg'; // Always save as JPG
//             $imageName = "{$uid}.{$extension}";

//             // Save to storage/app/public/attendanceImages/{uid}.jpg
//             $path = $request->file('image')->storeAs('attendanceImages', $imageName, 'public');

//             return response()->json([
//                 'status'     => 'success',
//                 'message'    => 'Attendance image saved.',
//                 'uid'        => $uid,
//                 'image_path' => Storage::url($path),
//             ], 201);

//         } else {
//             // UID not found → log it into storage/app/unregistered_uids.txt
//             $uid      = $request->input('uid');
//             $logEntry = "UID: {$uid}, Hall: " . $request->input('hall_name') . ", Timestamp: " . now() . "\n";

//             Storage::disk('local')->append('unregistered_uids.txt', $logEntry);

//             return response()->json([
//                 'status'  => 'error',
//                 'message' => 'UID not found in the database. UID logged for registration.',
//                 'uid'     => $uid,
//             ], 404);
//         }
//     }

// );

// php artisan serve --host=0.0.0.0 --port=8000le
// php artisan serve --host=0.0.0.0 --port=8000

// php artisan config:clear
// php artisan cache:clear
