from fastapi import APIRouter
from app.api.chat import router as chat_router
from app.api.orders import router as orders_router
from app.api.returns import router as returns_router
from app.api.tickets import router as tickets_router
from app.api.knowledge import router as knowledge_router
from app.api.analytics import router as analytics_router
from app.api.feedback import router as feedback_router

api_router = APIRouter()
api_router.include_router(chat_router)
api_router.include_router(orders_router)
api_router.include_router(returns_router)
api_router.include_router(tickets_router)
api_router.include_router(knowledge_router)
api_router.include_router(analytics_router)
api_router.include_router(feedback_router)
