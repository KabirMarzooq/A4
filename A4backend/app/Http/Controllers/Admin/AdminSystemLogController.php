<?php
// app/Http/Controllers/Admin/AdminSystemLogController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;

class AdminSystemLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SystemLog::with('user')->latest();

        if ($request->filled('search')) {
            $query->where('description', 'LIKE', '%' . $request->search . '%');
        }

        if ($request->filled('action')) {
            $query->where('action', 'LIKE', $request->action . '%');
        }

        return response()->json($query->paginate(20));
    }
}
