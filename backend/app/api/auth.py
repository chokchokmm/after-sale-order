import secrets
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.feishu_auth_service import feishu_auth_service
from app.services.state_store import generate_state, validate_state
from app.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


# Request/Response models
class FeishuAuthUrlResponse(BaseModel):
    """Response for getting Feishu auth URL."""
    url: str
    state: str


class FeishuLoginRequest(BaseModel):
    """Request for Feishu login."""
    code: str
    state: str


class FeishuLoginResponse(BaseModel):
    """Response for Feishu login."""
    success: bool
    message: str
    user: Optional[dict] = None


@router.get("/feishu", response_model=FeishuAuthUrlResponse)
async def get_feishu_auth_url():
    """Get Feishu OAuth authorization URL."""
    state = generate_state()
    auth_url = feishu_auth_service.get_auth_url(state)

    if not auth_url:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="飞书认证未配置")

    return FeishuAuthUrlResponse(
        url=auth_url,
        state=state
    )


@router.post("/feishu/login", response_model=FeishuLoginResponse)
async def feishu_login(request: FeishuLoginRequest):
    """Login with Feishu authorization code."""
    if not validate_state(request.state):
        logger.warning(f"Invalid or expired state: {request.state[:10]}...")
        return FeishuLoginResponse(
            success=False,
            message="state 无效或已过期，请重试",
            user=None
        )

    logger.info(f"Feishu login attempt with code: {request.code[:10]}...")

    result = await feishu_auth_service.login_with_code(request.code)

    if result.get("success"):
        logger.info(f"Feishu login successful for user: {result.get('user', {}).get('username')}")
        return FeishuLoginResponse(
            success=True,
            message="登录成功",
            user=result.get("user")
        )
    else:
        logger.warning(f"Feishu login failed: {result.get('message')}")
        return FeishuLoginResponse(
            success=False,
            message=result.get("message", "登录失败"),
            user=None
        )
