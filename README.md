# YouTube Transcript Generator (Free Stack Clone)

A free, open-source clone of the YouTube Transcript Generator tool — transcribes
any spoken language (including Telugu, Hindi, Tamil) and translates to English,
using only free/open-source components. No paid APIs anywhere in the stack.

## Architecture

- **`frontend/`** — Next.js app (deploy to Vercel free Hobby tier). No model
  inference happens here; it only submits jobs and polls for results.
- **`backend/`** — FastAPI service (deploy to Render free tier, or
  Railway/Fly.io/a VPS). Runs `yt-dlp`, `faster-whisper`, and NLLB-200. This is
  where all the heavy lifting happens, on an always-on host.
- **Redis + RQ** — background job queue so transcription never blocks the HTTP
  request. Use a free Redis instance (e.g. Upstash) in production.

### Pipeline

1. `POST /transcript` enqueues a job and returns a job ID immediately.
2. Frontend polls `GET /transcript/{id}` every ~2s and shows the current stage.
3. Worker tries `youtube-transcript-api` first (free, instant, no key).
4. If no usable captions exist, it downloads audio with `yt-dlp` and runs
   `faster-whisper` (`task=transcribe` for the original language,
   `task=translate` for direct English output).
5. If only text-to-text translation is needed (e.g. existing native-language
   captions), it uses NLLB-200-distilled-600M instead of re-running Whisper.
6. Results (timestamped lines, original + English) are written back to the job
   record and rendered by the frontend: transcript panel, video sync, search,
   export.

## Local development

```bash
cp .env.example .env
docker compose up --build
```

This starts Redis, the FastAPI backend, an RQ worker, and the Next.js frontend
at `http://localhost:3000` (backend at `http://localhost:8000`).

To run frontend/backend separately without Docker:

```bash
# Backend
cd backend
pip install -r requirements.txt
redis-server &                # or point REDIS_URL at a hosted instance
uvicorn main:app --reload &
python run_worker.py &

# Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Deployment

1. **Frontend → Vercel**: connect the repo (root directory `frontend/`), set
   `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL, deploy.
2. **Backend → Render**: create a Docker web service from `backend/`. Render
   will build the Dockerfile, which bakes the Whisper model into the image at
   build time so it isn't re-downloaded on every cold start. Add a second
   Render **background worker** service using the same image with
   `python run_worker.py` as the start command.
3. **Redis → Upstash** (free tier): set `REDIS_URL` on both Render services.
4. Add your Vercel domain to `CORS_ORIGINS` on the backend.

## Tradeoffs

- Telugu/Tamil/Hindi are lower-tier accuracy languages for Whisper; the
  `medium` model (configurable via `WHISPER_MODEL_SIZE`) balances accuracy vs.
  CPU-only inference speed on free tiers. `MAX_VIDEO_SECONDS` caps video length
  to keep wait times reasonable.
- Render's free tier cold-starts after 15 minutes idle (30–50s wake-up) — the
  loading UI explicitly messages this so it doesn't look broken.
- `youtube-transcript-api` has no official rate limit, but a small delay is
  added between requests to avoid throttling.
- Downloading audio via `yt-dlp` for transcription should be limited to
  personal/non-commercial use per YouTube's Terms of Service.

## Project structure

See inline comments in `frontend/` and `backend/` for the full layout: routes,
services (captions/downloader/transcriber/translator/formatters), the RQ
worker pipeline, and the UI components (Hero, UrlInput, VideoPlayer,
TranscriptPanel, SearchBar, ExportMenu, LanguageToggle, loading/empty/error
states, FeatureGrid, HowItWorks, FAQ).
