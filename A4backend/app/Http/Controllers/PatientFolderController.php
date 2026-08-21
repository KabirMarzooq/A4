<?php

namespace App\Http\Controllers;

use App\Models\PatientFolder;
use App\Models\PatientFile;
use App\Models\PatientFileTransfer;
use App\Models\VisitRecord;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PatientFolderController extends Controller
{
    // ── FOLDERS ───────────────────────────────────────────────────────────────

    /**
     * List all folders with search by phone or name.
     *
     * Pass ?with_files=1 to eager-load each folder's files in the SAME
     * response. Callers that need every patient across every folder (the
     * prescription and invoice patient pickers) previously fetched this list
     * and then issued one GET /folders/{id} per folder — an N+1 burst that
     * tripped the 60/min rate limiter and failed with a wall of 429s once the
     * hospital had a realistic number of folders.
     */
    public function indexFolders(Request $request)
    {
        $search = $request->query('search');
        $withFiles = $request->boolean('with_files');
        $user = Auth::user();
        // Doctors only see families with at least one file they created or
        // are currently assigned to — a file no doctor has ever touched
        // stays invisible to every doctor until admin/reception assigns it
        // (see transferFile). Admin/receptionist/lab stay unscoped.
        $doctorScoped = $user->role === 'doctor';

        $folders = PatientFolder::withCount('files')
            ->when(
                $doctorScoped,
                fn($q) => $q->whereHas('files', fn($f) => $f
                    ->where('created_by', $user->id)
                    ->orWhere('current_doctor_id', $user->id))
            )
            ->when(
                $withFiles,
                fn($q) => $q->with(['files' => fn($f) => $f
                    ->select('id', 'patient_folder_id', 'first_name', 'last_name', 'created_by', 'current_doctor_id')
                    ->when($doctorScoped, fn($ff) => $ff->where(fn($w) => $w
                        ->where('created_by', $user->id)
                        ->orWhere('current_doctor_id', $user->id)))
                    ->orderBy('first_name')])
            )
            ->when(
                $search,
                fn($q) =>
                $q->where('phone', 'like', '%' . $search . '%')
                    ->orWhere('folder_name', 'like', '%' . $search . '%')
            )
            ->orderBy('folder_name')
            ->get();

        return response()->json($folders);
    }

    /**
     * Create a new family folder
     */
    public function storeFolder(Request $request)
    {
        $request->validate([
            'folder_name' => 'required|string|max:100',
            'phone'       => 'required|string|unique:patient_folders,phone',
            'address'     => 'nullable|string',
            'doctor_id'   => 'nullable|exists:users,id',
        ]);

        $folder = PatientFolder::create([
            'folder_name'  => $request->folder_name,
            'card_number'  => PatientFolder::generateCardNumber(),
            'phone'        => $request->phone,
            'address'      => $request->address,
            'created_by'   => Auth::id(),
        ]);

        // DISABLED: A4 Medical Consortium does not charge a fixed registration
        // fee — opening a family folder is free. Commented out (not deleted)
        // in case a registration fee is reintroduced later.
        // $registrationFee   = 1000.00;
        // $serviceCharge     = round($registrationFee * 0.02, 2);
        // $total             = $registrationFee + $serviceCharge;
        //
        // Invoice::create([
        //     'invoice_number'  => Invoice::generateInvoiceNumber(),
        //     'patient_file_id' => null,
        //     'doctor_id'       => Auth::id(),
        //     'type'            => 'Card_Bill',
        //     'subtotal'        => $registrationFee,
        //     'service_charge'  => $serviceCharge,
        //     'total_amount'    => $total,
        //     'currency'        => 'NGN',
        //     'status'          => 'unpaid',
        //     'due_date'        => now()->addDays(1),
        //     'folder_id'       => $folder->id,
        // ]);
        //
        // $invoice = Invoice::where('folder_id', $folder->id)->latest()->first();
        //
        // InvoiceItem::create([
        //     'invoice_id'  => $invoice->id,
        //     'description' => 'New Patient Registration Fee — ' . $folder->folder_name,
        //     'quantity'    => 1,
        //     'unit_price'  => $registrationFee,
        //     'total_price' => $registrationFee,
        // ]);
        //
        // InvoiceItem::create([
        //     'invoice_id'  => $invoice->id,
        //     'description' => 'Platform Service Charge (2%)',
        //     'quantity'    => 1,
        //     'unit_price'  => $serviceCharge,
        //     'total_price' => $serviceCharge,
        // ]);

        return response()->json($folder->load('files'), 201);
    }

    /**
     * Get a single folder with all its member files
     */
    public function showFolder($id)
    {
        $user = Auth::user();
        $doctorScoped = $user->role === 'doctor';

        $folder = PatientFolder::with([
            'files' => fn($q) => $q->withCount('visitRecords')
                ->when($doctorScoped, fn($f) => $f->where(fn($w) => $w
                    ->where('created_by', $user->id)
                    ->orWhere('current_doctor_id', $user->id)))
                ->orderBy('first_name'),
        ])->findOrFail($id);

        return response()->json($folder);
    }

    /**
     * Update folder details
     */
    public function updateFolder(Request $request, $id)
    {
        $folder = PatientFolder::findOrFail($id);

        $request->validate([
            'folder_name' => 'sometimes|string|max:100',
            'phone'       => 'sometimes|string|unique:patient_folders,phone,' . $id,
            'address'     => 'nullable|string',
        ]);

        $folder->update($request->only('folder_name', 'phone', 'address'));

        return response()->json($folder);
    }

    // ── FILES ─────────────────────────────────────────────────────────────────

    /**
     * Create a new patient file inside a folder
     */
    public function storeFile(Request $request, $folderId)
    {
        $folder = PatientFolder::findOrFail($folderId);

        $request->validate($this->patientFileValidationRules(false));

        $file = PatientFile::create([
            ...$request->only($this->patientFileFields()),
            'patient_folder_id' => $folderId,
            'created_by'        => Auth::id(),
        ]);

        return response()->json($file, 201);
    }

    /**
     * Get a single patient file with all visit records
     */
    public function showFile($fileId)
    {
        // Receptionists can reach this endpoint to look up a patient for
        // billing, but must never see clinical content (diagnosis, notes,
        // exam findings, investigations) — only enough visit metadata
        // (date, type, fee, doctor) to make sense of an invoice.
        $isReceptionist = Auth::user()?->role === 'receptionist';

        $file = PatientFile::with([
            'folder:id,folder_name,card_number,phone,address',
            'currentDoctor:id,name,specialization',
            'currentAdmission',
            'visitRecords' => function ($q) use ($isReceptionist) {
                $q->orderBy('visit_date', 'desc');
                if ($isReceptionist) {
                    $q->select(
                        'id',
                        'patient_file_id',
                        'visit_date',
                        'visit_type',
                        'consultation_fee',
                        'doctor_id'
                    )->with('doctor:id,name,specialization,role');
                } else {
                    $q->with('doctor:id,name,specialization,role');
                }
            },
        ])->findOrFail($fileId);

        $this->assertDoctorOwnsFile($file);

        return response()->json($file);
    }

    /**
     * Update patient file details
     */
    public function updateFile(Request $request, $fileId)
    {
        $file = PatientFile::findOrFail($fileId);
        $this->assertDoctorOwnsFile($file);

        $request->validate($this->patientFileValidationRules(true));

        $file->update($request->only($this->patientFileFields()));

        return response()->json($file);
    }

    /**
     * A doctor may only view/edit a patient file they created or are
     * currently assigned to (patient_files.created_by / current_doctor_id).
     * Admin/receptionist are never scoped — this is purely a per-doctor
     * ownership boundary, not a general access-control layer.
     */
    private function assertDoctorOwnsFile(PatientFile $file): void
    {
        $user = Auth::user();
        if (
            $user->role === 'doctor'
            && $file->created_by !== $user->id
            && $file->current_doctor_id !== $user->id
        ) {
            abort(403, 'You are not assigned to this patient.');
        }
    }

    /**
     * Field list shared by storeFile/updateFile so the two never drift apart.
     */
    private function patientFileFields(): array
    {
        return [
            'first_name',
            'last_name',
            'email',
            'place_of_origin',
            'tribe',
            'occupation',
            'religion',
            'marital_status',
            'date_of_birth',
            'gender',
            'blood_type',
            'allergies',
            'chronic_conditions',
            'height_cm',
            'weight_kg',
            'lab_ref_no',
            'blood_group',
            'rhesus',
            'genotype',
            'sensitivity',
            'blood_test_date',
            'next_of_kin_name',
            'next_of_kin_relationship',
            'next_of_kin_phone',
            'next_of_kin_address',
            'next_of_kin_email',
        ];
    }

    /**
     * $isUpdate relaxes first_name/last_name from required to sometimes,
     * matching how storeFile vs updateFile already differed before this
     * field list grew large enough to need sharing.
     */
    private function patientFileValidationRules(bool $isUpdate): array
    {
        $nameRule = $isUpdate ? 'sometimes|string|max:100' : 'required|string|max:100';

        return [
            'first_name'         => $nameRule,
            'last_name'          => $nameRule,
            'email'              => 'nullable|email|max:150',
            'place_of_origin'    => 'nullable|string|max:150',
            'tribe'              => 'nullable|string|max:100',
            'occupation'         => 'nullable|string|max:150',
            'religion'           => 'nullable|string|max:100',
            'marital_status'     => 'nullable|string|max:50',
            'date_of_birth'      => 'nullable|date',
            'gender'             => 'nullable|in:Male,Female,Other',
            'blood_type'         => 'nullable|string|max:5',
            'allergies'          => 'nullable|string',
            'chronic_conditions' => 'nullable|string',
            'height_cm'          => 'nullable|numeric',
            'weight_kg'          => 'nullable|numeric',
            'lab_ref_no'         => 'nullable|string|max:100',
            'blood_group'        => 'nullable|in:A,B,AB,O',
            'rhesus'             => 'nullable|in:Positive,Negative',
            'genotype'           => 'nullable|string|max:20',
            'sensitivity'        => 'nullable|string|max:255',
            'blood_test_date'    => 'nullable|date',
            'next_of_kin_name'        => 'nullable|string|max:150',
            'next_of_kin_relationship' => 'nullable|string|max:100',
            'next_of_kin_phone'       => 'nullable|string|max:20',
            'next_of_kin_address'     => 'nullable|string',
            'next_of_kin_email'       => 'nullable|email|max:150',
        ];
    }

    // ── TRANSFERS ─────────────────────────────────────────────────────────────

    /**
     * Assign or hand off a patient file to a doctor. Doesn't restrict anyone
     * else's access — it just records who's currently responsible and
     * notifies the receiving doctor.
     */
    public function transferFile(Request $request, $fileId)
    {
        $file = PatientFile::findOrFail($fileId);

        $request->validate([
            'to_doctor_id' => 'required|exists:users,id',
            'reason'       => 'nullable|string|max:255',
        ]);

        // Admin counts as a doctor here too (see AppointmentController::getDoctors).
        $toDoctor = User::where('id', $request->to_doctor_id)
            ->whereIn('role', ['doctor', 'admin'])
            ->firstOrFail();

        PatientFileTransfer::create([
            'patient_file_id' => $fileId,
            'from_user_id'    => Auth::id(),
            'to_doctor_id'    => $toDoctor->id,
            'reason'          => $request->reason,
        ]);

        $file->current_doctor_id = $toDoctor->id;
        $file->save();

        $actor = Auth::user();
        SystemLog::log(
            'patient_file.transferred',
            "{$actor->name} assigned {$file->full_name} to Dr. {$toDoctor->name}"
                . ($request->reason ? " — {$request->reason}" : ''),
            $file
        );

        return response()->json(
            $file->load('currentDoctor:id,name,specialization')
        );
    }

    /**
     * Recent handoffs to the logged-in doctor.
     */
    public function transfersToMe()
    {
        $transfers = PatientFileTransfer::where('to_doctor_id', Auth::id())
            ->with([
                'patientFile:id,patient_folder_id,first_name,last_name',
                'patientFile.folder:id,folder_name,phone',
                'fromUser:id,name,role',
            ])
            ->latest()
            ->limit(20)
            ->get();

        return response()->json($transfers);
    }

    // ── VISIT RECORDS ─────────────────────────────────────────────────────────

    /**
     * Add a visit record to a patient file. Purely clinical — billing is
     * reception/admin's job now (ReceptionBillingController::storeInvoice),
     * not generated from what a doctor writes here.
     */
    public function storeVisitRecord(Request $request, $fileId)
    {
        $file = PatientFile::with('folder')->findOrFail($fileId);
        $this->assertDoctorOwnsFile($file);

        $request->validate([
            'visit_date'           => 'required|date',
            // The dialysis register has no "chief complaint" concept, so it's
            // only required for general visits.
            'chief_complaint'      => 'required_if:visit_type,general|nullable|string|max:255',
            'physical_examination' => 'nullable|string',
            'investigation'        => 'nullable|string',
            'test_results'         => 'nullable|string',
            'blood_pressure'       => 'nullable|string|max:20',
            'temperature_c'        => 'nullable|numeric|between:30,45',
            'heart_rate'           => 'nullable|integer|between:30,250',
            'oxygen_saturation'    => 'nullable|integer|between:50,100',
            'diagnosis'            => 'nullable|string',
            'notes'                => 'nullable|string',
            'action_taken'         => 'nullable|string|max:255',
            'visit_type'           => 'nullable|in:general,dialysis',
            'admission_id'         => 'nullable|exists:admissions,id',
            'access_type'          => 'nullable|string|max:100',
            'infection_status'     => 'nullable|string|max:100',
            'machine_no'           => 'nullable|string|max:50',
            'pre_bp'               => 'nullable|string|max:20',
            'post_bp'              => 'nullable|string|max:20',
            'pre_weight_kg'        => 'nullable|numeric|min:0',
            'post_weight_kg'       => 'nullable|numeric|min:0',
            'uf_ml'                => 'nullable|integer|min:0',
            'duration_hours'       => 'nullable|numeric|between:0,24',
            'complications'        => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $file, $fileId) {
            $visitType = $request->input('visit_type', 'general');

            // Session numbers are always computed server-side, never taken
            // from the client — same spirit as card_number/invoice_number.
            $sessionNumber = $visitType === 'dialysis'
                ? VisitRecord::nextDialysisSessionNumber($fileId)
                : null;

            // Create the visit record
            $record = VisitRecord::create([
                ...$request->only([
                    'visit_date',
                    'chief_complaint',
                    'physical_examination',
                    'investigation',
                    'test_results',
                    'blood_pressure',
                    'temperature_c',
                    'heart_rate',
                    'oxygen_saturation',
                    'diagnosis',
                    'notes',
                    'action_taken',
                    'access_type',
                    'infection_status',
                    'machine_no',
                    'pre_bp',
                    'post_bp',
                    'pre_weight_kg',
                    'post_weight_kg',
                    'uf_ml',
                    'duration_hours',
                    'complications',
                ]),
                'patient_file_id' => $fileId,
                'doctor_id'       => Auth::id(),
                'visit_type'      => $visitType,
                'session_number'  => $sessionNumber,
                // Auto-tag to the patient's active admission (if any) unless
                // the caller explicitly specified one — lets a normal round
                // note during a stay link up with zero extra doctor effort.
                'admission_id'    => $request->input('admission_id') ?? $file->currentAdmission?->id,
            ]);

            return response()->json([
                'record' => $record->load('doctor:id,name'),
            ], 201);
        });
    }

    /**
     * Update an existing visit record. Purely clinical, same as above.
     */
    public function updateVisitRecord(Request $request, $recordId)
    {
        $record = VisitRecord::with('patientFile.folder')->findOrFail($recordId);
        $this->assertDoctorOwnsFile($record->patientFile);

        $request->validate([
            'chief_complaint'      => 'sometimes|string|max:255',
            'physical_examination' => 'nullable|string',
            'investigation'        => 'nullable|string',
            'test_results'         => 'nullable|string',
            'blood_pressure'       => 'nullable|string|max:20',
            'temperature_c'        => 'nullable|numeric|between:30,45',
            'heart_rate'           => 'nullable|integer|between:30,250',
            'oxygen_saturation'    => 'nullable|integer|between:50,100',
            'diagnosis'            => 'nullable|string',
            'notes'                => 'nullable|string',
            'action_taken'         => 'nullable|string|max:255',
            'access_type'          => 'nullable|string|max:100',
            'infection_status'     => 'nullable|string|max:100',
            'machine_no'           => 'nullable|string|max:50',
            'pre_bp'               => 'nullable|string|max:20',
            'post_bp'              => 'nullable|string|max:20',
            'pre_weight_kg'        => 'nullable|numeric|min:0',
            'post_weight_kg'       => 'nullable|numeric|min:0',
            'uf_ml'                => 'nullable|integer|min:0',
            'duration_hours'       => 'nullable|numeric|between:0,24',
            'complications'        => 'nullable|string',
        ]);

        // visit_type/session_number are set once at creation and never
        // change on edit — same as card_number/invoice_number never being
        // regenerated on update.
        $record->update($request->only([
            'chief_complaint',
            'physical_examination',
            'investigation',
            'test_results',
            'blood_pressure',
            'temperature_c',
            'heart_rate',
            'oxygen_saturation',
            'diagnosis',
            'notes',
            'action_taken',
            'access_type',
            'infection_status',
            'machine_no',
            'pre_bp',
            'post_bp',
            'pre_weight_kg',
            'post_weight_kg',
            'uf_ml',
            'duration_hours',
            'complications',
        ]));

        return response()->json([
            'record' => $record->load('doctor:id,name'),
        ]);
    }

    /**
     * Get all prescriptions for a patient file
     */
    public function getFilePrescriptions($fileId)
    {
        $prescriptions = \App\Models\Prescription::where('patient_file_id', $fileId)
            ->with(['items', 'doctor:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($prescriptions);
    }
}
