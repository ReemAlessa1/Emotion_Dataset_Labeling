# Emotion Labeling Task

A small web app for HAI Assignment 1 (A1-2). Participants label 5 randomly
selected tweets from a 54-tweet sample (9 per emotion, covering all six of
anger, fear, joy, love, sadness, surprise) with the emotion they think each
tweet expresses. Submissions are recorded (who labeled which tweet with which
label) in a Google Sheet via a small Google Apps Script backend.

- `index.html` — the entire frontend (HTML/CSS/JS, no build step, no
  dependencies). This is what you deploy to GitHub Pages.
- `Code.gs` — the backend. Paste this into a Google Apps Script project bound
  to a Google Sheet, and deploy it as a Web App.

## How it works

1. Participant enters an ID and starts.
2. The app randomly shuffles the 54-tweet pool and shows 5 tweets, one at a
   time, with 6 emotion buttons.
3. When all 5 are labeled, the app `POST`s a JSON batch to your deployed
   Apps Script Web App URL.
4. The Apps Script backend appends one row per labeled tweet to a "Labels"
   sheet: `timestamp, participant, tweet_id, tweet_text, true_label, chosen_label`.
5. The "View collected results" link `GET`s all rows back and displays them
   in a table, with a "Download as CSV" button for a local file.

## Setup — Part 1: backend (Google Sheet + Apps Script)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it something like `emotion-labeling-data`.
2. In the sheet, go to **Extensions > Apps Script**. This opens the Apps
   Script editor, already linked to this spreadsheet.
3. Delete the placeholder `myFunction() {}` code, and paste in the entire
   contents of `Code.gs` from this folder.
4. Save the project (the disk icon, or Ctrl/Cmd+S). Give it a name if
   prompted, e.g. `emotion-labeling-backend`.
5. Run the one-time setup function:
   - In the toolbar, select `setupSheet` from the function dropdown (next to
     the "Debug" button).
   - Click **Run**.
   - The first time, Google will ask you to authorize the script (since it
     writes to your sheet). Click through: **Review permissions > choose your
     account > Advanced > Go to (project name) (unsafe) > Allow**. This
     "unsafe" warning just means the script isn't published/verified by
     Google — normal for a personal script you wrote yourself.
   - Check your spreadsheet: a "Labels" tab should now exist with a header
     row (`timestamp, participant, tweet_id, ...`).
6. Deploy it as a web app:
   - Click **Deploy > New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: anything, e.g. "v1".
   - **Execute as:** Me (your account).
   - **Who has access:** Anyone.
   - Click **Deploy**.
   - Google will ask you to authorize again — same steps as above.
   - Copy the **Web app URL** it gives you. It looks like:
     `https://script.google.com/macros/s/AKfycb.../exec`

Keep this URL — you'll paste it into the frontend next.

> **Redeploying after edits:** if you change `Code.gs` later, edits alone
> won't update the live URL. Use **Deploy > Manage deployments > (pencil icon)
> > New version > Deploy** to push changes to the same URL.

## Setup — Part 2: frontend (GitHub Pages)

1. Create a new GitHub repository (public is fine and simplest for grading),
   e.g. `emotion-labeling-task`.
2. Add `index.html` (and this `README.md`, and `Code.gs` for reference/
   grading) to the repo — either via `git push` or by dragging files into
   the GitHub web UI ("Add file > Upload files").
3. Open `index.html` and find this block near the top of the `<script>` tag:
   ```js
   const CONFIG = {
     APPS_SCRIPT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"
   };
   ```
   Replace the placeholder string with the Web App URL you copied above, and
   commit the change.
4. In the repo, go to **Settings > Pages**.
   - Source: **Deploy from a branch**.
   - Branch: `main`, folder `/ (root)`.
   - Save.
5. GitHub will give you a URL like:
   `https://yourusername.github.io/emotion-labeling-task/`
   It can take a minute or two to go live after the first deploy.

## Testing it

1. Open your GitHub Pages URL.
2. Enter a participant ID and label all 5 tweets.
3. You should land on a confirmation screen ("All done — thank you").
4. Click **View collected results** — you should see your row(s) in the
   table. This is also where the assignment's required "screenshot of data
   collected" comes from.
5. Optionally click **Download as CSV** to get a local file of everything
   collected so far.
6. You can also just open the Google Sheet directly to see the raw rows.

## Troubleshooting

- **"Backend URL not configured yet"** — you haven't pasted the Apps Script
  URL into `CONFIG.APPS_SCRIPT_URL` in `index.html`.
- **Fetch/CORS errors in the results view or on submit** — make sure the
  deployment's "Who has access" is set to **Anyone**, not "Anyone with a
  Google account" or "Only myself." Also make sure you're using the `/exec`
  URL, not the `/dev` URL.
- **Changes to Code.gs don't show up** — see the "Redeploying after edits"
  note above; you need a new deployment version, not just a save.
- **Nothing shows up in the Sheet** — open the Apps Script editor, go to
  **Executions** (left sidebar) to see logs/errors from recent `doPost`/
  `doGet` calls.

## Notes for the assignment write-up

- This satisfies "not everyone sees exactly the same 5 tweets" via the
  client-side `shuffle()` + `slice(0, 5)` on every new session.
- "Record who labeled which tweet with which label" is satisfied by the
  `participant` + `tweet_id` + `chosen_label` columns written on each
  submission.
- The 54-tweet sample here is written in the style of dair-ai/emotion for
  prototyping. If you have access to the actual dataset (e.g. via the
  Hugging Face `datasets` library or a CSV export), swap the `TWEETS` array
  in `index.html` for real rows — just keep the same `{id, label, text}`
  shape.
