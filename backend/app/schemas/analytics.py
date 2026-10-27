from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    conversation_id: Optional[int] = None
    ticket_id: Optional[int] = None
    rating: int  # 1-5
    comment: Optional[str] = None
    resolved_satisfactorily: bool = True

class FeedbackSchema(BaseModel):
    id: int
    conversation_id: Optional[int] = None
    ticket_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
    resolved_satisfactorily: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyticsOverview(BaseModel):
    total_conversations: int
    ai_resolution_rate: float
    avg_response_time_sec: float
    human_escalation_rate: float
    csat_score: float
    open_tickets_count: int
    sentiment_distribution: Dict[str, int]
    category_distribution: Dict[str, int]
    recent_trend: List[Dict[str, Any]]
    faq_frequency: List[Dict[str, Any]]
