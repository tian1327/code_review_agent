import os
from typing import Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    api_title: str = "Code Review Agent API"
    api_version: str = "1.0.0"
    api_description: str = "API for automated code review using LLM agents"
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    # CORS Settings
    cors_origins: list = ["*"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list = ["*"]
    cors_allow_headers: list = ["*"]
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Workflow Settings
    max_concurrent_workflows: int = 10
    workflow_timeout: int = 300  # 5 minutes
    
    # LLM Settings (for future integration)
    llm_api_key: Optional[str] = None
    llm_model: str = "gpt-4o"
    llm_max_tokens: int = 4000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings() 