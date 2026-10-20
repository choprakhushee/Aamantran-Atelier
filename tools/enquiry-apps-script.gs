// Aamantran Atelier — enquiry form → Google Sheet.
//
// Setup (about 5 minutes):
//   1. Create a Google Sheet called "Aamantran enquiries".
//   2. Extensions → Apps Script. Delete what's there and paste this whole file. Save.
//   3. Deploy → New deployment → type "Web app".
//      Execute as: Me. Who has access: Anyone. Deploy, and allow access when asked.
//   4. Copy the Web app URL (ends in /exec) into LEAD_ENDPOINT at the top of js/site.js,
//      then commit and push.
//
// Each request becomes a new row, and you get an email for every new lead.
// After editing this script, use Deploy → Manage deployments → Edit → New version
// so the live URL picks up the change.

const COLUMNS = [
  "submitted_at", "name", "partner", "phone", "email", "wedding_month",
  "city", "interest", "design", "functions", "note", "page",
];

function doPost(e) {
  const p = (e && e.parameter) || {};
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
  // Prefix with ' so Sheets keeps phone numbers and dates as typed.
  sheet.appendRow(COLUMNS.map((c) => (p[c] ? "'" + String(p[c]).slice(0, 2000) : "")));

  const owner = Session.getEffectiveUser().getEmail();
  if (owner) {
    MailApp.sendEmail({
      to: owner,
      subject: "New enquiry: " + (p.name || "someone") + (p.partner ? " & " + p.partner : ""),
      body: COLUMNS.map((c) => c + ": " + (p[c] || "")).join("\n") +
        "\n\nSheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    });
  }
  return ContentService.createTextOutput("ok");
}
