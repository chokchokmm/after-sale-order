from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.config import settings
from app.logger import get_logger

logger = get_logger(__name__)

client: Optional[AsyncIOMotorClient] = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB."""
    global client, database
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.database_name]
    print(f"Connected to MongoDB at {settings.mongodb_url}")

    # Create TTL index for chat_sessions (expire after 1 day)
    try:
        collection = database["chat_sessions"]
        existing_indexes = await collection.index_information()
        if "createdAt_1" not in existing_indexes:
            await collection.create_index(
                "createdAt",
                expireAfterSeconds=86400  # 1 day = 24 * 60 * 60
            )
            logger.info("Created TTL index for chat_sessions collection")
    except Exception as e:
        logger.warning(f"Failed to create TTL index: {e}")


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
