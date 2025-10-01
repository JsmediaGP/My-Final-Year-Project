<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Hall;

class HallController extends Controller
{
     protected function checkAdmin(Request $r): void
    {
        if (!$r->user() || $r->user()->role !== 'admin') {
            abort(
                response()->json(
                    ['message' => 'Unauthorized: Admin access required'],
                    Response::HTTP_FORBIDDEN
                )
            );
        }
    }

    /* ---- list all ---- */
    public function index(Request $r)
    {
        $this->checkAdmin($r);
        return response()->json([
            'message' => 'Halls fetched',
            'data'    => Hall::all()
        ]);
    }

    /* ---- create ---- */
    public function store(Request $r)
    {
        $this->checkAdmin($r);

        $data = $r->validate([
            'hall_name' => 'required|string|unique:halls',
            'capacity'  => 'required|integer|min:1',
        ]);

        $hall = Hall::create($data);

        return response()->json([
            'message' => 'Hall created successfully',
            'data'    => $hall,
        ], Response::HTTP_CREATED);
    }

    /* ---- show single ---- */
    public function show(Request $r, Hall $hall)
    {
        $this->checkAdmin($r);
        return response()->json([
            'message' => 'Hall fetched',
            'data'    => $hall,
        ]);
    }

    /* ---- update ---- */
    public function update(Request $r, Hall $hall)
    {
        $this->checkAdmin($r);

        $data = $r->validate([
            'hall_name' => 'sometimes|string|unique:halls,hall_name,' . $hall->id,
            'capacity'  => 'sometimes|integer|min:1',
        ]);

        $hall->update($data);

        return response()->json([
            'message' => 'Hall updated successfully',
            'data'    => $hall,
        ]);
    }

    /* ---- delete ---- */
    public function destroy(Request $r, Hall $hall)
    {
        $this->checkAdmin($r);
        $hall->delete();

        return response()->json([
            'message' => 'Hall deleted successfully',
            'data'    => null,
        ]);
    }

    /* ---- count ---- */
    public function count(Request $r)
    {
        $this->checkAdmin($r);
        return response()->json([
            'message' => 'Hall count fetched',
            'data'    => ['halls' => Hall::count()],
        ]);
    }
}
