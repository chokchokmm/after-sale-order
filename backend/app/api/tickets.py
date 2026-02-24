from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from app.models.ticket import (
    TicketCreate, TicketUpdate, TicketResponse,
    TicketStatus, TicketSystemSource, TicketCategory, TicketPriority
)
from app.schemas.response import TicketListResponse, MessageResponse
from app.services.ticket_service import ticket_service

router = APIRouter()


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_data: TicketCreate):
    """Create a new ticket."""
    ticket = await ticket_service.create_ticket(ticket_data)
    return ticket


@router.get("", response_model=TicketListResponse)
async def get_tickets(
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(10, ge=1, le=100, description="Page size"),
    systemSource: Optional[TicketSystemSource] = Query(None, description="Filter by system source"),
    category: Optional[TicketCategory] = Query(None, description="Filter by category"),
    status: Optional[TicketStatus] = Query(None, description="Filter by status"),
    priority: Optional[TicketPriority] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in description")
):
    """Get tickets with filtering and pagination."""
    tickets, total = await ticket_service.get_tickets(
        page=page,
        page_size=pageSize,
        system_source=systemSource,
        category=category,
        status=status,
        priority=priority,
        search=search
    )

    total_pages = (total + pageSize - 1) // pageSize

    return TicketListResponse(
        items=tickets,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages
    )


@router.get("/stats", response_model=dict)
async def get_ticket_statistics():
    """Get ticket statistics for dashboard."""
    stats = await ticket_service.get_ticket_statistics()
    by_category = await ticket_service.get_tickets_by_category()
    by_status = await ticket_service.get_tickets_by_status()
    by_priority = await ticket_service.get_tickets_by_priority()
    trend = await ticket_service.get_tickets_trend_7days()

    return {
        "overview": stats,
        "byCategory": by_category,
        "byStatus": by_status,
        "byPriority": by_priority,
        "trend": trend
    }


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str):
    """Get a ticket by ID."""
    ticket = await ticket_service.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(ticket_id: str, ticket_data: TicketUpdate):
    """Update a ticket."""
    ticket = await ticket_service.update_ticket(ticket_id, ticket_data)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.post("/{ticket_id}/close", response_model=TicketResponse)
async def close_ticket(ticket_id: str):
    """Close a ticket."""
    ticket = await ticket_service.close_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.delete("/{ticket_id}", response_model=MessageResponse)
async def delete_ticket(ticket_id: str):
    """Delete a ticket."""
    success = await ticket_service.delete_ticket(ticket_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return MessageResponse(message="Ticket deleted successfully", id=ticket_id)
