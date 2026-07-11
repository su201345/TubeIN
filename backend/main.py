import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rq.timeouts import BaseDeathPenalty

from core.config import get_settings
from routes import export, transcript


class NoOpDeathPenalty(BaseDeathPenalty):
    """Disables RQ's signal-based per-job timeout enforcement.

    BaseDeathPenalty itself is abstract (setup/cancel raise
    NotImplementedError), so it can't be used directly as a stand-in --
    this provides real no-op bodies instead.
    """

    def setup_death_penalty(self):
        pass

    def cancel_death_penalty(self):
        pass


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
        import logging

        from rq.worker import SimpleWorker

        from core.job_queue import get_queue, get_redis

        logging.basicConfig(level=logging.INFO)
        # RQ's default Worker relies on signal.signal() in three places:
        # SIGINT/SIGTERM on bootstrap, SIGALRM to monitor a forked worker
        # horse, and SIGALRM again per-job for timeout enforcement
        # (death_penalty_class). Python only allows installing signal
        # handlers from the main thread, but this worker runs in a
        # background thread (so a single free-tier instance can serve HTTP
        # and process jobs without a separate paid worker service). So:
        # - SimpleWorker runs jobs in-thread instead of forking, removing
        #   the SIGALRM-based horse monitor.
        # - death_penalty_class is swapped for RQ's no-op base class,
        #   removing the per-job SIGALRM timeout (job_timeout is still
        #   respected by RQ's bookkeeping, it just can't forcibly interrupt
        #   a hung job without OS signals -- acceptable here since jobs run
        #   one at a time in this single-instance deployment anyway).
        # - _install_signal_handlers is no-op'd to survive bootstrap.
        worker = SimpleWorker([get_queue()], connection=get_redis())
        worker.death_penalty_class = NoOpDeathPenalty
        worker._install_signal_handlers = lambda: None
        try:
            worker.work(with_scheduler=False)
        except Exception:
            logging.getLogger(__name__).exception("RQ worker thread crashed")

    thread = threading.Thread(target=_run, name="rq-worker", daemon=True)
    thread.start()
