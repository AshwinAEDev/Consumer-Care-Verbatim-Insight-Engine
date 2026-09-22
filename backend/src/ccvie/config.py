from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://ccvie:ccvie@localhost:5432/ccvie"
    embedding_model_name: str = "all-MiniLM-L6-v2"
    llm_provider: str = "anthropic"
    llm_model_name: str = ""
    router_entity_count_threshold: int = 3
    router_word_count_low: int = 50
    router_word_count_high: int = 150
    router_taxonomy_coverage_high: float = 0.80
    router_taxonomy_coverage_low: float = 0.40
    ingestion_cadence_minutes: int = 60
    eval_lead_time_regression_max_days_drop: int = 1
    eval_citation_accuracy_min: float = 0.95
    eval_router_accuracy_min: float = 0.85


settings = Settings()
