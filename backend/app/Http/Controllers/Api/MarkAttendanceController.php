<?php

namespace App\Http\Controllers\Api;


use App\Models\Hall;

use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;
use App\Models\ClassSchedule;
use App\Http\Controllers\Controller;
use App\Services\AttendanceService; 
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class MarkAttendanceController extends Controller
{
        protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }
   

    

   
     public function scan(Request $request)
    {
        
         // 1. Validate request
        $request->validate([
            'uid'       => 'required|string',
            'hall_name' => 'required|string',
            'image'     => 'required|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        $uid = $request->input('uid');
        $hallName = $request->input('hall_name');
        $image = $request->file('image');

        // 2. Check if UID exists in DB
        $user = User::where('rfid_uid', $uid)->first();
        Log::info('Incoming RFID request', $request->all());
        if (!$user) {
            // UID not found → log it
            Storage::disk('public')->put('unregistered_uid.txt', $uid);

            return response()->json([
                'status'  => 'error',
                'message' => 'UID not found. Logged for registration.',
                'uid'     => $uid,
            ], 404);
        }

        // 3. UID exists → save uploaded image
        $imageName = $uid . '.jpg'; // Always save as JPG
        $path = $image->storeAs('attendanceImages', $imageName, 'public');

        // 4. Send data to AttendanceService
        $response = $this->attendanceService->markAttendance($user, $hallName, $path);

        // 5. Return service response
        return response()->json($response, $response['status_code'] ?? 200);
    
    }
}
