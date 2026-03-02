import asyncio
from typing import List, Dict, Any
from zhipuai import ZhipuAI

from app.config import settings
from app.models.chat import SimilarTicket
from app.services.ai_service import ai_service
from app.logger import get_logger

logger = get_logger(__name__)


class ChatService:
    """Service for simplified chat operations (single Q&A mode)."""

    def __init__(self):
        self.client = None
        if settings.zhipu_api_key:
            self.client = ZhipuAI(api_key=settings.zhipu_api_key)

    async def ask(self, user_input: str) -> dict:
        """
        Single Q&A, stateless.
        Returns: {"success": bool, "message": str, "similarTickets": list}
        """
        # 1. Check format
        if not user_input.startswith("问题描述:"):
            return {
                "success": False,
                "message": "请按以下格式输入您的问题：\n问题描述:您的问题内容\n\n例如：问题描述:订单无法支付"
            }

        # 2. Extract problem description
        problem = user_input.replace("问题描述:", "").strip()
        if not problem:
            return {
                "success": False,
                "message": "请输入具体的问题描述"
            }

        # 3. Search for similar tickets
        try:
            similar_tickets = await ai_service.find_similar_tickets(problem, limit=3)
        except Exception as e:
            logger.error(f"Error searching similar tickets: {e}")
            return {
                "success": True,
                "message": "搜索相似工单时出现错误，建议创建工单由人工处理。",
                "similarTickets": []
            }

        # 4. Generate recommendation
        recommendation = await self._generate_simple_recommendation(problem, similar_tickets)

        # Convert to SimilarTicket models
        similar_ticket_models = [
            SimilarTicket(
                id=t.get("id"),
                description=t.get("description", ""),
                handleDetail=t.get("handleDetail", ""),
                score=t.get("score", 0)
            )
            for t in similar_tickets
        ]

        return {
            "success": True,
            "message": recommendation,
            "similarTickets": [t.model_dump() for t in similar_ticket_models]
        }

    async def _generate_simple_recommendation(
        self,
        problem: str,
        similar_tickets: List[Dict[str, Any]]
    ) -> str:
        """Generate simple recommendation based on similar tickets."""
        if not similar_tickets:
            return "暂无相似工单推荐，建议创建工单由人工处理。"

        if not self.client:
            return "暂无相似工单推荐，建议创建工单由人工处理。"

        # Reuse ai_service's prompt builder
        prompt = ai_service._build_simple_recommendation_prompt(problem, similar_tickets)

        logger.info(f"智能客服 - 生成的提示词:\n{prompt}")

        try:
            def _call_glm():
                return self.client.chat.completions.create(
                    model="GLM-4-Flash",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=1000,
                    timeout=settings.llm_timeout
                )

            response = await asyncio.wait_for(
                asyncio.to_thread(_call_glm),
                timeout=settings.llm_timeout + 5
            )

            return response.choices[0].message.content.strip()

        except asyncio.TimeoutError:
            logger.warning("Timeout generating recommendation")
            return "暂无相似工单推荐，建议创建工单由人工处理。"
        except Exception as e:
            logger.error(f"Error generating recommendation: {e}")
            return "暂无相似工单推荐，建议创建工单由人工处理。"


chat_service = ChatService()
