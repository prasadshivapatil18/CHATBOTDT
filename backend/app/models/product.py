from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    description = Column(Text, nullable=False)
    specs = Column(Text, nullable=True)  # JSON string or bullet points
    returnable = Column(Boolean, default=True)
    warranty_months = Column(Integer, default=12)
    rating = Column(Float, default=4.5)
