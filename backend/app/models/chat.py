from pydantic import BaseModel, Field
from typing import List, Optional


class SimilarTicket(BaseModel):
    """A similar ticket found during search."""
    id: str
    description: str
    handleDetail: str
    score: float


class AskRequest(BaseModel):
    """Schema for asking a question."""
    message: str


class AskResponse(BaseModel):
    """Schema for ask response."""
    success: bool
    message: str
    similarTickets: List[SimilarTicket] = Field(default_factory=list)
