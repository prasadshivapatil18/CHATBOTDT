from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OrderItemSchema(BaseModel):
    id: int
    product_id: Optional[int] = None
    sku: Optional[str] = None
    product_name: str
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int] = None
    customer_name: str
    customer_email: str
    status: str
    payment_status: Optional[str] = "paid"
    payment_method: Optional[str] = "Credit Card (•••• 4242)"
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    estimated_delivery: Optional[str] = None
    actual_delivery: Optional[str] = None
    cancellation_status: Optional[str] = "not_cancelled"
    return_eligibility: Optional[bool] = True
    return_status: Optional[str] = "none"
    refund_amount: Optional[float] = 0.0
    refund_status: Optional[str] = "none"
    support_notes: Optional[str] = None
    is_demo: Optional[bool] = False
    order_date: datetime
    total_amount: float
    shipping_address: str
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True

class ReturnRequestCreate(BaseModel):
    order_number: str
    reason: str
    item_details: Optional[str] = None
    customer_email: Optional[str] = None

class ReturnRequestSchema(BaseModel):
    id: int
    return_number: str
    order_id: int
    reason: str
    item_details: Optional[str] = None
    status: str
    refund_amount: float
    tracking_number: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
