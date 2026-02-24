from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.ticket import TicketSystemSource, TicketCategory, TicketStatus, TicketPriority


class TicketListParams(BaseModel):
    """Query parameters for ticket list."""
    page: int = Field(1, ge=1, description="Page number")
    pageSize: int = Field(10, ge=1, le=100, description="Page size")
    systemSource: Optional[TicketSystemSource] = None
    category: Optional[TicketCategory] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    search: Optional[str] = Field(None, description="Search in description")
