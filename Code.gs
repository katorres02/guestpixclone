/**
 * Camila & Carlos — Wedding gallery (Google Apps Script backend)
 *
 * Serves the web page and exposes the functions used by the frontend:
 *  - listFiles()      → lists photos/videos in the Drive folder
 *  - initUpload(...)  → creates a resumable upload session on Drive
 *  - finalizeUpload() → makes the file public so thumbnails load
 *  - deleteFile(...)  → deletes a file (only if the same device uploaded it)
 */

const FOLDER_ID = '1cr-NVHiZJwcHnqf0G-0bKhSg1zJpbs2a';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Camila & Carlos — Share your photos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * JSON API for a frontend hosted outside Apps Script (e.g. GitHub Pages).
 * Called with fetch(POST, Content-Type: text/plain) to avoid CORS preflight.
 */
function doPost(e) {
  var res;
  try {
    var req = JSON.parse(e.postData.contents);
    var data;
    switch (req.action) {
      case 'list':
        data = listFiles();
        break;
      case 'initUpload':
        data = initUpload(req.name, req.mimeType, req.uploader, req.device, req.origin);
        break;
      case 'finalize':
        data = finalizeUpload(req.id);
        break;
      case 'delete':
        data = deleteFile(req.id, req.device);
        break;
      default:
        throw new Error('Unknown action: ' + req.action);
    }
    res = { data: data };
  } catch (err) {
    res = { error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Lists the folder's files, newest first. */
function listFiles() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  const out = [];
  while (files.hasNext()) {
    const f = files.next();
    let meta = {};
    try { meta = JSON.parse(f.getDescription() || '{}'); } catch (e) {}
    out.push({
      id: f.getId(),
      name: f.getName(),
      mimeType: f.getMimeType(),
      size: f.getSize(),
      created: f.getDateCreated().getTime(),
      uploader: meta.uploader || '',
      device: meta.device || ''
    });
  }
  out.sort(function (a, b) { return b.created - a.created; });
  return out;
}

/**
 * Creates a resumable upload session on the Drive API and returns the session
 * URL. The browser uploads the file directly to that URL (supports large
 * videos and a real progress bar).
 */
function initUpload(fileName, mimeType, uploader, device, origin) {
  const metadata = {
    name: fileName,
    parents: [FOLDER_ID],
    description: JSON.stringify({ uploader: uploader, device: device })
  };
  const res = UrlFetchApp.fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'post',
      contentType: 'application/json; charset=UTF-8',
      headers: {
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
        Origin: origin
      },
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true
    }
  );
  if (res.getResponseCode() !== 200) {
    throw new Error('Could not start the upload: ' + res.getContentText());
  }
  const headers = res.getHeaders();
  return headers.Location || headers.location;
}

/** Shares the file by link so thumbnails load without signing in. */
function finalizeUpload(fileId) {
  try {
    DriveApp.getFileById(fileId)
      .setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // If the folder is already public the file inherits the permission; not fatal.
  }
  return true;
}

/** Trashes a file, only if the same device uploaded it. */
function deleteFile(fileId, device) {
  const f = DriveApp.getFileById(fileId);
  let meta = {};
  try { meta = JSON.parse(f.getDescription() || '{}'); } catch (e) {}
  if (!device || meta.device !== device) {
    throw new Error('You can only delete the memories you uploaded.');
  }
  f.setTrashed(true);
  return true;
}
