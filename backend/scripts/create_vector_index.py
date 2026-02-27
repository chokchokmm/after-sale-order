"""
Script to create vector search index in MongoDB.

Run this script after starting MongoDB to enable vector search:
    python scripts/create_vector_index.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os


async def create_vector_index():
    """Create vector search index for ticket embeddings."""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://root:password@localhost:27017/ticket_system?authSource=admin")
    database_name = os.getenv("DATABASE_NAME", "ticket_system")

    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    collection = db["tickets"]

    # Create vector search index
    index_definition = {
        "name": "ticket_embedding_index",
        "definition": {
            "mappings": {
                "dynamic": True,
                "fields": {
                    "embedding": {
                        "type": "knnVector",
                        "dimensions": 1024,  # Zhipu embedding-3 dimensions
                        "similarity": "cosine"
                    }
                }
            }
        }
    }

    try:
        # Check if index already exists
        indexes = await collection.list_search_indexes().to_list(length=None)
        for idx in indexes:
            if idx.get("name") == "ticket_embedding_index":
                print("Vector index already exists.")
                return

        # Create the index
        await collection.create_search_index(index_definition)
        print("Vector search index created successfully!")
        print("Index name: ticket_embedding_index")
        print("Dimensions: 1024")
        print("Similarity: cosine")

    except Exception as e:
        print(f"Error creating index: {e}")
        print("\nNote: If you're using MongoDB Atlas, create the index manually:")
        print("1. Go to your Atlas cluster")
        print("2. Navigate to 'Search' tab")
        print("3. Create a new Search Index with JSON editor")
        print("4. Use the following configuration:")
        print("""
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1024,
        "similarity": "cosine"
      }
    }
  }
}
""")

    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(create_vector_index())
