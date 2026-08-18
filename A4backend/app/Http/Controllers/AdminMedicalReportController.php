<?php

namespace App\Http\Controllers;

use App\Models\MedicalReportRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMedicalReportController extends Controller
{
    /**
     * Get all pending report requests (for admin dashboard).
     */
    public function index()
    {
        $requests = MedicalReportRequest::with('patient:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    /**
     * Approve a report request.
     */
    public function approve($id)
    {
        $reportRequest = MedicalReportRequest::where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $reportRequest->update([
            'status'   => 'approved',
            'admin_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Report request approved successfully.',
            'request' => $reportRequest,
        ]);
    }

    /**
     * Reject a report request with a reason.
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $reportRequest = MedicalReportRequest::where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $reportRequest->update([
            'status'           => 'rejected',
            'admin_id'         => Auth::id(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'message' => 'Report request rejected.',
            'request' => $reportRequest,
        ]);
    }
}
