import os
import uuid

import yt_dlp

from core.config import get_settings

_settings = get_settings()


class DownloadError(Exception):
    pass


def download_audio(url: str) -> tuple[str, dict]:
    """Download best audio track for the given YouTube URL. Returns (filepath, info)."""
    os.makedirs(_settings.audio_tmp_dir, exist_ok=True)
    out_id = uuid.uuid4().hex
    out_template = os.path.join(_settings.audio_tmp_dir, f"{out_id}.%(ext)s")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": out_template,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "128",
            }
        ],
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 30,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
    except yt_dlp.utils.DownloadError as exc:
        raise DownloadError(str(exc)) from exc

    duration = info.get("duration") or 0
    if _settings.max_video_seconds and duration > _settings.max_video_seconds:
        raise DownloadError(
            f"Video is {int(duration // 60)} min long; this free-tier deployment "
            f"caps transcription at {_settings.max_video_seconds // 60} min."
        )

    filepath = os.path.join(_settings.audio_tmp_dir, f"{out_id}.mp3")
    if not os.path.exists(filepath):
        # yt-dlp may have picked a different extension if ffmpeg postprocessing failed
        for ext in ("m4a", "webm", "opus"):
            candidate = os.path.join(_settings.audio_tmp_dir, f"{out_id}.{ext}")
            if os.path.exists(candidate):
                filepath = candidate
                break
        else:
            raise DownloadError("Audio download completed but output file was not found.")

    return filepath, info


def cleanup_audio(filepath: str) -> None:
    try:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
    except OSError:
        pass
