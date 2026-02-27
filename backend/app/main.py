from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.api import tickets, users
from app.logger import setup_logging, get_logger

# 初始化日志
setup_logging()
logger = get_logger(__name__)

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
    logger.info("Application starting up...")
    await connect_to_mongo()
    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    logger.info("Application shutting down...")
    await close_mongo_connection()
    logger.info("Application shutdown complete")


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
