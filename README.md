# 🏥 A4 Medical Consortium — Hospital Management System

<div align="center">

**A full-stack Hospital Management System built with Laravel & React, designed to run both in the cloud and on a hospital's own local server.**

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Core Systems](#-core-systems) • [API Reference](#-api-reference) • [Roles & Permissions](#-roles--permissions)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Core Systems](#-core-systems)
- [API Reference](#-api-reference)
- [Roles & Permissions](#-roles--permissions)
- [Security](#-security)
- [Payments](#-payments)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)
- [Roadmap](#-roadmap)

---

## 🌟 Overview

A4 Medical Consortium is a hospital management system covering the full day-to-day operation of a small-to-mid-size hospital: online appointment booking, walk-in patient registration, clinical documentation (visit records, dialysis sessions, inpatient admissions), lab orders and results, a pharmacy counter and drug inventory, billing, and a full audit trail — all behind role-based access for six distinct staff roles plus patients.

Its defining architectural fact: **it's designed to run in two places at once.** A cloud deployment (Vercel + Railway) is where patients register accounts and book appointments online. A separate deployment on a physical server inside the hospital is what staff actually use day to day, working whether or not the hospital's internet is up. The two stay loosely connected by a small one-way sync bridge — see [Architecture](#-architecture).

---

## 🏗 Architecture

### The two deployments

```
                    ┌───────────────────────────────┐
                    │           CLOUD                │
                    │   (Vercel + Railway)            │
                    │                                 │
                    │  React frontend  ──►  Laravel API│
                    │  (public site,        + MySQL    │
                    │   patient portal)                │
                    └───────────────┬─────────────────┘
                                    │
                          Offline sync bridge
                    (shared-secret HTTP, one-way each direction,
                     runs every 5 min via Laravel's scheduler)
                                    │
                    ┌───────────────▼─────────────────┐
                    │           LOCAL                  │
                    │  (hospital's own Windows server) │
                    │                                   │
                    │  React frontend  ──►  Laravel API │
                    │  (staff-only,          + MySQL     │
                    │   separate build)                  │
                    └───────────────────────────────────┘
```

Both sides run the **same codebase** — one repo, deployed twice with different environment variables. What differs is which frontend build gets served (see [Getting Started](#-getting-started)) and which env vars are set (`SYNC_CLOUD_URL` only exists on the local side; the cloud side never calls itself).

### What actually syncs

- **Cloud → Local**: a new online appointment booking gets pulled down into a local `synced_booking_requests` queue (`php artisan sync:pull`), where it shows up on the Receptionist/Admin "Sync Requests" tab.
- **Local → Cloud**: when a receptionist confirms or declines one of those requests, that decision gets pushed back up (`php artisan sync:push`) so the online patient's own appointment status actually reflects reality.
- **Fails safely**: if the local machine has no internet when the sync job runs, both commands just log an error and try again on the next 5-minute cycle — nothing in normal local operation waits on or breaks because of this.
- Confirming a request does **not** auto-create a patient record — the receptionist reviews the online-submitted details and creates the folder manually (same "New Folder" flow as any walk-in), so a typo or an existing family folder can be caught before it becomes permanent data.

See `App\Http\Controllers\SyncController` (cloud side), `App\Http\Controllers\SyncedBookingRequestController` (local side), and `app/Console/Commands/Sync*.php` for the implementation.

### Clinical data model

Two separate patient concepts exist on purpose, because a walk-in patient never necessarily has an online account:

- **`PatientFolder` / `PatientFile`** — the actual medical record system. A folder is a family/household (shared phone number, address); each file inside it is one individual, with demographics, allergies, next-of-kin, etc. No account is required for a patient file to exist — this is what a receptionist creates for a walk-in, and it's also what the offline sync flow produces once a receptionist confirms an online booking.
- **`User` (role: `patient`) / `Appointment`** — the online-facing side. A registered patient books an appointment against a doctor; that's the thing that flows through the offline sync bridge.

Every clinical encounter — a general visit, a dialysis session, a round-note during an inpatient stay, a lab order — is a row in (or linked from) `VisitRecord`, attached to a `PatientFile`. See [Core Systems](#-core-systems) for how dialysis, admissions, and lab orders extend this same pipeline rather than duplicating it.

---

## ✨ Features

### 🩺 Patient (online, cloud-facing)

- Register/log in (email+password or Google), book/reschedule/cancel appointments with a doctor — only doctors the admin has already approved appear in the booking list
- View own appointments, prescriptions, bills and receipts
- Pay online via Paystack (currently **disabled** by default — see [Payments](#-payments)) or at the hospital desk
- Request a copy of their medical report (admin-approved)

### 👨‍⚕️ Doctor

- Accept/decline the incoming online appointment queue, plus a same-shaped "Online Bookings" queue on the Schedule page for cloud-synced requests addressed to them by name (see [Offline sync](#offline-sync))
- Patient-folder access is **scoped to their own patients** — a file they created, or one currently assigned to them (`current_doctor_id`); an unassigned or another doctor's file is invisible, not just hidden in the UI (enforced server-side on every read/write route)
- Create/edit visit records, view history, assign/transfer patients to themselves
- Log dialysis sessions in a dedicated register-style view (auto-incrementing session number, all the fields a hemodialysis unit tracks — access type, machine, pre/post BP & weight, UF, duration, complications)
- Admit a patient (ward, reason) and discharge them later — every visit record logged during that stay auto-links to the admission with no extra step
- Order lab tests for a patient directly from their file — no price entered; billing for the test is reception's job, not the doctor's (see [Billing](#billing))
- Write prescriptions against the drug inventory
- View their own revenue dashboard

Visit records and dialysis sessions are **purely clinical now** — there's no consultation-fee field on either form, and neither generates an invoice. An admin account switched into the Doctor view (see below) is treated as a doctor everywhere a doctor can be picked (booking, patient assignment) but stays **unscoped** — it sees every patient, not just its own.

### 📋 Receptionist

- Register walk-in families/patients (the same "New Folder" flow whether it's a genuine walk-in or a confirmed online booking) — demographic details and billing only; clinical content (diagnosis, notes, exam findings, investigations) is stripped from the API response and hidden in the UI, so a receptionist can open a patient's file to bill them without seeing what a doctor wrote. The entire Visit History tab strip (Overview/Dialysis/Prescriptions/Lab Results) is hidden for this role, not just field-stripped — reprinting a prescription happens from the dedicated Prescriptions page instead
- Front-desk patient logistics: assign a walk-in to a doctor (or transfer between doctors), and admit/discharge — none of which expose clinical content, so they sit outside the doctor-only clinical routes
- **Create Invoice**: write a bill directly for anything that isn't a lab order or old-style visit-record fee — online or walk-in patient, free-form line items (`POST /reception/bills`)
- Record cash/POS payments (full or **partial** — an invoice can be `partially_paid` with a running balance), view all bills and receipts
- View the full cross-doctor schedule
- Review the incoming online-booking sync queue **read-only** — confirming or declining is the addressed doctor's (or admin's) call, not reception's; reception still creates the patient folder once a request is confirmed
- No longer runs the pharmacy counter-sales desk (moved to Pharmacy/Admin only) — defaults to the Schedules tab on login instead of Sales

### 💊 Pharmacy

- Run the daily counter-sales register (open in the morning, add items as they're sold, auto-closes at 10pm if left open)
- Manage drug inventory (add, restock, low-stock visibility)
- Fulfill prescriptions

### 🧪 Lab

- A dedicated Lab Dashboard: a pending queue and a completed/history view
- Receive orders either from a doctor (placed from inside a patient's file) or start one directly — for an existing patient file, or as a **standalone walk-in order with no patient folder at all** (just a name, and optional phone/email snapshotted onto the order itself; `patient_file_id` is nullable)
- No pricing anywhere in the ordering flow — lab orders a test, reception bills it separately. The `lab_tests` catalog still carries a price per test, kept as reception's future pricing reference, not something lab enters
- Mark an order in-progress, then record a result — a typed summary, an uploaded PDF/JPG/PNG file (max 10MB), or both — the accepted file types are labeled in the UI
- Email the result straight to the patient once complete (WhatsApp delivery is a planned follow-up, not built yet)
- Completed orders for a patient with a folder surface in that patient's file under a **Lab Results** tab — hidden entirely when there's nothing completed yet, same pattern as Dialysis

### 👔 Admin

- Full user management: approve pending staff accounts, change roles, deactivate/delete
- Browse the full, searchable system-wide audit log
- Approve/reject medical report requests
- A **Medical Records** tab, unscoped — sees every patient's full clinical content, same as a doctor would, without the per-doctor ownership restriction
- A "Total Revenue Today" card at the top of Bills & Receipts — every *payment* collected that day (not every invoice created that day), broken down by invoice type; counted off `Payment` rows so a same-day partial payment on an older invoice still counts, only rendered for the admin role even though that page is shared with Receptionist/Pharmacy
- Everything every other staff role can do, **plus** a dashboard role switcher: an admin account can toggle into the Doctor view (their own nav) without that ever granting an ordinary doctor account any admin access — it's one-directional, gated to the literal `admin` role only. While switched, the account displays with the "Dr." prefix everywhere a real doctor's name would appear, and appears (labeled "Hospital Administrator") in every doctor picker — booking, patient assignment — standing in as a doctor there too.

### 🌐 System-wide

- **Audit log**: nearly every write across every module (admissions, lab orders, invoices, user changes, sync decisions, etc.) is logged with actor, action, and description — browsable by admin under System Logs
- **Automated backups**: daily database backup + retention cleanup + a health-check job that alerts by email if a backup goes missing or shrinks unexpectedly
- **Dark mode**, responsive layout, toast-based feedback throughout

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React 19 + Vite | UI framework / build tool |
| React Router 6 | Client-side routing |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations |
| Axios | HTTP client, with an interceptor that auto-attaches the JWT and silently refreshes it |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend

| Technology | Purpose |
| --- | --- |
| Laravel 12 / PHP 8.2+ | API framework |
| MySQL 8+ | Database (one instance per deployment — cloud and local are separate databases) |
| `tymon/jwt-auth` | API authentication — every protected endpoint is JWT-secured, not session-based |
| `spatie/laravel-backup` | Scheduled database backups + health monitoring |
| Resend | Transactional email (password reset, lab results, account approvals, contact form, bug reports) |
| Laravel's own scheduler (`routes/console.php`) | Drives all recurring jobs — backups, pharmacy auto-close, and the offline sync cycle |

### Third-party services

- **Paystack** — card/bank/USSD payments (integration present, disabled by default; see [Payments](#-payments))
- **Resend** — outbound email
- **Google OAuth** — "Sign in with Google" alongside normal email/password

---

## 🚀 Getting Started

### Prerequisites

- PHP ≥ 8.2, Composer ≥ 2.0
- Node.js ≥ 18, npm
- MySQL ≥ 8.0
- Git

### 1. Clone

```bash
git clone https://github.com/KabirMarzooq/A4.git
cd A4
```

### 2. Backend (`A4backend/`)

```bash
cd A4backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

**`.env` is extensively commented — read it, don't just fill in blanks.** Every variable explains what it's for and what breaks if it's misconfigured, including the offline-sync and CORS variables described in [Architecture](#-architecture). At minimum for local development, set:

- `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` — then create that database and run `php artisan migrate`
- `ADMIN_SECRET` — required to register the first admin account
- `FRONTEND_URL` — wherever your frontend dev server runs (`http://localhost:5173` by default)

Leave `MAIL_MAILER=log` during development (emails get written to `storage/logs/laravel.log` instead of actually sending) and `PAYSTACK_ENABLED=false` unless you're specifically testing payments.

```bash
php artisan migrate
php artisan storage:link   # required for lab-result file uploads to be servable
```

Run it (Laravel Herd, or):

```bash
php artisan serve
```

### 3. Frontend (`Frontend/`) — two separate builds

This app produces **two different frontend builds from the same source**, because the API URL a build talks to is baked in at build time (Vite), not switchable at runtime:

```bash
cd ../Frontend
npm install
cp .env.example .env          # points at the cloud/dev backend by default
npm run dev                    # local dev server, http://localhost:5173
```

- `npm run build` → `dist/` — the **cloud** build (what Vercel deploys), reads `.env`
- `npm run build:hospital` → `dist-hospital/` — the **local** build for the hospital's own machine, reads `Frontend/.env.hospital` (edit that file's `VITE_API_BASE_URL` to point at wherever the local backend actually runs before building)

### 4. Deploying for real

- **Cloud**: Vercel (frontend, `npm run build`) + Railway (backend). Set `CORS_ALLOWED_ORIGINS` on Railway to the real Vercel domain; leave `SYNC_CLOUD_URL` unset there.
- **Local hospital server**: run the backend there too (own MySQL database, own `php artisan migrate`), serve the `dist-hospital/` build, set `SYNC_SECRET` to the *same* value as the cloud deployment and `SYNC_CLOUD_URL` to the real Railway URL. Schedule `php artisan schedule:run` to fire every minute (Windows Task Scheduler, "run whether user is logged on or not") — that single entry drives the 5-minute sync cycle along with every other scheduled job.

---

## 📁 Project Structure

```
A4/
├── A4backend/                          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/           # ~24 controllers, one per feature area
│   │   │   └── Admin/                  # Admin-only controllers (users, logs, schedules)
│   │   ├── Models/                     # Eloquent models
│   │   ├── Observers/                  # System-log audit trail — one per write-heavy model
│   │   ├── Console/Commands/           # sync:pull, sync:push, sync:run
│   │   └── Http/Middleware/            # RoleMiddleware, VerifySyncKey, etc.
│   ├── config/                         # cors.php, backup.php, services.php, jwt.php...
│   ├── database/migrations/            # Full schema history — the real source of truth for the data model
│   ├── resources/views/emails/         # Blade email templates
│   ├── routes/
│   │   ├── api.php                     # Every API route, grouped by role/feature
│   │   └── console.php                 # All scheduled jobs
│   └── .env.example                    # Fully documented — read this before deploying
│
└── Frontend/                           # React SPA
    ├── src/
    │   ├── components/                 # Dashboard shell, route guards, role-based home redirect
    │   ├── pages/                      # Public site + auth pages
    │   ├── sections/                   # One file per dashboard screen, per role
    │   ├── services/api.js             # Axios instance, JWT interceptor, auto-refresh
    │   └── utils/tokenRefresh.js
    ├── .env.example                    # Cloud/dev build config
    └── .env.hospital                   # Local hospital build config
```

---

## 🧩 Core Systems

### Patient records: folders → files → visit records

A `PatientFolder` (family) contains one or more `PatientFile`s (individuals). Every clinical encounter is a `VisitRecord` against a file — a general visit, a dialysis session (`visit_type = dialysis`, its own register-style tab, session numbers computed server-side and never client-editable), or a round-note during an inpatient stay (auto-linked to the active `Admission` with zero extra doctor action). Lab orders (`LabOrder`) hang off a `PatientFile` too, optionally linked to the visit record they were ordered from — or hang off nothing at all for a standalone lab walk-in with no folder.

Names and free-text clinical fields are normalized on write regardless of how they get there — form, API client, `tinker` — via Eloquent mutators (`App\Support\TextCase`) on `PatientFolder`/`PatientFile`/`VisitRecord`: proper nouns (names, places) become Title Case, narrative text (complaints, notes, diagnoses) gets sentence-case applied only to the first letter of each sentence so medical abbreviations (BP, HIV, IV) survive untouched. The frontend forms apply the same normalization at submit time too, purely so staff see the corrected casing immediately rather than waiting on a refetch — the backend mutator is what actually guarantees consistency.

### Billing

Billing is reception/admin's job, not the clinical staff's — doctors and lab no longer generate invoices at all. Reception writes an `Invoice` directly against an online or walk-in patient with free-form line items (**Create Invoice**, `POST /reception/bills`); the patient then pays at the desk (cash/POS/transfer) or online if Paystack is enabled. There's no separate "admission" or "dialysis" or "lab test" charge type — everything not created some other way funnels through this one manual-invoice path.

**Partial payments** are fully supported: `invoices.amount_paid` tracks a running total across every successful `Payment` against that invoice, and `status` becomes `partially_paid` (not `paid`) once `amount_paid` is more than zero but less than `total_amount`. Recording a cash payment accepts an optional `amount` — omit it to pay the full remaining balance, or specify less to leave a balance owing. A card payment (Paystack) always charges the full remaining balance in one go, since Paystack itself has no concept of a partial charge; the amount charged is computed server-side from the invoice's actual balance, not blindly from `total_amount`. Each payment — full or partial — gets its own `Receipt`.

Receipts print/download as a self-contained, inline-styled quarter-A4 (~105×148mm) document via the browser's native print dialog — no server-side PDF renderer is involved. The admin "Total Revenue Today" widget sums every `Payment` collected that day (not every invoice created), so it correctly reflects same-day partial payments on older invoices.

### Admissions

`Admission` tracks ward, admission/discharge dates, and status (`admitted`/`discharged`). A patient's file shows a live "Admitted — Ward: X — Day N" badge while active. Discharging just closes out the admission record — any billing that happened during the stay already went through the normal per-visit flow above.

Admitting and discharging happen from inside a patient's file, but the hospital-wide **Admissions** page (`GET /admissions`, nav item for doctor/receptionist/admin) is the ward board: who is currently admitted, which ward, under which doctor, and how many days in — filterable by current/discharged and searchable by patient.

### Offline sync

Covered in [Architecture](#-architecture) — the mechanism that lets online bookings reach the hospital's local, possibly-offline system, and lets a receptionist's decision reach the patient back online.

### Audit logging

`SystemLog` + a per-model Observer pattern: `AdmissionObserver`, `LabOrderObserver`, `SyncedBookingRequestObserver`, `InvoiceObserver`, etc. — each one logs the relevant state transitions (created, status changes) with the acting user, role, and a human-readable description, browsable by admin under System Logs with search and action-type filtering.

---

## 📡 API Reference

All endpoints are under `/api`, JWT-authenticated (`Authorization: Bearer {token}`) unless noted otherwise. `routes/api.php` is the authoritative, always-current list — grouped exactly as below with comment headers matching these names. This table is a map of *where things live*, not an exhaustive endpoint-by-endpoint listing (that lives in the route file itself, so it can't drift out of sync with this doc).

| Route group | Who can call it | What it covers |
| --- | --- | --- |
| `/auth/*` | Public | Register, login, refresh, logout, forgot/reset password |
| `/auth/google/*` | Public | Google OAuth redirect + callback |
| `/appointments`, `/my-appointments`, `/doctors` | Authenticated patient | Book, view, cancel, reschedule |
| `/doctor/*` | Doctor **+ Admin** (via the role switcher) | Appointment queue, accept/decline, dashboard overview, revenue |
| `/patient/*` | Patient | Own prescriptions, bills, receipts, Paystack init/verify, report requests |
| `/admin/*` | Admin only | User management, system logs, report-request approvals |
| `/schedules` | Receptionist, Admin | Cross-doctor schedule view |
| `/reception/*` | GET/cash-payment/card-init: Receptionist, Admin, Pharmacy. `POST /reception/bills` (Create Invoice): Receptionist, Admin only | Bills/receipts, cash & card payment recording (partial-payment aware), manual invoice creation |
| `/pharmacy/sales/*` | Pharmacy, Admin | Counter-sales register (receptionist no longer runs this desk) |
| `/pharmacy/drugs` | Pharmacy, Admin, Doctor | Drug inventory CRUD |
| `/folders/*` | Split by sensitivity: clinical writes (visit records) are Doctor/Admin only, and doctor access is further **scoped to their own patients** server-side; intake, assignment/transfer and admissions also allow Receptionist; read lookup and intake also allow **Lab** | Family folders, patient files, visit records, transfers, admissions |
| `/admissions` | Doctor, Receptionist, Admin | Hospital-wide ward board (who is admitted right now) |
| `/lab-tests`, `/lab-orders/*` | Doctor, Lab, Admin | Test catalog, order lifecycle (including `/lab-orders/standalone` for a folder-less walk-in), results, email delivery — no pricing on any order endpoint |
| `/sync/*` | Machine-to-machine (`X-Sync-Key` header, not JWT) | Cloud-side pull/push endpoints for the offline sync bridge |
| `/sync-requests/*` | View: Receptionist, Admin, Doctor (doctor sees only requests addressed to them by name). Confirm/decline: Doctor, Admin only | Local-side incoming online-booking queue — deciding whether to take the booking is the doctor's call, not reception's |
| `/notifications/*` | Any authenticated role | Per-section unread summary + `POST /notifications/seen` to persist that a section was checked, so a cleared dot stays cleared |
| `/webhook/paystack` | Public (Paystack's servers) | Payment confirmation webhook |
| `/contact`, `/report-issue` | Public / authenticated | Contact form, bug reports |

---

## 👥 Roles & Permissions

Six roles: `patient`, `doctor`, `receptionist`, `pharmacy`, `lab`, `admin`. Patient, doctor, receptionist, pharmacy, and lab all self-register; **doctor/receptionist/pharmacy/lab accounts start `pending`** and need an admin to approve them from the Users tab before they can log in. Admin registration requires the `ADMIN_SECRET` env value.

| Capability | Patient | Doctor | Receptionist | Pharmacy | Lab | Admin |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Book/view own appointments (approved doctors only) | ✅ | — | — | — | — | — |
| Accept/decline appointment queue (local + online-sync) | — | ✅ | — | — | — | ✅ (via role switch) |
| Patient folders — clinical read/write (diagnosis, notes, visit records) | — | ✅ own patients only | — | — | — | ✅ unscoped |
| Patient folders — read lookup (search, demographics, billing history) | — | ✅ own patients only | ✅ | — | ✅ | ✅ unscoped |
| Patient folders — create new patient intake (demographics only) | — | ✅ | ✅ | — | ✅ | ✅ |
| Dialysis sessions (clinical) | — | ✅ own patients only | — | — | — | ✅ unscoped |
| Admissions / doctor assignment & transfers | — | ✅ | ✅ | — | — | ✅ |
| Order lab tests (no pricing) | — | ✅ own patients only | — | — | ✅ (incl. folder-less walk-in) | ✅ |
| Fulfil lab orders, email results | — | — | — | — | ✅ | ✅ |
| Prescriptions — write | — | ✅ | — | — | — | — |
| Prescriptions — dispense | — | — | — | ✅ | — | — |
| Drug inventory — manage | — | view | — | ✅ | — | ✅ |
| Drug inventory — read (for counter sales) | — | — | — | ✅ | — | ✅ |
| Counter sales register | — | — | — | ✅ | — | ✅ |
| Create Invoice (manual bill, any patient) | — | — | ✅ | — | — | ✅ |
| Cash/card payment recording (full or partial) | — | — | ✅ | ✅ (desk) | — | ✅ |
| Sync requests — view queue | — | ✅ own requests only | ✅ | — | — | ✅ |
| Sync requests — confirm/decline | — | ✅ own requests only | — | — | — | ✅ |
| Total revenue today dashboard | — | — | — | — | — | ✅ |
| User management, system logs | — | — | — | — | — | ✅ |

---

## 🔒 Security

- **JWT authentication** (`tymon/jwt-auth`) — every protected route requires a valid bearer token; role checks happen server-side via `RoleMiddleware` on every route group, mirrored (not replaced) by frontend route guards
- **Named rate limiters** on the sensitive endpoints specifically — `login`, `register`, `forgot-password`, `reset-password`, `contact-form` — plus a blanket per-user/per-IP limit on every other API route as defense-in-depth
- **CORS**: origin allowlist, configurable via `CORS_ALLOWED_ORIGINS` (see [Architecture](#-architecture))
- **Offline sync** endpoints are authenticated by a separate shared-secret header (`X-Sync-Key`), compared with `hash_equals()` — there's no logged-in user on either end of that machine-to-machine call
- **Least-privilege data access**: e.g. Lab and Receptionist can look up a patient and create a new intake (demographics only) but never write clinical content; Receptionist's read access is additionally field-stripped server-side so diagnosis/notes/exam findings never leave the API for that role, not just hidden in the UI; Pharmacy is excluded from the folders/visit-records API entirely; a doctor's clinical read/write is further scoped server-side to patients they created or are currently assigned to — an unassigned or another doctor's file 403s, it isn't just absent from the list
- Passwords hashed via bcrypt (`BCRYPT_ROUNDS`, configurable) — note the cost factor is baked into each hash at creation time, so lowering `BCRYPT_ROUNDS` only speeds up newly-created accounts, not existing ones, unless those users' passwords are reset
- **Regulatory**: the hospital's CAC registration number (`RC 2635840`) is printed on every receipt, invoice, prescription, and medical report

No field-level encryption-at-rest is implemented for clinical data — protection currently relies on access control, not encryption. Worth knowing if this is being evaluated against a specific compliance standard.

---

## 💳 Payments

Paystack integration exists in the codebase but is **disabled by default** (`PAYSTACK_ENABLED=false`) — this deployment collects payment physically (cash/POS/transfer) at the reception desk instead, recorded via `ReceptionBillingController`. To re-enable online card payment: set real `PAYSTACK_SECRET_KEY`/`PAYSTACK_PUBLIC_KEY` from a [Paystack dashboard](https://dashboard.paystack.com/#/settings/developer), flip `PAYSTACK_ENABLED=true`, and register the webhook URL (`/api/webhook/paystack`) in Paystack's dashboard settings. No code changes are needed to turn it back on.

---

## 🤝 Contributing

1. Fork the repo, `git clone` your fork
2. `git checkout -b feature/your-feature`
3. Make your change — and **if it changes what the system does, update this README to match** (see the note at the top of this file's history: this doc is meant to track reality, not a point-in-time snapshot)
4. Commit using conventional prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
5. Push and open a PR describing what changed and why

**Code style**: PSR-12 for PHP, functional components + hooks for React, Tailwind utility classes first.

---

## 📄 License

No `LICENSE` file exists in this repository — treat it as **all rights reserved / proprietary** by default, not open source, until a specific license is deliberately added. (An earlier version of this README claimed MIT without an actual license file backing it — that was inaccurate and has been corrected.)

---

## 💬 Support

- **Email**: a4consortium@gmail.com
- **GitHub Issues**: [github.com/KabirMarzooq/A4/issues](https://github.com/KabirMarzooq/A4/issues)

---

## 🗺️ Roadmap

Not built yet, genuinely planned:

- [ ] WhatsApp delivery for lab results (email delivery is built; WhatsApp needs a WhatsApp Business API integration — real setup work, deliberately deferred)
- [ ] Cloud-side appointment cancellations reflecting back down into an already-pulled local sync request (currently a known gap — see `SyncPullAppointments`'s doc comment)
- [ ] Mobile app
- [ ] Telemedicine / video consultations
- [ ] Insurance integration

---

<div align="center">

**Made by Kabir Marzooq**

[⬆ Back to top](#-a4-medical-consortium--hospital-management-system)

</div>
