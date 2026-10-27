from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    account_id = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(100), default="Valued Customer")
    email = Column(String(120), nullable=True)
    role = Column(String(20), default="customer")  # customer, agent, admin
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
