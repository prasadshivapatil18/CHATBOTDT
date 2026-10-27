import pytest
from fastapi.testclient import TestClient
from app.models.order import Order

def test_demo_orders_seeded_in_database(client: TestClient, db_session):
    """Verify that all demo orders are seeded with is_demo = True and valid fields."""
    demo_orders = db_session.query(Order).filter(Order.is_demo == True).all()
    assert len(demo_orders) >= 10
    
    order_numbers = {o.order_number for o in demo_orders}
    for i in range(1001, 1011):
        assert f"ORD-DEMO-{i}" in order_numbers

def test_demo_orders_api_filter(client: TestClient):
    """Verify the orders API filters by is_demo flag correctly."""
    res = client.get("/api/orders?is_demo=true")
    assert res.status_code == 200
    orders = res.json()
    assert len(orders) >= 10
    assert all(o["is_demo"] is True for o in orders)

def test_scenario_1_delivered_order(client: TestClient):
    """Delivered order (ORD-DEMO-1001) confirms delivery and responds naturally."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-1",
        "message": "Where is my order ORD-DEMO-1001?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1001" in reply
    assert "delivered" in reply
    assert any(t["tool_name"] == "track_order" for t in data["tools_called"])

def test_scenario_2_shipped_order(client: TestClient):
    """Shipped order (ORD-DEMO-1002) in transit with estimated delivery."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-2",
        "message": "Can you track my package ORD-DEMO-1002?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1002" in reply
    assert "way" in reply or "transit" in reply or "neoexpress" in reply

def test_scenario_3_processing_order_cancellation(client: TestClient):
    """Processing order (ORD-DEMO-1003) offers instant cancellation before shipment."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-3",
        "message": "Can I cancel ORD-DEMO-1003?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "processing" in reply
    assert "cancel" in reply

def test_scenario_4_delayed_order(client: TestClient):
    """Delayed order (ORD-DEMO-1004) acknowledges delay with empathy and updated info."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-4",
        "message": "Why is ORD-DEMO-1004 taking so long?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1004" in reply
    assert "delay" in reply or "weather" in reply

def test_scenario_5_cancelled_order(client: TestClient):
    """Cancelled order (ORD-DEMO-1005) confirms cancellation and refund."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-5",
        "message": "What is the status of my order ORD-DEMO-1005?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1005" in reply
    assert "cancelled" in reply

def test_scenario_6_refund_pending(client: TestClient):
    """Refund pending order (ORD-DEMO-1006) retrieves pending refund and expected timeframe."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-6",
        "message": "When will I receive my refund for ORD-DEMO-1006?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1006" in reply
    assert "refund" in reply
    assert "pending" in reply or "3 to 5" in reply or "business days" in reply

def test_scenario_7_refund_completed(client: TestClient):
    """Refund completed order (ORD-DEMO-1007) retrieves completed status."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-7",
        "message": "Did my refund go through for ORD-DEMO-1007?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1007" in reply
    assert "completed" in reply or "success" in reply

def test_scenario_8_return_eligible(client: TestClient):
    """Return eligible order (ORD-DEMO-1008) confirms 30-day window eligibility."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-8",
        "message": "Can I return ORD-DEMO-1008?"
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1008" in reply
    assert "eligible" in reply

def test_scenario_9_return_ineligible(client: TestClient):
    """Return ineligible order (ORD-DEMO-1009) explains return window expiration."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-9",
        "message": "I want to return ORD-DEMO-1009."
    })
    assert res.status_code == 200
    data = res.json()
    reply = data["reply"].lower()
    assert "ord-demo-1009" in reply
    assert "ineligible" in reply or "cannot" in reply or "window" in reply or "days" in reply

def test_scenario_10_payment_issue_escalation(client: TestClient):
    """Payment issue (ORD-DEMO-1010) strictly avoids financial jokes and creates support escalation."""
    res = client.post("/api/chat", json={
        "session_id": "demo-test-10",
        "message": "I was charged but my order ORD-DEMO-1010 is not confirmed."
    })
    assert res.status_code == 200
    data = res.json()
    assert data["humor_used"] is False
    assert data["is_escalated"] is True
    assert data["ticket_number"] is not None
    reply = data["reply"].lower()
    assert "ticket" in reply
    assert "ord-demo-1010" in reply
