from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.feedback import CustomerFeedback
from app.schemas.analytics import FeedbackCreate, FeedbackSchema

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackSchema)
def submit_customer_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
        
    fb = CustomerFeedback(
        conversation_id=payload.conversation_id,
        ticket_id=payload.ticket_id,
        rating=payload.rating,
        comment=payload.comment,
        resolved_satisfactorily=payload.resolved_satisfactorily,
        created_at=datetime.utcnow()
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("", response_model=List[FeedbackSchema])
def list_feedback(limit: int = 20, db: Session = Depends(get_db)):
    return db.query(CustomerFeedback).order_by(CustomerFeedback.created_at.desc()).limit(limit).all()
