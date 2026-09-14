/**
 * Backend for the Emotion Labeling Task.
 *
 * This script lives inside a Google Sheet (Extensions > Apps Script) and is
 * deployed as a Web App. The frontend (index.html) POSTs each participant's
 * completed submission here, and GETs all rows back for the results view.
 *
 * SETUP (see README.md for full walkthrough):
 * 1. Create a Google Sheet. Rename Sheet1 (or any tab) to "Labels".
 * 2. Extensions > Apps Script, delete the placeholder code, paste this file.
 * 3. Run `setupSheet` once from the Apps Script editor to create the header row.
 * 4. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the resulting /exec URL into CONFIG.APPS_SCRIPT_URL in index.html.
 */

const SHEET_NAME = "Labels";
const HEADERS = ["timestamp", "participant", "tweet_id", "tweet_text", "true_label", "chosen_label"];

/**
 * One-time setup: creates the "Labels" sheet (if missing) and writes the
 * header row. Run this once manually from the Apps Script editor
 * (select this function in the toolbar dropdown, then click Run).
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Handles POST requests from the frontend: appends one row per labeled
 * tweet in the submitted batch.
 *
 * Expected JSON body:
 * {
 *   "participant": "jordan_p",
 *   "submitted_at": "2026-09-14T20:10:00.000Z",
 *   "answers": [
 *     { "tweet_id": "t01", "tweet_text": "...", "true_label": "anger", "chosen_label": "anger" },
 *     ...
 *   ]
 * }
 */
function doPost(e) {
  try {
    const sheet = getSheet_();
    const body = JSON.parse(e.postData.contents);

    if (!body.participant || !Array.isArray(body.answers)) {
      return jsonResponse_({ status: "error", message: "Missing participant or answers" });
    }

    body.answers.forEach(function (a) {
      sheet.appendRow([
        body.submitted_at || new Date().toISOString(),
        body.participant,
        a.tweet_id || "",
        a.tweet_text || "",
        a.true_label || "",
        a.chosen_label || ""
      ]);
    });

    return jsonResponse_({ status: "ok", rows_added: body.answers.length });
  } catch (err) {
    return jsonResponse_({ status: "error", message: err.message });
  }
}

/**
 * Handles GET requests: returns every recorded row as JSON, used by the
 * results view and CSV export in the frontend.
 */
function doGet(e) {
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return jsonResponse_([]);
    }
    const headers = values[0];
    const rows = values.slice(1).map(function (row) {
      const obj = {};
      headers.forEach(function (h, i) {
        obj[h] = row[i];
      });
      return obj;
    });
    return jsonResponse_(rows);
  } catch (err) {
    return jsonResponse_({ status: "error", message: err.message });
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
