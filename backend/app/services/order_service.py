from sqlalchemy.orm import Session
from app.models.order import Order
from typing import Optional, Dict, Any

def get_order_by_number(db: Session, order_number: str, customer_email: Optional[str] = None) -> Optional[Order]:
    """
    Retrieves an order by its order_number.
    If customer_email is specified, verifies ownership to prevent unauthorized access.
    """
    clean_number = order_number.strip().upper()
    query = db.query(Order).filter(Order.order_number == clean_number)
    
    order = query.first()
    if not order:
        return None
        
    # Authorization check if email is provided
    if customer_email and order.customer_email.lower() != customer_email.strip().lower():
        # Unauthorized access attempt
        return None
        
    return order

def format_order_status_summary(order: Order) -> Dict[str, Any]:
    return {
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "status": order.status,
        "payment_status": getattr(order, "payment_status", "paid") or "paid",
        "payment_method": getattr(order, "payment_method", "Credit Card") or "Credit Card",
        "carrier": order.carrier,
        "tracking_number": order.tracking_number,
        "estimated_delivery": order.estimated_delivery,
        "actual_delivery": getattr(order, "actual_delivery", None),
        "cancellation_status": getattr(order, "cancellation_status", "not_cancelled") or "not_cancelled",
        "return_eligibility": getattr(order, "return_eligibility", True),
        "return_status": getattr(order, "return_status", "none") or "none",
        "refund_amount": getattr(order, "refund_amount", 0.0) or 0.0,
        "refund_status": getattr(order, "refund_status", "none") or "none",
        "support_notes": getattr(order, "support_notes", None),
        "is_demo": getattr(order, "is_demo", False),
        "order_date": order.order_date.isoformat() if order.order_date else None,
        "total_amount": order.total_amount,
        "shipping_address": order.shipping_address,
        "items": [
            {
                "product_name": item.product_name,
                "sku": getattr(item, "sku", None),
                "quantity": item.quantity,
                "unit_price": item.unit_price
            }
            for item in order.items
        ]
    }
