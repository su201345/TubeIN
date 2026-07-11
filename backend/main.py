import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from routes import export, transcript

settings = get_settings()

app = FastAPI(title="YouTube Transcript Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcript.router)
app.include_router(export.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def start_in_process_worker():
    """Run the RQ worker in a background thread of the same process.

    On a single free-tier instance there's no separate always-on worker
    service, so the web process also drains the transcript job queue.
    Set RUN_WORKER_IN_PROCESS=false to disable this if a dedicated
    worker service is deployed separately.
    """
    if not settings.run_worker_in_process:
        return

    def _run():
        from rq import Worker

        from core.job_queue import get_queue, get_redis

        worker = Worker([get_queue()], connection=get_redis())
        worker.work(with_scheduler=False)

    thread = threading.Thread(target=_run, name="rq-worker", daemon=True)
    thread.start()
