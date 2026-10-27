from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ToolCallInfo(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output: Dict[str, Any]

class ChatMessageRequest(BaseModel):
    conversation_id: Optional[int] = None
    session_id: str
    message: str
    customer_name: Optional[str] = "Customer"
    customer_email: Optional[str] = None

class ChatMessageResponse(BaseModel):
    conversation_id: int
    message_id: int
    reply: str
    sender: str = "ai"
    sentiment: str = "neutral"
    humor_used: bool = False
    is_escalated: bool = False
    ticket_number: Optional[str] = None
    ticket_summary: Optional[str] = None
    tools_called: List[ToolCallInfo] = []
    suggested_actions: List[str] = []
    is_demo: bool = True
    created_at: str

class MessageHistoryItem(BaseModel):
    id: int
    sender: str
    content: str
    sentiment: Optional[str] = "neutral"
    humor_used: Optional[bool] = False
    tool_invocations: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationDetail(BaseModel):
    id: int
    session_id: str
    title: str
    status: str
    messages: List[MessageHistoryItem] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
