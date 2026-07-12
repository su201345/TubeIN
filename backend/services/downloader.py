import os
import time
import uuid

import yt_dlp

from core.config import get_settings

_settings = get_settings()

# Player clients that don't require a PO token, ordered by how reliably they
# work from datacenter/hosting IPs (which YouTube is more likely to flag with
# "Sign in to confirm you're not a bot" on the default web client).
# android_vr and tv are JS-player-free and PO-token-free; web_safari is kept
# as a last resort since it's yt-dlp's other current default.
_PLAYER_CLIENT_ATTEMPTS = ["android_vr", "tv", "web_safari"]

_BOT_CHECK_MARKERS = ("sign in to confirm you're not a bot", "confirm you're not a bot")


class DownloadError(Exception):
    pass


def _is_bot_check_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(marker in message for marker in _BOT_CHECK_MARKERS)


def download_audio(url: str) -> tuple[str, dict]:
    """Download best audio track for the given YouTube URL. Returns (filepath, info)."""
    os.makedirs(_settings.audio_tmp_dir, exist_ok=True)
    out_id = uuid.uuid4().hex
    out_template = os.path.join(_settings.audio_tmp_dir, f"{out_id}.%(ext)s")

    base_opts = {
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

    last_exc: Exception | None = None
    info = None
    for attempt, client in enumerate(_PLAYER_CLIENT_ATTEMPTS):
        ydl_opts = {
            **base_opts,
            "extractor_args": {"youtube": {"player_client": [client]}},
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
            last_exc = None
            break
        except yt_dlp.utils.DownloadError as exc:
            last_exc = exc
            # Only worth retrying with another client if this looks like the
            # bot-check / IP-reputation failure; other errors (private video,
            # age-restricted, etc.) won't be fixed by switching clients.
            if not _is_bot_check_error(exc):
                break
            if attempt < len(_PLAYER_CLIENT_ATTEMPTS) - 1:
                time.sleep(1.5 * (attempt + 1))
            continue

    if last_exc is not None:
        if _is_bot_check_error(last_exc):
            raise DownloadError(
                "YouTube is blocking downloads from this server's IP address "
                "('Sign in to confirm you're not a bot'). This video has no "
                "existing captions to fall back on, so a transcript can't be "
                "produced right now. Try again later or use a video that "
                "already has captions."
            ) from last_exc
        raise DownloadError(str(last_exc)) from last_exc

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
