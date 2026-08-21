<?php

namespace App\Http\Controllers;

use App\Models\SyncedBookingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SyncedBookingRequestController extends Controller
{
    /**
     * LOCAL SIDE — list incoming online booking requests, soonest first.
     * Reception/admin see every request (reception still creates the
     * patient folder once one is confirmed). A doctor only sees — and may
     * only act on — requests addressed to them: the cloud side has no
     * shared user id with this database (see the synced_booking_requests
     * migration comment), so the patient's requested doctor NAME is the
     * only link available, matched against this doctor's own name.
     */
    public function index()
    {
        $user = Auth::user();

        return SyncedBookingRequest::when(
            $user->role === 'doctor',
            fn($q) => $q->where('requested_doctor_name', $user->name)
        )
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();
    }

    /**
     * LOCAL SIDE — the requested doctor (or admin, standing in as one)
     * confirms a synced request. Deciding whether to take the appointment
     * is the doctor's call, not reception's — reception's role here is
     * view-only, then creating the patient folder once confirmed.
     * Marked unpushed so the next `sync:push` run tells the cloud. Does
     * NOT create a patient folder here — the receptionist does that via
     * the normal "New Folder" flow, same as any walk-in, so they can
     * review/correct the online-submitted details first and avoid a
     * duplicate-folder conflict if this family already has one.
     */
    public function confirm($id)
    {
        $r = SyncedBookingRequest::findOrFail($id);
        $this->assertDoctorMayAct($r);

        $r->update([
            'status'           => 'confirmed',
            'status_pushed_at' => null,
        ]);

        return response()->json($r);
    }

    /**
     * LOCAL SIDE — the requested doctor (or admin) declines a synced request.
     */
    public function decline(Request $request, $id)
    {
        $request->validate([
            'decline_reason' => 'required|string|max:500',
        ]);

        $r = SyncedBookingRequest::findOrFail($id);
        $this->assertDoctorMayAct($r);

        $r->update([
            'status'           => 'declined',
            'decline_reason'   => $request->decline_reason,
            'status_pushed_at' => null,
        ]);

        return response()->json($r);
    }

    /**
     * A doctor may only confirm/decline a request addressed to them by
     * name. Admin is unrestricted (stands in as any doctor). Reception
     * never reaches here — the route itself excludes them.
     */
    private function assertDoctorMayAct(SyncedBookingRequest $r): void
    {
        $user = Auth::user();
        if ($user->role === 'doctor' && $r->requested_doctor_name !== $user->name) {
            abort(403, 'This request was addressed to another doctor.');
        }
    }
}
