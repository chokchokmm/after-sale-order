from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    """Application configuration settings."""

    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "ticket_system"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


# Create settings instance
settings = Settings()
