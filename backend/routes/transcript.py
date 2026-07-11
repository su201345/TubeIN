import uuid

from fastapi import APIRouter, HTTPException

from core.job_queue import get_queue
from core.job_store import load_status, save_status
from models.schemas import JobCreatedResponse, JobStage, JobStatus, TranscriptRequest
from workers.job_worker import run_transcript_job

router = APIRouter(tags=["transcript"])


@router.post("/transcript", response_model=JobCreatedResponse)
def create_transcript_job(payload: TranscriptRequest) -> JobCreatedResponse:
    if not payload.url or "youtu" not in payload.url:
        raise HTTPException(status_code=400, detail="Please provide a valid YouTube URL.")

    job_id = uuid.uuid4().hex
    save_status(job_id, JobStatus(id=job_id, stage=JobStage.queued, progress=0, message="Queued"))

    queue = get_queue()
    queue.enqueue(
        run_transcript_job,
        job_id=job_id,
        url=payload.url,
        source_language=payload.source_language.value,
        want_translation=payload.want_translation,
        job_timeout=1800,
    )

    return JobCreatedResponse(id=job_id)


@router.get("/transcript/{job_id}", response_model=JobStatus)
def get_transcript_job(job_id: str) -> JobStatus:
    status = load_status(job_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found or expired.")
    return status
