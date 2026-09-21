from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "INSPIRE"
    app_env: str = "development"
    database_url: str = f"sqlite:///{(Path(__file__).resolve().parents[1] / 'inspire.db').as_posix()}"
    jwt_secret_key: str = "dev-secret-key-change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    openai_api_key: str = ""
    backend_cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
