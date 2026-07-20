# DSA Tutor

An adaptive DSA/pattern tutor: generates problems per topic, reviews your code,
Socratically checks whether you actually understand the *pattern* (not just the
code), and schedules review using spaced repetition (SM-2) so weak topics
resurface automatically. Also includes a personalized daily tech/AI/DSA digest.

## Architecture

```
backend/   FastAPI + SQLite. Owns problem generation, code review, Socratic
           evaluation, spaced repetition scheduling, and the digest builder.
frontend/  React (Vite), built as an installable PWA — works on desktop and
           mobile browsers today, and is the base for a native app later.
```

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env   # free key: https://aistudio.google.com/apikey
uvicorn main:app --reload --port 8000
```

Uses the Gemini API (free tier) via `google-genai`. `llm.py` defaults to
`gemini-flash-lite-latest` — if your key's free-tier quota is 0 on a given
model (varies by account/region), check `client.models.list()` for other
models available to your key and swap `MODEL` in `llm.py`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173. API calls proxy to the backend on :8000.

On your phone: open the deployed URL in Chrome/Safari, then "Add to Home
Screen" — the PWA manifest makes it installable like a real app.

## How the learning loop works

1. **Due Today** shows topics whose spaced-repetition schedule says you're due
   for review (or everything, if nothing's due yet).
2. Pick a topic → a fresh problem is generated at your current mastery level.
3. You write a short explanation of the *pattern* in your own words (the
   Socratic check — this is what catches "I copied the solution but don't
   really get it").
4. You write code, submit, and get an LLM code review (correctness, time/space
   complexity, bugs) plus feedback on your explanation.
5. Your combined score updates that topic's SM-2 schedule — nail it and the
   next review is pushed further out; struggle and it comes back tomorrow.

## Wiring the daily digest

`POST /digest/build` takes a list of `{title, url, snippet}` articles and has
Claude filter + summarize them against your stored interests
(`GET/POST /interests`). It deliberately does NOT scrape news itself, so you
can point it at whatever source you trust — options:

- A small script using Claude's web_search tool to gather AI/DSA headlines,
  then POST the results here
- An RSS aggregator (e.g. feedparser) hitting a few blogs/subreddits you like
- Cron this daily (e.g. `cron` on Linux, or a scheduled Cloudflare Worker
  given you've already got that stack from other projects)

## Roadmap

- **This weekend:** get the loop above working end-to-end for 2-3 topics.
- **Next:** add code execution (not just LLM review) via a sandboxed runner
  (e.g. Judge0 API or a Docker sandbox) so correctness isn't LLM-opinion-only.
- **Mobile native:** the frontend is plain React + fetch calls with no
  browser-only APIs, so it ports to **React Native / Expo** with the same
  component logic — the PWA isn't a dead end, it's the shared base.
- **Generalize beyond DSA:** the topic/problem/attempt/mastery schema isn't
  DSA-specific — swap `Problem.prompt` generation for "explain this system
  design concept" or "translate this sentence" and the same spaced-repetition
  engine works for any subject you want to learn in depth.

## Notes

- SQLite file (`dsa_tutor.db`) is local and gitignored — don't commit your
  progress data or API key.
- `GEMINI_API_KEY` must be set for problem generation, code review, and
  digest summarization to work.
