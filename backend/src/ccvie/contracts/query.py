"""QueryRequest."""

from pydantic import BaseModel


class QueryFilters(BaseModel):
    product: str | None = None
    region: str | None = None
    issueType: str | None = None
    timeWindow: str | None = None


class QueryRequest(BaseModel):
    text: str
    filters: QueryFilters | None = None
