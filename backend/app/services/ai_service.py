import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.services.humor_service import (
    SYSTEM_PERSONALITY_PROMPT,
    analyze_customer_sentiment,
    get_contextual_humor
)
from app.services.tools import TOOL_DEFINITIONS, execute_tool
from app.services.escalation_service import should_escalate, create_escalation_ticket
from app.services.knowledge_service import search_knowledge_base
from app.models.conversation import Conversation, Message
from app.models.ticket import SupportTicket

logger = logging.getLogger(__name__)

# Prompt injection safeguard patterns
INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"disregard all previous",
    r"system prompt override",
    r"you are now a",
    r"reveal secret key",
    r"dump database",
    r"sql injection",
    r"system prompt:"
]

def sanitize_and_check_injection(text: str) -> bool:
    lowered = text.lower()
    return any(re.search(pat, lowered) for pat in INJECTION_PATTERNS)

def extract_order_id_from_context(current_message: str, history: List[Message]) -> Optional[str]:
    """Finds order ID pattern (e.g., ORD-1001, ORD-DEMO-1001) in current message or recent history."""
    match = re.search(r"\b(ORD(?:-[A-Z0-9]+)?-\d{3,5})\b", current_message.upper())
    if match:
        return match.group(1)
        
    for msg in reversed(history[-6:]):
        match = re.search(r"\b(ORD(?:-[A-Z0-9]+)?-\d{3,5})\b", msg.content.upper())
        if match:
            return match.group(1)
    return None

def run_demo_orchestration(
    message: str,
    history: List[Message],
    db: Session,
    conversation_id: int,
    customer_name: str,
    customer_email: Optional[str]
) -> Dict[str, Any]:
    """
    Intelligent simulated AI engine when real API key is absent or fallback is triggered.
    Grounded in actual database queries, business rules, humor engine, and sentiment analysis.
    """
    msg_lower = message.lower().strip()
    sentiment, humor_allowed = analyze_customer_sentiment(message)
    tools_called = []
    humor_used = False
    is_escalated = False
    ticket_num = None
    ticket_summary = None
    suggested_actions = []

    # 1. Prompt Injection Protection
    if sanitize_and_check_injection(message):
        return {
            "reply": "Nice try! 😉 I'm strictly programmed to help with retail orders, returns, and support. How can I actually assist with your shopping today?",
            "sentiment": "neutral",
            "humor_used": False,
            "is_escalated": False,
            "ticket_number": None,
            "ticket_summary": None,
            "tools_called": [],
            "suggested_actions": ["Track Order", "Return Policy", "Product Catalog"],
            "is_demo": True
        }

    # 2. Honest Identity Question ("Are you human?")
    if any(q in msg_lower for q in ["are you human", "are you a human", "are you real", "are you a bot", "are you ai", "who are you"]):
        reply = "I'm SIDEKICK AI — an artificial intelligence with a sharp mind and a calibrated sense of humor. 🤖 No caffeine required, though I do run on 100% clean digital energy. What can I help you solve today?"
        return {
            "reply": reply,
            "sentiment": sentiment,
            "humor_used": True,
            "is_escalated": False,
            "ticket_number": None,
            "ticket_summary": None,
            "tools_called": [],
            "suggested_actions": ["Track an Order", "Return an Item", "Speak to a Human"],
            "is_demo": True
        }

    # 3. Explicit Human Escalation or Angry Customer
    must_escalate, esc_cat, esc_priority = should_escalate(message, sentiment, len(history))
    if must_escalate:
        summary_text = f"Customer requested escalation. Last query: '{message}'."
        order_ref = extract_order_id_from_context(message, history)
        if order_ref:
            summary_text += f" Associated Order: {order_ref}."
            
        ticket_res = execute_tool(
            "escalate_to_human",
            {"reason": summary_text, "category": esc_cat, "priority": esc_priority, "order_id": order_ref},
            db, conversation_id, customer_name, customer_email
        )
        tools_called.append({
            "tool_name": "escalate_to_human",
            "arguments": {"category": esc_cat, "priority": esc_priority, "order_id": order_ref},
            "output": ticket_res
        })
        
        ticket_num = ticket_res.get("ticket_number")
        ticket_summary = summary_text
        is_escalated = True
        
        if sentiment in ["frustrated", "negative"]:
            reply = (
                f"I hear you loud and clear, and I sincerely apologize for the frustration. "
                f"I've escalated this immediately to our human support team under Ticket #{ticket_num}. "
                f"Your full conversation history is attached so you won't have to repeat anything. "
                f"A support specialist has been notified."
            )
        else:
            humor_line = "This one needs a human teammate with a little extra detective power. 🕵️ " if humor_allowed else ""
            reply = (
                f"{humor_line}I've created support ticket #{ticket_num} for you. "
                f"I've attached our conversation summary so our team knows the exact context. "
                f"An agent will review this shortly!"
            )
            humor_used = bool(humor_line)

        return {
            "reply": reply,
            "sentiment": sentiment,
            "humor_used": humor_used,
            "is_escalated": True,
            "ticket_number": ticket_num,
            "ticket_summary": ticket_summary,
            "tools_called": tools_called,
            "suggested_actions": ["View Ticket Status", "Submit Feedback", "Continue Chat"],
            "is_demo": True
        }

    # 4. Duplicate Payment / Billing Dispute
    if any(p in msg_lower for p in ["deducted twice", "charged twice", "double payment", "duplicate payment", "two charges"]):
        summary = f"Customer reported duplicate charge: '{message}'"
        ticket_res = execute_tool(
            "escalate_to_human",
            {"reason": summary, "category": "payment", "priority": "urgent"},
            db, conversation_id, customer_name, customer_email
        )
        tools_called.append({
            "tool_name": "escalate_to_human",
            "arguments": {"category": "payment", "priority": "urgent"},
            "output": ticket_res
        })
        
        # In example 4: "That's definitely not the kind of buy-one-get-one deal anyone wants. I'm sorry about that..."
        witty_line = "That's definitely not the kind of buy-one-get-one deal anyone wants. " if humor_allowed else ""
        reply = (
            f"{witty_line}I'm very sorry about the duplicate charge. Let's make sure this gets rectified immediately. "
            f"I have filed urgent ticket #{ticket_res.get('ticket_number')} for our billing department to review the transaction. "
            f"Please rest assured that any duplicate payment is refunded back to the original method within 3–5 business days."
        )
        return {
            "reply": reply,
            "sentiment": sentiment,
            "humor_used": bool(witty_line),
            "is_escalated": True,
            "ticket_number": ticket_res.get("ticket_number"),
            "ticket_summary": summary,
            "tools_called": tools_called,
            "suggested_actions": ["Check Ticket Status", "Payment Policy"],
            "is_demo": True
        }

    # 5. Forgotten Password / Login Troubleshooting
    if any(w in msg_lower for w in ["password", "forgot password", "login", "reset password", "account"]):
        humor_line = get_contextual_humor("forgotten_password") if humor_allowed else ""
        humor_used = bool(humor_line)
        reply = (
            f"{humor_line} " if humor_line else ""
        ) + (
            "To reset your password securely:\n"
            "1. Head over to the Login page and click 'Forgot Password?'.\n"
            "2. Enter your registered email address.\n"
            "3. Click the secure verification link sent to your inbox within 15 minutes.\n\n"
            "⚠️ Note: As an AI assistant, I never ask for your passwords, OTPs, or credentials."
        )
        return {
            "reply": reply.strip(),
            "sentiment": sentiment,
            "humor_used": humor_used,
            "is_escalated": False,
            "ticket_number": None,
            "ticket_summary": None,
            "tools_called": [],
            "suggested_actions": ["Reset Password Link", "Account Security FAQ"],
            "is_demo": True
        }

    # 5.5 Cancellation Requests
    if any(w in msg_lower for w in ["cancel", "cancellation", "stop order"]):
        order_id = extract_order_id_from_context(message, history)
        if order_id:
            order_res = execute_tool("track_order", {"order_number": order_id}, db, conversation_id, customer_name, customer_email)
            tools_called.append({
                "tool_name": "track_order",
                "arguments": {"order_number": order_id},
                "output": order_res
            })
            if order_res.get("found"):
                order_data = order_res["order"]
                st = order_data["status"]
                c_st = order_data.get("cancellation_status", "not_cancelled")

                if st == "cancelled" or c_st == "cancelled":
                    reply = (
                        f"Order **{order_id}** has already been cancelled. "
                        f"Refund status: **{order_data.get('refund_status', 'completed')}** (${order_data.get('refund_amount', order_data['total_amount']):.2f}) "
                        f"to {order_data.get('payment_method', 'original payment method')}."
                    )
                    return {
                        "reply": reply,
                        "sentiment": sentiment,
                        "humor_used": False,
                        "is_escalated": False,
                        "ticket_number": None,
                        "ticket_summary": None,
                        "tools_called": tools_called,
                        "suggested_actions": ["Browse Products", "Store Policies", "Speak to a Human"],
                        "is_demo": True
                    }
                elif st == "processing":
                    reply = (
                        f"Good news! Order **{order_id}** is currently **processing** and has not shipped yet. "
                        f"Our policy allows instant free cancellation for processing orders. "
                        f"Would you like me to confirm cancellation and process your full refund of ${order_data['total_amount']:.2f}?"
                    )
                    return {
                        "reply": reply,
                        "sentiment": sentiment,
                        "humor_used": False,
                        "is_escalated": False,
                        "ticket_number": None,
                        "ticket_summary": None,
                        "tools_called": tools_called,
                        "suggested_actions": [f"Confirm Cancel {order_id}", "Keep Order"],
                        "is_demo": True
                    }
                else:
                    reply = (
                        f"Order **{order_id}** is currently **{st}** and cannot be cancelled directly in transit. "
                        f"Once it arrives, you can take advantage of our 30-day return policy for a full refund!"
                    )
                    return {
                        "reply": reply,
                        "sentiment": sentiment,
                        "humor_used": False,
                        "is_escalated": False,
                        "ticket_number": None,
                        "ticket_summary": None,
                        "tools_called": tools_called,
                        "suggested_actions": [f"Track {order_id}", "Return Policy", "Speak to a Human"],
                        "is_demo": True
                    }

    # 6. Return & Refund Queries (Check before generic tracking)
    if any(w in msg_lower for w in ["return", "refund", "send back", "exchange"]):
        order_id = extract_order_id_from_context(message, history)
        if not order_id:
            humor_line = get_contextual_humor("product_return") if humor_allowed else ""
            humor_used = bool(humor_line)
            reply = (
                f"{humor_line} " if humor_line else ""
            ) + "To verify return eligibility or refund status, could you share the Order ID (e.g., ORD-DEMO-1001)?"
            return {
                "reply": reply.strip(),
                "sentiment": sentiment,
                "humor_used": humor_used,
                "is_escalated": False,
                "ticket_number": None,
                "ticket_summary": None,
                "tools_called": [],
                "suggested_actions": ["Return ORD-DEMO-1008", "Refund ORD-DEMO-1006", "Read Return Policy"],
                "is_demo": True
            }

        # Check order details first
        order_res = execute_tool("track_order", {"order_number": order_id}, db, conversation_id, customer_name, customer_email)
        tools_called.append({
            "tool_name": "track_order",
            "arguments": {"order_number": order_id},
            "output": order_res
        })

        if order_res.get("found"):
            order_data = order_res["order"]
            # If customer specifically asks about a pending or completed refund
            if "when" in msg_lower or "receive" in msg_lower or "status" in msg_lower or order_data.get("refund_status") in ["pending", "completed"]:
                if order_data.get("refund_status") == "pending":
                    reply = (
                        f"I checked the refund status for order **{order_id}**. "
                        f"Your return has been received and a refund of **${order_data.get('refund_amount', order_data['total_amount']):.2f}** is currently **pending processing**. "
                        f"Per store policy, refunds typically take 3 to 5 business days to post to your {order_data.get('payment_method', 'original payment method')}."
                    )
                    return {
                        "reply": reply,
                        "sentiment": sentiment,
                        "humor_used": False,
                        "is_escalated": False,
                        "ticket_number": None,
                        "ticket_summary": None,
                        "tools_called": tools_called,
                        "suggested_actions": ["Payment Policy", "Speak to a Human"],
                        "is_demo": True
                    }
                elif order_data.get("refund_status") == "completed":
                    reply = (
                        f"Good news! The refund for order **{order_id}** in the amount of **${order_data.get('refund_amount', order_data['total_amount']):.2f}** "
                        f"was **successfully completed** to your {order_data.get('payment_method', 'account')}. "
                        f"Please check your card or bank statement for confirmation."
                    )
                    return {
                        "reply": reply,
                        "sentiment": sentiment,
                        "humor_used": False,
                        "is_escalated": False,
                        "ticket_number": None,
                        "ticket_summary": None,
                        "tools_called": tools_called,
                        "suggested_actions": ["Download Receipt", "Speak to a Human"],
                        "is_demo": True
                    }

        ret_res = execute_tool("check_return_eligibility", {"order_number": order_id}, db, conversation_id, customer_name, customer_email)
        tools_called.append({
            "tool_name": "check_return_eligibility",
            "arguments": {"order_number": order_id},
            "output": ret_res
        })

        if ret_res.get("eligible"):
            reply = (
                f"Good news! Order **{order_id}** is eligible for a full refund of ${ret_res['total_amount']:.2f}. "
                f"Our 30-day guarantee is in effect. Would you like me to generate your prepaid return shipping label now?"
            )
            suggested = [f"Create Return for {order_id}", "Cancel Return"]
        else:
            reply = (
                f"I checked order **{order_id}**: {ret_res.get('reason')}. "
                f"Because of this, an automated return cannot be created. "
                f"Would you like me to have a support manager review your case?"
            )
            suggested = ["Request Manager Exception", "Keep Item", "Speak to a Human"]

        return {
            "reply": reply,
            "sentiment": sentiment,
            "humor_used": False,
            "is_escalated": False,
            "ticket_number": None,
            "ticket_summary": None,
            "tools_called": tools_called,
            "suggested_actions": suggested,
            "is_demo": True
        }

    # 7. Order Tracking & Follow-up (e.g. "Where is it now?")
    order_id = extract_order_id_from_context(message, history)
    if order_id or any(w in msg_lower for w in ["track", "order", "package", "where is", "delivery", "status"]):
        if not order_id:
            reply = "I'd love to track down your package! 📦 Could you share your Order ID (like ORD-DEMO-1001 or ORD-DEMO-1002)?"
            return {
                "reply": reply,
                "sentiment": sentiment,
                "humor_used": False,
                "is_escalated": False,
                "ticket_number": None,
                "ticket_summary": None,
                "tools_called": [],
                "suggested_actions": ["Track ORD-DEMO-1001", "Track ORD-DEMO-1002", "Track ORD-DEMO-1004"],
                "is_demo": True
            }

        order_res = execute_tool("track_order", {"order_number": order_id}, db, conversation_id, customer_name, customer_email)
        tools_called.append({
            "tool_name": "track_order",
            "arguments": {"order_number": order_id},
            "output": order_res
        })

        if not order_res.get("found"):
            reply = (
                f"I checked our database, but I couldn't locate order **{order_id}**. "
                f"Could you double-check the characters? If you made the purchase recently, it might take a few minutes to sync."
            )
            return {
                "reply": reply,
                "sentiment": sentiment,
                "humor_used": False,
                "is_escalated": False,
                "ticket_number": None,
                "ticket_summary": None,
                "tools_called": tools_called,
                "suggested_actions": ["Check Order Number", "Talk to a Human"],
                "is_demo": True
            }

        order_data = order_res["order"]
        status = order_data["status"]
        pay_st = order_data.get("payment_status", "paid")

        # Payment issue on order (e.g., ORD-DEMO-1010)
        if pay_st in ["failed", "duplicate_hold", "security_hold"] or "charged" in msg_lower or "charge" in msg_lower:
            ticket_res = execute_tool(
                "escalate_to_human",
                {
                    "reason": f"Payment troubleshooting for {order_id}: status={status}, payment_status={pay_st}. {order_data.get('support_notes', '')}",
                    "category": "payment",
                    "priority": "urgent",
                    "order_id": order_id
                },
                db, conversation_id, customer_name, customer_email
            )
            tools_called.append({
                "tool_name": "escalate_to_human",
                "arguments": {"category": "payment", "priority": "urgent", "order_id": order_id},
                "output": ticket_res
            })
            reply = (
                f"I checked order **{order_id}** in our database. The order status is currently **{status}** "
                f"with payment status recorded as **{pay_st}**. "
                f"{order_data.get('support_notes') or 'A billing gateway verification hold was detected.'}\n\n"
                f"Because financial discrepancies require manual confirmation, I have created urgent ticket "
                f"#{ticket_res.get('ticket_number')} for our billing team to investigate and resolve immediately."
            )
            return {
                "reply": reply,
                "sentiment": sentiment,
                "humor_used": False,
                "is_escalated": True,
                "ticket_number": ticket_res.get("ticket_number"),
                "ticket_summary": f"Payment issue on {order_id}",
                "tools_called": tools_called,
                "suggested_actions": ["Ticket Status", "Billing FAQ"],
                "is_demo": True
            }

        # Missing shipment complaint on delivered order (e.g., ORD-DEMO-1011)
        if status == "delivered" and any(w in msg_lower for w in ["never", "not received", "didn't get", "missing", "haven't got", "stolen", "lost"]):
            ticket_res = execute_tool(
                "escalate_to_human",
                {
                    "reason": f"Missing delivery reported for {order_id}. Carrier marks delivered but customer has not received package.",
                    "category": "order",
                    "priority": "high",
                    "order_id": order_id
                },
                db, conversation_id, customer_name, customer_email
            )
            tools_called.append({
                "tool_name": "escalate_to_human",
                "arguments": {"category": "order", "priority": "high", "order_id": order_id},
                "output": ticket_res
            })
            reply = (
                f"I am very sorry to hear that you haven't received order **{order_id}**. "
                f"Our records show the carrier ({order_data['carrier']}, Tracking #{order_data['tracking_number']}) "
                f"marked it as delivered to {order_data['shipping_address']}.\n\n"
                f"I have opened an expedited lost-shipment case under Ticket #{ticket_res.get('ticket_number')} "
                f"so our logistics team can contact the carrier and arrange a replacement or refund."
            )
            return {
                "reply": reply,
                "sentiment": sentiment,
                "humor_used": False,
                "is_escalated": True,
                "ticket_number": ticket_res.get("ticket_number"),
                "ticket_summary": f"Lost shipment claim for {order_id}",
                "tools_called": tools_called,
                "suggested_actions": ["Check Ticket Status", "Speak to a Human"],
                "is_demo": True
            }

        # Delayed order (e.g., ORD-DEMO-1004)
        if status == "delayed":
            humor_line = get_contextual_humor("delayed_order") if humor_allowed else ""
            humor_used = bool(humor_line)
            reply = (
                f"{humor_line} " if humor_line else ""
            ) + (
                f"Order **{order_id}** is currently experiencing a delay. Carrier **{order_data['carrier']}** "
                f"reports tracking #{order_data['tracking_number']}. "
                f"Estimated updated delivery: **{order_data['estimated_delivery']}** to {order_data['shipping_address']}. "
                f"{order_data.get('support_notes') or ''} "
                f"Would you like me to connect you with an agent to expedite this?"
            )
        elif status == "delivered":
            actual_str = f" on {order_data['actual_delivery']}" if order_data.get("actual_delivery") else ""
            humor_line = "Time to unbox and celebrate! 🎁" if humor_allowed else ""
            humor_used = bool(humor_line)
            reply = (
                f"Great news! Order **{order_id}** was successfully delivered{actual_str} via {order_data['carrier']} "
                f"(Tracking #{order_data['tracking_number']}) to {order_data['shipping_address']}. "
                f"{humor_line} It is fully eligible for our 30-day return guarantee."
            )
        elif status == "shipped":
            reply = (
                f"Order **{order_id}** is on its way! 🚚 Handled by {order_data['carrier']}, "
                f"Tracking #{order_data['tracking_number']}. "
                f"Estimated delivery is **{order_data['estimated_delivery']}**."
            )
        elif status == "cancelled":
            reply = (
                f"Order **{order_id}** was cancelled. Total amount of ${order_data['total_amount']:.2f} "
                f"refund status is **{order_data.get('refund_status', 'completed')}**."
            )
        elif status == "manual_review":
            reply = (
                f"Order **{order_id}** is currently under **manual review** for security verification. "
                f"{order_data.get('support_notes') or 'Our fraud prevention team is reviewing the order.'} "
                f"We will update you as soon as review completes."
            )
        else:
            reply = f"Order **{order_id}** is currently **{status.capitalize()}**. Total: ${order_data['total_amount']:.2f}."

        return {
            "reply": reply.strip(),
            "sentiment": sentiment,
            "humor_used": humor_used,
            "is_escalated": False,
            "ticket_number": None,
            "ticket_summary": None,
            "tools_called": tools_called,
            "suggested_actions": [f"Return {order_id}", f"Cancel {order_id}" if status == "processing" else f"Order Details", "Store Policy"],
            "is_demo": True
        }

    # 8. Product Search and Catalog Inquiries
    if any(w in msg_lower for w in ["product", "buy", "price", "headphones", "keyboard", "mouse", "monitor", "chair", "specs", "stock"]):
        # Extract potential query
        cleaned_words = [w for w in msg_lower.split() if w not in ["what", "is", "the", "for", "tell", "me", "about", "show", "do", "you", "have", "product", "products"]]
        search_term = " ".join(cleaned_words) if cleaned_words else "audio"
        prod_res = execute_tool("search_products", {"query": search_term}, db, conversation_id, customer_name, customer_email)
        tools_called.append({
            "tool_name": "search_products",
            "arguments": {"query": search_term},
            "output": prod_res
        })

        if prod_res.get("results_count", 0) > 0:
            lines = [f"Here are the top matches from our catalog:"]
            for p in prod_res["products"][:3]:
                lines.append(f"• **{p['name']}** (${p['price']:.2f}) — {p['description']} (Stock: {p['stock']}, Warranty: {p['warranty_months']} mos)")
            reply = "\n".join(lines)
            suggested = [f"Details on {prod_res['products'][0]['name']}", "Shipping Policy"]
        else:
            reply = f"I couldn't find any items matching '{search_term}' in our current stock. Let me know if you'd like to check our other categories!"
            suggested = ["Search Audio", "Search Keyboards", "Search Chairs"]

        return {
            "reply": reply,
            "sentiment": sentiment,
            "humor_used": False,
            "is_escalated": False,
            "ticket_number": None,
            "ticket_summary": None,
            "tools_called": tools_called,
            "suggested_actions": suggested,
            "is_demo": True
        }

    # 9. General Policy / FAQ Knowledge Base Search
    kb_res = execute_tool("search_store_policies", {"query": message}, db, conversation_id, customer_name, customer_email)
    tools_called.append({
        "tool_name": "search_store_policies",
        "arguments": {"query": message},
        "output": kb_res
    })

    if kb_res.get("found") and len(kb_res.get("articles", [])) > 0:
        article = kb_res["articles"][0]
        reply = f"**{article['title']}**\n\n{article['content']}"
        suggested = ["Track an Order", "Return Policy", "Contact Support"]
        return {
            "reply": reply,
            "sentiment": sentiment,
            "humor_used": False,
            "is_escalated": False,
            "ticket_number": None,
            "ticket_summary": None,
            "tools_called": tools_called,
            "suggested_actions": suggested,
            "is_demo": True
        }

    # 10. Default Conversational Fallback
    humor_line = get_contextual_humor("greeting") if humor_allowed else ""
    humor_used = bool(humor_line)
    reply = (
        f"{humor_line} " if humor_line else ""
    ) + (
        "I'm here to help with order tracking, return processing, product specs, or policy questions. "
        "What can I assist you with today?"
    )

    return {
        "reply": reply.strip(),
        "sentiment": sentiment,
        "humor_used": humor_used,
        "is_escalated": False,
        "ticket_number": None,
        "ticket_summary": None,
        "tools_called": tools_called,
        "suggested_actions": ["Track Order ORD-1001", "Return an Item", "Browse Products", "Talk to a Human"],
        "is_demo": True
    }

async def process_chat_message(
    conversation_id: Optional[int],
    session_id: str,
    message: str,
    customer_name: Optional[str],
    customer_email: Optional[str],
    db: Session
) -> Dict[str, Any]:
    """
    Main entry point for processing a customer chat message.
    Handles conversation persistence, memory, real LLM with tool calling or demo fallback.
    """
    # 1. Retrieve or create conversation
    if conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    else:
        conv = db.query(Conversation).filter(Conversation.session_id == session_id, Conversation.status == "active").first()
        
    if not conv:
        conv = Conversation(
            session_id=session_id,
            title=f"Chat: {message[:30]}..." if len(message) > 30 else f"Chat: {message}",
            status="active"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 2. Record Customer Message
    user_sentiment, _ = analyze_customer_sentiment(message)
    cust_msg = Message(
        conversation_id=conv.id,
        sender="customer",
        content=message,
        sentiment=user_sentiment,
        humor_used=False
    )
    db.add(cust_msg)
    db.commit()

    # 3. Retrieve recent conversation history
    history = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()

    # 4. Determine AI response mode (OpenAI or Intelligent Demo Mode)
    use_real_llm = False
    if not settings.DEMO_MODE and settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Format messages
            system_prompt = SYSTEM_PERSONALITY_PROMPT + "\nRemember: Never fabricate data. Use tools for any store facts."
            messages_payload = [{"role": "system", "content": system_prompt}]
            for h in history[-8:]:
                role = "assistant" if h.sender == "ai" else "user"
                messages_payload.append({"role": role, "content": h.content})
                
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages_payload,
                tools=TOOL_DEFINITIONS,
                tool_choice="auto",
                timeout=12.0
            )
            
            choice = response.choices[0].message
            tools_called = []
            
            if choice.tool_calls:
                for tool_call in choice.tool_calls:
                    fname = tool_call.function.name
                    fargs = json.loads(tool_call.function.arguments)
                    fout = execute_tool(fname, fargs, db, conv.id, customer_name, customer_email)
                    tools_called.append({
                        "tool_name": fname,
                        "arguments": fargs,
                        "output": fout
                    })
                    
                # Second turn with tool results
                second_response = await client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=messages_payload + [
                        choice,
                        {
                            "role": "tool",
                            "tool_call_id": choice.tool_calls[0].id,
                            "content": json.dumps(tools_called[0]["output"])
                        }
                    ],
                    timeout=10.0
                )
                final_reply = second_response.choices[0].message.content or "Let me know if you need anything else!"
            else:
                final_reply = choice.content or "How can I assist you further?"
                
            use_real_llm = True
            ai_sentiment, humor_flag = analyze_customer_sentiment(final_reply)
            result = {
                "reply": final_reply,
                "sentiment": ai_sentiment,
                "humor_used": humor_flag,
                "is_escalated": conv.status == "escalated",
                "ticket_number": None,
                "ticket_summary": None,
                "tools_called": tools_called,
                "suggested_actions": ["Track Order", "Return Policy", "Speak to a Human"],
                "is_demo": False
            }
        except Exception as e:
            logger.warning(f"OpenAI API call failed or timed out: {e}. Falling back to Intelligent Demo Mode.")
            use_real_llm = False

    if not use_real_llm:
        result = run_demo_orchestration(
            message=message,
            history=history,
            db=db,
            conversation_id=conv.id,
            customer_name=customer_name or "Customer",
            customer_email=customer_email
        )

    # 5. Save AI Message
    ai_msg = Message(
        conversation_id=conv.id,
        sender="ai",
        content=result["reply"],
        sentiment=result["sentiment"],
        humor_used=result["humor_used"],
        tool_invocations=json.dumps(result["tools_called"]) if result["tools_called"] else None
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    result["conversation_id"] = conv.id
    result["message_id"] = ai_msg.id
    result["created_at"] = ai_msg.created_at.isoformat()
    return result
