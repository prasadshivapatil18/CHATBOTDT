from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, ConversationDetail
from app.services.ai_service import process_chat_message
from app.models.conversation import Conversation

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatMessageResponse)
async def post_chat_message(payload: ChatMessageRequest, db: Session = Depends(get_db)):
    """Processes customer message through the AI conversational engine."""
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be blank.")
        
    result = await process_chat_message(
        conversation_id=payload.conversation_id,
        session_id=payload.session_id,
        message=payload.message,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        db=db
    )
    return result

@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation_history(conversation_id: int, db: Session = Depends(get_db)):
    """Retrieves full conversation history."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv
