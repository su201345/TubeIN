import re
import time

from youtube_transcript_api import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
    YouTubeTranscriptApi,
)

from models.schemas import TranscriptLine

_YOUTUBE_ID_RE = re.compile(
    r"(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})"
)


def extract_video_id(url: str) -> str | None:
    match = _YOUTUBE_ID_RE.search(url)
    if match:
        return match.group(1)
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", url.strip()):
        return url.strip()
    return None


def fetch_existing_captions(
    video_id: str, preferred_lang: str | None
) -> tuple[list[TranscriptLine], str] | None:
    """Return (lines, language_code) if usable captions already exist, else None."""
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    except (TranscriptsDisabled, VideoUnavailable, NoTranscriptFound):
        return None
    except Exception:
        return None

    transcript = None
    lang_code = None

    candidates = []
    if preferred_lang and preferred_lang != "auto":
        candidates.append(preferred_lang)
    candidates.append("en")

    for code in candidates:
        try:
            transcript = transcript_list.find_transcript([code])
            lang_code = code
            break
        except NoTranscriptFound:
            continue

    if transcript is None:
        try:
            transcript = next(iter(transcript_list))
            lang_code = transcript.language_code
        except StopIteration:
            return None

    try:
        raw = transcript.fetch()
    except Exception:
        return None

    time.sleep(0.3)  # be gentle with YouTube's caption endpoint

    lines = [
        TranscriptLine(start=item["start"], end=item["start"] + item["duration"], text=item["text"])
        for item in raw
    ]
    return lines, lang_code
