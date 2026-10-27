from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.knowledge import KnowledgeArticle
from app.schemas.knowledge import KnowledgeArticleCreate, KnowledgeArticleUpdate, KnowledgeArticleSchema
from app.services.knowledge_service import search_knowledge_base

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

@router.get("", response_model=List[KnowledgeArticleSchema])
def list_or_search_articles(q: Optional[str] = Query(None), db: Session = Depends(get_db)):
    if q and q.strip():
        return search_knowledge_base(db, q, limit=10)
    return db.query(KnowledgeArticle).order_by(KnowledgeArticle.category.asc()).all()

@router.post("", response_model=KnowledgeArticleSchema)
def create_article(payload: KnowledgeArticleCreate, db: Session = Depends(get_db)):
    article = KnowledgeArticle(
        title=payload.title,
        category=payload.category,
        keywords=payload.keywords or "",
        content=payload.content,
        is_verified=payload.is_verified,
        created_at=datetime.utcnow()
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

@router.put("/{article_id}", response_model=KnowledgeArticleSchema)
def update_article(article_id: int, payload: KnowledgeArticleUpdate, db: Session = Depends(get_db)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
        
    if payload.title is not None:
        article.title = payload.title
    if payload.category is not None:
        article.category = payload.category
    if payload.keywords is not None:
        article.keywords = payload.keywords
    if payload.content is not None:
        article.content = payload.content
    if payload.is_verified is not None:
        article.is_verified = payload.is_verified
        
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article

@router.delete("/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    db.delete(article)
    db.commit()
    return {"message": "Article deleted successfully."}
