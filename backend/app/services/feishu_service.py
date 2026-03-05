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


async def send_ticket_created_message(
    ticket_id: str,
    system_source: str,
    category: str,
    priority: str,
    description: str,
    created_by: str = None
):
    """Send ticket creation notification to Feishu group.

    Args:
        ticket_id: Ticket ID (e.g., AS-20260305-01)
        system_source: System source (TMS/OMS/WMS)
        category: Ticket category (TICKET_PROCESS/SYSTEM_FAILURE)
        priority: Priority level (P0/P1/P2/P3)
        description: Ticket description
        created_by: Creator name or identifier (optional)
    """
    if not settings.feishu_webhook_url:
        logger.warning("Feishu webhook URL not configured, skipping notification")
        return

    # Map enum values to Chinese labels
    system_source_map = {
        "TMS": "TMS运输管理系统",
        "OMS": "OMS订单管理系统",
        "WMS": "WMS仓储管理系统"
    }

    category_map = {
        "TICKET_PROCESS": "工单处理",
        "SYSTEM_FAILURE": "系统故障"
    }

    # Build notification message
    text_lines = [
        "新工单创建通知",
        f"工单号：{ticket_id}",
        f"来源系统：{system_source_map.get(system_source, system_source)}",
        f"工单类型：{category_map.get(category, category)}",
        f"优先级：{priority}",
        f"问题描述：{description or '无'}",
        f"创建人：{created_by or '未指定'}"
    ]

    text = "\n".join(text_lines)

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
                    logger.info(f"Feishu creation notification sent for ticket {ticket_id}")
                else:
                    logger.error(f"Feishu creation notification failed: {result}")
            else:
                logger.error(f"Feishu creation notification failed: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Failed to send Feishu creation notification: {e}")
