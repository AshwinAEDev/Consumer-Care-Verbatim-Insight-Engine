"""InsightResponse."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class InsightResponse(BaseModel):
    id: UUID
    title: str
    summary: str
    clusterSize: int = Field(gt=0)
    confidence: float = Field(ge=0, le=1)
    affectedProduct: str
    affectedPack: str | None = None
    affectedRegion: str | None = None
    detectedAt: datetime
    verbatimIds: list[UUID]
    leadTime: float | None = None
    costUsd: float | None = None
