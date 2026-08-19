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
});

// Admin Protected Routes
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::patch('/users/{id}/approve', [AdminUserController::class, 'approve']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

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

// Pharmacy counter sales — receptionist included because this clinic runs
// the pharmacy sales desk out of reception (see RoleHome.jsx: both
// "receptionist" and "pharmacy" land on /dashboard/sales-records by default).
Route::middleware(['auth:api', 'role:pharmacy,admin,receptionist'])->prefix('pharmacy')->group(function () {
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

// Patient folders/files/visit records — clinical documentation, so pharmacy
// AND lab are deliberately excluded from every mutating endpoint here (lab
// gets read-only access above only; pharmacy only needs drug/prescription
// data, covered by the routes above).
Route::middleware(['auth:api', 'role:doctor,receptionist,admin'])->prefix('folders')->group(function () {

    // ── FOLDERS ──────────────────────────────────────────────────────────────
    Route::post('/', [PatientFolderController::class, 'storeFolder']);
    Route::patch('/{id}', [PatientFolderController::class, 'updateFolder']);

    // ── FILES ─────────────────────────────────────────────────────────────────
    Route::post('/{folderId}/files', [PatientFolderController::class, 'storeFile']);
    Route::patch('/files/{fileId}', [PatientFolderController::class, 'updateFile']);

    // ── VISIT RECORDS ─────────────────────────────────────────────────────────
    Route::post('/files/{fileId}/visits', [PatientFolderController::class, 'storeVisitRecord']);
    Route::patch('/visits/{recordId}', [PatientFolderController::class, 'updateVisitRecord']);
    Route::get('/files/{fileId}/prescriptions', [PatientFolderController::class, 'getFilePrescriptions']);

    // ── TRANSFERS ────────────────────────────────────────────────────────────
    Route::post('/files/{fileId}/transfer', [PatientFolderController::class, 'transferFile']);
    Route::get('/transfers/mine', [PatientFolderController::class, 'transfersToMe']);

    // ── ADMISSIONS ───────────────────────────────────────────────────────────
    Route::post('/files/{fileId}/admissions', [AdmissionController::class, 'admit']);
    Route::get('/files/{fileId}/admissions', [AdmissionController::class, 'indexForFile']);
    Route::patch('/admissions/{admissionId}/discharge', [AdmissionController::class, 'discharge']);
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
        Route::get('/{id}', [LabOrderController::class, 'show']);
        Route::patch('/{id}/in-progress', [LabOrderController::class, 'markInProgress']);
        Route::post('/{id}/result', [LabOrderController::class, 'uploadResult']);
        Route::post('/{id}/send', [LabOrderController::class, 'sendResult']);
    });
});

// Offline sync — local side. Receptionist/admin reviewing and acting on the
// incoming online-booking queue pulled down from the cloud server. Matches
// the role scope of the existing "Schedules" page (/schedules below).
Route::middleware(['auth:api', 'role:receptionist,admin'])->prefix('sync-requests')->group(function () {
    Route::get('/', [SyncedBookingRequestController::class, 'index']);
    Route::patch('/{id}/confirm', [SyncedBookingRequestController::class, 'confirm']);
    Route::patch('/{id}/decline', [SyncedBookingRequestController::class, 'decline']);
});