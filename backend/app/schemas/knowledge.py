from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class KnowledgeArticleCreate(BaseModel):
    title: str
    category: str
    keywords: Optional[str] = ""
    content: str
    is_verified: bool = True

class KnowledgeArticleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    keywords: Optional[str] = None
    content: Optional[str] = None
    is_verified: Optional[bool] = None

class KnowledgeArticleSchema(BaseModel):
    id: int
    title: str
    category: str
    keywords: Optional[str] = ""
    content: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
