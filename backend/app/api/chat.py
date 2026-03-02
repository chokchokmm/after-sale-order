from fastapi import APIRouter

from app.models.chat import AskRequest, AskResponse
from app.services.chat_service import chat_service

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    """Single Q&A, stateless."""
    result = await chat_service.ask(request.message)
    return AskResponse(**result)
