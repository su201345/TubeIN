from core.config import get_settings
from core.job_store import save_status
from models.schemas import JobStage, JobStatus, TranscriptLine
from services import captions, downloader, transcriber, translator

_settings = get_settings()


def _update(job_id: str, **kwargs) -> JobStatus:
    from core.job_store import load_status

    current = load_status(job_id) or JobStatus(id=job_id, stage=JobStage.queued)
    data = current.model_dump()
    data.update(kwargs)
    status = JobStatus(**data)
    save_status(job_id, status)
    return status


def run_transcript_job(job_id: str, url: str, source_language: str, want_translation: bool) -> None:
    try:
        video_id = captions.extract_video_id(url)
        if not video_id:
            _update(
                job_id,
                stage=JobStage.error,
                error="Couldn't parse a YouTube video ID from that link.",
                message="Invalid URL",
            )
            return

        _update(
            job_id,
            stage=JobStage.fetching_captions,
            progress=10,
            message="Checking for existing captions…",
            video_id=video_id,
        )

        existing = captions.fetch_existing_captions(video_id, source_language)

        if existing is not None:
            lines, lang_code = existing
            needs_translation = want_translation and lang_code != "en"

            # Without NLLB available (e.g. free-tier RAM limits), skip captions
            # that need translating and fall through to the Whisper path below,
            # which can transcribe + translate directly from audio.
            if not needs_translation or _settings.enable_nllb_translation:
                if needs_translation:
                    _update(
                        job_id,
                        stage=JobStage.translating,
                        progress=60,
                        message="Translating existing captions to English…",
                        detected_language=lang_code,
                        source="captions",
                    )
                    lines = translator.translate_lines(lines, lang_code)
                else:
                    lines = [
                        TranscriptLine(start=l.start, end=l.end, text=l.text, text_en=l.text if lang_code == "en" else None)
                        for l in lines
                    ]

                _update(
                    job_id,
                    stage=JobStage.done,
                    progress=100,
                    message="Done",
                    detected_language=lang_code,
                    source="captions",
                    lines=lines,
                )
                return

        # No usable captions — fall back to audio download + Whisper.
        _update(
            job_id,
            stage=JobStage.downloading_audio,
            progress=20,
            message="Downloading audio (this can take a minute on free-tier hosting)…",
        )

        audio_path = None
        try:
            audio_path, info = downloader.download_audio(url)

            _update(
                job_id,
                stage=JobStage.transcribing,
                progress=45,
                message="Transcribing speech with Whisper…",
                video_title=info.get("title"),
                duration=info.get("duration"),
            )

            lang_hint = None if source_language in ("auto", None) else source_language
            original_lines, detected_lang = transcriber.transcribe_original(audio_path, lang_hint)

            final_lines = original_lines
            if want_translation and detected_lang != "en":
                _update(
                    job_id,
                    stage=JobStage.translating,
                    progress=75,
                    message="Generating English translation…",
                    detected_language=detected_lang,
                )
                english_lines, _ = transcriber.transcribe_translate_to_english(audio_path, lang_hint)
                final_lines = [
                    TranscriptLine(
                        start=o.start,
                        end=o.end,
                        text=o.text,
                        text_en=english_lines[i].text if i < len(english_lines) else None,
                    )
                    for i, o in enumerate(original_lines)
                ]
            elif detected_lang == "en":
                final_lines = [
                    TranscriptLine(start=o.start, end=o.end, text=o.text, text_en=o.text)
                    for o in original_lines
                ]

            _update(
                job_id,
                stage=JobStage.done,
                progress=100,
                message="Done",
                detected_language=detected_lang,
                source="whisper",
                lines=final_lines,
            )
        finally:
            if audio_path:
                downloader.cleanup_audio(audio_path)

    except downloader.DownloadError as exc:
        _update(job_id, stage=JobStage.error, error=str(exc), message="Download failed")
    except Exception as exc:  # noqa: BLE001
        _update(
            job_id,
            stage=JobStage.error,
            error="Something went wrong while processing this video. Please try again.",
            message=str(exc),
        )
