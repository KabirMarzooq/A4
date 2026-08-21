// Shared by every screen that shows a prescription and needs a print/download
// button — patient's own view, doctor's issuing history, the reception/
// pharmacy cross-view, and the Prescriptions tab inside a patient's medical
// record. One template means the printed document looks the same regardless
// of which screen it was printed from, and a size/branding change only has
// to happen once.
//
// Self-contained inline-styled HTML rather than cloning the app's own
// stylesheets into the print window — see BillsandReceipts.jsx's ReceiptView
// for why: cloned <link> stylesheets don't block document.write's synchronous
// parse, so printing before they load reproduces an unstyled "raw form".
// Quarter-A4 (~105×148mm), matching the receipt size.
import { COMPANY_NAME, COMPANY_RC_NUMBER } from "./companyInfo";

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

/**
 * @param {object} p - a prescription object (items[] preferred, legacy
 *   medication/dosage/frequency/duration fields as fallback)
 * @param {string} [patientNameOverride] - use when the caller already knows
 *   the patient name more reliably than p.patient/p.patient_file (e.g. the
 *   Prescriptions tab inside an already-open patient file)
 */
export function printPrescription(p, patientNameOverride) {
  const patientName =
    patientNameOverride ||
    p.patient?.name ||
    (p.patient_file
      ? `${p.patient_file.first_name} ${p.patient_file.last_name}`
      : "Patient");

  const rows = p.items?.length
    ? p.items
        .map(
          (item) => `
          <tr>
            <td>${escapeHtml(item.drug_name)}</td>
            <td class="ctr">${escapeHtml(item.quantity)}</td>
            <td>${escapeHtml(item.dosage || "—")}</td>
            <td>${escapeHtml(item.frequency || "—")}</td>
            <td>${escapeHtml(item.duration || "—")}</td>
          </tr>`
        )
        .join("")
    : `
        <tr>
          <td>${escapeHtml(p.medication || "—")}</td>
          <td class="ctr">—</td>
          <td>${escapeHtml(p.dosage || "—")}</td>
          <td>${escapeHtml(p.frequency || "—")}</td>
          <td>${escapeHtml(p.duration || "—")}</td>
        </tr>`;

  const html = `
    <!DOCTYPE html><html><head>
    <meta charset="utf-8" />
    <title>Prescription — ${escapeHtml(patientName)}</title>
    <style>
      @page { size: 105mm 148mm; margin: 6mm; }
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'Segoe UI',Arial,sans-serif; color:#1e293b; font-size:9px; }
      .sheet { border:2px solid #0f766e; border-radius:6px; padding:10px; position:relative; overflow:hidden; }
      .sheet::before {
        content:''; position:absolute; inset:0; pointer-events:none;
        border:1px solid #99f6e4; border-radius:4px; margin:3px;
      }
      .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #14b8a6; padding-bottom:6px; margin-bottom:8px; }
      .brand { font-size:14px; font-weight:900; color:#0f766e; letter-spacing:-0.3px; }
      .brand-sub { font-size:7px; color:#64748b; margin-top:1px; }
      .rc { font-size:6.5px; color:#94a3b8; margin-top:2px; }
      .badge { background:#f0fdfa; border:1px solid #5eead4; color:#0f766e; font-size:6.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; padding:3px 6px; border-radius:999px; white-space:nowrap; }
      .patient { background:#f8fafc; border-radius:6px; padding:6px 8px; margin-bottom:8px; }
      .patient-name { font-weight:800; font-size:9.5px; }
      .patient-contact { font-size:7.5px; color:#94a3b8; }
      .meta { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:8px; font-size:7.5px; }
      .meta-item { background:#f8fafc; border-radius:5px; padding:5px 6px; }
      .meta-label { font-size:6px; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; font-weight:700; }
      .meta-value { font-weight:700; margin-top:1px; }
      table { width:100%; border-collapse:collapse; margin-bottom:6px; font-size:7px; }
      th { text-align:left; font-size:6px; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; border-bottom:1px solid #cbd5e1; padding:3px 2px; }
      td { padding:3px 2px; border-bottom:1px solid #e2e8f0; }
      .ctr { text-align:center; }
      .instructions { background:#fffbeb; border:1px solid #fde68a; border-radius:5px; padding:5px 6px; margin-bottom:6px; font-size:7px; color:#92400e; font-style:italic; }
      .footer { margin-top:8px; padding-top:6px; border-top:1px dashed #cbd5e1; font-size:6px; color:#94a3b8; text-align:center; line-height:1.5; }
    </style>
    </head><body>
      <div class="sheet">
        <div class="header">
          <div>
            <div class="brand">${escapeHtml(COMPANY_NAME)}</div>
            <div class="brand-sub">Hospital Management System</div>
            <div class="rc">${escapeHtml(COMPANY_RC_NUMBER)}</div>
          </div>
          <span class="badge">Official Prescription</span>
        </div>

        <div class="patient">
          <div class="patient-name">${escapeHtml(patientName)}</div>
        </div>

        <div class="meta">
          <div class="meta-item">
            <div class="meta-label">Prescribed By</div>
            <div class="meta-value">Dr. ${escapeHtml(p.doctor?.name || "—")}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Date Issued</div>
            <div class="meta-value">${escapeHtml(formatDate(p.created_at))}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Medication</th><th class="ctr">Qty</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        ${
          p.instructions
            ? `<div class="instructions">${escapeHtml(p.instructions)}</div>`
            : ""
        }

        <div class="footer">
          This is an official prescription issued by ${escapeHtml(COMPANY_NAME)}.<br />
          ${escapeHtml(COMPANY_RC_NUMBER)} · Generated on ${escapeHtml(formatDate(new Date()))}
        </div>
      </div>
    </body></html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
