from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.knowledge import KnowledgeArticle
from app.models.ticket import SupportTicket, TicketResponse
from app.models.feedback import CustomerFeedback
from app.models.conversation import Conversation, Message

def seed_database(db: Session):
    # Only seed if products don't exist
    if db.query(Product).first():
        return

    print("🌱 Seeding realistic retail demo data...")

    # 1. Products
    products = [
        Product(
            sku="SKU-KB100",
            name="NeoGlow Mechanical Keyboard",
            category="Keyboards",
            price=129.99,
            stock=42,
            description="Hot-swappable tactile switches, per-key RGB lighting, and aircraft-grade aluminum top frame.",
            specs="Switches: Gateron Pro Yellow, Connection: Type-C + 2.4GHz + BT 5.2, Battery: 4000mAh",
            returnable=True,
            warranty_months=24,
            rating=4.8
        ),
        Product(
            sku="SKU-HP200",
            name="AuraPulse ANC Wireless Headphones",
            category="Audio",
            price=199.99,
            stock=18,
            description="Active noise cancellation, transparency mode, custom 40mm titanium drivers, and 45h playtime.",
            specs="Driver: 40mm Titanium, Codecs: LDAC/AAC/SBC, Battery: 45 Hours, Weight: 250g",
            returnable=True,
            warranty_months=12,
            rating=4.9
        ),
        Product(
            sku="SKU-MS300",
            name="CyberGlide Ergonomic Mouse",
            category="Accessories",
            price=59.99,
            stock=65,
            description="Ultra-lightweight 58g ergonomic gaming mouse with optical switches and flexible paracord cable.",
            specs="Sensor: 26,000 DPI Optical, Switches: Optical 90M clicks, Polling Rate: 1000Hz",
            returnable=True,
            warranty_months=12,
            rating=4.7
        ),
        Product(
            sku="SKU-MN400",
            name="NeoVibe 34\" Ultrawide 4K Monitor",
            category="Displays",
            price=449.99,
            stock=8,
            description="Curved 1500R WQHD panel with 144Hz refresh rate, 1ms response time, and HDR400 color precision.",
            specs="Resolution: 3440x1440, Refresh: 144Hz, Panel: Fast IPS, Ports: 2x DP 1.4, 2x HDMI 2.1, USB-C 90W PD",
            returnable=True,
            warranty_months=36,
            rating=4.6
        ),
        Product(
            sku="SKU-CH500",
            name="TitanFlex Mesh Ergonomic Chair",
            category="Furniture",
            price=289.99,
            stock=14,
            description="Breathable Korean mesh, 3D dynamic lumbar support, 4D armrests, and 135° recline angle.",
            specs="Max Weight: 300 lbs, Base: Aluminum Alloy, Castors: Smooth PU Rollerblade Wheels",
            returnable=True,
            warranty_months=60,
            rating=4.8
        )
    ]
    db.add_all(products)
    db.commit()

    # 2. Knowledge Articles
    articles = [
        KnowledgeArticle(
            title="Shipping Rates & Delivery Times",
            category="shipping",
            keywords="shipping, delivery, rates, courier, tracking, how long, express, international",
            content="Standard delivery takes 3 to 5 business days and is FREE on all orders over $50 (otherwise $4.99). Express overnight shipping is available for $14.99 on orders placed before 2 PM EST. All shipments include real-time courier tracking provided via NeoExpress Logistics.",
            is_verified=True
        ),
        KnowledgeArticle(
            title="30-Day Hassle-Free Returns & Refunds Policy",
            category="returns",
            keywords="return, refund, exchange, 30 days, damaged, return label, policy, money back",
            content="We offer a 30-day money-back guarantee on all eligible retail products from the date of delivery. Items must be in original condition with packaging. Once we receive your return, refunds are credited directly to your original payment method within 3 to 5 business days. Prepaid return shipping labels are provided free of charge.",
            is_verified=True
        ),
        KnowledgeArticle(
            title="Order Cancellations & Modifications",
            category="cancellations",
            keywords="cancel, change order, cancel order, modify address, stop shipment",
            content="Orders can be cancelled or modified instantly at no fee as long as the status is 'processing'. Once an order transitions to 'shipped', it cannot be recalled and must be returned using our standard 30-day return process upon receipt.",
            is_verified=True
        ),
        KnowledgeArticle(
            title="Billing, Payments & Duplicate Charges",
            category="payments",
            keywords="payment, card, duplicate payment, charged twice, credit card, paypal, apple pay, billing, receipt",
            content="We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. If you notice a duplicate authorization charge, it is typically a temporary banking hold that resolves automatically within 24-48 hours. If two charges settled, our support team can verify the transaction and issue an immediate reversal.",
            is_verified=True
        ),
        KnowledgeArticle(
            title="Product Warranty & Defect Replacements",
            category="warranty",
            keywords="warranty, broken, defect, guarantee, repair, replace, broken item",
            content="All electronic products carry a minimum 12-month manufacturer warranty covering hardware defects. Furniture and displays carry 36 to 60 month warranties. If your item develops a fault under normal use, we provide a free express replacement.",
            is_verified=True
        ),
        KnowledgeArticle(
            title="Support Hours & Contact Information",
            category="policies",
            keywords="hours, contact, phone, email, human agent, live chat, office",
            content="SIDEKICK AI is available 24/7/365 for instant answers. Our human tier-2 support leads are available Monday through Saturday from 8:00 AM to 8:00 PM EST. You can also reach our desk directly at support@neoretail.store.",
            is_verified=True
        )
    ]
    db.add_all(articles)
    db.commit()

    # 3. Sample Orders
    order1 = Order(
        order_number="ORD-1001",
        customer_name="Alex Rivera",
        customer_email="alex.rivera@example.com",
        status="delivered",
        tracking_number="NEO-TRK-774910",
        carrier="NeoExpress Logistics",
        estimated_delivery="Delivered on Oct 20",
        order_date=datetime.utcnow() - timedelta(days=6),
        total_amount=199.99,
        shipping_address="742 Evergreen Terrace, Springfield, OR"
    )
    db.add(order1)
    db.flush()

    item1 = OrderItem(
        order_id=order1.id,
        product_id=products[1].id,
        product_name="AuraPulse ANC Wireless Headphones",
        quantity=1,
        unit_price=199.99
    )
    db.add(item1)

    order2 = Order(
        order_number="ORD-1002",
        customer_name="Sarah Connor",
        customer_email="sarah.c@example.com",
        status="delayed",
        tracking_number="NEO-TRK-881923",
        carrier="NeoExpress Logistics",
        estimated_delivery="Delayed: Expected Oct 26",
        order_date=datetime.utcnow() - timedelta(days=5),
        total_amount=129.99,
        shipping_address="100 Cyberdyne Way, Los Angeles, CA"
    )
    db.add(order2)
    db.flush()

    item2 = OrderItem(
        order_id=order2.id,
        product_id=products[0].id,
        product_name="NeoGlow Mechanical Keyboard",
        quantity=1,
        unit_price=129.99
    )
    db.add(item2)

    order3 = Order(
        order_number="ORD-1003",
        customer_name="Marcus Vance",
        customer_email="marcus.v@example.com",
        status="processing",
        tracking_number="PENDING-ASSIGNMENT",
        carrier="NeoExpress Logistics",
        estimated_delivery="Oct 28",
        order_date=datetime.utcnow() - timedelta(days=1),
        total_amount=59.99,
        shipping_address="42 Wallaby Way, Sydney / NY Hub"
    )
    db.add(order3)
    db.flush()

    item3 = OrderItem(
        order_id=order3.id,
        product_id=products[2].id,
        product_name="CyberGlide Ergonomic Mouse",
        quantity=1,
        unit_price=59.99
    )
    db.add(item3)

    # 4. Ineligible Old Order (>30 days)
    order4 = Order(
        order_number="ORD-1004",
        customer_name="David Miller",
        customer_email="david.m@example.com",
        status="delivered",
        tracking_number="NEO-TRK-102938",
        carrier="NeoExpress Logistics",
        estimated_delivery="Delivered 45 days ago",
        order_date=datetime.utcnow() - timedelta(days=45),
        total_amount=289.99,
        shipping_address="55 Broadway, New York, NY"
    )
    db.add(order4)
    db.flush()

    item4 = OrderItem(
        order_id=order4.id,
        product_id=products[4].id,
        product_name="TitanFlex Mesh Ergonomic Chair",
        quantity=1,
        unit_price=289.99
    )
    db.add(item4)

    # 5. Support Tickets
    ticket1 = SupportTicket(
        ticket_number="TCK-1001",
        customer_name="Sarah Connor",
        customer_email="sarah.c@example.com",
        category="order",
        priority="high",
        status="in_progress",
        subject="Delayed Package ORD-1002 Expedition Request",
        summary="Customer inquired about order ORD-1002 delayed in transit. Package status held at regional hub.",
        order_id="ORD-1002",
        assigned_agent="Agent Miller (Logistics Lead)",
        queue_position=1,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(ticket1)
    db.flush()

    resp1 = TicketResponse(
        ticket_id=ticket1.id,
        sender_name="System",
        sender_role="system",
        message="Ticket created via AI Handoff. Customer sentiment: mildly frustrated.",
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    resp2 = TicketResponse(
        ticket_id=ticket1.id,
        sender_name="Agent Miller",
        sender_role="agent",
        message="Contacted NeoExpress local hub. Package cleared inspection and will be on the delivery truck tomorrow morning.",
        created_at=datetime.utcnow() - timedelta(hours=1)
    )
    db.add_all([resp1, resp2])

    ticket2 = SupportTicket(
        ticket_number="TCK-1002",
        customer_name="Emily Thorne",
        customer_email="emily@example.com",
        category="payment",
        priority="urgent",
        status="open",
        subject="Duplicate Payment Verification on Checkout",
        summary="Customer reports card charged twice for single checkout. Requires billing reversal.",
        order_id=None,
        assigned_agent=None,
        queue_position=2,
        created_at=datetime.utcnow() - timedelta(minutes=45)
    )
    db.add(ticket2)

    # 6. Customer Feedback
    feedbacks = [
        CustomerFeedback(
            rating=5,
            comment="The AI is hilarious! Tracked my order in 3 seconds and made me laugh.",
            resolved_satisfactorily=True,
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        CustomerFeedback(
            rating=5,
            comment="Instant return label generated without any hassle.",
            resolved_satisfactorily=True,
            created_at=datetime.utcnow() - timedelta(days=1)
        ),
        CustomerFeedback(
            rating=4,
            comment="Transferred me to human support smoothly when my card acted up.",
            resolved_satisfactorily=True,
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
    ]
    db.add_all(feedbacks)

    db.commit()

    # Seed demo orders catalogue
    try:
        from app.seed_demo_orders import seed_demo_orders
        seed_demo_orders(db)
    except Exception as e:
        print(f"Demo orders seed notification: {e}")

    print("✅ Seed data successfully inserted!")
