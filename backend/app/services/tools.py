from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.services.order_service import get_order_by_number, format_order_status_summary
from app.services.return_service import check_return_eligibility, create_return_request
from app.services.knowledge_service import search_knowledge_base
from app.services.escalation_service import create_escalation_ticket
from app.models.product import Product

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "track_order",
            "description": "Look up an existing order by order number (e.g. ORD-1001, ORD-1002) to get current shipping status, carrier, tracking number, and items.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_number": {
                        "type": "string",
                        "description": "The order identifier, e.g. ORD-1001"
                    }
                },
                "required": ["order_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_return_eligibility",
            "description": "Check if an order can be returned based on delivery status and 30-day return policy window.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_number": {
                        "type": "string",
                        "description": "The order identifier to check"
                    }
                },
                "required": ["order_number"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Search product catalog for prices, specifications, warranty, and stock availability.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Keywords, product names, or categories"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_store_policies",
            "description": "Search the official retail knowledge base for shipping rates, refund rules, warranty terms, store hours, and payment methods.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search topic such as 'shipping costs', 'refund timeline', 'accepted payment methods'"
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "escalate_to_human",
            "description": "Escalate the issue and generate a support ticket when a human agent is requested or required.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "description": "Detailed summary of the customer's problem"
                    },
                    "category": {
                        "type": "string",
                        "enum": ["order", "return", "payment", "technical", "general"],
                        "description": "The issue category"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "urgent"],
                        "description": "Ticket priority level"
                    },
                    "order_id": {
                        "type": "string",
                        "description": "Optional order number if relevant"
                    }
                },
                "required": ["reason"]
            }
        }
    }
]

def execute_tool(
    name: str,
    args: Dict[str, Any],
    db: Session,
    conversation_id: Optional[int] = None,
    customer_name: Optional[str] = "Customer",
    customer_email: Optional[str] = None
) -> Dict[str, Any]:
    """Executes backend functions requested by AI tool calls."""
    if name == "track_order":
        order_num = args.get("order_number", "")
        order = get_order_by_number(db, order_num, customer_email)
        if not order:
            return {"found": False, "message": f"Order '{order_num}' could not be found in our system. Please double-check the order ID."}
        return {"found": True, "order": format_order_status_summary(order)}
        
    elif name == "check_return_eligibility":
        order_num = args.get("order_number", "")
        order = get_order_by_number(db, order_num, customer_email)
        if not order:
            return {"eligible": False, "message": f"Cannot find order '{order_num}'."}
        eligible, reason = check_return_eligibility(order)
        return {
            "eligible": eligible,
            "order_number": order.order_number,
            "reason": reason,
            "order_status": order.status,
            "total_amount": order.total_amount
        }
        
    elif name == "search_products":
        query = args.get("query", "").lower()
        products = db.query(Product).filter(
            (Product.name.ilike(f"%{query}%")) | 
            (Product.category.ilike(f"%{query}%")) |
            (Product.description.ilike(f"%{query}%"))
        ).limit(4).all()
        
        return {
            "results_count": len(products),
            "products": [
                {
                    "sku": p.sku,
                    "name": p.name,
                    "category": p.category,
                    "price": p.price,
                    "stock": p.stock,
                    "description": p.description,
                    "warranty_months": p.warranty_months
                }
                for p in products
            ]
        }
        
    elif name == "search_store_policies":
        query = args.get("query", "")
        articles = search_knowledge_base(db, query, limit=2)
        return {
            "found": len(articles) > 0,
            "articles": [
                {
                    "title": a.title,
                    "category": a.category,
                    "content": a.content
                }
                for a in articles
            ]
        }
        
    elif name == "escalate_to_human":
        ticket = create_escalation_ticket(
            db=db,
            conversation_id=conversation_id,
            customer_name=customer_name or "Customer",
            customer_email=customer_email or "customer@example.com",
            subject=f"Customer Support Request: {args.get('category', 'general').capitalize()}",
            summary=args.get("reason", "Customer requested human assistance."),
            category=args.get("category", "general"),
            priority=args.get("priority", "medium"),
            order_id=args.get("order_id")
        )
        return {
            "escalated": True,
            "ticket_number": ticket.ticket_number,
            "queue_position": ticket.queue_position,
            "summary": ticket.summary
        }
        
    return {"error": f"Tool '{name}' not recognized"}
