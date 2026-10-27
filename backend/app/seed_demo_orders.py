"""
Database Seeding Script for Realistic Retail Demo Orders.
Sidekick AI Customer Service Platform.

Seeds 13 comprehensive demonstration orders representing diverse retail scenarios:
1.  ORD-DEMO-1001: Delivered successfully (Audio Headphones, return eligible)
2.  ORD-DEMO-1002: Shipped & in transit with live courier tracking (Smart Watch)
3.  ORD-DEMO-1003: Processing order, eligible for instant free cancellation (Mechanical Keyboard)
4.  ORD-DEMO-1004: Delayed delivery with updated courier tracking & apology (Running Shoes)
5.  ORD-DEMO-1005: Cancelled order with recorded refund (Bluetooth Speaker)
6.  ORD-DEMO-1006: Return received with refund pending 3-5 bank days (Laptop Backpack)
7.  ORD-DEMO-1007: Return and refund completed in full (USB-C Hub)
8.  ORD-DEMO-1008: Delivered order within 30-day window, eligible for return (Fitness Band)
9.  ORD-DEMO-1009: Delivered order >30 days ago, return window expired (Desk Lamp)
10. ORD-DEMO-1010: Simulated payment authorization issue requiring escalation (Wireless Mouse)
11. ORD-DEMO-1011: Missing shipment enquiry on carrier-delivered package (4K Webcam)
12. ORD-DEMO-1012: Duplicate payment authorization complaint under review (Ergonomic Chair)
13. ORD-DEMO-1013: High-value security manual review hold (Ultrawide Monitor)

IDEMPOTENT: Running this script multiple times will update/ensure demo records exist
without duplicating them, and without deleting or modifying any real customer data.
"""

import sys
import logging
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Ensure backend root is on sys.path for direct CLI execution
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base, ensure_schema_up_to_date
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.return_request import ReturnRequest
from app.models.ticket import SupportTicket, TicketResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_demo_orders")

# Current base time for relative timestamps
NOW = datetime.now(timezone.utc).replace(tzinfo=None)

# 1. Demo Customers
DEMO_CUSTOMERS = [
    {"account_id": "USR-DEMO-1001", "name": "Elena Rostova", "email": "elena.rostova@example.com"},
    {"account_id": "USR-DEMO-1002", "name": "Marcus Chen", "email": "marcus.chen@example.com"},
    {"account_id": "USR-DEMO-1003", "name": "Chloe Bennett", "email": "chloe.bennett@example.com"},
    {"account_id": "USR-DEMO-1004", "name": "Liam O'Connor", "email": "liam.oconnor@example.com"},
    {"account_id": "USR-DEMO-1005", "name": "Sofia Martinez", "email": "sofia.martinez@example.com"},
    {"account_id": "USR-DEMO-1006", "name": "Julian Thorne", "email": "julian.thorne@example.com"},
    {"account_id": "USR-DEMO-1007", "name": "Maya Lin", "email": "maya.lin@example.com"},
    {"account_id": "USR-DEMO-1008", "name": "Tariq Al-Mansoor", "email": "tariq.mansoor@example.com"},
    {"account_id": "USR-DEMO-1009", "name": "Beatrice Vance", "email": "beatrice.vance@example.com"},
    {"account_id": "USR-DEMO-1010", "name": "Zachary Knight", "email": "zachary.knight@example.com"},
    {"account_id": "USR-DEMO-1011", "name": "Nina Patel", "email": "nina.patel@example.com"},
    {"account_id": "USR-DEMO-1012", "name": "Derek Foster", "email": "derek.foster@example.com"},
    {"account_id": "USR-DEMO-1013", "name": "Gabriel Santos", "email": "gabriel.santos@example.com"},
]

# 2. Demo Products
DEMO_PRODUCTS = [
    {
        "sku": "SKU-HP200",
        "name": "AuraPulse ANC Wireless Headphones",
        "category": "Audio",
        "price": 199.99,
        "stock": 25,
        "description": "Active noise cancellation, custom 40mm titanium drivers, and 45-hour battery playtime.",
        "specs": "Driver: 40mm Titanium, Codecs: LDAC/AAC/SBC, Battery: 45 Hours, Weight: 250g",
        "returnable": True,
        "warranty_months": 12,
        "rating": 4.9,
    },
    {
        "sku": "SKU-SW600",
        "name": "NeoTrack Chrono Smart Watch",
        "category": "Wearables",
        "price": 179.99,
        "stock": 30,
        "description": "AMOLED touch display, heart rate and SpO2 tracking, GPS navigation, and 7-day battery life.",
        "specs": "Screen: 1.43\" AMOLED, Water Resistance: 5 ATM, GPS: Dual-frequency, Battery: 7 Days",
        "returnable": True,
        "warranty_months": 24,
        "rating": 4.7,
    },
    {
        "sku": "SKU-KB100",
        "name": "NeoGlow Mechanical Keyboard",
        "category": "Keyboards",
        "price": 129.99,
        "stock": 42,
        "description": "Hot-swappable tactile switches, per-key RGB lighting, and aircraft-grade aluminum top frame.",
        "specs": "Switches: Gateron Pro Yellow, Connection: Type-C + 2.4GHz + BT 5.2, Battery: 4000mAh",
        "returnable": True,
        "warranty_months": 24,
        "rating": 4.8,
    },
    {
        "sku": "SKU-RS700",
        "name": "AeroStride Pro Running Shoes",
        "category": "Footwear",
        "price": 119.99,
        "stock": 50,
        "description": "Breathable carbon-fiber plate distance running shoes with dynamic cushion foam.",
        "specs": "Weight: 210g, Plate: Full carbon fiber, Drop: 8mm, Midsole: Supercritical PEBA",
        "returnable": True,
        "warranty_months": 6,
        "rating": 4.6,
    },
    {
        "sku": "SKU-SP800",
        "name": "SoundWave Rugged Bluetooth Speaker",
        "category": "Audio",
        "price": 79.99,
        "stock": 35,
        "description": "IP67 waterproof outdoor speaker with 360-degree sound, punchy bass, and 24h battery life.",
        "specs": "Power: 30W RMS, Rating: IP67, Bluetooth: 5.3, Playtime: 24h, Charge: USB-C Fast Charge",
        "returnable": True,
        "warranty_months": 12,
        "rating": 4.8,
    },
    {
        "sku": "SKU-BP900",
        "name": "CyberPack Shield Laptop Backpack",
        "category": "Accessories",
        "price": 89.99,
        "stock": 40,
        "description": "Weatherproof EDC backpack with dedicated padded 16\" laptop compartment and TSA lock.",
        "specs": "Volume: 25L, Fabric: 840D Ballistic Nylon, Fits: 16\" MacBook Pro, Water Repellent",
        "returnable": True,
        "warranty_months": 24,
        "rating": 4.9,
    },
    {
        "sku": "SKU-HB150",
        "name": "OmniPort 8-in-1 USB-C Hub",
        "category": "Accessories",
        "price": 49.99,
        "stock": 60,
        "description": "Multiport adapter featuring 4K HDMI @60Hz, 100W Power Delivery, SD/TF reader, and Gigabit Ethernet.",
        "specs": "HDMI: 4K@60Hz, PD: 100W Pass-through, Ethernet: 1Gbps, USB: 3x USB 3.1 Gen 2",
        "returnable": True,
        "warranty_months": 18,
        "rating": 4.7,
    },
    {
        "sku": "SKU-FB250",
        "name": "PulseFit Active Fitness Band",
        "category": "Wearables",
        "price": 69.99,
        "stock": 45,
        "description": "Ultra-lightweight activity tracker with continuous heart-rate, sleep staging, and 14-day battery.",
        "specs": "Display: 1.1\" OLED, Weight: 23g, Water: 50m water resistant, Battery: 14 Days",
        "returnable": True,
        "warranty_months": 12,
        "rating": 4.5,
    },
    {
        "sku": "SKU-DL350",
        "name": "LumenArt Minimalist LED Desk Lamp",
        "category": "Home Office",
        "price": 39.99,
        "stock": 30,
        "description": "Architectural swing-arm desk lamp with adjustable color temperatures and wireless fast charger base.",
        "specs": "Luminance: 1000 Lumens, Color Temp: 2700K - 6500K, Base: 15W Qi Wireless Charger",
        "returnable": True,
        "warranty_months": 12,
        "rating": 4.4,
    },
    {
        "sku": "SKU-MS300",
        "name": "CyberGlide Ergonomic Mouse",
        "category": "Accessories",
        "price": 59.99,
        "stock": 65,
        "description": "Ultra-lightweight 58g ergonomic gaming mouse with optical switches and flexible paracord cable.",
        "specs": "Sensor: 26,000 DPI Optical, Switches: Optical 90M clicks, Polling Rate: 1000Hz",
        "returnable": True,
        "warranty_months": 12,
        "rating": 4.7,
    },
    {
        "sku": "SKU-WC450",
        "name": "VisionClear 4K Ultra HD Webcam",
        "category": "Video & Streaming",
        "price": 99.99,
        "stock": 28,
        "description": "4K Sony STARVIS sensor webcam with AI auto-framing, dual noise-canceling mics, and privacy shutter.",
        "specs": "Resolution: 4K@30fps / 1080p@60fps, FOV: 90°, Microphone: Dual Stereo, Mount: Tripod ready",
        "returnable": True,
        "warranty_months": 24,
        "rating": 4.8,
    },
    {
        "sku": "SKU-CH500",
        "name": "TitanFlex Mesh Ergonomic Chair",
        "category": "Furniture",
        "price": 289.99,
        "stock": 14,
        "description": "Breathable Korean mesh, 3D dynamic lumbar support, 4D armrests, and 135° recline angle.",
        "specs": "Max Weight: 300 lbs, Base: Aluminum Alloy, Castors: Smooth PU Rollerblade Wheels",
        "returnable": True,
        "warranty_months": 60,
        "rating": 4.8,
    },
    {
        "sku": "SKU-MN400",
        "name": "NeoVibe 34\" Ultrawide 4K Monitor",
        "category": "Displays",
        "price": 449.99,
        "stock": 8,
        "description": "Curved 1500R WQHD panel with 144Hz refresh rate, 1ms response time, and HDR400 color precision.",
        "specs": "Resolution: 3440x1440, Refresh: 144Hz, Panel: Fast IPS, Ports: 2x DP 1.4, 2x HDMI 2.1, USB-C 90W PD",
        "returnable": True,
        "warranty_months": 36,
        "rating": 4.6,
    },
]

# 3. Demo Orders Definition
DEMO_ORDERS = [
    {
        "order_number": "ORD-DEMO-1001",
        "account_id": "USR-DEMO-1001",
        "customer_name": "Elena Rostova",
        "customer_email": "elena.rostova@example.com",
        "sku": "SKU-HP200",
        "product_name": "AuraPulse ANC Wireless Headphones",
        "quantity": 1,
        "unit_price": 199.99,
        "total_amount": 199.99,
        "order_date": NOW - timedelta(days=6),
        "status": "delivered",
        "payment_status": "paid",
        "payment_method": "Visa ending in •••• 4242",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "NEO-TRK-771001",
        "estimated_delivery": "Oct 20, 2026",
        "actual_delivery": "Oct 20, 2026 at 14:15 EST",
        "cancellation_status": "not_cancelled",
        "return_eligibility": True,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "742 Evergreen Terrace, Springfield, OR 97477",
        "support_notes": "Delivered successfully to residential porch. Fully eligible for general inquiries or 30-day return.",
    },
    {
        "order_number": "ORD-DEMO-1002",
        "account_id": "USR-DEMO-1002",
        "customer_name": "Marcus Chen",
        "customer_email": "marcus.chen@example.com",
        "sku": "SKU-SW600",
        "product_name": "NeoTrack Chrono Smart Watch",
        "quantity": 1,
        "unit_price": 179.99,
        "total_amount": 179.99,
        "order_date": NOW - timedelta(days=2),
        "status": "shipped",
        "payment_status": "paid",
        "payment_method": "Mastercard ending in •••• 8821",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "NEO-TRK-771002",
        "estimated_delivery": "Oct 28, 2026",
        "actual_delivery": None,
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "100 Cyberdyne Way, Suite 400, Los Angeles, CA 90001",
        "support_notes": "Departed regional hub sorting facility; in active transit on scheduled trajectory.",
    },
    {
        "order_number": "ORD-DEMO-1003",
        "account_id": "USR-DEMO-1003",
        "customer_name": "Chloe Bennett",
        "customer_email": "chloe.bennett@example.com",
        "sku": "SKU-KB100",
        "product_name": "NeoGlow Mechanical Keyboard",
        "quantity": 1,
        "unit_price": 129.99,
        "total_amount": 129.99,
        "order_date": NOW - timedelta(hours=14),
        "status": "processing",
        "payment_status": "paid",
        "payment_method": "Apple Pay (Device Token •••• 3190)",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "PENDING-ASSIGNMENT",
        "estimated_delivery": "Oct 30, 2026",
        "actual_delivery": None,
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "42 Wallaby Way, Sydney / New York Logistics Gate, NY 10001",
        "support_notes": "Payment confirmed and item allocated in warehouse. Order can be cancelled immediately at no fee.",
    },
    {
        "order_number": "ORD-DEMO-1004",
        "account_id": "USR-DEMO-1004",
        "customer_name": "Liam O'Connor",
        "customer_email": "liam.oconnor@example.com",
        "sku": "SKU-RS700",
        "product_name": "AeroStride Pro Running Shoes",
        "quantity": 1,
        "unit_price": 119.99,
        "total_amount": 119.99,
        "order_date": NOW - timedelta(days=5),
        "status": "delayed",
        "payment_status": "paid",
        "payment_method": "Visa ending in •••• 1092",
        "carrier": "Apex Freight Express",
        "tracking_number": "NEO-TRK-771004",
        "estimated_delivery": "Delayed: Expected Oct 27, 2026 (was Oct 22)",
        "actual_delivery": None,
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "221B Baker Street, Suite 2, Boston, MA 02115",
        "support_notes": "Weather disruption at Chicago hub delayed dispatch. Courier logs note package rerouted.",
    },
    {
        "order_number": "ORD-DEMO-1005",
        "account_id": "USR-DEMO-1005",
        "customer_name": "Sofia Martinez",
        "customer_email": "sofia.martinez@example.com",
        "sku": "SKU-SP800",
        "product_name": "SoundWave Rugged Bluetooth Speaker",
        "quantity": 1,
        "unit_price": 79.99,
        "total_amount": 79.99,
        "order_date": NOW - timedelta(days=4),
        "status": "cancelled",
        "payment_status": "refunded",
        "payment_method": "PayPal (safely masked: s***z@example.com)",
        "carrier": "NeoExpress Logistics",
        "tracking_number": None,
        "estimated_delivery": None,
        "actual_delivery": None,
        "cancellation_status": "cancelled",
        "return_eligibility": False,
        "return_status": "none",
        "refund_amount": 79.99,
        "refund_status": "completed",
        "shipping_address": "88 Ocean Drive, Miami, FL 33139",
        "support_notes": "Customer cancelled during processing stage. Full refund of $79.99 automatically posted to PayPal.",
    },
    {
        "order_number": "ORD-DEMO-1006",
        "account_id": "USR-DEMO-1006",
        "customer_name": "Julian Thorne",
        "customer_email": "julian.thorne@example.com",
        "sku": "SKU-BP900",
        "product_name": "CyberPack Shield Laptop Backpack",
        "quantity": 1,
        "unit_price": 89.99,
        "total_amount": 89.99,
        "order_date": NOW - timedelta(days=12),
        "status": "returned",
        "payment_status": "refund_pending",
        "payment_method": "Mastercard ending in •••• 5044",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "NEO-TRK-771006",
        "estimated_delivery": "Delivered Oct 14",
        "actual_delivery": "Delivered Oct 14, 2026",
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "approved",
        "refund_amount": 89.99,
        "refund_status": "pending",
        "shipping_address": "12 Grimmauld Place, Chicago, IL 60601",
        "support_notes": "Return package received and verified at central intake warehouse. Refund of $89.99 pending 3-5 bank business days.",
    },
    {
        "order_number": "ORD-DEMO-1007",
        "account_id": "USR-DEMO-1007",
        "customer_name": "Maya Lin",
        "customer_email": "maya.lin@example.com",
        "sku": "SKU-HB150",
        "product_name": "OmniPort 8-in-1 USB-C Hub",
        "quantity": 1,
        "unit_price": 49.99,
        "total_amount": 49.99,
        "order_date": NOW - timedelta(days=18),
        "status": "returned",
        "payment_status": "refunded",
        "payment_method": "Visa ending in •••• 9912",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "NEO-TRK-771007",
        "estimated_delivery": "Delivered Oct 09",
        "actual_delivery": "Delivered Oct 09, 2026",
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "refunded",
        "refund_amount": 49.99,
        "refund_status": "completed",
        "shipping_address": "500 Market Street, San Francisco, CA 94105",
        "support_notes": "Return item inspected and full refund of $49.99 completed back to original card on Oct 16.",
    },
    {
        "order_number": "ORD-DEMO-1008",
        "account_id": "USR-DEMO-1008",
        "customer_name": "Tariq Al-Mansoor",
        "customer_email": "tariq.mansoor@example.com",
        "sku": "SKU-FB250",
        "product_name": "PulseFit Active Fitness Band",
        "quantity": 1,
        "unit_price": 69.99,
        "total_amount": 69.99,
        "order_date": NOW - timedelta(days=8),
        "status": "delivered",
        "payment_status": "paid",
        "payment_method": "Visa ending in •••• 5531",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "NEO-TRK-771008",
        "estimated_delivery": "Oct 18, 2026",
        "actual_delivery": "Delivered Oct 18, 2026",
        "cancellation_status": "not_cancelled",
        "return_eligibility": True,
        "return_status": "eligible",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "1600 Amphitheatre Parkway, Mountain View, CA 94043",
        "support_notes": "Delivered 6 days ago. Well within 30-day money-back guarantee window; instant return label can be issued.",
    },
    {
        "order_number": "ORD-DEMO-1009",
        "account_id": "USR-DEMO-1009",
        "customer_name": "Beatrice Vance",
        "customer_email": "beatrice.vance@example.com",
        "sku": "SKU-DL350",
        "product_name": "LumenArt Minimalist LED Desk Lamp",
        "quantity": 1,
        "unit_price": 39.99,
        "total_amount": 39.99,
        "order_date": NOW - timedelta(days=48),
        "status": "delivered",
        "payment_status": "paid",
        "payment_method": "Mastercard ending in •••• 7120",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "NEO-TRK-771009",
        "estimated_delivery": "Delivered 42 days ago",
        "actual_delivery": "Delivered 42 days ago",
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "ineligible_expired",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "77 Sunset Strip, Austin, TX 78701",
        "support_notes": "Delivered 42 days ago. Outside the standard 30-day retail return window. AI must decline and offer escalation if disputed.",
    },
    {
        "order_number": "ORD-DEMO-1010",
        "account_id": "USR-DEMO-1010",
        "customer_name": "Zachary Knight",
        "customer_email": "zachary.knight@example.com",
        "sku": "SKU-MS300",
        "product_name": "CyberGlide Ergonomic Mouse",
        "quantity": 1,
        "unit_price": 59.99,
        "total_amount": 59.99,
        "order_date": NOW - timedelta(hours=3),
        "status": "payment_pending",
        "payment_status": "failed",
        "payment_method": "Visa ending in •••• 3341",
        "carrier": "NeoExpress Logistics",
        "tracking_number": None,
        "estimated_delivery": None,
        "actual_delivery": None,
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "90210 Wilshire Blvd, Beverly Hills, CA 90212",
        "support_notes": "Card authorization failed at payment gateway; customer reports bank debit pending. Requires billing desk review.",
    },
    {
        "order_number": "ORD-DEMO-1011",
        "account_id": "USR-DEMO-1011",
        "customer_name": "Nina Patel",
        "customer_email": "nina.patel@example.com",
        "sku": "SKU-WC450",
        "product_name": "VisionClear 4K Ultra HD Webcam",
        "quantity": 1,
        "unit_price": 99.99,
        "total_amount": 99.99,
        "order_date": NOW - timedelta(days=3),
        "status": "delivered",
        "payment_status": "paid",
        "payment_method": "Apple Pay (Device Token •••• 8820)",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "NEO-TRK-771011",
        "estimated_delivery": "Delivered Oct 23",
        "actual_delivery": "Oct 23, 2026 at 11:00 EST",
        "cancellation_status": "not_cancelled",
        "return_eligibility": True,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "350 5th Ave, New York, NY 10118",
        "support_notes": "Carrier GPS marks delivered to porch; customer reports package was never received. Lost package claim opened.",
    },
    {
        "order_number": "ORD-DEMO-1012",
        "account_id": "USR-DEMO-1012",
        "customer_name": "Derek Foster",
        "customer_email": "derek.foster@example.com",
        "sku": "SKU-CH500",
        "product_name": "TitanFlex Mesh Ergonomic Chair",
        "quantity": 1,
        "unit_price": 289.99,
        "total_amount": 289.99,
        "order_date": NOW - timedelta(hours=6),
        "status": "processing",
        "payment_status": "duplicate_hold",
        "payment_method": "Visa ending in •••• 6601",
        "carrier": "NeoExpress Logistics",
        "tracking_number": "PENDING-ASSIGNMENT",
        "estimated_delivery": "Nov 02, 2026",
        "actual_delivery": None,
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "100 Pine Street, Seattle, WA 98101",
        "support_notes": "Customer reports card was charged twice on checkout. Secondary hold detected on processor token; reversal pending.",
    },
    {
        "order_number": "ORD-DEMO-1013",
        "account_id": "USR-DEMO-1013",
        "customer_name": "Gabriel Santos",
        "customer_email": "gabriel.santos@example.com",
        "sku": "SKU-MN400",
        "product_name": "NeoVibe 34\" Ultrawide 4K Monitor",
        "quantity": 1,
        "unit_price": 449.99,
        "total_amount": 449.99,
        "order_date": NOW - timedelta(hours=2),
        "status": "manual_review",
        "payment_status": "security_hold",
        "payment_method": "American Express (•••• 1009)",
        "carrier": "Apex Freight Express",
        "tracking_number": "HOLD-SECURITY-REV",
        "estimated_delivery": "Pending Verification",
        "actual_delivery": None,
        "cancellation_status": "not_cancelled",
        "return_eligibility": False,
        "return_status": "none",
        "refund_amount": 0.0,
        "refund_status": "none",
        "shipping_address": "1200 Brickell Ave, Penthouse 18, Miami, FL 33131",
        "support_notes": "High-value transaction flagged by automated risk model for billing address / device IP mismatch. Requires security lead review.",
    },
]

def seed_demo_orders(db: Session) -> int:
    """
    Idempotent seeding function for retail demonstration orders.
    Inserts demo users, products, orders, returns, and support tickets.
    Safely preserves any existing production or test data.
    """
    logger.info("Checking database schema compatibility...")
    ensure_schema_up_to_date(engine)

    # 1. Seed or update demo customers
    user_map = {}
    for c_data in DEMO_CUSTOMERS:
        existing_user = db.query(User).filter(
            (User.email == c_data["email"]) | (User.account_id == c_data["account_id"])
        ).first()

        if not existing_user:
            user = User(
                session_id=c_data["account_id"],
                account_id=c_data["account_id"],
                name=c_data["name"],
                email=c_data["email"],
                role="customer",
                is_demo=True,
                created_at=NOW - timedelta(days=60),
            )
            db.add(user)
            db.flush()
            user_map[c_data["account_id"]] = user
        else:
            # Keep updated with demo marker and account_id
            existing_user.account_id = c_data["account_id"]
            existing_user.is_demo = True
            user_map[c_data["account_id"]] = existing_user

    # 2. Seed or update demo products
    product_map = {}
    for p_data in DEMO_PRODUCTS:
        existing_product = db.query(Product).filter(Product.sku == p_data["sku"]).first()
        if not existing_product:
            prod = Product(
                sku=p_data["sku"],
                name=p_data["name"],
                category=p_data["category"],
                price=p_data["price"],
                stock=p_data["stock"],
                description=p_data["description"],
                specs=p_data["specs"],
                returnable=p_data["returnable"],
                warranty_months=p_data["warranty_months"],
                rating=p_data["rating"],
            )
            db.add(prod)
            db.flush()
            product_map[p_data["sku"]] = prod
        else:
            product_map[p_data["sku"]] = existing_product

    # 3. Seed or update demo orders and order items
    seeded_orders_count = 0
    for o_data in DEMO_ORDERS:
        order_num = o_data["order_number"]
        existing_order = db.query(Order).filter(Order.order_number == order_num).first()
        cust_user = user_map.get(o_data["account_id"])
        prod = product_map.get(o_data["sku"])

        if not existing_order:
            order = Order(
                order_number=order_num,
                customer_id=cust_user.id if cust_user else None,
                customer_name=o_data["customer_name"],
                customer_email=o_data["customer_email"],
                status=o_data["status"],
                payment_status=o_data["payment_status"],
                payment_method=o_data["payment_method"],
                tracking_number=o_data["tracking_number"],
                carrier=o_data["carrier"],
                estimated_delivery=o_data["estimated_delivery"],
                actual_delivery=o_data["actual_delivery"],
                cancellation_status=o_data["cancellation_status"],
                return_eligibility=o_data["return_eligibility"],
                return_status=o_data["return_status"],
                refund_amount=o_data["refund_amount"],
                refund_status=o_data["refund_status"],
                shipping_address=o_data["shipping_address"],
                support_notes=o_data["support_notes"],
                total_amount=o_data["total_amount"],
                order_date=o_data["order_date"],
                is_demo=True,
            )
            db.add(order)
            db.flush()

            # Add Order Item
            item = OrderItem(
                order_id=order.id,
                product_id=prod.id if prod else None,
                sku=o_data["sku"],
                product_name=o_data["product_name"],
                quantity=o_data["quantity"],
                unit_price=o_data["unit_price"],
            )
            db.add(item)
            seeded_orders_count += 1
        else:
            # Update attributes to ensure consistency with latest seed definition
            existing_order.customer_id = cust_user.id if cust_user else existing_order.customer_id
            existing_order.customer_name = o_data["customer_name"]
            existing_order.customer_email = o_data["customer_email"]
            existing_order.status = o_data["status"]
            existing_order.payment_status = o_data["payment_status"]
            existing_order.payment_method = o_data["payment_method"]
            existing_order.tracking_number = o_data["tracking_number"]
            existing_order.carrier = o_data["carrier"]
            existing_order.estimated_delivery = o_data["estimated_delivery"]
            existing_order.actual_delivery = o_data["actual_delivery"]
            existing_order.cancellation_status = o_data["cancellation_status"]
            existing_order.return_eligibility = o_data["return_eligibility"]
            existing_order.return_status = o_data["return_status"]
            existing_order.refund_amount = o_data["refund_amount"]
            existing_order.refund_status = o_data["refund_status"]
            existing_order.shipping_address = o_data["shipping_address"]
            existing_order.support_notes = o_data["support_notes"]
            existing_order.is_demo = True

            # Ensure item exists
            if not existing_order.items:
                item = OrderItem(
                    order_id=existing_order.id,
                    product_id=prod.id if prod else None,
                    sku=o_data["sku"],
                    product_name=o_data["product_name"],
                    quantity=o_data["quantity"],
                    unit_price=o_data["unit_price"],
                )
                db.add(item)
            seeded_orders_count += 1

    # 4. Seed associated Return Requests for demo refund scenarios
    # Return for ORD-DEMO-1006 (Refund Pending)
    ord_1006 = db.query(Order).filter(Order.order_number == "ORD-DEMO-1006").first()
    if ord_1006:
        existing_ret = db.query(ReturnRequest).filter(ReturnRequest.order_id == ord_1006.id).first()
        if not existing_ret:
            ret_1006 = ReturnRequest(
                return_number="RET-DEMO-1006",
                order_id=ord_1006.id,
                customer_id=ord_1006.customer_id,
                reason="Customer changed preference; returned in mint condition with original tags.",
                item_details="CyberPack Shield Laptop Backpack (Qty: 1)",
                status="approved",
                refund_amount=89.99,
                tracking_number="RET-TRK-881006",
                created_at=NOW - timedelta(days=2),
            )
            db.add(ret_1006)

    # Return for ORD-DEMO-1007 (Refund Completed)
    ord_1007 = db.query(Order).filter(Order.order_number == "ORD-DEMO-1007").first()
    if ord_1007:
        existing_ret = db.query(ReturnRequest).filter(ReturnRequest.order_id == ord_1007.id).first()
        if not existing_ret:
            ret_1007 = ReturnRequest(
                return_number="RET-DEMO-1007",
                order_id=ord_1007.id,
                customer_id=ord_1007.customer_id,
                reason="Customer ordered incorrect port configuration for workstation.",
                item_details="OmniPort 8-in-1 USB-C Hub (Qty: 1)",
                status="refunded",
                refund_amount=49.99,
                tracking_number="RET-TRK-881007",
                created_at=NOW - timedelta(days=8),
                resolved_at=NOW - timedelta(days=5),
            )
            db.add(ret_1007)

    # 5. Seed associated Support Tickets for escalation scenarios
    # Ticket for ORD-DEMO-1004 (Delayed package inquiry)
    existing_tck_1004 = db.query(SupportTicket).filter(SupportTicket.ticket_number == "TCK-DEMO-1004").first()
    if not existing_tck_1004:
        tck_1004 = SupportTicket(
            ticket_number="TCK-DEMO-1004",
            customer_name="Liam O'Connor",
            customer_email="liam.oconnor@example.com",
            category="order",
            priority="high",
            status="in_progress",
            subject="Delayed Shipment Expedition: ORD-DEMO-1004",
            summary="Customer inquired about delayed running shoes. Package caught in Midwest storm transit delay.",
            order_id="ORD-DEMO-1004",
            assigned_agent="Agent Miller (Logistics Lead)",
            queue_position=1,
            created_at=NOW - timedelta(hours=4),
        )
        db.add(tck_1004)
        db.flush()
        db.add(TicketResponse(
            ticket_id=tck_1004.id,
            sender_name="System",
            sender_role="system",
            message="Automated escalation generated via customer inquiry on delay.",
            created_at=NOW - timedelta(hours=4),
        ))
        db.add(TicketResponse(
            ticket_id=tck_1004.id,
            sender_name="Agent Miller",
            sender_role="agent",
            message="Apex Freight dispatched package on express truck. Expected arrival by tomorrow noon.",
            created_at=NOW - timedelta(hours=2),
        ))

    # Ticket for ORD-DEMO-1010 (Payment issue)
    existing_tck_1010 = db.query(SupportTicket).filter(SupportTicket.ticket_number == "TCK-DEMO-1010").first()
    if not existing_tck_1010:
        tck_1010 = SupportTicket(
            ticket_number="TCK-DEMO-1010",
            customer_name="Zachary Knight",
            customer_email="zachary.knight@example.com",
            category="payment",
            priority="urgent",
            status="open",
            subject="Payment Gateway Failure & Bank Verification: ORD-DEMO-1010",
            summary="Customer reported pending card debit with failed checkout status. Gateway timeout review required.",
            order_id="ORD-DEMO-1010",
            assigned_agent="Finance Tier-2 Lead",
            queue_position=2,
            created_at=NOW - timedelta(hours=1),
        )
        db.add(tck_1010)

    # Ticket for ORD-DEMO-1011 (Missing shipment)
    existing_tck_1011 = db.query(SupportTicket).filter(SupportTicket.ticket_number == "TCK-DEMO-1011").first()
    if not existing_tck_1011:
        tck_1011 = SupportTicket(
            ticket_number="TCK-DEMO-1011",
            customer_name="Nina Patel",
            customer_email="nina.patel@example.com",
            category="order",
            priority="high",
            status="open",
            subject="Lost or Misdelivered Shipment Investigation: ORD-DEMO-1011",
            summary="Carrier marked delivered on Oct 23, but resident never received package. Porch theft investigation opened.",
            order_id="ORD-DEMO-1011",
            assigned_agent=None,
            queue_position=3,
            created_at=NOW - timedelta(minutes=40),
        )
        db.add(tck_1011)

    # Commit all changes cleanly
    db.commit()
    logger.info(f"Successfully processed {seeded_orders_count} demo retail orders in database.")
    return seeded_orders_count

def main():
    """CLI Entry point for seeding demo orders."""
    # Ensure stdout handles utf-8 or falls back safely
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("=" * 60)
    print("[SIDEKICK AI] Retail Demo Orders Seeder")
    print("=" * 60)
    db = SessionLocal()
    try:
        count = seed_demo_orders(db)
        print(f"[OK] Success! {count} fictional retail demo orders verified/seeded.")
        print("Demo orders: ORD-DEMO-1001 through ORD-DEMO-1013.")
        print("All records marked with is_demo = true.")
    except Exception as exc:
        db.rollback()
        logger.error(f"Seeding failed: {exc}", exc_info=True)
        print(f"[ERROR] Error during database seeding: {exc}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
