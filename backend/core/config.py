from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    redis_url: str = "redis://localhost:6379/0"
    cors_origins_raw: str = Field("http://localhost:3000", alias="CORS_ORIGINS")
    whisper_model_size: str = "small"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    nllb_model_name: str = "facebook/nllb-200-distilled-600M"
    max_video_seconds: int = 1800
    job_result_ttl: int = 86400
    audio_tmp_dir: str = "/tmp/ytt_audio"
    run_worker_in_process: bool = True
    enable_nllb_translation: bool = False

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
