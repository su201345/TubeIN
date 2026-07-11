from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from core.config import get_settings
from models.schemas import TranscriptLine

_settings = get_settings()
_tokenizer = None
_model = None

# Maps our simple ISO codes to NLLB's FLORES-200 language codes.
_NLLB_LANG_MAP = {
    "te": "tel_Telu",
    "hi": "hin_Deva",
    "ta": "tam_Taml",
    "en": "eng_Latn",
    "auto": "eng_Latn",
}


def _load():
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(_settings.nllb_model_name)
        _model = AutoModelForSeq2SeqLM.from_pretrained(_settings.nllb_model_name)
    return _tokenizer, _model


def translate_text(text: str, source_lang: str) -> str:
    if not text.strip():
        return ""
    tokenizer, model = _load()
    src_code = _NLLB_LANG_MAP.get(source_lang, "eng_Latn")
    tokenizer.src_lang = src_code
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    forced_bos_token_id = tokenizer.convert_tokens_to_ids("eng_Latn")
    generated = model.generate(
        **inputs, forced_bos_token_id=forced_bos_token_id, max_length=512
    )
    return tokenizer.batch_decode(generated, skip_special_tokens=True)[0]


def translate_lines(lines: list[TranscriptLine], source_lang: str) -> list[TranscriptLine]:
    """Translate each transcript line's text to English, in place-ish (returns new list)."""
    translated = []
    for line in lines:
        en_text = translate_text(line.text, source_lang)
        translated.append(
            TranscriptLine(start=line.start, end=line.end, text=line.text, text_en=en_text)
        )
    return translated
