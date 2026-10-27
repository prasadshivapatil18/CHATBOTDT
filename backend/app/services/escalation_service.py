from sqlalchemy.orm import Session
from datetime import datetime
import random
from typing import Optional, Dict, Any, Tuple
from app.models.ticket import SupportTicket, TicketResponse
from app.models.conversation import Conversation

def should_escalate(message: str, sentiment: str, previous_messages_count: int = 0) -> Tuple[bool, str, str]:
    """
    Evaluates whether conversation should escalate to human agent.
    Returns (should_escalate, category, priority).
    """
    msg = message.lower()
    
    # Exclude identity questions (e.g. "are you human", "are you a real person")
    identity_inquiries = ["are you human", "are you a human", "are you real", "are you a real", "are you a bot", "are you ai"]
    if any(q in msg for q in identity_inquiries):
        return False, "general", "low"

    # 1. Explicit request for human support
    explicit_triggers = ["talk to human", "speak to human", "connect to human", "need a human", "transfer to human", "human agent", "real person please", "human please", "representative", "manager", "supervisor"]
    if any(trigger in msg for trigger in explicit_triggers) or (("human" in msg or "agent" in msg) and any(w in msg for w in ["speak", "talk", "connect", "transfer", "need", "get me"])):
        return True, "general", "high"
        
    # 2. Payment/billing dispute
    if any(w in msg for w in ["deducted twice", "charged twice", "double charged", "duplicate payment", "fraud", "stolen", "unauthorized"]):
        return True, "payment", "urgent"
        
    # 3. Severe frustration
    if sentiment in ["frustrated", "negative"] and any(w in msg for w in ["terrible", "worst", "hours", "unacceptable", "sue", "legal"]):
        return True, "general", "urgent"
        
    return False, "general", "medium"

def create_escalation_ticket(
    db: Session,
    conversation_id: Optional[int],
    customer_name: str,
    customer_email: str,
    subject: str,
    summary: str,
    category: str = "general",
    priority: str = "medium",
    order_id: Optional[str] = None
) -> SupportTicket:
    """
    Creates a formal support ticket in the database.
    """
    ticket_num = f"TCK-{random.randint(1000, 9999)}"
    
    # Calculate queue position based on open tickets
    open_count = db.query(SupportTicket).filter(SupportTicket.status.in_(["open", "queued"])).count()
    queue_pos = open_count + 1
    
    ticket = SupportTicket(
        ticket_number=ticket_num,
        conversation_id=conversation_id,
        customer_name=customer_name or "Customer",
        customer_email=customer_email or "customer@example.com",
        category=category,
        priority=priority,
        status="queued",
        subject=subject,
        summary=summary,
        order_id=order_id,
        queue_position=queue_pos,
        created_at=datetime.utcnow()
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Add initial system response
    initial_sys_msg = TicketResponse(
        ticket_id=ticket.id,
        sender_name="System",
        sender_role="system",
        message=f"Ticket #{ticket_num} created from chat session. AI summary generated. Queued for support specialist.",
        created_at=datetime.utcnow()
    )
    db.add(initial_sys_msg)
    
    # Update conversation status if conversation_id is provided
    if conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            conv.status = "escalated"
            
    db.commit()
    return ticket
