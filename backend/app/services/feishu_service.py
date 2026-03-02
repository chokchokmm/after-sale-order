"""Feishu bot notification service."""

import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def send_ticket_completed_message(
    ticket_id: str,
    description: str,
    handle_detail: str = None
):
    """Send ticket completion notification to Feishu group.

    Args:
        ticket_id: Ticket ID (e.g., AS-20260227-21)
        description: Ticket description
        handle_detail: How the ticket was handled (optional)
    """
    if not settings.feishu_webhook_url:
        logger.warning("Feishu webhook URL not configured, skipping notification")
        return

    # Build message (must contain keywords: "工单号" and "已完成")
    text = f"工单号:{ticket_id}，问题描述:{description or '无'}，已经处理完成。处理方式:{handle_detail or '无'}！"

    payload = {
        "msg_type": "text",
        "content": {
            "text": text
        }
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                settings.feishu_webhook_url,
                json=payload
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("code") == 0:
                    logger.info(f"Feishu notification sent for ticket {ticket_id}")
                else:
                    logger.error(f"Feishu notification failed: {result}")
            else:
                logger.error(f"Feishu notification failed: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Failed to send Feishu notification: {e}")
