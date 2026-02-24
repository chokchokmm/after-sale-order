from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.ticket import TicketResponse
from app.models.user import UserResponse


class MessageResponse(BaseModel):
    """Standard message response."""
    message: str
    id: Optional[str] = None


class TicketListResponse(BaseModel):
    """Response for ticket list."""
    items: List[TicketResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int


class TicketDetailResponse(BaseModel):
    """Response for ticket detail."""
    ticket: TicketResponse


class UserListResponse(BaseModel):
    """Response for user list."""
    items: List[UserResponse]
    total: int
