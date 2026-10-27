from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(120), nullable=False)
    status = Column(String(30), default="processing")  # processing, shipped, delivered, delayed, cancelled
    tracking_number = Column(String(100), nullable=True)
    carrier = Column(String(50), default="NeoExpress Logistics")
    estimated_delivery = Column(String(50), nullable=True)
    order_date = Column(DateTime, default=datetime.utcnow)
    total_amount = Column(Float, nullable=False)
    shipping_address = Column(Text, nullable=False)

    payment_status = Column(String(30), default="paid")  # paid, refund_pending, refunded, failed, duplicate_hold, security_hold
    payment_method = Column(String(100), default="Credit Card (•••• 4242)")
    actual_delivery = Column(String(50), nullable=True)
    cancellation_status = Column(String(30), default="not_cancelled")  # not_cancelled, cancelled, requested, ineligible
    return_eligibility = Column(Boolean, default=True)
    return_status = Column(String(30), default="none")  # none, eligible, ineligible_expired, requested, approved, refunded
    refund_amount = Column(Float, default=0.0)
    refund_status = Column(String(30), default="none")  # none, pending, completed, not_applicable
    support_notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False, index=True)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    returns = relationship("ReturnRequest", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    sku = Column(String(50), nullable=True)
    product_name = Column(String(150), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
