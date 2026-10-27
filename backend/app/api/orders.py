from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.order import Order
from app.schemas.order import OrderSchema
from app.services.order_service import get_order_by_number

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[OrderSchema])
def list_orders(
    limit: int = 50,
    is_demo: Optional[bool] = Query(None, description="Filter demo vs real orders"),
    query: Optional[str] = Query(None, description="Search by order ID, customer name or email"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    db: Session = Depends(get_db)
):
    """List retail orders with optional demo-flag and search filters."""
    q = db.query(Order)
    if is_demo is not None:
        q = q.filter(Order.is_demo == is_demo)
    if status and status.lower() != "all":
        q = q.filter(Order.status == status.lower())
    if query:
        search = f"%{query.strip().upper()}%"
        q = q.filter(
            (Order.order_number.ilike(search)) |
            (Order.customer_name.ilike(search)) |
            (Order.customer_email.ilike(search))
        )
    return q.order_by(Order.order_date.desc()).limit(limit).all()

@router.get("/{order_number}", response_model=OrderSchema)
def get_order_detail(
    order_number: str, 
    email: Optional[str] = Query(None, description="Optional customer email for verification"),
    db: Session = Depends(get_db)
):
    """Retrieve detailed order information with authorization check."""
    order = get_order_by_number(db, order_number, customer_email=email)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_number}' was not found or unauthorized.")
    return order
