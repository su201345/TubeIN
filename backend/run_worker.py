from rq import Worker

from core.job_queue import get_queue, get_redis

if __name__ == "__main__":
    queue = get_queue()
    worker = Worker([queue], connection=get_redis())
    worker.work()
