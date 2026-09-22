# Deploying Phase 1 to ByteAndBook.com (cPanel File Manager)

This guide walks through publishing the new ByteAndBook site to the live
server. It assumes no command-line or developer experience. Follow the
steps **in order** and do not skip Step 2 (the backup).

**What you're deploying:** `byteandbook-deploy-phase1-2026-09-22.zip`
(found at the project root, next to this repository). Do not use any
other zip file.

**Time needed:** About 20-30 minutes, most of it waiting for uploads.

---

## Step 1: Log into cPanel and open File Manager

1. Go to your Namecheap cPanel login page and sign in.
2. In the cPanel dashboard, find the **Files** section and click **File
   Manager**.
3. In File Manager's left-hand folder tree, click into `public_html`.
   This is the folder that holds the live website. You should see files
   like `index.html` and a folder or files related to SSL
   (`.well-known`).

Do not change or delete anything yet, this step is just to confirm
you're in the right place.

---

## Step 2: Back up the current live site (do this before anything else)

This creates a safety copy of the site exactly as it is right now, in
case anything needs to be undone later.

1. While inside `public_html` in File Manager, click **Select All**
   (usually a toolbar button, or select every visible file/folder with
   your mouse).
2. Click **Compress** in the toolbar.
3. Choose **Zip Archive** as the format.
4. Name the archive exactly:
   ```
   byteandbook-backup-pre-phase1-2026-09-22.zip
   ```
5. Click **Compress File(s)**. cPanel will create the zip inside
   `public_html`.
6. Select that new zip file and click **Download** in the toolbar. Save
   it somewhere safe on your own computer (e.g. a "Backups" folder on
   your Desktop). Confirm the download finished and the file opens
   before continuing.
7. Once downloaded and confirmed, you may leave the zip in
   `public_html` for now or delete it from the server after Step 5
   confirms the new site is live and working (a local copy on your
   computer is what matters for rollback).

**Do not proceed to Step 4 until this backup is downloaded and
verified on your own computer.**

---

## Step 3: Confirm `.well-known` is present and will not be touched

1. Still inside `public_html`, make sure File Manager is set to show
   hidden files (folders starting with a dot). There's usually a
   **Settings** button in the top-right of File Manager with a "Show
   Hidden Files (dotfiles)" checkbox, turn it on if `.well-known`
   isn't visible.
2. Confirm you can see a folder named `.well-known`, and that it
   contains its SSL validation file(s) (2 files, per your hosting
   provider's SSL setup).
3. **Do not open, rename, move, or delete this folder or its
   contents at any point in this process.** The new site package
   (`byteandbook-deploy-phase1-2026-09-22.zip`) does not contain a
   `.well-known` folder at all, so extracting it will never overwrite
   or delete this folder. It's called out here only so you know to
   leave it alone if you see it during Steps 4-5.

---

## Step 4: Upload and extract the new site

1. Still inside `public_html`, click **Upload** in the toolbar.
2. Upload `byteandbook-deploy-phase1-2026-09-22.zip` from your
   computer. Wait for the upload progress bar to reach 100%.
3. Go back to the File Manager file listing (there's usually a "Go
   Back" link on the upload page) and confirm the zip file now appears
   inside `public_html`.
4. Right-click the uploaded zip file (or select it and use the
   toolbar) and choose **Extract**.
5. When prompted for the extraction destination, extract it directly
   into `public_html` (the default location cPanel suggests is
   usually correct, it should match the folder you're already in).
6. If cPanel asks whether to overwrite existing files, choose
   **Yes/Overwrite**. This is expected and correct: the new site
   reuses names like `index.html`, so the old versions need to be
   replaced with the new ones. This only replaces files that exist in
   the new zip; it will not delete `.well-known` or anything else not
   included in the zip.
7. Once extraction finishes, you should see new folders in
   `public_html` such as `about`, `services`, `contact`, `work`,
   `insights`, `process`, `privacy`, `terms`, `refund-policy`,
   `checkout`, an `api` folder, an `_astro` folder, plus `index.html`,
   `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`, `favicon.svg`,
   and a `styles.*.css` file.
8. Delete the uploaded zip file itself from `public_html` once
   extraction is confirmed successful (it doesn't need to stay on the
   server, it was only a delivery container).
9. Optional cleanup: if you see old files left over from the previous
   single-page site that aren't part of the list in step 7 (for
   example old image files the new site doesn't use), you can leave
   them for now. They won't break anything since the new pages don't
   reference them. If you want a fully clean `public_html`, check with
   your developer before deleting anything you don't recognize.

---

## Step 5: Verify the live site

Open a fresh/incognito browser window (so you're not seeing a cached
version) and check:

1. `https://byteandbook.com/` loads the new homepage, with no browser
   certificate warning (look for the padlock icon in the address bar).
2. `https://www.byteandbook.com/` also loads correctly over HTTPS with
   no certificate warning.
3. Click through a few pages to confirm they load: `/services/`,
   `/about/`, `/contact/`.
4. Confirm the padlock/HTTPS still shows no warning on those inner
   pages too.

If all of this looks correct, the deployment is complete. Use the
route list your developer gave you separately to do a fuller manual
check of every page.

---

## Step 6: Rollback (only if something looks broken)

If the live site is broken, showing errors, or missing content after
Step 4:

1. Go back into cPanel File Manager, `public_html`.
2. Select everything currently in `public_html` **except**
   `.well-known`, and delete it (or move it to a temporary folder if
   you'd rather not delete right away).
3. Upload your local copy of
   `byteandbook-backup-pre-phase1-2026-09-22.zip` (from Step 2) back
   into `public_html`.
4. Extract it into `public_html`, overwriting when prompted.
5. Delete the re-uploaded zip file once extraction is confirmed.
6. Reload `https://byteandbook.com/` in an incognito window to confirm
   the previous site is back.
7. Contact your developer with details of what looked broken before
   trying the new deploy again.

**Throughout rollback, as with deployment, never touch
`.well-known`.**
