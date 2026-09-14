# Emotion Labeling Task

A small web app for HAI Assignment 1 (A1-2). Participants label 5 randomly
selected tweets from the full dair-ai/emotion dataset (996 tweets, 166 per
emotion, covering all six of anger, fear, joy, love, sadness, surprise).
Submissions are recorded (who labeled which tweet with which label) in a
Google Sheet via a small Google Apps Script backend.

- `index.html` — the entire frontend (HTML/CSS/JS, no build step, no
  dependencies). This is what you deploy to GitHub Pages.
- `tweets.json` — the tweet pool the app loads at runtime (`fetch("tweets.json")`).
  Must sit in the same folder as `index.html`.
- `Code.gs` — the backend. Paste this into a Google Apps Script project bound
  to a Google Sheet, and deploy it as a Web App.

## About tweets.json

This is the full dair-ai/emotion dataset from your CSV export (columns:
`text`, `label`, where label is `0`–`5` mapped to
`sadness, joy, love, anger, fear, surprise` respectively — the dataset's
standard encoding), converted to JSON as-is — all 996 rows, 166 per emotion,
nothing sampled or filtered out. Format:

```json
[
  { "id": "t0001", "label": "sadness", "text": "..." },
  { "id": "t0002", "label": "sadness", "text": "..." },
  ...
]
```

`id` and `label` are stored alongside the text mainly for your own
record-keeping/analysis (e.g. comparing `chosen_label` to `label` later) —
participants only ever see the `text`, and the app randomly shuffles the
full pool before picking 5 for each participant. If you want to regenerate
this file from a fresh CSV export, this is the conversion script used:

```python
import csv, json

LABEL_MAP = {'0':'sadness','1':'joy','2':'love','3':'anger','4':'fear','5':'surprise'}

out = []
counter = 1
with open('emotion_dataset.csv', newline='', encoding='utf-8') as f:
    r = csv.DictReader(f)
    for row in r:
        text = row['text'].strip()
        lbl = row['label'].strip()
        if lbl not in LABEL_MAP:
            continue
        out.append({'id': f't{counter:04d}', 'label': LABEL_MAP[lbl], 'text': text})
        counter += 1

with open('tweets.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2)
```

## How it works

1. Participant enters an ID and clicks start, which triggers a `fetch("tweets.json")`
   to load the tweet pool.
2. The app randomly shuffles the pool and picks 5 tweets for that participant.
3. The labeling screen shows one tweet at a time, with a persistent
   "Emotion guide" panel on the right (definition + example for each of
   the six emotions) that stays visible the whole time.
4. Selecting an emotion visibly highlights that choice; clicking
   **Submit answer** saves it and moves to the next unanswered tweet.
5. A progress bar below the tweet card shows all 5 tweets (numbered,
   checked off once answered). Participants can click any number to jump
   back, review, and change a previous answer at any point before finishing.
6. Once all 5 are answered, **Finish & submit all 5 answers** becomes
   enabled. Clicking it `POST`s the batch to your deployed Apps Script Web
   App URL, and the participant sees a simple thank-you message — no data
   export or download is offered to participants.
7. The Apps Script backend appends one row per labeled tweet to a "Labels"
   sheet: `timestamp, participant, tweet_id, tweet_text, true_label, chosen_label`.
8. The "View collected results" link (on the intro screen) `GET`s all rows
   back and displays them in a table — this is for you as the task
   deployer/researcher, not shown to participants during the task.

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
2. Add `index.html`, `tweets.json` (must be in the same folder — the app
   fetches it as a relative path), and this `README.md` and `Code.gs` for
   reference/grading, to the repo — either via `git push` or by dragging
   files into the GitHub web UI ("Add file > Upload files").
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
2. Enter a participant ID and label all 5 tweets (try clicking back to an
   earlier tweet via the progress bar and changing your answer, to confirm
   that works).
3. After clicking **Finish & submit all 5 answers**, you should land on a
   simple "Thank you!" screen.
4. Go back to the intro screen and click **View collected results** — you
   should see your row(s) in the table. This is also where the
   assignment's required "screenshot of data collected" comes from.
5. You can also just open the Google Sheet directly to see the raw rows.

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
- **"Couldn't load the tweet pool" error on the intro screen** — `tweets.json`
  isn't in the same folder as `index.html` on whatever you're hosting, or
  you're viewing the page via a local `file://` path instead of `http(s)://`
  (browsers block `fetch` of local files from `file://` pages in most cases).

## Notes for the assignment write-up

- This satisfies "not everyone sees exactly the same 5 tweets" via the
  client-side `shuffle()` + `slice(0, 5)` on every new session.
- "Record who labeled which tweet with which label" is satisfied by the
  `participant` + `tweet_id` + `chosen_label` columns written on each
  submission.
- `tweets.json` contains the full dataset (996 tweets, 166 per emotion),
  which comfortably satisfies "at least 50 tweets... cover all six emotion
  categories," and every participant gets a random 5 drawn from the whole
  set rather than a fixed shortlist.
- The right-hand "Emotion guide" panel (definition + example tweet per
  emotion) stays visible throughout the intro and labeling screens, so
  participants always have a reference for what each label means.
- Participants can revisit and change any of their 5 answers (via the
  progress bar) before hitting the final "Finish & submit" button, so
  labels aren't locked in the moment a button is clicked.
- Participants only ever see a thank-you message at the end — there's no
  CSV download or raw-data exposure in their flow. Data export (CSV or
  otherwise) is left to you as the researcher, via the Google Sheet
  directly or the "View collected results" table.
