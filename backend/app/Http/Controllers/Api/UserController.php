<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;


class UserController extends Controller
{
    // Check if the user is an admin
    protected function checkAdmin(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized: Admin access required',
            ], Response::HTTP_FORBIDDEN);
        }
    }


    // List all users
    public function index(Request $request)
    {
        if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }
        $role = $request->query('role');

        $query = User::query();

        if ($role && in_array($role, ['student', 'lecturer', 'admin'])) {
            $query->where('role', $role);
        }
        $users = $query->get();

    return response()->json([
        'message' => 'User list fetched',
        'data'    => $users
    ], Response::HTTP_OK);

        // $users = $query->get()->map(function ($u) {
        //     if ($u->role === 'student') {
        //         return [
        //             'id'            => $u->id,
        //             'first_name'    => $u->first_name,
        //             'last_name'     => $u->last_name,
        //             'matric_number' => $u->matric_number,
        //             'rfid_uid'      => $u->rfid_uid,
        //             'email'         => $u->email,
        //             'role'          => $u->role,
        //             'picture' => $u->picture,
        //         ];
        //     }

        //     return [
        //         'id'         => $u->id,
        //         'first_name' => $u->first_name,
        //         'last_name'  => $u->last_name,
        //         'email'      => $u->email,
        //         'role'       => $u->role,
        //         'picture' => $u->picture,
        //     ];
        // });

        // return response()->json([
        //     'message' => 'User list fetched',
        //     'data'    => $users
        // ], Response::HTTP_OK);








    }

    // Count students
    public function countStudents(Request $request)
    {
        if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }

        $count = User::where('role', 'student')->count();
        return response()->json([
            'message' => 'Student count retrieved successfully',
            'data' => ['students' => $count],
            
        ], Response::HTTP_OK);
    }

    // Count lecturers
    public function countLecturers(Request $request)
    {
        if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }

        $count = User::where('role', 'lecturer')->count();
        return response()->json([
             'message' => 'Lecturer count retrieved successfully',
            'data' => ['lecturers' => $count],
           
        ], Response::HTTP_OK);
    }

    // Create a new user
    public function store(Request $request)
    {
         if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'matric_number' => 'required_if:role,student|string|unique:users|nullable',
            'rfid_uid' => 'required_if:role,student|string|unique:users|nullable',
            'email' => 'required|string|email|unique:users|max:255',
            'role' => 'required|in:student,lecturer,admin',
            'picture' => 'required_if:role,student|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $data = $request->all();
        $data['password'] = Hash::make($request->last_name);

        if ($request->hasFile('picture')) {
            $file = $request->file('picture');

            // Conditionally set the filename based on the user's role
            if ($request->role === 'student') {
                $extension = $file->getClientOriginalExtension();
                $fileName = $request->rfid_uid . '.' . $extension;
            } else {
                // If not a student, use the original filename
                $fileName = $file->getClientOriginalName();
            }

            $path = $file->storeAs('profile_pictures', $fileName, 'public');
            $data['picture'] = $path;
        }

        $user = User::create($data);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user,
        ], Response::HTTP_CREATED);
    }

    // Update an existing user
    public function update(Request $request, $id)
    {
        if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }

        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'matric_number' => 'sometimes|required_if:role,student|string|unique:users,matric_number,' . $id . '|nullable',
            'rfid_uid' => 'sometimes|required_if:role,student|string|unique:users,rfid_uid,' . $id . '|nullable',
            'email' => 'sometimes|required|string|email|unique:users,email,' . $id . '|max:255',
            'role' => 'sometimes|required|in:student,lecturer,admin',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $data = $request->all();

        if ($request->has('last_name')) {
            $data['password'] = Hash::make($request->last_name);
        }

      
        // Handle picture update
        if ($request->hasFile('picture')) {
            // Delete the old picture if it exists
            if ($user->picture) {
                Storage::disk('public')->delete($user->picture);
            }

            // Get the file extension
            $extension = $request->file('picture')->extension();
            // Create the new file name using the user's rfid_uid
            $fileName = $user->rfid_uid . '.' . $extension;
            // Store the file in the `profile_pictures` folder with the new name
            $path = $request->file('picture')->storeAs('profile_pictures', $fileName, 'public');
            // Update the data array with the new file path
            $data['picture'] = $path;
        }

        $user->update($data);

        return response()->json([
            'data' => $user,
            'message' => 'User updated successfully',
        ], Response::HTTP_OK);
    }

    // Delete a user
    public function destroy(Request $request, User $user)
    {
        if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }

        // Optional: prevent admin from deleting themselves
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete yourself'], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
            'data'    => null
        ]);
    }


    public function show(Request $request, User $user)
    {
        if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }
        if (!$user || !$user->id) {
    return response()->json([
        'message' => 'User not found',
    ], 404);
}

        if ($user->role === 'student') {
            $data = [
                'id'            => $user->id,
                'first_name'    => $user->first_name,
                'last_name'     => $user->last_name,
                'matric_number' => $user->matric_number,
                'rfid_uid'      => $user->rfid_uid,
                'email'         => $user->email,
                'role'          => $user->role,
            ];
        } else {
            $data = [
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'role'       => $user->role,
            ];
        }

        return response()->json([
            'message' => 'User fetched successfully',
            'data'    => $data
        ], Response::HTTP_OK);
    }

    public function listLecturers(Request $request)
    {
        //  only admins
        if ($errorResponse = $this->checkAdmin($request)) {
            return $errorResponse;
        }

        $lecturers = User::where('role', 'lecturer')
            ->select('id', 'first_name', 'last_name', 'email', 'role')
            ->orderBy('last_name')
            ->get();

        return response()->json([
            'message' => 'Lecturers fetched',
            'data'    => $lecturers
        ], Response::HTTP_OK);
    }


}
