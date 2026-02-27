"""
Rebuild embeddings for all existing tickets.
Run this script to generate embeddings for tickets that don't have one yet.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/rebuild_embeddings.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.services.ai_service import AIService


async def rebuild_embeddings():
    """Rebuild embeddings for all tickets."""
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    collection = db["tickets"]

    # Get AI service
    ai_service = AIService()

    # Get all tickets
    tickets = []
    async for doc in collection.find({}):
        tickets.append(doc)

    print(f"找到 {len(tickets)} 个工单")

    success_count = 0
    fail_count = 0

    for i, ticket in enumerate(tickets, 1):
        ticket_id = ticket.get("id")
        description = ticket.get("description", "")
        category = ticket.get("category")
        system_source = ticket.get("systemSource")
        handle_type = ticket.get("handleType")

        if not description:
            print(f"[{i}/{len(tickets)}] {ticket_id}: 跳过（无问题描述）")
            fail_count += 1
            continue

        print(f"[{i}/{len(tickets)}] {ticket_id}: 正在生成向量...")

        success = await ai_service.store_ticket_embedding(
            ticket_id=ticket_id,
            description=description
        )

        if success:
            print(f"[{i}/{len(tickets)}] {ticket_id}: ✓ 成功")
            success_count += 1
        else:
            print(f"[{i}/{len(tickets)}] {ticket_id}: ✗ 失败")
            fail_count += 1

    print(f"\n完成！成功: {success_count}, 失败: {fail_count}")

    # Check Milvus count
    from pymilvus import connections, Collection, utility
    connections.connect(host=settings.milvus_host, port=settings.milvus_port)
    if utility.has_collection(settings.milvus_collection):
        collection = Collection(settings.milvus_collection)
        num = collection.num_entities
        print(f"Milvus 中现在有 {num} 条向量数据")

    client.close()


if __name__ == "__main__":
    asyncio.run(rebuild_embeddings())
