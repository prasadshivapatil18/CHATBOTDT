from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TicketResponseCreate(BaseModel):
    sender_name: str
    sender_role: str = "agent"  # agent, customer, system
    message: str

class TicketResponseSchema(BaseModel):
    id: int
    ticket_id: int
    sender_name: str
    sender_role: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class SupportTicketCreate(BaseModel):
    conversation_id: Optional[int] = None
    customer_name: Optional[str] = "Customer"
    customer_email: Optional[str] = "customer@example.com"
    category: str = "general"
    priority: str = "medium"
    subject: str
    summary: str
    order_id: Optional[str] = None

class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_agent: Optional[str] = None
    category: Optional[str] = None

class SupportTicketSchema(BaseModel):
    id: int
    ticket_number: str
    conversation_id: Optional[int] = None
    customer_name: str
    customer_email: str
    category: str
    priority: str
    status: str
    subject: str
    summary: str
    order_id: Optional[str] = None
    assigned_agent: Optional[str] = None
    queue_position: Optional[int] = 1
    created_at: datetime
    updated_at: datetime
    responses: List[TicketResponseSchema] = []

    class Config:
        from_attributes = True
