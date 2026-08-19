<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        // We start the query
        $query = User::query();

        // Optional: Filter by role if provided in the request
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Optional: Filter by approval status (pending/approved)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Optional: Search by name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Fetch users. We use paginate() so the frontend doesn't 
        // crash if you eventually have 5,000 users.
        $users = $query->latest()->paginate(15);

        return response()->json($users);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:patient,doctor,receptionist,admin,pharmacy,lab',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);

        return response()->json(['message' => 'User role updated successfully']);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'approved']);

        // Best-effort — the approval itself already succeeded and is logged
        // via UserObserver, so a mail failure shouldn't fail the request.
        try {
            Mail::send('emails.account-approved', ['name' => $user->name], function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Your A4 Medical Consortium Account Has Been Approved');
            });
        } catch (\Exception $e) {
            // Swallowed intentionally
        }

        return response()->json(['message' => 'User approved successfully']);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User account removed']);
    }
}
