# 📸 Camila & Carlos — Wedding Gallery

A simple GuestPix-style clone: guests upload photos and videos from their
phones (no sign-in required) straight into a Google Drive folder, browse
everyone's gallery, and can delete **only what they uploaded themselves**.

- **Frontend:** a single HTML file with Tailwind CSS (responsive, mobile-first).
- **Backend:** Google Apps Script (runs under the folder owner's account, which
  is why guests never need to log in).
- **Destination folder:** `1cr-NVHiZJwcHnqf0G-0bKhSg1zJpbs2a` (already set in `Code.gs`).

## 🧭 Two ways to publish

| Option | What you do | Final URL |
|---|---|---|
| **A. Apps Script only** (simplest) | Paste 3 files into script.google.com | `script.google.com/macros/s/.../exec` |
| **B. GitHub Pages + Apps Script** | Same as A **+** serve `docs/index.html` from this repo | `katorres02.github.io/guestpixclone/` (nicer for the QR code) |

⚠️ In both cases the **Apps Script is required**: it is the "backend" that
writes to Drive using the owner's account. GitHub Pages is static hosting —
any credential or "env variable" placed there ends up visible in every guest's
browser, and a credential with write access to your Drive would be unsafe.
The Apps Script solves this: the credential lives at Google, and it only
exposes four controlled actions (list, upload, publish thumbnail, delete-your-own).

## 🚀 Step 1 (required): deploy the Apps Script (~5 minutes)

1. Go to [script.google.com](https://script.google.com) with the account that
   owns the Drive folder and create a **New project**.
2. In the default `Code.gs` file, delete everything and paste the contents of
   **`Code.gs`** from this repo.
3. Menu **＋ (Add file) → HTML**, name it exactly **`Index`** and paste the
   contents of **`Index.html`**.
4. Open **⚙️ Project Settings** and check *"Show appsscript.json manifest file"*.
   Open it in the editor and replace it with the contents of **`appsscript.json`**.
5. Blue button **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone** (anonymous)
6. Authorize the permissions when prompted (you'll see an "unverified app"
   screen: *Advanced → Go to project*; this is normal for your own script).
7. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

If you choose **option A**, that URL is already the page you share with your
guests and you're done. For **option B**, continue to step 2.

## 🌐 Step 2 (optional): frontend on GitHub Pages

1. Open `docs/index.html` and paste the `/exec` URL from the previous step into
   the `SCRIPT_URL` constant (at the very top, clearly marked).
2. Push to this repo.
3. In the repo: **Settings → Pages → Source: Deploy from a branch →
   Branch: `main`, folder `/docs` → Save**.
4. In 1-2 minutes the page is live at `https://katorres02.github.io/guestpixclone/`.

No environment variables or credentials are needed on GitHub: the only value
the HTML carries is the public Apps Script URL.

### 📱 Share it with a QR code

Generate a QR code with the URL (for example at [qr.io](https://qr.io) or any
generator) and print it on the tables: *"Share your photos of the wedding"*.

## ✅ Important details

- **Thumbnails visible to everyone:** the Drive folder must be shared as
  *"Anyone with the link → Viewer"*. (The script also makes each file public
  when the upload finishes, just in case.)
- **Large videos:** files upload directly to Google using resumable upload
  sessions, so heavy videos work and show a real progress bar.
- **"Delete my photos":** each phone gets an anonymous ID (stored in the
  browser). Only files uploaded from that same device can be deleted; deleting
  sends the file to your Drive trash (recoverable for 30 days).
- **Design changes:** edit `Index.html` (option A) or `docs/index.html`
  (option B). For option A, paste the new version into Apps Script and use
  **Deploy → Manage deployments → ✏️ → New version** to update without
  changing the URL.

## 🗂 Files

| File | What it is | Where it goes |
|---|---|---|
| `Code.gs` | Backend (list, upload, delete) | Apps Script → `Code.gs` |
| `Index.html` | The web page served by Apps Script (option A) | Apps Script → HTML file `Index` |
| `appsscript.json` | Web app permissions and configuration | Apps Script → manifest |
| `docs/index.html` | Standalone page for GitHub Pages (option B) | This repo, served by Pages |
