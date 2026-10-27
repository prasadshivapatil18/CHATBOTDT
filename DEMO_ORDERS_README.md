# Sidekick AI — Demonstration Orders & Test Catalogue

This reference manual documents the complete set of fictional retail demonstration orders implemented for the **Sidekick AI Customer Service Platform**. It provides testing prompts, expected assistant behaviors, sentiment evaluation protocols, and administrative guidance.

---

## A. Overview

### 1. Purpose of the Demo Orders
The demonstration orders provide realistic, end-to-end testing scenarios for all core retail support workflows:
* **Real-time Order & Courier Tracking**: Shipped, delivered, and delayed shipments with live carrier integration.
* **Hassle-Free Cancellations**: Instant self-service cancellations on pre-dispatch processing orders.
* **30-Day Policy Return Authorization**: Automated validation of product delivery dates and return policy eligibility.
* **Refund Lifecycle Tracking**: Clear visibility into pending vs. completed merchant banking credits.
* **Financial & Billing Incident Triage**: Zero-humor escalation protocols for failed charges and duplicate payment disputes.
* **Tier-2 Human Handoff**: Automatic creation of prioritized support tickets with synchronized conversation summaries.

### 2. Confirmation of Fictional Data
* **Customers**: All customer names, residential addresses, and account IDs are entirely fictional.
* **Email Addresses**: All email addresses strictly utilize the IANA RFC-2606 reserved example domain (`example.com`).
* **Payment Credentials**: All payment methods use simulated, masked tokens (e.g., `Visa ending in •••• 4242`). No real card numbers or banking accounts are stored or processed.
* **Courier Tracking**: All tracking numbers utilize simulated identifiers (e.g., `NEO-TRK-771001`, `APX-TRK-881004`).

### 3. Database Setup Requirements
* **Runtime**: Python 3.11+
* **Framework**: FastAPI with SQLAlchemy ORM
* **Storage**: SQLite development database (`retail_support.db` or configured `DATABASE_URL`)
* **Integrity Guarantee**: Seeding operations are non-destructive and **never** drop or overwrite existing production tables.

### 4. Instructions for Seeding the Database
The dedicated seeding script is located at:
`backend/app/seed_demo_orders.py`

#### Method 1: Python Module Execution (Recommended)
From the project root or backend directory:
```bash
# Navigate to backend directory
cd backend

# Execute via virtual environment Python
python -m app.seed_demo_orders
```

#### Method 2: Direct Script Execution
From the workspace root:
```bash
python backend/app/seed_demo_orders.py
```

#### Automated Startup Seeding
The backend application automatically invokes `seed_demo_orders(db)` during the FastAPI application lifespan startup if demo records are absent.

### 5. Identification of Demo Orders
* **Database Marker**: Every demo record contains `is_demo = true` on the `orders` and `users` tables.
* **ID Formatting**: Standard demo identifiers follow the `ORD-DEMO-1001` through `ORD-DEMO-1013` scheme.
* **Admin Dashboard Tagging**: In the Admin Command Center, demo orders display a vibrant `DEMO` badge and can be filtered separately from real customer records.

---

## B. Complete Order Catalogue

| Order ID | Customer | Product & SKU | Status | Payment State | Delivery Info | Return / Refund State | Primary Demonstration Scenario |
|---|---|---|---|---|---|---|---|
| **ORD-DEMO-1001** | Elena Rostova (`USR-DEMO-1001`) | AuraPulse ANC Wireless Headphones (`SKU-HP200`) | `delivered` | `paid`<br>Visa •••• 4242 | Delivered Oct 20<br>Carrier: NeoExpress Logistics<br>Trk: `NEO-TRK-771001` | **Eligible**<br>Within 30-day window | Delivered successfully; sample support inquiry and return eligibility. |
| **ORD-DEMO-1002** | Marcus Chen (`USR-DEMO-1002`) | NeoTrack Chrono Smart Watch (`SKU-SW600`) | `shipped` | `paid`<br>Mastercard •••• 8821 | Est: Oct 28<br>Carrier: NeoExpress Logistics<br>Trk: `NEO-TRK-771002` | **Ineligible**<br>(In Transit) | Active courier shipment in transit with ETA. |
| **ORD-DEMO-1003** | Chloe Bennett (`USR-DEMO-1003`) | NeoGlow Mechanical Keyboard (`SKU-KB100`) | `processing` | `paid`<br>Apple Pay •••• 3190 | Est: Oct 30<br>Warehouse allocation | **Eligible for Free Cancellation** | Processing order; eligible for immediate cancellation prior to dispatch. |
| **ORD-DEMO-1004** | Liam O'Connor (`USR-DEMO-1004`) | AeroStride Pro Running Shoes (`SKU-RS700`) | `delayed` | `paid`<br>Visa •••• 1092 | Delayed: Oct 27<br>Carrier: Apex Freight<br>Trk: `NEO-TRK-771004` | **Ineligible**<br>(Delayed Transit) | Delivery delay requiring empathy, verified courier notes, and agent offer. |
| **ORD-DEMO-1005** | Sofia Martinez (`USR-DEMO-1005`) | SoundWave Rugged Bluetooth Speaker (`SKU-SP800`) | `cancelled` | `refunded`<br>PayPal (s***z@example.com) | Cancelled before dispatch | **Refunded: $79.99**<br>Status: `completed` | Successfully cancelled order with recorded refund. |
| **ORD-DEMO-1006** | Julian Thorne (`USR-DEMO-1006`) | CyberPack Shield Laptop Backpack (`SKU-BP900`) | `returned` | `refund_pending`<br>Mastercard •••• 5044 | Delivered Oct 14<br>Returned to depot | **Refund: $89.99**<br>Status: `pending` | Returned item with refund currently clearing banking cycle (3–5 days). |
| **ORD-DEMO-1007** | Maya Lin (`USR-DEMO-1007`) | OmniPort 8-in-1 USB-C Hub (`SKU-HB150`) | `returned` | `refunded`<br>Visa •••• 9912 | Delivered Oct 09<br>Resolved Oct 16 | **Refund: $49.99**<br>Status: `completed` | Return processed and refund successfully completed to card. |
| **ORD-DEMO-1008** | Tariq Al-Mansoor (`USR-DEMO-1008`) | PulseFit Active Fitness Band (`SKU-FB250`) | `delivered` | `paid`<br>Visa •••• 5531 | Delivered Oct 18<br>(6 days ago) | **Eligible**<br>30-Day Guarantee | Delivered product well within the 30-day window; generates return label. |
| **ORD-DEMO-1009** | Beatrice Vance (`USR-DEMO-1009`) | LumenArt Minimalist LED Desk Lamp (`SKU-DL350`) | `delivered` | `paid`<br>Mastercard •••• 7120 | Delivered 42 days ago<br>(Sept 12) | **Ineligible**<br>Expired (>30 days) | Delivered product outside the return window; polite refusal and exception review. |
| **ORD-DEMO-1010** | Zachary Knight (`USR-DEMO-1010`) | CyberGlide Ergonomic Mouse (`SKU-MS300`) | `payment_pending` | `failed`<br>Visa •••• 3341 | On hold pending payment | **Ineligible**<br>Payment Hold | Simulated payment gateway failure requiring billing escalation (zero jokes). |
| **ORD-DEMO-1011** | Nina Patel (`USR-DEMO-1011`) | VisionClear 4K Ultra HD Webcam (`SKU-WC450`) | `delivered` | `paid`<br>Apple Pay •••• 8820 | Marked Delivered Oct 23<br>Trk: `NEO-TRK-771011` | Claim: Porch theft / missing | Carrier records delivery, customer reports non-receipt; initiates investigation. |
| **ORD-DEMO-1012** | Derek Foster (`USR-DEMO-1012`) | TitanFlex Mesh Ergonomic Chair (`SKU-CH500`) | `processing` | `duplicate_hold`<br>Visa •••• 6601 | Processing warehouse hold | Pre-auth hold reversal | Duplicate payment authorization complaint flagged for finance review. |
| **ORD-DEMO-1013** | Gabriel Santos (`USR-DEMO-1013`) | NeoVibe 34" Ultrawide 4K Monitor (`SKU-MN400`) | `manual_review` | `security_hold`<br>Amex •••• 1009 | Pending fraud clearance | On security hold | High-value order held for IP/address security verification. |

---

## C. Suggested Chatbot Test Conversations

### 1. Delivered Order (ORD-DEMO-1001)
* **Customer Prompt**: `"Where is my order ORD-DEMO-1001?"`
* **Expected AI Behavior**:
  1. Calls `track_order` tool with `{"order_number": "ORD-DEMO-1001"}`.
  2. Confirms that the order was delivered via NeoExpress Logistics to Springfield, OR.
  3. Notes that the delivery took place on October 20 and confirms the item is eligible for customer support or a 30-day return.
  4. Light, friendly closing is permitted (e.g., *"Time to unbox and celebrate! 🎁"*).

### 2. Shipped Order in Transit (ORD-DEMO-1002)
* **Customer Prompt**: `"Can you track package ORD-DEMO-1002?"`
* **Expected AI Behavior**:
  1. Calls `track_order` tool with `{"order_number": "ORD-DEMO-1002"}`.
  2. Reports status as `shipped` via NeoExpress Logistics.
  3. Provides tracking number `NEO-TRK-771002` and estimated delivery date of October 28, 2026.
  4. Does not claim the item is delivered or offer return labels prematurely.

### 3. Processing Order & Cancellation (ORD-DEMO-1003)
* **Customer Prompt**: `"Can I cancel ORD-DEMO-1003? I changed my mind."`
* **Expected AI Behavior**:
  1. Identifies the order is currently in `processing` status in the warehouse.
  2. Informs the customer that because it has not yet shipped, it qualifies for **immediate free cancellation**.
  3. Offers to confirm the cancellation and initiate a full refund of $129.99 to their Apple Pay payment method.

### 4. Delayed Order (ORD-DEMO-1004)
* **Customer Prompt**: `"Why is ORD-DEMO-1004 taking so long? I need my running shoes!"`
* **Expected AI Behavior**:
  1. Calls `track_order` tool and detects `delayed` status.
  2. Immediately acknowledges the delay with genuine empathy (no trivializing jokes).
  3. Explains verified courier information: Apex Freight reports weather disruption with an updated delivery date of October 27, 2026.
  4. Offers to connect the customer with an expediting support agent.

### 5. Cancelled Order (ORD-DEMO-1005)
* **Customer Prompt**: `"What happened to my order ORD-DEMO-1005?"`
* **Expected AI Behavior**:
  1. Retrieves order status `cancelled` and cancellation status `cancelled`.
  2. Confirms that the order was cancelled prior to dispatch.
  3. Confirms that the $79.99 refund was completed back to their PayPal account.

### 6. Refund Pending (ORD-DEMO-1006)
* **Customer Prompt**: `"When will I receive my refund for ORD-DEMO-1006?"`
* **Expected AI Behavior**:
  1. Retrieves return and refund state from database records.
  2. Confirms that the returned item was received and inspected at the depot.
  3. Explains that the refund of **$89.99** is currently **pending** in banking settlement.
  4. Cites the verified store policy: funds typically reflect within **3 to 5 business days**.

### 7. Refund Completed (ORD-DEMO-1007)
* **Customer Prompt**: `"Did my refund go through for order ORD-DEMO-1007?"`
* **Expected AI Behavior**:
  1. Checks order records and finds `refund_status: completed`.
  2. Confirms that the full refund of **$49.99** was processed on record back to the customer's Visa card ending in `•••• 9912`.
  3. Recommends checking their bank statement for the credit.

### 8. Return Eligible (ORD-DEMO-1008)
* **Customer Prompt**: `"Can I return ORD-DEMO-1008?"`
* **Expected AI Behavior**:
  1. Calls `check_return_eligibility` tool.
  2. Calculates delivery date (delivered 6 days ago) against the 30-day guarantee.
  3. Confirms the item is fully eligible for return and offers to generate a prepaid shipping label for the $69.99 refund.

### 9. Return Ineligible (ORD-DEMO-1009)
* **Customer Prompt**: `"I want to return ORD-DEMO-1009."`
* **Expected AI Behavior**:
  1. Calls `check_return_eligibility` tool.
  2. Identifies that the item was delivered 42 days ago, which exceeds the configured 30-day return window.
  3. Politely explains the policy limitation.
  4. Offers to submit a case for manager exception review if the customer has special circumstances.

### 10. Payment Gateway Failure (ORD-DEMO-1010)
* **Customer Prompt**: `"I was charged on my bank app, but my order ORD-DEMO-1010 says payment failed!"`
* **Expected AI Behavior**:
  1. Detects financial concern and disables humor engine entirely.
  2. Inspects database: status is `payment_pending`, payment status is `failed`.
  3. Avoids guessing or making false claims about the banking network.
  4. Explains that a gateway authorization hold occurred and automatically files urgent support ticket `TCK-DEMO-1010` for human billing resolution.

### 11. Missing Shipment on Delivered Order (ORD-DEMO-1011)
* **Customer Prompt**: `"Tracking says ORD-DEMO-1011 was delivered yesterday, but I never received it! Where is it?"`
* **Expected AI Behavior**:
  1. Confirms the carrier recorded delivery to their New York address.
  2. Empathizes with the customer without dismissing the complaint.
  3. Opens a lost-shipment case (Ticket `TCK-DEMO-1011`) for carrier GPS investigation or express replacement.

### 12. Duplicate Payment Complaint (ORD-DEMO-1012)
* **Customer Prompt**: `"My credit card was charged twice for order ORD-DEMO-1012!"`
* **Expected AI Behavior**:
  1. Empathizes immediately.
  2. Cites the store billing policy regarding temporary banking holds vs. double settled charges.
  3. Notes the duplicate hold recorded on the order.
  4. Escalates under urgent billing priority for transaction reversal.

### 13. High-Value Manual Review Hold (ORD-DEMO-1013)
* **Customer Prompt**: `"Why hasn't my monitor order ORD-DEMO-1013 shipped yet?"`
* **Expected AI Behavior**:
  1. Checks order status `manual_review` and payment status `security_hold`.
  2. Explains factually that the order is undergoing standard security address verification.
  3. Avoids disclosing internal fraud rule specifics while reassuring the customer that verification completes within 24 hours.

---

## D. Humor and Sentiment Testing

The assistant incorporates calibrated sentiment analysis and contextual humor rules. Test the following variations to ensure policy adherence:

### 1. Friendly Customer (Humor Permitted)
* **User**: `"Hi there! Could you track ORD-DEMO-1001 for me? Hope you're having a great day!"`
* **Expected Response**: Friendly tone with light, tasteful humor permitted (e.g. referencing digital energy, unboxing excitement).

### 2. Frustrated Customer (Empathy First, Zero Jokes)
* **User**: `"This is ridiculous! I've been waiting all week for ORD-DEMO-1004 and now you tell me it's delayed! I'm furious!"`
* **Expected Response**:
  * Sentiment detected as `frustrated` or `negative`.
  * `humor_used` must be `false`.
  * Response starts with a sincere apology and clear facts.
  * Offers immediate human agent escalation.

### 3. Financial & Billing Issues (Strict Zero-Humor Rule)
* **User**: `"My card was charged twice for ORD-DEMO-1012!"`
* **Expected Response**:
  * **Zero humor**. Joking about double charges or lost money is strictly prohibited.
  * Direct reassurance, ticket generation, and refund timeline explanation (3–5 business days).

### 4. Explicit Request for a Human
* **User**: `"I don't want to talk to an AI bot. Transfer me to a real person immediately."`
* **Expected Response**:
  * Immediately creates a human support ticket.
  * Captures conversation context so the customer does not have to repeat themselves.
  * Provides queue position and ticket identifier.

### 5. Queries Outside Knowledge Base
* **User**: `"Do you sell warp-drive space cruisers for intergalactic travel?"`
* **Expected Response**:
  * Grounded retrieval checks catalog and knowledge base.
  * Frankly admits store does not carry the item without hallucinating fictional specs or policies.

---

## E. Troubleshooting Guide

| Issue | Root Cause | Solution |
|---|---|---|
| **Order not found in Chat or Admin** | Database has not been seeded with demo records. | Run `python -m app.seed_demo_orders` from the `backend` folder. Check that `retail_support.db` is present. |
| **Unauthorized order lookup error (404)** | Email mismatch verification triggered in API. | Ensure the customer email matches the record when querying `/api/orders/{order_number}?email=...`. |
| **Chatbot returns generic fallback** | Order ID pattern was not recognized in prompt. | Verify the order ID starts with `ORD-` (e.g. `ORD-DEMO-1001`). The updated regex matches `ORD-(?:DEMO-)?\d{3,5}`. |
| **LLM API Timeout or Quota Error** | OpenAI API key missing, invalid, or rate-limited. | The backend automatically activates **Intelligent Demo Mode** (`DEMO_MODE=True`), querying real SQLite records without external API dependence. |
| **Return request rejected on valid order** | Order delivery date calculation exceeded 30 days. | Verify the `order_date` in database. `ORD-DEMO-1008` is seeded 8 days ago and will always pass eligibility. |
| **Admin Dashboard shows empty table** | Filter set to "Production Only" when only demo data is seeded. | Click the "Demo Orders" or "All Orders" toggle button in the Order Catalogue toolbar. |

---

## F. Verification Checklist

- [x] At least 10 demo retail orders created and seeded (`ORD-DEMO-1001` through `ORD-DEMO-1013`).
- [x] Every documented order ID matches a verified record in the configured database.
- [x] Database seeding script (`backend/app/seed_demo_orders.py`) is completely idempotent.
- [x] Separate `DEMO_ORDERS_README.md` exists at project root.
- [x] Complete order catalogue, scenario descriptions, and test transcripts documented.
- [x] Chatbot retrieves order data from backend database rather than hardcoded frontend responses.
- [x] Order statuses, return eligibility, and refund states are consistent across database, chatbot, and UI.
- [x] Demo records cannot overwrite or delete real production customer records.
- [x] Admin Command Center includes dedicated Orders Catalogue with search, filtering, and inspector modal.
