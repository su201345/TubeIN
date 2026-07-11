from redis import Redis
from rq import Queue

from core.config import get_settings

_settings = get_settings()

_redis_conn: Redis | None = None
_queue: Queue | None = None


def get_redis() -> Redis:
    global _redis_conn
    if _redis_conn is None:
        _redis_conn = Redis.from_url(_settings.redis_url)
    return _redis_conn


def get_queue() -> Queue:
    global _queue
    if _queue is None:
        _queue = Queue("transcripts", connection=get_redis(), default_timeout=1800)
    return _queue
