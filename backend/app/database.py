from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.config import settings

client: Optional[AsyncIOMotorClient] = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB."""
    global client, database
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.database_name]
    print(f"Connected to MongoDB at {settings.mongodb_url}")


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    """Get database instance."""
    return database


async def get_collection(collection_name: str):
    """Get a collection from the database."""
    db = get_database()
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo first.")
    return db[collection_name]
