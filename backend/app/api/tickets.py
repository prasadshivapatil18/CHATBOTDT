from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.ticket import SupportTicket, TicketResponse
from app.schemas.ticket import (
    SupportTicketCreate,
    SupportTicketUpdate,
    SupportTicketSchema,
    TicketResponseCreate,
    TicketResponseSchema
)
from app.services.escalation_service import create_escalation_ticket

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=List[SupportTicketSchema])
def list_tickets(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve support tickets with optional filtering."""
    query = db.query(SupportTicket)
    if status and status != "all":
        query = query.filter(SupportTicket.status == status)
    if category and category != "all":
        query = query.filter(SupportTicket.category == category)
    if priority and priority != "all":
        query = query.filter(SupportTicket.priority == priority)
        
    return query.order_by(SupportTicket.created_at.desc()).all()

@router.get("/{ticket_id}", response_model=SupportTicketSchema)
def get_ticket_detail(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    return ticket

@router.post("", response_model=SupportTicketSchema)
def create_ticket(payload: SupportTicketCreate, db: Session = Depends(get_db)):
    ticket = create_escalation_ticket(
        db=db,
        conversation_id=payload.conversation_id,
        customer_name=payload.customer_name or "Customer",
        customer_email=payload.customer_email or "customer@example.com",
        subject=payload.subject,
        summary=payload.summary,
        category=payload.category,
        priority=payload.priority,
        order_id=payload.order_id
    )
    return ticket

@router.patch("/{ticket_id}", response_model=SupportTicketSchema)
def update_ticket(ticket_id: int, payload: SupportTicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
        
    if payload.status is not None:
        ticket.status = payload.status
    if payload.priority is not None:
        ticket.priority = payload.priority
    if payload.assigned_agent is not None:
        ticket.assigned_agent = payload.assigned_agent
    if payload.category is not None:
        ticket.category = payload.category
        
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket

@router.post("/{ticket_id}/responses", response_model=TicketResponseSchema)
def add_ticket_response(ticket_id: int, payload: TicketResponseCreate, db: Session = Depends(get_db)):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
        
    resp = TicketResponse(
        ticket_id=ticket.id,
        sender_name=payload.sender_name,
        sender_role=payload.sender_role,
        message=payload.message,
        created_at=datetime.utcnow()
    )
    db.add(resp)
    
    # If agent responded, update ticket status to in_progress if currently open/queued
    if payload.sender_role == "agent" and ticket.status in ["open", "queued"]:
        ticket.status = "in_progress"
        ticket.assigned_agent = payload.sender_name
        
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(resp)
    return resp
