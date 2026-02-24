from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from app.models.ticket import (
    Ticket, TicketCreate, TicketUpdate, TicketStatus,
    TicketSystemSource, TicketCategory, TicketPriority
)
from app.database import get_collection


class TicketService:
    """Service for ticket business logic."""

    async def create_ticket(self, ticket_data: TicketCreate, created_by: Optional[str] = None) -> Ticket:
        """Create a new ticket."""
        collection = await get_collection("tickets")

        ticket_dict = ticket_data.model_dump()
        ticket_dict["createdAt"] = datetime.utcnow()
        ticket_dict["updatedAt"] = datetime.utcnow()
        ticket_dict["status"] = TicketStatus.OPEN
        ticket_dict["createdBy"] = created_by
        ticket_dict["aiMetadata"] = {"keywords": [], "similarTickets": [], "suggestedSolution": None}

        result = await collection.insert_one(ticket_dict)
        ticket_dict["id"] = str(result.inserted_id)

        return Ticket(**ticket_dict)

    async def get_ticket_by_id(self, ticket_id: str) -> Optional[Ticket]:
        """Get a ticket by ID."""
        collection = await get_collection("tickets")

        try:
            obj_id = ObjectId(ticket_id)
        except:
            return None

        doc = await collection.find_one({"_id": obj_id})
        if doc:
            doc["id"] = str(doc["_id"])
            return Ticket(**doc)
        return None

    async def get_tickets(
        self,
        page: int = 1,
        page_size: int = 10,
        system_source: Optional[TicketSystemSource] = None,
        category: Optional[TicketCategory] = None,
        status: Optional[TicketStatus] = None,
        priority: Optional[TicketPriority] = None,
        search: Optional[str] = None
    ) -> tuple[List[Ticket], int]:
        """Get tickets with filtering and pagination."""
        collection = await get_collection("tickets")

        # Build query filter
        filter_query: Dict[str, Any] = {}

        if system_source:
            filter_query["systemSource"] = system_source
        if category:
            filter_query["category"] = category
        if status:
            filter_query["status"] = status
        if priority:
            filter_query["priority"] = priority
        if search:
            filter_query["description"] = {"$regex": search, "$options": "i"}

        # Get total count
        total = await collection.count_documents(filter_query)

        # Get paginated results
        skip = (page - 1) * page_size
        cursor = collection.find(filter_query).sort("createdAt", -1).skip(skip).limit(page_size)

        tickets = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            tickets.append(Ticket(**doc))

        return tickets, total

    async def update_ticket(self, ticket_id: str, ticket_data: TicketUpdate) -> Optional[Ticket]:
        """Update a ticket."""
        collection = await get_collection("tickets")

        try:
            obj_id = ObjectId(ticket_id)
        except:
            return None

        # Build update dict with only non-None fields
        update_dict = {k: v for k, v in ticket_data.model_dump().items() if v is not None}
        if not update_dict:
            return await self.get_ticket_by_id(ticket_id)

        update_dict["updatedAt"] = datetime.utcnow()

        # If status is being changed to CLOSED, set closedAt
        if ticket_data.status == TicketStatus.CLOSED:
            update_dict["closedAt"] = datetime.utcnow()

        await collection.update_one({"_id": obj_id}, {"$set": update_dict})

        return await self.get_ticket_by_id(ticket_id)

    async def close_ticket(self, ticket_id: str) -> Optional[Ticket]:
        """Close a ticket."""
        collection = await get_collection("tickets")

        try:
            obj_id = ObjectId(ticket_id)
        except:
            return None

        await collection.update_one(
            {"_id": obj_id},
            {
                "$set": {
                    "status": TicketStatus.CLOSED,
                    "closedAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        return await self.get_ticket_by_id(ticket_id)

    async def delete_ticket(self, ticket_id: str) -> bool:
        """Delete a ticket."""
        collection = await get_collection("tickets")

        try:
            obj_id = ObjectId(ticket_id)
        except:
            return False

        result = await collection.delete_one({"_id": obj_id})
        return result.deleted_count > 0

    async def get_ticket_statistics(self) -> Dict[str, Any]:
        """Get ticket statistics for dashboard."""
        collection = await get_collection("tickets")

        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "open": {"$sum": {"$cond": [{"$eq": ["$status", "OPEN"]}, 1, 0]}},
                    "processing": {"$sum": {"$cond": [{"$eq": ["$status", "PROCESSING"]}, 1, 0]}},
                    "closed": {"$sum": {"$cond": [{"$eq": ["$status", "CLOSED"]}, 1, 0]}},
                    "verified": {"$sum": {"$cond": [{"$eq": ["$status", "VERIFIED"]}, 1, 0]}},
                }
            }
        ]

        async for doc in collection.aggregate(pipeline):
            return {
                "total": doc.get("total", 0),
                "open": doc.get("open", 0),
                "processing": doc.get("processing", 0),
                "closed": doc.get("closed", 0),
                "verified": doc.get("verified", 0),
            }

        return {"total": 0, "open": 0, "processing": 0, "closed": 0, "verified": 0}

    async def get_tickets_by_category(self) -> Dict[str, int]:
        """Get ticket count by category."""
        collection = await get_collection("tickets")

        pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "count": {"$sum": 1}
                }
            }
        ]

        result = {}
        async for doc in collection.aggregate(pipeline):
            result[doc["_id"]] = doc["count"]
        return result

    async def get_tickets_by_status(self) -> Dict[str, int]:
        """Get ticket count by status."""
        collection = await get_collection("tickets")

        pipeline = [
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]

        result = {}
        async for doc in collection.aggregate(pipeline):
            result[doc["_id"]] = doc["count"]
        return result

    async def get_tickets_by_priority(self) -> Dict[str, int]:
        """Get ticket count by priority."""
        collection = await get_collection("tickets")

        pipeline = [
            {
                "$group": {
                    "_id": "$priority",
                    "count": {"$sum": 1}
                }
            }
        ]

        result = {}
        async for doc in collection.aggregate(pipeline):
            result[doc["_id"]] = doc["count"]
        return result

    async def get_tickets_trend_7days(self) -> List[Dict[str, Any]]:
        """Get ticket creation trend for the last 30 days."""
        collection = await get_collection("tickets")

        # Get current time in UTC
        now = datetime.now(timezone.utc)

        # Generate 30 days of data
        trend_data = []
        for i in range(29, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = (day_start + timedelta(days=1))

            # Count tickets created on this day
            count = await collection.count_documents({
                "createdAt": {"$gte": day_start, "$lt": day_end}
            })

            # Format date label - show month/day for older dates
            if i == 0:
                date_label = "今天"
            elif i == 1:
                date_label = "昨天"
            else:
                # Format as MM-DD for older dates
                date_label = day_start.strftime("%m-%d")

            trend_data.append({
                "date": date_label,
                "value": count,
                "datetime": day_start
            })

        return trend_data


ticket_service = TicketService()
