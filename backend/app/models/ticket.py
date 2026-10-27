from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(100), default="Customer")
    customer_email = Column(String(120), default="customer@example.com")
    category = Column(String(50), default="general")  # order, return, payment, technical, general
    priority = Column(String(20), default="medium")   # low, medium, high, urgent
    status = Column(String(30), default="open")       # open, queued, in_progress, resolved
    subject = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    order_id = Column(String(50), nullable=True)
    assigned_agent = Column(String(100), nullable=True)
    queue_position = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="ticket")
    responses = relationship("TicketResponse", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketResponse.created_at")

class TicketResponse(Base):
    __tablename__ = "ticket_responses"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    sender_name = Column(String(100), nullable=False)
    sender_role = Column(String(20), default="agent")  # agent, customer, system
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("SupportTicket", back_populates="responses")
