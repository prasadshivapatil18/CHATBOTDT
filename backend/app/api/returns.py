from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.order import ReturnRequestCreate, ReturnRequestSchema
from app.services.order_service import get_order_by_number
from app.services.return_service import check_return_eligibility, create_return_request

router = APIRouter(prefix="/returns", tags=["Returns"])

@router.get("/check/{order_number}")
def check_order_return_eligibility(order_number: str, db: Session = Depends(get_db)):
    order = get_order_by_number(db, order_number)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    eligible, reason = check_return_eligibility(order)
    return {
        "order_number": order.order_number,
        "eligible": eligible,
        "reason": reason,
        "total_amount": order.total_amount,
        "status": order.status
    }

@router.post("", response_model=ReturnRequestSchema)
def submit_return_request(payload: ReturnRequestCreate, db: Session = Depends(get_db)):
    order = get_order_by_number(db, payload.order_number, payload.customer_email)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{payload.order_number}' not found.")
        
    eligible, reason = check_return_eligibility(order)
    if not eligible:
        raise HTTPException(status_code=400, detail=f"Order cannot be returned: {reason}")
        
    return_obj = create_return_request(db, order, payload.reason, payload.item_details)
    return return_obj
