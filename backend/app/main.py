from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import engine, Base, SessionLocal, ensure_schema_up_to_date
import app.models  # ensure models are imported for metadata
from app.seed_data import seed_database
from app.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("retail_chatbot")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    ensure_schema_up_to_date(engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
        try:
            from app.seed_demo_orders import seed_demo_orders
            seed_demo_orders(db)
        except ImportError:
            pass
    finally:
        db.close()
        
    yield
    # Shutdown
    logger.info("Shutting down Sidekick AI backend.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent, witty, Neo-Brutalist Customer Service Chatbot with human handoff.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "demo_mode": settings.DEMO_MODE,
        "llm_provider": "openai" if (not settings.DEMO_MODE and settings.OPENAI_API_KEY) else "intelligent-demo-engine"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal service error occurred. Please try again or speak with an agent."}
    )
