from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.knowledge import KnowledgeArticle
from typing import List, Optional

def search_knowledge_base(db: Session, query: str, limit: int = 3) -> List[KnowledgeArticle]:
    """
    Retrieves matching verified knowledge articles using keyword & full-text matching.
    """
    clean_query = query.lower().strip()
    words = [w for w in clean_query.split() if len(w) > 3]
    
    query_builder = db.query(KnowledgeArticle).filter(KnowledgeArticle.is_verified == True)
    
    if not words:
        return query_builder.limit(limit).all()
        
    conditions = []
    for word in words:
        conditions.append(KnowledgeArticle.title.ilike(f"%{word}%"))
        conditions.append(KnowledgeArticle.keywords.ilike(f"%{word}%"))
        conditions.append(KnowledgeArticle.content.ilike(f"%{word}%"))
        
    results = query_builder.filter(or_(*conditions)).limit(limit).all()
    return results

def get_policy_by_category(db: Session, category: str) -> Optional[KnowledgeArticle]:
    return db.query(KnowledgeArticle).filter(
        KnowledgeArticle.category.ilike(category),
        KnowledgeArticle.is_verified == True
    ).first()
