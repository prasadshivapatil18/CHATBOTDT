from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "Sidekick AI Customer Service"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    
    # LLM Settings
    OPENAI_API_KEY: str | None = None
    OPENAI_BASE_URL: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    DEMO_MODE: bool = True  # Automatically set to False if valid OPENAI_API_KEY is present
    
    # Database
    DATABASE_URL: str = "sqlite:///./retail_support.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"

settings = Settings()

# Auto-toggle demo mode based on API key availability
if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 10:
    settings.DEMO_MODE = False
else:
    settings.DEMO_MODE = True
