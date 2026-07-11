from enum import Enum

from pydantic import BaseModel, Field


class SourceLanguage(str, Enum):
    auto = "auto"
    telugu = "te"
    hindi = "hi"
    tamil = "ta"
    english = "en"
    other = "other"


class JobStage(str, Enum):
    queued = "queued"
    fetching_captions = "fetching_captions"
    downloading_audio = "downloading_audio"
    transcribing = "transcribing"
    translating = "translating"
    done = "done"
    error = "error"


class TranscriptRequest(BaseModel):
    url: str = Field(..., description="YouTube video URL")
    source_language: SourceLanguage = SourceLanguage.auto
    want_translation: bool = True


class TranscriptLine(BaseModel):
    start: float
    end: float
    text: str
    text_en: str | None = None


class JobStatus(BaseModel):
    id: str
    stage: JobStage
    progress: int = 0
    message: str | None = None
    video_id: str | None = None
    video_title: str | None = None
    duration: float | None = None
    detected_language: str | None = None
    source: str | None = None  # "captions" | "whisper"
    lines: list[TranscriptLine] | None = None
    error: str | None = None


class JobCreatedResponse(BaseModel):
    id: str
