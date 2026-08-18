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
     * List all folders with search by phone or name
     */
    public function indexFolders(Request $request)
    {
        $search = $request->query('search');

        $folders = PatientFolder::withCount('files')
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
        $folder = PatientFolder::with([
            'files' => fn($q) => $q->withCount('visitRecords')
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
        $file = PatientFile::with([
            'folder:id,folder_name,card_number,phone,address',
            'currentDoctor:id,name,specialization',
            'visitRecords' => fn($q) =>
            $q->with('doctor:id,name,specialization,role')
                ->orderBy('visit_date', 'desc'),
        ])->findOrFail($fileId);

        return response()->json($file);
    }

    /**
     * Update patient file details
     */
    public function updateFile(Request $request, $fileId)
    {
        $file = PatientFile::findOrFail($fileId);

        $request->validate($this->patientFileValidationRules(true));

        $file->update($request->only($this->patientFileFields()));

        return response()->json($file);
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

        $toDoctor = User::where('id', $request->to_doctor_id)
            ->where('role', 'doctor')
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
     * Add a visit record to a patient file.
     * If consultation_fee is provided, generates an invoice for reception.
     */
    public function storeVisitRecord(Request $request, $fileId)
    {
        $file = PatientFile::with('folder')->findOrFail($fileId);

        $request->validate([
            'visit_date'           => 'required|date',
            'chief_complaint'      => 'required|string|max:255',
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
            'consultation_fee'     => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $file, $fileId) {
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
                    'consultation_fee',
                ]),
                'patient_file_id' => $fileId,
                'doctor_id'       => Auth::id(),
            ]);

            // If consultation fee provided — generate invoice
            // No fixed price here: the doctor writes down what they actually
            // charged for this visit, and that's the whole bill — no platform
            // service charge added on top (was 2%, commented out below).
            $invoice = null;
            if ($request->filled('consultation_fee') && $request->consultation_fee > 0) {
                $fee   = (float) $request->consultation_fee;
                // $serviceCharge = round($fee * 0.02, 2);
                $total = $fee;

                $invoice = Invoice::create([
                    'invoice_number'  => Invoice::generateInvoiceNumber(),
                    'patient_file_id' => $fileId,
                    'doctor_id'       => Auth::id(),
                    'type'            => 'Hospital_Bill',
                    'subtotal'        => $fee,
                    'service_charge'  => 0,
                    'total_amount'    => $total,
                    'currency'        => 'NGN',
                    'status'          => 'unpaid',
                    'due_date'        => now()->addDays(1),
                ]);

                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => 'Hospital Bill — ' . $file->full_name,
                    'quantity'    => 1,
                    'unit_price'  => $fee,
                    'total_price' => $fee,
                ]);

                // InvoiceItem::create([
                //     'invoice_id'  => $invoice->id,
                //     'description' => 'Platform Service Charge (2%)',
                //     'quantity'    => 1,
                //     'unit_price'  => $serviceCharge,
                //     'total_price' => $serviceCharge,
                // ]);
            }

            return response()->json([
                'record'  => $record->load('doctor:id,name'),
                'invoice' => $invoice,
            ], 201);
        });
    }

    /**
     * Update an existing visit record
     */
    public function updateVisitRecord(Request $request, $recordId)
    {
        $record = VisitRecord::with('patientFile.folder')->findOrFail($recordId);

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
            'consultation_fee'     => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $record) {
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
                'consultation_fee',
            ]));

            $invoice     = null;
            $invoiceAction = null;

            if ($request->filled('consultation_fee') && $request->consultation_fee > 0) {
                $fee = (float) $request->consultation_fee;
                // No fixed price / no platform service charge (was 2%) — the
                // doctor-entered fee is the whole bill. Commented out, not
                // deleted, in case a percentage charge is reintroduced.
                // $serviceCharge = round($fee * 0.02, 2);
                $total = $fee;

                // Look for an existing unpaid invoice for this patient file
                // that was generated as a consultation (not a registration fee)
                $existingInvoice = Invoice::where('patient_file_id', $record->patient_file_id)
                    ->where('type', 'consultation')
                    ->whereNull('folder_id')    // exclude registration fee invoices
                    ->whereIn('status', ['unpaid', 'overdue'])
                    ->latest()
                    ->first();

                if ($existingInvoice) {
                    // Update existing unpaid invoice with new amounts
                    $existingInvoice->update([
                        'subtotal'       => $fee,
                        'service_charge' => 0,
                        'total_amount'   => $total,
                    ]);

                    // Update the consultation fee line item
                    $existingInvoice->items()
                        ->where('description', 'not like', '%Service Charge%')
                        ->update([
                            'unit_price'  => $fee,
                            'total_price' => $fee,
                        ]);

                    // // Update the service charge line item
                    // $existingInvoice->items()
                    //     ->where('description', 'like', '%Service Charge%')
                    //     ->update([
                    //         'unit_price'  => $serviceCharge,
                    //         'total_price' => $serviceCharge,
                    //     ]);

                    $invoice       = $existingInvoice;
                    $invoiceAction = 'updated';
                } else {
                    // No existing unpaid invoice — create a fresh one
                    $patientName = $record->patientFile->first_name . ' ' . $record->patientFile->last_name;

                    $invoice = Invoice::create([
                        'invoice_number'  => Invoice::generateInvoiceNumber(),
                        'patient_file_id' => $record->patient_file_id,
                        'doctor_id'       => Auth::id(),
                        'type'            => 'consultation',
                        'subtotal'        => $fee,
                        'service_charge'  => 0,
                        'total_amount'    => $total,
                        'currency'        => 'NGN',
                        'status'          => 'unpaid',
                        'due_date'        => now()->addDays(1),
                    ]);

                    InvoiceItem::create([
                        'invoice_id'  => $invoice->id,
                        'description' => 'Hospital Bill — ' . $patientName,
                        'quantity'    => 1,
                        'unit_price'  => $fee,
                        'total_price' => $fee,
                    ]);

                    // InvoiceItem::create([
                    //     'invoice_id'  => $invoice->id,
                    //     'description' => 'Platform Service Charge (2%)',
                    //     'quantity'    => 1,
                    //     'unit_price'  => $serviceCharge,
                    //     'total_price' => $serviceCharge,
                    // ]);

                    $invoiceAction = 'created';
                }
            }

            return response()->json([
                'record'        => $record->load('doctor:id,name'),
                'invoice'       => $invoice,
                'invoice_action' => $invoiceAction, // 'created', 'updated', or null
            ]);
        });
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
