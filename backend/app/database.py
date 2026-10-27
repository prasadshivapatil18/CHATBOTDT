from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# SQLite configuration needs check_same_thread=False
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_schema_up_to_date(target_engine=None):
    """Safely adds missing columns to SQLite tables if they do not exist."""
    eng = target_engine or engine
    inspector = inspect(eng)
    table_names = inspector.get_table_names()
    
    with eng.connect() as conn:
        # Check orders table
        if "orders" in table_names:
            cols = {c["name"] for c in inspector.get_columns("orders")}
            order_cols = [
                ("payment_status", "VARCHAR(30) DEFAULT 'paid'"),
                ("payment_method", "VARCHAR(100) DEFAULT 'Credit Card (•••• 4242)'"),
                ("actual_delivery", "VARCHAR(50)"),
                ("cancellation_status", "VARCHAR(30) DEFAULT 'not_cancelled'"),
                ("return_eligibility", "BOOLEAN DEFAULT 1"),
                ("return_status", "VARCHAR(30) DEFAULT 'none'"),
                ("refund_amount", "FLOAT DEFAULT 0.0"),
                ("refund_status", "VARCHAR(30) DEFAULT 'none'"),
                ("support_notes", "TEXT"),
                ("is_demo", "BOOLEAN DEFAULT 0"),
            ]
            for col_name, col_def in order_cols:
                if col_name not in cols:
                    try:
                        conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col_name} {col_def}"))
                        conn.commit()
                    except Exception as e:
                        pass
                        
        # Check order_items table
        if "order_items" in table_names:
            cols = {c["name"] for c in inspector.get_columns("order_items")}
            if "sku" not in cols:
                try:
                    conn.execute(text("ALTER TABLE order_items ADD COLUMN sku VARCHAR(50)"))
                    conn.commit()
                except Exception:
                    pass

        # Check users table
        if "users" in table_names:
            cols = {c["name"] for c in inspector.get_columns("users")}
            if "account_id" not in cols:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN account_id VARCHAR(50)"))
                    conn.commit()
                except Exception:
                    pass
            if "is_demo" not in cols:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_demo BOOLEAN DEFAULT 0"))
                    conn.commit()
                except Exception:
                    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

