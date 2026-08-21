// Full-A4 printable summary of a patient's clinical record — deliberately
// NOT quarter-A4 like receipts/prescriptions (see printPrescription.js):
// an arbitrary number of visits, a dialysis register, lab results, and
// prescriptions genuinely need the room. Self-contained inline-styled HTML,
// same reasoning as printPrescription.js — no dependency on the print
// window loading cloned stylesheets in time.
//
// Sourced directly from the already-loaded PatientFile/VisitRecord data in
// PatientFileView (MedicalRecords.jsx) — this is the real, current clinical
// record, not the legacy MedicalReport request flow (MedicalReports.jsx),
// which reads from MedicalRecord/PatientProfile models nothing ever writes
// to and so always renders empty.
import { COMPANY_NAME, COMPANY_RC_NUMBER } from "./companyInfo";

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

const formatDate = (date, opts) =>
  date
    ? new Date(date).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...opts,
      })
    : "—";

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export function printMedicalRecord({
  file,
  generalRecords = [],
  dialysisRecords = [],
  prescriptions = [],
  labResults = [],
}) {
  const age = calcAge(file?.date_of_birth);

  const demographics = [
    { label: "Blood Type", value: file?.blood_type },
    { label: "Gender", value: file?.gender },
    { label: "Age", value: age !== null ? `${age} yrs` : null },
    { label: "Genotype", value: file?.genotype },
    { label: "Blood Group", value: file?.blood_group ? `${file.blood_group}${file.rhesus === "Negative" ? "-" : file.rhesus === "Positive" ? "+" : ""}` : null },
  ].filter((d) => d.value);

  const visitRows = generalRecords
    .map(
      (r) => `
      <div class="visit">
        <div class="visit-head">
          <span class="visit-date">${escapeHtml(formatDate(r.visit_date))}</span>
          <span class="visit-doctor">Dr. ${escapeHtml(r.doctor?.name || "—")}</span>
        </div>
        ${r.chief_complaint ? `<div class="field"><span class="field-label">Chief Complaint</span><span>${escapeHtml(r.chief_complaint)}</span></div>` : ""}
        ${
          r.blood_pressure || r.temperature_c || r.heart_rate || r.oxygen_saturation
            ? `<div class="vitals">
                ${r.blood_pressure ? `<span class="vital">BP ${escapeHtml(r.blood_pressure)}</span>` : ""}
                ${r.temperature_c ? `<span class="vital">Temp ${escapeHtml(r.temperature_c)}°C</span>` : ""}
                ${r.heart_rate ? `<span class="vital">HR ${escapeHtml(r.heart_rate)} bpm</span>` : ""}
                ${r.oxygen_saturation ? `<span class="vital">SpO2 ${escapeHtml(r.oxygen_saturation)}%</span>` : ""}
              </div>`
            : ""
        }
        ${r.diagnosis ? `<div class="field"><span class="field-label">Diagnosis</span><span>${escapeHtml(r.diagnosis)}</span></div>` : ""}
        ${r.notes ? `<div class="field"><span class="field-label">Notes</span><span class="muted">${escapeHtml(r.notes)}</span></div>` : ""}
        ${r.action_taken ? `<div class="field"><span class="field-label">Action Taken</span><span>${escapeHtml(r.action_taken)}</span></div>` : ""}
      </div>`
    )
    .join("");

  const dialysisRows = dialysisRecords
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(formatDate(r.visit_date, { month: "short" }))}</td>
        <td>${escapeHtml(r.session_number ?? "—")}</td>
        <td>${escapeHtml(r.access_type || "—")}</td>
        <td>${escapeHtml(r.pre_bp || "—")}</td>
        <td>${escapeHtml(r.post_bp || "—")}</td>
        <td>${escapeHtml(r.uf_ml ?? "—")}</td>
        <td>${escapeHtml(r.duration_hours ?? "—")}</td>
      </tr>`
    )
    .join("");

  const labRows = labResults
    .map(
      (o) => `
      <div class="visit">
        <div class="visit-head">
          <span class="visit-date">${escapeHtml(o.test_name)}</span>
          <span class="visit-doctor">${escapeHtml(formatDate(o.completed_at))}</span>
        </div>
        ${o.result_summary ? `<div class="field"><span>${escapeHtml(o.result_summary)}</span></div>` : ""}
      </div>`
    )
    .join("");

  const prescriptionRows = prescriptions
    .map((p) => {
      const items = p.items?.length
        ? p.items.map((i) => `${i.drug_name} (${i.quantity})`).join(", ")
        : p.medication || "—";
      return `
      <div class="visit">
        <div class="visit-head">
          <span class="visit-date">${escapeHtml(items)}</span>
          <span class="visit-doctor">${escapeHtml(formatDate(p.created_at))} · Dr. ${escapeHtml(p.doctor?.name || "—")}</span>
        </div>
        ${p.instructions ? `<div class="field"><span class="muted">${escapeHtml(p.instructions)}</span></div>` : ""}
      </div>`;
    })
    .join("");

  const section = (title, count, bodyHtml, emptyText) => `
    <div class="section">
      <p class="section-title">${escapeHtml(title)} (${count})</p>
      ${count === 0 ? `<p class="empty">${escapeHtml(emptyText)}</p>` : bodyHtml}
    </div>`;

  const html = `
    <!DOCTYPE html><html><head>
    <meta charset="utf-8" />
    <title>Medical Record — ${escapeHtml(file?.full_name || "")}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'Segoe UI',Arial,sans-serif; color:#1e293b; font-size:11px; line-height:1.5; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #0f766e; padding-bottom:14px; margin-bottom:16px; }
      .brand { font-size:20px; font-weight:900; color:#0f766e; letter-spacing:-0.3px; }
      .brand-sub { font-size:10px; color:#64748b; margin-top:2px; }
      .rc { font-size:9px; color:#94a3b8; margin-top:2px; }
      .doc-title { text-align:right; }
      .doc-title .label { font-size:10px; color:#64748b; }
      .doc-title .date { font-size:10px; color:#94a3b8; margin-top:2px; }
      .patient-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; margin-bottom:16px; }
      .patient-name { font-size:16px; font-weight:900; margin-bottom:8px; }
      .demo-grid { display:flex; flex-wrap:wrap; gap:16px; margin-bottom:6px; }
      .demo-item { font-size:10px; }
      .demo-label { text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; font-weight:700; font-size:8.5px; }
      .demo-value { font-weight:700; }
      .alerts { display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; }
      .alert { flex:1; min-width:200px; border-radius:6px; padding:8px 10px; font-size:10px; }
      .alert-allergy { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; }
      .alert-chronic { background:#fffbeb; border:1px solid #fde68a; color:#92400e; }
      .alert-label { text-transform:uppercase; font-weight:800; font-size:8.5px; letter-spacing:0.5px; margin-bottom:2px; }
      .section { margin-bottom:18px; }
      .section-title { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid #e2e8f0; }
      .empty { font-size:10px; color:#94a3b8; font-style:italic; }
      .visit { border:1px solid #e2e8f0; border-radius:6px; padding:10px 12px; margin-bottom:8px; page-break-inside:avoid; }
      .visit-head { display:flex; justify-content:space-between; margin-bottom:6px; }
      .visit-date { font-weight:800; color:#0f766e; font-size:10.5px; }
      .visit-doctor { font-size:9px; color:#94a3b8; }
      .field { margin-bottom:4px; font-size:10px; }
      .field-label { text-transform:uppercase; font-size:8px; letter-spacing:0.5px; color:#94a3b8; font-weight:700; margin-right:6px; }
      .muted { color:#64748b; font-style:italic; }
      .vitals { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:6px; }
      .vital { background:#f1f5f9; border-radius:4px; padding:2px 7px; font-size:9px; font-weight:700; color:#475569; }
      table { width:100%; border-collapse:collapse; font-size:9px; }
      th { text-align:left; text-transform:uppercase; font-size:8px; letter-spacing:0.4px; color:#64748b; border-bottom:1px solid #cbd5e1; padding:5px 4px; }
      td { padding:5px 4px; border-bottom:1px solid #e2e8f0; }
      .footer { margin-top:16px; padding-top:10px; border-top:1px dashed #cbd5e1; font-size:8.5px; color:#94a3b8; text-align:center; line-height:1.6; }
    </style>
    </head><body>
      <div class="header">
        <div>
          <div class="brand">${escapeHtml(COMPANY_NAME)}</div>
          <div class="brand-sub">Hospital Management System</div>
          <div class="rc">${escapeHtml(COMPANY_RC_NUMBER)}</div>
        </div>
        <div class="doc-title">
          <div class="label">Medical Record</div>
          <div class="date">Generated ${escapeHtml(formatDate(new Date()))}</div>
        </div>
      </div>

      <div class="patient-box">
        <div class="patient-name">${escapeHtml(file?.full_name || "")}</div>
        <div class="demo-grid">
          ${demographics
            .map(
              (d) =>
                `<div class="demo-item"><div class="demo-label">${escapeHtml(d.label)}</div><div class="demo-value">${escapeHtml(d.value)}</div></div>`
            )
            .join("")}
          <div class="demo-item"><div class="demo-label">Card No.</div><div class="demo-value">${escapeHtml(file?.folder?.card_number || "—")}</div></div>
        </div>
        ${
          file?.allergies || file?.chronic_conditions
            ? `<div class="alerts">
                ${file?.allergies ? `<div class="alert alert-allergy"><div class="alert-label">Allergies</div>${escapeHtml(file.allergies)}</div>` : ""}
                ${file?.chronic_conditions ? `<div class="alert alert-chronic"><div class="alert-label">Chronic Conditions</div>${escapeHtml(file.chronic_conditions)}</div>` : ""}
              </div>`
            : ""
        }
      </div>

      ${section("Visit History", generalRecords.length, visitRows, "No visit records on file.")}

      ${
        dialysisRecords.length > 0
          ? `<div class="section">
              <p class="section-title">Dialysis Sessions (${dialysisRecords.length})</p>
              <table>
                <thead><tr><th>Date</th><th>#</th><th>Access</th><th>Pre BP</th><th>Post BP</th><th>UF(ml)</th><th>Duration</th></tr></thead>
                <tbody>${dialysisRows}</tbody>
              </table>
            </div>`
          : ""
      }

      ${section("Lab Results", labResults.length, labRows, "No completed lab results.")}

      ${section("Prescriptions", prescriptions.length, prescriptionRows, "No prescriptions on file.")}

      <div class="footer">
        This is an official medical record extract from ${escapeHtml(COMPANY_NAME)} HMS. ${escapeHtml(COMPANY_RC_NUMBER)}<br />
        Confidential — for the named patient's care only.
      </div>
    </body></html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 150);
}
