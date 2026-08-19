<?php

namespace App\Http\Controllers;

use App\Models\SyncedBookingRequest;
use Illuminate\Http\Request;

class SyncedBookingRequestController extends Controller
{
    /**
     * LOCAL SIDE — list incoming online booking requests, soonest first.
     */
    public function index()
    {
        return SyncedBookingRequest::orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();
    }

    /**
     * LOCAL SIDE — receptionist confirms a synced request.
     * Marked unpushed so the next `sync:push` run tells the cloud. Does
     * NOT create a patient folder here — the receptionist does that via
     * the normal "New Folder" flow, same as any walk-in, so they can
     * review/correct the online-submitted details first and avoid a
     * duplicate-folder conflict if this family already has one.
     */
    public function confirm($id)
    {
        $r = SyncedBookingRequest::findOrFail($id);
        $r->update([
            'status'           => 'confirmed',
            'status_pushed_at' => null,
        ]);

        return response()->json($r);
    }

    /**
     * LOCAL SIDE — receptionist declines a synced request.
     */
    public function decline(Request $request, $id)
    {
        $request->validate([
            'decline_reason' => 'required|string|max:500',
        ]);

        $r = SyncedBookingRequest::findOrFail($id);
        $r->update([
            'status'           => 'declined',
            'decline_reason'   => $request->decline_reason,
            'status_pushed_at' => null,
        ]);

        return response()->json($r);
    }
}
