from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TicketSystemSource(str, Enum):
    """System source where the issue originated."""
    TMS = "TMS"
    OMS = "OMS"
    WMS = "WMS"


class TicketCategory(str, Enum):
    """Category of the ticket."""
    TICKET_PROCESS = "TICKET_PROCESS"
    SYSTEM_FAILURE = "SYSTEM_FAILURE"
    COST_OPTIMIZATION = "COST_OPTIMIZATION"


class TicketHandleType(str, Enum):
    """Type of handling required."""
    PRODUCT = "PRODUCT"
    DEV = "DEV"
    PRODUCT_DEV = "PRODUCT_DEV"


class TicketPriority(str, Enum):
    """Priority level of the ticket."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class TicketStatus(str, Enum):
    """Status of the ticket."""
    OPEN = "OPEN"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"


class AIMetadata(BaseModel):
    """AI-generated metadata for the ticket."""
    keywords: List[str] = Field(default_factory=list)
    similarTickets: List[str] = Field(default_factory=list)
    suggestedSolution: Optional[str] = None


class Ticket(BaseModel):
    """Ticket model for after-sales support."""
    id: Optional[str] = None
    systemSource: TicketSystemSource
    category: TicketCategory
    description: str
    handleType: TicketHandleType
    handleDetail: str
    priority: TicketPriority
    status: TicketStatus = TicketStatus.OPEN
    tags: List[str] = Field(default_factory=list)
    solutionTemplate: Optional[str] = None
    createdBy: Optional[str] = None
    assignedTo: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    closedAt: Optional[datetime] = None
    aiMetadata: AIMetadata = Field(default_factory=AIMetadata)


class TicketCreate(BaseModel):
    """Schema for creating a ticket."""
    systemSource: TicketSystemSource
    category: TicketCategory
    description: str
    handleType: TicketHandleType
    handleDetail: str = ""
    priority: TicketPriority
    tags: List[str] = Field(default_factory=list)
    solutionTemplate: Optional[str] = None
    assignedTo: Optional[str] = None
    createdBy: Optional[str] = None


class TicketUpdate(BaseModel):
    """Schema for updating a ticket."""
    systemSource: Optional[TicketSystemSource] = None
    category: Optional[TicketCategory] = None
    description: Optional[str] = None
    handleType: Optional[TicketHandleType] = None
    handleDetail: Optional[str] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    tags: Optional[List[str]] = None
    solutionTemplate: Optional[str] = None
    assignedTo: Optional[str] = None
    createdBy: Optional[str] = None


class TicketResponse(Ticket):
    """Schema for ticket response."""
    id: str

    class Config:
        from_attributes = True
