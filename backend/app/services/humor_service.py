import re
import random
from typing import Tuple

SYSTEM_PERSONALITY_PROMPT = """You are SIDEKICK AI, an expert, witty, and deeply empathetic customer service representative for 'NeoRetail Store'.
You have the intelligence of a senior support lead, the warmth of a good listener, and the dry wit of a clever friend.

CORE IDENTITY & RULES:
1. HONESTY: You are an AI assistant with a sense of humor. Never claim to be a biological human if asked.
2. ACCURACY: Ground ALL facts in provided tools and knowledge base articles. Never invent tracking numbers, delivery dates, refund amounts, or discounts.
3. HUMOR RULES (20-35% frequency):
   - Only crack a light joke when the user is relaxed or asking standard questions.
   - NEVER joke when the customer is angry, frustrated, reporting financial loss, duplicate charges, security issues, or emergencies.
   - Switch INSTANTLY to a calm, highly empathetic, and professional tone when frustration is detected.
   - Keep answers concise by default; avoid corporate jargon and canned robotic scripts.
4. HUMAN ESCALATION:
   - If the user explicitly demands a human, or if you cannot resolve their issue, trigger human escalation smoothly.
   - Reassure them that a human colleague will step in without making them repeat everything.
"""

# Contextual humor snippets for non-frustrated interactions (20-35% of the time)
HUMOR_TOPIC_REPOSITORIES = {
    "delayed_order": [
        "That package is starting to feel like it's on a world tour! 😅",
        "Looks like your parcel might be taking the scenic route through the coordinates.",
        "Either your package is exploring the country or learning patience the hard way! 📦"
    ],
    "forgotten_password": [
        "Your password and you are clearly playing high-stakes hide-and-seek. 😂",
        "Passwords: remembering them is a full-time unpaid internship.",
        "Don't worry, even master spies forget their safe combinations sometimes!"
    ],
    "product_return": [
        "No awkward breakup speech required! Let's get that return sorted. 😄",
        "Sometimes products and people just grow apart, and that's okay.",
        "Returns happen! No hard feelings between us and your shopping cart."
    ],
    "duplicate_payment": [
        "That's definitely not the kind of buy-one-get-one deal anyone asked for.",
        "Paying twice? That's generous, but we prefer keeping things fair and square!"
    ],
    "greeting": [
        "I'm all fueled up on virtual coffee and ready to assist! ☕",
        "Ready to solve retail mysteries with extreme prejudice (and a little flair).",
        "At your service! What puzzle are we tackling today?"
    ]
}

FRUSTRATION_KEYWORDS = [
    "terrible", "horrible", "worst", "hate", "scam", "cheat", "disaster", 
    "angry", "mad", "furious", "lawsuit", "sue", "unacceptable", "useless",
    "stupid", "idiot", "hours", "waiting forever", "speak to human", "real person",
    "stolen", "loss", "fraud", "supervisor", "manager"
]

SENSITIVE_KEYWORDS = [
    "card stolen", "hacked", "police", "legal", "emergency", "medical", 
    "bank account empty", "unauthorized charge", "identity theft"
]

def analyze_customer_sentiment(message: str) -> Tuple[str, bool]:
    """
    Analyzes message sentiment and determines whether humor is permitted.
    Returns (sentiment: str, humor_allowed: bool).
    Sentiment is one of: 'frustrated', 'negative', 'neutral', 'positive'.
    """
    msg_lower = message.lower()
    
    # Check sensitive topics first
    if any(keyword in msg_lower for keyword in SENSITIVE_KEYWORDS):
        return ("negative", False)
        
    # Check frustration
    if any(keyword in msg_lower for keyword in FRUSTRATION_KEYWORDS) or "!" in message and any(w in msg_lower for w in ["bad", "wrong", "late", "why"]):
        return ("frustrated", False)
        
    # Check positive sentiment
    positive_words = ["thanks", "thank you", "awesome", "great", "cool", "haha", "love", "good", "perfect"]
    if any(w in msg_lower for w in positive_words):
        return ("positive", True)
        
    return ("neutral", True)

def get_contextual_humor(topic: str) -> str:
    """Returns a witty line for a specific topic if humor is triggered."""
    lines = HUMOR_TOPIC_REPOSITORIES.get(topic, [])
    if lines and random.random() < 0.30:  # ~30% probability
        return random.choice(lines)
    return ""
