<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientPrescriptionController;
use App\Http\Controllers\MedicalReportRequestController;
use App\Http\Controllers\RecordClaimController;
use App\Http\Controllers\AdminMedicalReportController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\PaystackController;
use App\Http\Controllers\Admin\AdminScheduleController;
use App\Http\Controllers\Admin\AdminSystemLogController;
use App\Http\Controllers\ReceptionBillingController;
use App\Http\Controllers\DrugController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\PharmacySaleController;
use App\Http\Controllers\PatientFolderController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\LabOrderController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\SyncedBookingRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\IssueReportController;

// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');;
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');;
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Password reset routes
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password');;
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:reset-password');

    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:api');
});

// Google OAuth — must be outside all middleware groups
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

Route::post('/webhook/paystack', [PaystackController::class, 'webhook']);

// Offline sync — cloud side. Machine-to-machine only (the local server's
// sync:pull/sync:push commands), no logged-in user, protected by the
// shared-secret sync.key middleware instead of auth:api.
Route::middleware('sync.key')->prefix('sync')->group(function () {
    Route::get('/pending-appointments', [SyncController::class, 'pendingAppointments']);
    Route::post('/status-update', [SyncController::class, 'receiveStatusUpdate']);
});

Route::post('/contact', [ContactController::class, 'send'])->middleware('throttle:contact-form');

// Frontend-facing feature flags — lets the UI adapt without a redeploy
Route::get('/config', function () {
    return response()->json([
        'paystack_enabled' => config('paystack.enabled'),
    ]);
});

// Protected routes Must send Bearer Token
Route::middleware('auth:api')->group(function () {
    Route::get('/user-profile', function () {
        return response()->json(auth('api')->user());
    });

    Route::patch('/user/update-email', [UserSettingsController::class, 'updateEmail']);
    Route::patch('/user/update-password', [UserSettingsController::class, 'updatePassword']);
    Route::patch('/user/update-profile', [UserSettingsController::class, 'updateProfile']);
    Route::delete('/user/delete-account', [UserSettingsController::class, 'deleteAccount']);

    Route::post('/appointments', [AppointmentController::class, 'store']);


    Route::get('/doctors', [AppointmentController::class, 'getDoctors']);

    Route::get('/my-appointments', [AppointmentController::class, 'myAppointments']);

    Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    Route::patch('/appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);

    Route::get('/notifications/summary', [NotificationController::class, 'summary']);
    Route::post('/notifications/seen', [NotificationController::class, 'markSeen']);

    Route::post('/report-issue', [IssueReportController::class, 'store']);
});

// Doctor Protected Routes — admin included so the admin account can use the
// dashboard's "Switch to Doctor" role switcher (see Dashboard.jsx); this does
// NOT grant ordinary doctor accounts any admin access, only the reverse.
Route::middleware(['auth:api', 'role:doctor,admin'])->prefix('doctor')->group(function () {

    Route::get('/appointments', [AppointmentController::class, 'doctorAppointments']);

    Route::get('/dashboard-overview', [DashboardController::class, 'getDoctorDashboard']);

    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);

    // Status update endpoints
    Route::patch('/appointments/{id}/accept', [AppointmentController::class, 'acceptAppointment']);
    Route::patch('/appointments/{id}/decline', [AppointmentController::class, 'declineAppointment']);
    Route::get('/revenue', [BillingController::class, 'doctorRevenue']);
});

// Patient Protected Routes
Route::middleware(['auth:api', 'role:patient'])->prefix('patient')->group(function () {
    Route::get('/prescriptions', [PatientPrescriptionController::class, 'index']);
    Route::post('/prescriptions/{id}/refill', [PatientPrescriptionController::class, 'requestRefill']);

    Route::get('/bills', [BillingController::class, 'myBills']);
    Route::get('/bills/{id}', [BillingController::class, 'showInvoice']);
    Route::get('/receipts/{id}', [BillingController::class, 'showReceipt']);

    // DISABLED: this was a Phase-1 manual test stand-in that let a patient
    // mark their own invoice paid with no payment verification at all — not
    // safe now that payment collection is a receptionist-recorded, physical
    // process. Left commented (not deleted) in case a real automated
    // payment-confirmation flow (e.g. a webhook) needs it back.
    // Route::post('/bills/{id}/mark-paid', [BillingController::class, 'markPaid']);
    Route::post('/payment/initialize', [PaystackController::class, 'initializePayment']);
    Route::get('/payment/verify/{reference}', [PaystackController::class, 'verifyPayment']);

    Route::post('/report-requests', [MedicalReportRequestController::class, 'store']);
    Route::get('/report-requests', [MedicalReportRequestController::class, 'myRequests']);
    Route::get('/report-requests/{id}/report', [MedicalReportRequestController::class, 'getReport']);

    // Link this account to a hospital record created for them as a walk-in.
    Route::post('/claim-record/lookup', [RecordClaimController::class, 'lookup']);
    Route::post('/claim-record/confirm', [RecordClaimController::class, 'confirm']);
    Route::get('/linked-records', [RecordClaimController::class, 'myLinkedFiles']);
});

// Admin Protected Routes
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::patch('/users/{id}/approve', [AdminUserController::class, 'approve']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    Route::get('/revenue/today', [BillingController::class, 'adminRevenueToday']);

    Route::get('/logs', [AdminSystemLogController::class, 'index']);

    Route::get('/report-requests', [AdminMedicalReportController::class, 'index']);
    Route::patch('/report-requests/{id}/approve', [AdminMedicalReportController::class, 'approve']);
    Route::patch('/report-requests/{id}/reject', [AdminMedicalReportController::class, 'reject']);
});

// Both Receptionist and Admins Routes
Route::middleware(['auth:api', 'role:receptionist,admin'])->group(function () {
    Route::get('/schedules', [AdminScheduleController::class, 'index']);

    Route::get('/patients', [PatientController::class, 'allPatients']);
});

// Receptionist, Pharmacy and Admins Routes
Route::middleware(['auth:api', 'role:receptionist,admin,pharmacy'])->prefix('reception')->group(function () {
    Route::get('/bills', [ReceptionBillingController::class, 'allBills']);
    Route::get('/bills/{id}', [ReceptionBillingController::class, 'showInvoice']);
    Route::get('/receipts/{id}', [ReceptionBillingController::class, 'showReceipt']);
    Route::post('/bills/{id}/cash-payment', [ReceptionBillingController::class, 'markCashPaid']);
    Route::post('/payment/initialize', [ReceptionBillingController::class, 'initializeCardPayment']);
});

// Writing a fresh bill (not tied to a visit record or lab order) is
// reception/admin only — pharmacy has its own sales desk for that.
Route::middleware(['auth:api', 'role:receptionist,admin'])->prefix('reception')->group(function () {
    Route::post('/bills', [ReceptionBillingController::class, 'storeInvoice']);
});

// Pharmacy counter sales. Receptionist no longer runs this desk — reception
// defaults to Schedules now (see RoleHome.jsx / Dashboard.jsx nav).
Route::middleware(['auth:api', 'role:pharmacy,admin'])->prefix('pharmacy')->group(function () {
    Route::get('/sales/today', [PharmacySaleController::class, 'today']);
    Route::post('/sales/items', [PharmacySaleController::class, 'addItem']);
    Route::patch('/sales/items/{id}', [PharmacySaleController::class, 'updateItem']);
    Route::delete('/sales/items/{id}', [PharmacySaleController::class, 'removeItem']);
    Route::patch('/sales/close', [PharmacySaleController::class, 'closeSale']);
    Route::get('/sales/history/{id}', [PharmacySaleController::class, 'showHistory']);
});

Route::middleware(['auth:api', 'role:admin,receptionist,pharmacy'])->group(function () {
    Route::get('/prescriptions', [PrescriptionController::class, 'allPrescriptions']);
});

Route::middleware(['auth:api', 'role:pharmacy,admin,doctor'])->prefix('pharmacy')->group(function () {
    Route::get('/drugs', [DrugController::class, 'index']);
});

Route::middleware(['auth:api', 'role:pharmacy,admin,doctor'])->prefix('pharmacy')->group(function () {
    Route::post('/drugs', [DrugController::class, 'store']);
    Route::patch('/drugs/{id}', [DrugController::class, 'update']);
    Route::patch('/drugs/{id}/restock', [DrugController::class, 'restock']);
    Route::delete('/drugs/{id}', [DrugController::class, 'destroy']);
});

// Read-only patient lookup — doctor/receptionist/admin AND lab (lab staff
// need to find the right patient to attach an order to, nothing more; kept
// as its own group, not merged into the mutating group below, so the two
// role lists never collide on the same URI).
Route::middleware(['auth:api', 'role:doctor,receptionist,admin,lab'])->prefix('folders')->group(function () {
    Route::get('/', [PatientFolderController::class, 'indexFolders']);
    Route::get('/{id}', [PatientFolderController::class, 'showFolder']);
    Route::get('/files/{fileId}', [PatientFolderController::class, 'showFile']);
});

// Prescriptions are dispensing/handout info, not clinical notes — a
// receptionist needs these to reprint a patient's prescription without
// pulling a doctor away, so this stays out of the clinical-only group below.
// Lab/pharmacy still excluded (no legitimate need to browse them here; the
// pharmacy role instead fulfils/dispenses via its own prescription queue).
Route::middleware(['auth:api', 'role:doctor,receptionist,admin'])->prefix('folders')->group(function () {
    Route::get('/files/{fileId}/prescriptions', [PatientFolderController::class, 'getFilePrescriptions']);
});

// Patient intake — demographic-only folder/file creation. Receptionist needs
// this to register a walk-in patient and attach a hospital bill without
// touching clinical content; lab needs it so a brand-new patient with no
// existing folder can still get a lab order (see LabDashboard "create new
// patient" flow). Neither role can reach the clinical-write group below.
Route::middleware(['auth:api', 'role:doctor,receptionist,admin,lab'])->prefix('folders')->group(function () {
    Route::post('/', [PatientFolderController::class, 'storeFolder']);
    Route::patch('/{id}', [PatientFolderController::class, 'updateFolder']);
    Route::post('/{folderId}/files', [PatientFolderController::class, 'storeFile']);
    Route::patch('/files/{fileId}', [PatientFolderController::class, 'updateFile']);
});

// Clinical documentation — the actual diagnosis/notes/exam findings.
// Deliberately doctor/admin only: pharmacy and lab never had access, and
// receptionist was removed (2026-08-20) so the write access they need for
// intake and billing can't be used to read/write clinical content.
// See PatientFolderController::showFile for the matching read-side restriction.
Route::middleware(['auth:api', 'role:doctor,admin'])->prefix('folders')->group(function () {

    // ── VISIT RECORDS ─────────────────────────────────────────────────────────
    Route::post('/files/{fileId}/visits', [PatientFolderController::class, 'storeVisitRecord']);
    Route::patch('/visits/{recordId}', [PatientFolderController::class, 'updateVisitRecord']);

    // Doctor-scoped inbox ("transfers TO me") — reception has no equivalent.
    Route::get('/transfers/mine', [PatientFolderController::class, 'transfersToMe']);
});

// Patient logistics — who a patient is assigned to, and whether they're
// admitted. Reception owns front-desk workflow (assigning a walk-in to a
// doctor, admitting them), so they belong here even though they're excluded
// from the clinical group above. None of these expose diagnosis/notes.
Route::middleware(['auth:api', 'role:doctor,receptionist,admin'])->prefix('folders')->group(function () {

    // ── TRANSFERS / ASSIGNMENT ───────────────────────────────────────────────
    Route::post('/files/{fileId}/transfer', [PatientFolderController::class, 'transferFile']);

    // ── ADMISSIONS ───────────────────────────────────────────────────────────
    Route::post('/files/{fileId}/admissions', [AdmissionController::class, 'admit']);
    Route::get('/files/{fileId}/admissions', [AdmissionController::class, 'indexForFile']);
    Route::patch('/admissions/{admissionId}/discharge', [AdmissionController::class, 'discharge']);
});

// Hospital-wide ward board — "who is admitted right now", which had no home
// before (admit/discharge only existed inside an individual patient file).
Route::middleware(['auth:api', 'role:doctor,receptionist,admin'])->group(function () {
    Route::get('/admissions', [AdmissionController::class, 'index']);
});

// Lab tests — doctors order, lab staff fulfil, admin oversees.
Route::middleware(['auth:api', 'role:doctor,lab,admin'])->group(function () {
    Route::prefix('lab-tests')->group(function () {
        Route::get('/', [LabTestController::class, 'index']);
        Route::post('/', [LabTestController::class, 'store']);
        Route::patch('/{id}', [LabTestController::class, 'update']);
        Route::delete('/{id}', [LabTestController::class, 'destroy']);
    });

    Route::prefix('lab-orders')->group(function () {
        Route::get('/', [LabOrderController::class, 'index']);
        Route::get('/history', [LabOrderController::class, 'history']);
        Route::get('/patient/{fileId}', [LabOrderController::class, 'patientOrders']);
        Route::post('/files/{fileId}', [LabOrderController::class, 'store']);
        Route::post('/standalone', [LabOrderController::class, 'storeStandalone']);
        Route::get('/{id}', [LabOrderController::class, 'show']);
        Route::patch('/{id}/in-progress', [LabOrderController::class, 'markInProgress']);
        Route::post('/{id}/result', [LabOrderController::class, 'uploadResult']);
        Route::post('/{id}/send', [LabOrderController::class, 'sendResult']);
    });
});

// Offline sync — local side. Reception/admin can view the incoming
// online-booking queue pulled down from the cloud server (reception needs
// this to create the patient folder once one is confirmed), but only the
// requested doctor (or admin, standing in) may confirm/decline — that
// decision belongs to the doctor, not reception.
Route::middleware(['auth:api', 'role:receptionist,admin,doctor'])->prefix('sync-requests')->group(function () {
    Route::get('/', [SyncedBookingRequestController::class, 'index']);
});
Route::middleware(['auth:api', 'role:doctor,admin'])->prefix('sync-requests')->group(function () {
    Route::patch('/{id}/confirm', [SyncedBookingRequestController::class, 'confirm']);
    Route::patch('/{id}/decline', [SyncedBookingRequestController::class, 'decline']);
});