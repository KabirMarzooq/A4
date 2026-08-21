<?php

namespace App\Http\Controllers;

use App\Models\PatientFile;
use App\Models\PatientFolder;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Lets a patient (online account) link themselves to a hospital record a
 * receptionist/lab/doctor created for them as a walk-in — the two identities
 * (User vs PatientFile) have no connection otherwise. Possession of the
 * physical hospital card number plus the phone number on file stands in for
 * identity proof here, the same way those two pieces of information already
 * work as the shared secret for anyone physically walking up to the desk.
 */
class RecordClaimController extends Controller
{
    /**
     * Step 1 — find the family folder by card number + phone, and list its
     * members so the patient can say which one is them (a folder is a
     * family; more than one person can be in it).
     */
    public function lookup(Request $request)
    {
        $request->validate([
            'card_number' => 'required|string',
            'phone'       => 'required|string',
        ]);

        $folder = PatientFolder::where('card_number', $request->card_number)
            ->where('phone', $request->phone)
            ->first();

        if (!$folder) {
            return response()->json([
                'message' => 'No hospital record found matching that card number and phone.',
            ], 404);
        }

        $userId = Auth::id();
        $files = $folder->files()
            ->get(['id', 'first_name', 'last_name', 'linked_user_id'])
            ->map(fn($f) => [
                'id'             => $f->id,
                'name'           => $f->first_name . ' ' . $f->last_name,
                'linked_to_you'  => $f->linked_user_id === $userId,
                'linked_to_other' => $f->linked_user_id !== null && $f->linked_user_id !== $userId,
            ]);

        return response()->json([
            'folder_name' => $folder->folder_name,
            'files'       => $files,
        ]);
    }

    /**
     * Step 2 — link a specific file from that folder to the logged-in
     * account. Re-validates card_number + phone rather than trusting the
     * file id alone, so this stays a single self-contained proof of
     * possession rather than a two-request race an attacker could split.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'card_number'     => 'required|string',
            'phone'           => 'required|string',
            'patient_file_id' => 'required|exists:patient_files,id',
        ]);

        $folder = PatientFolder::where('card_number', $request->card_number)
            ->where('phone', $request->phone)
            ->firstOrFail();

        $file = PatientFile::where('id', $request->patient_file_id)
            ->where('patient_folder_id', $folder->id)
            ->firstOrFail();

        if ($file->linked_user_id && $file->linked_user_id !== Auth::id()) {
            return response()->json([
                'message' => 'This record is already linked to another account.',
            ], 409);
        }

        $file->update(['linked_user_id' => Auth::id()]);

        SystemLog::log(
            'patient_file.linked_to_account',
            Auth::user()->name . " linked their account to {$file->full_name}'s hospital record",
            $file
        );

        return response()->json([
            'message' => 'Record linked successfully.',
            'file'    => $file,
        ]);
    }

    /**
     * Records already linked to the logged-in patient — powers the "already
     * linked" state in the UI and is what MedicalReportRequestController
     * reads from to assemble a real report.
     */
    public function myLinkedFiles()
    {
        $files = PatientFile::where('linked_user_id', Auth::id())
            ->with('folder:id,folder_name,card_number')
            ->get(['id', 'patient_folder_id', 'first_name', 'last_name']);

        return response()->json($files);
    }
}
