from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from core.job_store import load_status
from models.schemas import JobStage
from services.formatters import build_docx, build_srt, build_txt, build_vtt

router = APIRouter(tags=["export"])

_MEDIA_TYPES = {
    "txt": "text/plain",
    "srt": "application/x-subrip",
    "vtt": "text/vtt",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.get("/export/{job_id}")
def export_transcript(
    job_id: str,
    fmt: str = Query("txt", pattern="^(txt|srt|vtt|docx)$"),
    lang: str = Query("original", pattern="^(original|en)$"),
):
    status = load_status(job_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found or expired.")
    if status.stage != JobStage.done or not status.lines:
        raise HTTPException(status_code=409, detail="Transcript is not ready yet.")

    use_english = lang == "en"
    filename = f"transcript-{job_id}.{fmt}"

    if fmt == "txt":
        content = build_txt(status.lines, use_english)
        return Response(content=content, media_type=_MEDIA_TYPES[fmt], headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        })
    if fmt == "srt":
        content = build_srt(status.lines, use_english)
        return Response(content=content, media_type=_MEDIA_TYPES[fmt], headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        })
    if fmt == "vtt":
        content = build_vtt(status.lines, use_english)
        return Response(content=content, media_type=_MEDIA_TYPES[fmt], headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        })
    if fmt == "docx":
        content = build_docx(status.lines, use_english)
        return Response(content=content, media_type=_MEDIA_TYPES[fmt], headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        })

    raise HTTPException(status_code=400, detail="Unsupported format.")
