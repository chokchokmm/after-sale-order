from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.api import tickets, users

# Create FastAPI app
app = FastAPI(
    title="售后工单管理系统 API",
    description="After-sales Ticket Management System API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on startup."""
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    await close_mongo_connection()


# Include routers
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "售后工单管理系统 API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
