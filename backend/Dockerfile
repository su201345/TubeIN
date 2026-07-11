FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    execstack \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Some container kernels reject ctranslate2's shared library because it
# requests an executable stack; clear that flag so it can be mmap'd.
RUN find / -name "libctranslate2*.so*" -exec execstack -c {} \; 2>/dev/null || true

COPY . .

# Bake the faster-whisper model into the image so it isn't re-downloaded on every cold start.
ARG WHISPER_MODEL_SIZE=medium
ENV WHISPER_MODEL_SIZE=${WHISPER_MODEL_SIZE}
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('${WHISPER_MODEL_SIZE}', device='cpu', compute_type='int8')"

# Pre-download NLLB-200 as well so the first text-translation request isn't slow.
RUN python -c "from transformers import AutoModelForSeq2SeqLM, AutoTokenizer; \
    m='facebook/nllb-200-distilled-600M'; \
    AutoTokenizer.from_pretrained(m); \
    AutoModelForSeq2SeqLM.from_pretrained(m)"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
