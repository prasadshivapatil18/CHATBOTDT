from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from app.models.order import Order
from app.models.return_request import ReturnRequest
from typing import Dict, Any, Tuple

def check_return_eligibility(order: Order) -> Tuple[bool, str]:
    """
    Checks if order is eligible for return.
    Rules:
    - Ineligible if cancelled or already returned
    - Must be 'delivered'
    - Must be within 30 days of delivery/order
    - Must not have return_eligibility marked as False
    """
    if getattr(order, "status", None) == "cancelled" or getattr(order, "cancellation_status", None) == "cancelled":
        return False, f"Order {order.order_number} is cancelled and cannot be returned."

    if getattr(order, "status", None) == "returned" or getattr(order, "return_status", None) in ["refunded", "approved", "requested"]:
        status_label = getattr(order, "return_status", "processed")
        return False, f"Order {order.order_number} return request has already been recorded (status: {status_label})."

    if order.status != "delivered":
        return False, f"Order {order.order_number} is currently '{order.status}'. Only delivered items can be returned."

    # Explicit flag check
    if getattr(order, "return_eligibility", None) is False:
        notes = getattr(order, "support_notes", "") or "Return window expired."
        return False, f"Order {order.order_number} is ineligible for return. {notes}"

    days_since_order = (datetime.utcnow() - order.order_date).days
    if days_since_order > 30:
        return False, f"Order was placed {days_since_order} days ago. Our standard return window is 30 days."

    return True, "Order is eligible for return."

def create_return_request(db: Session, order: Order, reason: str, item_details: str = None) -> ReturnRequest:
    return_code = f"RET-{random.randint(1000, 9999)}"
    
    ret = ReturnRequest(
        return_number=return_code,
        order_id=order.id,
        customer_id=order.customer_id,
        reason=reason,
        item_details=item_details or "All items in order",
        status="approved",
        refund_amount=order.total_amount,
        tracking_number=f"RET-TRK-{random.randint(100000, 999999)}",
        created_at=datetime.utcnow()
    )
    db.add(ret)
    db.commit()
    db.refresh(ret)
    return ret
