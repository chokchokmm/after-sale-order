import httpx
from typing import Optional, Dict, Any
from urllib.parse import urlencode

from app.config import settings
from app.logger import get_logger

logger = get_logger(__name__)

# Feishu OAuth API endpoints
FEISHU_AUTH_URL = "https://open.feishu.cn/open-apis/authen/v1/index"
FEISHU_TOKEN_URL = "https://open.feishu.cn/open-apis/authen/v2/oauth/token"
FEISHU_USER_INFO_URL = "https://open.feishu.cn/open-apis/authen/v1/user_info"


class FeishuAuthService:
    """Service for Feishu OAuth authentication."""

    def get_auth_url(self, state: str = "") -> str:
        """Generate Feishu OAuth authorization URL."""
        params = {
            "app_id": settings.feishu_app_id,
            "redirect_uri": settings.feishu_redirect_uri,
        }
        if state:
            params["state"] = state

        query_string = urlencode(params)
        return f"{FEISHU_AUTH_URL}?{query_string}"

    async def get_access_token(self, code: str) -> Optional[str]:
        """Exchange authorization code for access token."""
        if not settings.feishu_app_id or not settings.feishu_app_secret:
            logger.error("Feishu OAuth credentials not configured")
            return None

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    FEISHU_TOKEN_URL,
                    json={
                        "grant_type": "authorization_code",
                        "client_id": settings.feishu_app_id,
                        "client_secret": settings.feishu_app_secret,
                        "code": code,
                    },
                    timeout=30,
                )

                if response.status_code != 200:
                    logger.error(f"Feishu token API error: {response.status_code}")
                    return None

                data = response.json()
                if data.get("code") != 0:
                    logger.error(f"Feishu token API returned error: {data.get('msg')}")
                    return None

                return data.get("user_access_token")

        except Exception as e:
            logger.error(f"Error getting Feishu access token: {e}")
            return None

    async def get_user_info(self, access_token: str) -> Optional[Dict[str, Any]]:
        """Get user info from Feishu using access token."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    FEISHU_USER_INFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=30,
                )

                if response.status_code != 200:
                    logger.error(f"Feishu user info API error: {response.status_code}")
                    return None

                data = response.json()
                if data.get("code") != 0:
                    logger.error(f"Feishu user info API returned error: {data.get('msg')}")
                    return None

                return data.get("data")

        except Exception as e:
            logger.error(f"Error getting Feishu user info: {e}")
            return None

    async def login_with_code(self, code: str) -> Dict[str, Any]:
        """Complete login flow with authorization code."""
        # Exchange code for access token
        access_token = await self.get_access_token(code)
        if not access_token:
            return {
                "success": False,
                "message": "授权码无效或已过期"
            }

        # Get user info
        user_info = await self.get_user_info(access_token)
        if not user_info:
            return {
                "success": False,
                "message": "获取用户信息失败"
            }

        return {
            "success": True,
            "user": {
                "username": user_info.get("name", ""),
                "avatar": user_info.get("avatar_url", ""),
                "email": user_info.get("email", ""),
                "feishuOpenId": user_info.get("open_id", ""),
                "loginType": "feishu"
            }
        }


feishu_auth_service = FeishuAuthService()
