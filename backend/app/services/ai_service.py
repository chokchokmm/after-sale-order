import asyncio
from typing import List, Optional, Dict, Any
from zhipuai import ZhipuAI
from pymilvus import (
    connections,
    Collection,
    FieldSchema,
    CollectionSchema,
    DataType,
    utility,
)
from app.config import settings
from app.database import get_collection
from app.logger import get_logger

logger = get_logger(__name__)


class MilvusService:
    """Service for Milvus vector database operations."""

    def __init__(self):
        self.collection_name = settings.milvus_collection
        self.embedding_dim = 1024  # Zhipu embedding-3 dimension
        self._connected = False
        self._collection = None

    def connect(self):
        """Connect to Milvus server."""
        if self._connected:
            return True

        try:
            connections.connect(
                alias="default",
                host=settings.milvus_host,
                port=settings.milvus_port,
                timeout=settings.milvus_timeout
            )
            self._connected = True
            logger.info(f"Connected to Milvus at {settings.milvus_host}:{settings.milvus_port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Milvus: {e}")
            return False

    def create_collection(self):
        """Create the ticket embeddings collection if not exists."""
        if not self.connect():
            return False

        try:
            # Check if collection exists
            if utility.has_collection(self.collection_name):
                self._collection = Collection(self.collection_name)
                logger.info(f"Collection '{self.collection_name}' already exists")
                return True

            # Define fields
            fields = [
                FieldSchema(name="id", dtype=DataType.VARCHAR, is_primary=True, max_length=50),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.embedding_dim),
            ]

            # Create collection
            schema = CollectionSchema(fields=fields, description="Ticket embeddings for similarity search")
            self._collection = Collection(name=self.collection_name, schema=schema)

            # Create index for vector search
            index_params = {
                "metric_type": "COSINE",
                "index_type": "IVF_FLAT",
                "params": {"nlist": 128}
            }
            self._collection.create_index(field_name="embedding", index_params=index_params)

            logger.info(f"Collection '{self.collection_name}' created successfully")
            return True

        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            return False

    def get_collection(self) -> Optional[Collection]:
        """Get the collection instance."""
        if not self._collection:
            self.create_collection()
        return self._collection

    def insert_embedding(self, ticket_id: str, embedding: List[float]) -> bool:
        """Insert a ticket embedding into Milvus."""
        collection = self.get_collection()
        if not collection:
            return False

        try:
            # Load collection first
            collection.load()

            # Delete existing embedding if any (ignore errors if not exists)
            try:
                collection.delete(f'id == "{ticket_id}"')
            except Exception:
                pass  # Ignore delete errors

            # Insert new embedding
            data = [
                [ticket_id],
                [embedding]
            ]
            collection.insert(data)
            collection.flush()
            return True
        except Exception as e:
            logger.error(f"Error inserting embedding: {e}")
            return False

    def search_similar(
        self,
        embedding: List[float],
        top_k: int = 5,
        filter_expr: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar ticket embeddings."""
        collection = self.get_collection()
        if not collection:
            return []

        try:
            # Load collection to memory
            collection.load()

            # Search parameters
            search_params = {"metric_type": "COSINE", "params": {"nprobe": 16}}

            # Perform search
            results = collection.search(
                data=[embedding],
                anns_field="embedding",
                param=search_params,
                limit=top_k,
                expr=filter_expr,
                output_fields=["id"]
            )

            # Extract results
            similar_ids = []
            for hits in results:
                for hit in hits:
                    similar_ids.append({
                        "id": hit.entity.get("id"),
                        "score": hit.score
                    })

            return similar_ids

        except Exception as e:
            logger.error(f"Error searching embeddings: {e}")
            return []

    def delete_embedding(self, ticket_id: str) -> bool:
        """Delete a ticket embedding from Milvus."""
        collection = self.get_collection()
        if not collection:
            return False

        try:
            collection.load()
            collection.delete(f'id == "{ticket_id}"')
            collection.flush()
            return True
        except Exception as e:
            logger.error(f"Error deleting embedding: {e}")
            return False


class AIService:
    """Service for AI-related operations using Zhipu AI."""

    def __init__(self):
        self.client = None
        if settings.zhipu_api_key:
            self.client = ZhipuAI(api_key=settings.zhipu_api_key)

        self.milvus = MilvusService()
        # Initialize Milvus collection on startup
        self.milvus.create_collection()

    # ==================== Embedding 相关 ====================

    def get_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for text using Zhipu AI."""
        if not self.client:
            return None

        try:
            response = self.client.embeddings.create(
                model="embedding-3",
                input=text,
                dimensions=self.milvus.embedding_dim,
                timeout=settings.embedding_timeout
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None

    async def store_ticket_embedding(
        self,
        ticket_id: str,
        description: str
    ) -> bool:
        """Generate and store embedding for a ticket in Milvus."""
        if not description:
            return False

        try:
            embedding = await asyncio.wait_for(
                asyncio.to_thread(self.get_embedding, description),
                timeout=settings.embedding_timeout
            )
            if not embedding:
                return False

            return await asyncio.wait_for(
                asyncio.to_thread(self.milvus.insert_embedding, ticket_id, embedding),
                timeout=settings.milvus_timeout
            )
        except asyncio.TimeoutError:
            logger.warning(f"Timeout storing embedding for ticket {ticket_id}")
            return False

    async def find_similar_tickets(
        self,
        description: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Find similar completed tickets using Milvus vector search."""
        if not description:
            return []

        logger.info(f"向量搜索 - 搜索文本: {description}")

        try:
            embedding = await asyncio.wait_for(
                asyncio.to_thread(self.get_embedding, description),
                timeout=settings.embedding_timeout
            )
        except asyncio.TimeoutError:
            raise TimeoutError("向量搜索超时：生成 Embedding 失败")

        if not embedding:
            return []

        try:
            # Search in Milvus
            similar_results = await asyncio.wait_for(
                asyncio.to_thread(self.milvus.search_similar, embedding, limit * 2),
                timeout=settings.milvus_timeout
            )

            logger.info(f"向量搜索 - Milvus 返回 {len(similar_results)} 条结果")
            for r in similar_results:
                logger.debug(f"  - ID: {r['id']}, 相似度: {r['score']:.4f}")

            if not similar_results:
                return []

            # Get ticket IDs from Milvus results
            ticket_ids = [r["id"] for r in similar_results]

            # Fetch full ticket data from MongoDB
            collection = await get_collection("tickets")
            query = {
                "id": {"$in": ticket_ids},
                "status": "COMPLETED",
                "handleDetail": {"$ne": "", "$exists": True}
            }

            results = []
            async for doc in collection.find(query).limit(limit):
                # Add similarity score from Milvus
                for r in similar_results:
                    if r["id"] == doc.get("id"):
                        doc["score"] = r["score"]
                        break
                results.append(doc)

            logger.info(f"向量搜索 - MongoDB 过滤后返回 {len(results)} 条结果")

            return results

        except asyncio.TimeoutError:
            raise TimeoutError("向量搜索超时：Milvus 查询失败")

    # ==================== 智能推荐 ====================

    def _build_recommendation_prompt(
        self,
        current_ticket: Dict[str, Any],
        similar_tickets: List[Dict[str, Any]]
    ) -> str:
        """Build prompt for handling recommendation."""

        category_map = {
            "TICKET_PROCESS": "工单处理",
            "SYSTEM_FAILURE": "系统故障",
            "COST_OPTIMIZATION": "系统提升"
        }
        source_map = {
            "TMS": "TMS运输管理系统",
            "OMS": "OMS订单管理系统",
            "WMS": "WMS仓储管理系统"
        }

        category_name = category_map.get(current_ticket.get("category"), current_ticket.get("category"))
        source_name = source_map.get(current_ticket.get("systemSource"), current_ticket.get("systemSource"))

        # Build similar tickets context with REAL ticket IDs
        similar_context = ""
        ticket_ids = []
        if similar_tickets:
            similar_context = "\n## 历史相似工单及处理方式\n\n"
            for i, ticket in enumerate(similar_tickets, 1):
                ticket_id = ticket.get('id', '未知')
                ticket_ids.append(ticket_id)
                score = ticket.get("score", 0)
                similar_context += f"### 相似工单 {i}\n"
                similar_context += f"- 工单编号: {ticket_id}\n"
                similar_context += f"- 相似度: {score:.1%}\n"
                similar_context += f"- 问题描述: {ticket.get('description', '无')}\n"
                similar_context += f"- 处理详情: {ticket.get('handleDetail', '无')}\n"
                if ticket.get('solutionTemplate'):
                    similar_context += f"- 解决方案模板: {ticket.get('solutionTemplate')}\n"
                similar_context += "\n"

        # Build the list of available ticket IDs
        available_ids = "\n".join([f"- {tid}" for tid in ticket_ids]) if ticket_ids else "无"

        prompt = f"""你是一个售后工单处理助手。你只能根据历史相似工单的处理详情，为当前工单推荐处理步骤。

## 当前工单信息
- 工单编号: {current_ticket.get('id', '未知')}
- 来源系统: {source_name}
- 工单类型: {category_name}
- 问题描述: {current_ticket.get('description', '无')}

{similar_context}

## 严格要求
1. 如果没有历史相似工单，必须回答"暂无相似工单推荐"
2. 如果有历史相似工单，推荐的处理步骤必须来自上述相似工单的"处理详情",不能自己凭空编造,可以根据当前问题的具体情况，对历史处理步骤进行适当的顺序调整或合并，但不能添加新的内容
3. 输出格式要清晰，便于阅读和执行
4. 在输出内容的最后，必须列出你参考的工单编号（**只能使用下面列出的真实编号，如果可用真实工单编号没有，就显示 无相似工单**）：

可用的真实工单编号：
{available_ids}

---
**参考工单：**
（只能填写上面列出的真实编号）
- AS-XXXXXXX-XX
- ...

请直接输出处理步骤，不要输出开场白或其他无关内容。"""

        return prompt

    async def generate_handling_recommendation(
        self,
        ticket_id: str
    ) -> Optional[str]:
        """Generate handling recommendation for a ticket based on similar historical tickets."""
        if not self.client:
            return None

        try:
            # Get current ticket
            collection = await get_collection("tickets")
            current_ticket = await collection.find_one({"id": ticket_id})
            if not current_ticket:
                return None

            # Find similar completed tickets using Milvus
            similar_tickets = await self.find_similar_tickets(
                description=current_ticket.get("description", ""),
                limit=3
            )

            # Build prompt and generate recommendation
            prompt = self._build_recommendation_prompt(current_ticket, similar_tickets)

            # Print prompt for review
            logger.info(f"智能推荐 - 生成的提示词:\n{prompt}")

            def _call_glm():
                return self.client.chat.completions.create(
                    model="GLM-4-Flash",
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                    timeout=settings.llm_timeout
                )

            response = await asyncio.wait_for(
                asyncio.to_thread(_call_glm),
                timeout=settings.llm_timeout + 5  # 额外 5 秒缓冲
            )

            return response.choices[0].message.content.strip()

        except asyncio.TimeoutError:
            logger.warning(f"Timeout generating recommendation for ticket {ticket_id}")
            return None
        except Exception as e:
            logger.error(f"Error generating recommendation: {e}")
            return None

    # ==================== 标签生成 ====================

    def _build_tag_prompt(self, description: str, category: str, system_source: str) -> str:
        """Build prompt for tag generation."""
        category_map = {
            "TICKET_PROCESS": "工单处理",
            "SYSTEM_FAILURE": "系统故障",
            "COST_OPTIMIZATION": "系统提升"
        }
        source_map = {
            "TMS": "TMS运输管理系统",
            "OMS": "OMS订单管理系统",
            "WMS": "WMS仓储管理系统"
        }

        category_name = category_map.get(category, category)
        source_name = source_map.get(system_source, system_source)

        prompt = f"""你是一个售后工单系统的标签分析助手。请根据以下工单信息，生成3-5个合适的标签。

## 工单信息
- 来源系统: {source_name}
- 工单类型: {category_name}
- 问题描述: {description}

## 标签要求
1. 标签应该简洁明了，2-6个字为宜
2. 标签应该能概括问题的关键特征
3. 可以包含：问题类型、紧急程度、影响范围、涉及的模块等
4. 标签应该是通用的，便于后续筛选和统计

## 常见标签示例
- 订单异常、支付问题、物流延迟、库存问题
- 系统报错、接口超时、数据不一致、权限问题
- 紧急、高优先级、需跟进、已复现
- TMS相关、OMS相关、WMS相关
- 用户投诉、批量问题、偶发问题

请直接输出标签，每行一个，不要输出其他内容。"""
        return prompt

    async def generate_tags(
        self,
        description: str,
        category: str,
        system_source: str
    ) -> List[str]:
        """Generate tags for a ticket using Zhipu AI."""
        if not self.client:
            return []

        try:
            prompt = self._build_tag_prompt(description, category, system_source)

            def _call_glm():
                return self.client.chat.completions.create(
                    model="GLM-4-Flash",
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=200,
                    timeout=settings.llm_timeout
                )

            response = await asyncio.wait_for(
                asyncio.to_thread(_call_glm),
                timeout=settings.llm_timeout + 5
            )

            content = response.choices[0].message.content.strip()

            # Parse tags from response (one per line)
            tags = []
            for line in content.split('\n'):
                line = line.strip()
                # Remove common prefixes like "1.", "- ", "• ", etc.
                line = line.lstrip('0123456789.-•、 ')
                if line and len(line) <= 10:
                    tags.append(line)

            return tags[:5]  # Return at most 5 tags

        except asyncio.TimeoutError:
            logger.warning("Timeout generating tags")
            return []
        except Exception as e:
            logger.error(f"Error generating tags: {e}")
            return []


ai_service = AIService()
