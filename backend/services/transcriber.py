from faster_whisper import WhisperModel

from core.config import get_settings
from models.schemas import TranscriptLine

_settings = get_settings()
_model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            _settings.whisper_model_size,
            device=_settings.whisper_device,
            compute_type=_settings.whisper_compute_type,
        )
    return _model


def _run(audio_path: str, task: str, language: str | None) -> tuple[list[TranscriptLine], str]:
    model = get_model()
    segments, info = model.transcribe(
        audio_path,
        task=task,
        language=None if not language or language == "auto" else language,
        vad_filter=True,
        beam_size=5,
    )
    lines = [
        TranscriptLine(start=seg.start, end=seg.end, text=seg.text.strip())
        for seg in segments
    ]
    return lines, info.language


def transcribe_original(audio_path: str, language: str | None) -> tuple[list[TranscriptLine], str]:
    """Transcribe audio in its original spoken language."""
    return _run(audio_path, task="transcribe", language=language)


def transcribe_translate_to_english(
    audio_path: str, language: str | None
) -> tuple[list[TranscriptLine], str]:
    """Transcribe audio directly to English text (Whisper's built-in translate task)."""
    return _run(audio_path, task="translate", language=language)
