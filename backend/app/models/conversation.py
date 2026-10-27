from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), default="New Support Inquiry")
    status = Column(String(30), default="active")  # active, escalated, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")
    ticket = relationship("SupportTicket", back_populates="conversation", uselist=False)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender = Column(String(20), nullable=False)  # customer, ai, agent, system
    content = Column(Text, nullable=False)
    sentiment = Column(String(20), default="neutral")  # positive, neutral, frustrated, negative
    humor_used = Column(Boolean, default=False)
    tool_invocations = Column(Text, nullable=True)  # JSON string of tools called
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
