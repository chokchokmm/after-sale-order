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

    # Zhipu AI
    zhipu_api_key: str = ""

    # Milvus Vector Database
    milvus_host: str = "localhost"
    milvus_port: int = 19530
    milvus_collection: str = "ticket_embeddings"

    # MinIO Object Storage
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "ticket-screenshots"
    minio_secure: bool = False
    minio_url_expiry: int = 3600  # 1 hour in seconds

    # Timeout settings (in seconds)
    milvus_timeout: int = 60  # Milvus 操作超时（首次插入可能较慢）
    embedding_timeout: int = 30  # Embedding API 超时 (文本较长可能需要更长时间)
    llm_timeout: int = 60  # LLM API 超时 (生成推荐/标签可能较慢)

    # Logging
    log_level: str = "INFO"  # 日志级别: DEBUG, INFO, WARNING, ERROR
    log_dir: str = "logs"  # 日志目录

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
