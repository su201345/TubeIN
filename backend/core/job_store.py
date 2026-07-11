import json

from core.config import get_settings
from core.job_queue import get_redis
from models.schemas import JobStatus

_settings = get_settings()
_KEY_PREFIX = "job_status:"


def save_status(job_id: str, status: JobStatus) -> None:
    redis_conn = get_redis()
    redis_conn.set(
        f"{_KEY_PREFIX}{job_id}",
        status.model_dump_json(),
        ex=_settings.job_result_ttl,
    )


def load_status(job_id: str) -> JobStatus | None:
    redis_conn = get_redis()
    raw = redis_conn.get(f"{_KEY_PREFIX}{job_id}")
    if raw is None:
        return None
    return JobStatus(**json.loads(raw))
