# ⚡ SIDEKICK AI — Intelligent Retail Customer Support Platform
> **Python FastAPI Backend** • **Neo-Brutalism Design System** • **Human-Like Grounded AI** • **College Portfolio Demonstration**

![Neo-Brutalism UI](https://img.shields.io/badge/UI_Design-Neo--Brutalism-FFE156?style=for-the-badge&logoColor=black)
![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-4D7CFE?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React + TS](https://img.shields.io/badge/Frontend-React_19_+_TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Pytest](https://img.shields.io/badge/Tests-30_Passed-B8F56A?style=for-the-badge&logo=pytest&logoColor=black)
[![Demo Orders Manual](https://img.shields.io/badge/Demo_Orders_Catalogue-13_Scenarios-FFE156?style=for-the-badge&logo=markdown&logoColor=black)](DEMO_ORDERS_README.md)

---

> 📖 **Demo Testing Reference**: See the complete order catalogue, customer scenarios, and sample conversation transcripts in [DEMO_ORDERS_README.md](DEMO_ORDERS_README.md).

## 🌟 Executive Overview

**SIDEKICK AI** is a production-grade, portfolio-ready retail customer support system. It combines the intelligence and accuracy of an expert customer support lead with natural, witty, and empathetic conversation — eliminating generic robotic language and tedious hold times.

Unlike conventional chatbot demos, **Sidekick AI never hallucinates store policies, delivery dates, or refund approvals**. Every response is grounded in real database records and verified knowledge articles through automated tool calling. When issues require human discretion or a customer expresses frustration, Sidekick AI executes an intelligent human handoff, creating a trackable support ticket with an auto-generated context summary.

The entire frontend is built from scratch adhering strictly to an expressive **Neo-Brutalism Design System** with bold 3px black borders, hard offset shadows, vibrant primary colors, oversized typography, and tactile button presses.

---

## 🎨 Mandatory Neo-Brutalism Design Tokens

The interface follows strict Neo-Brutalism visual guidelines:

| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| **`--neo-bg`** | `#FFFDF5` | Warm off-white canvas |
| **`--neo-ink`** | `#171717` | High-contrast borders, text, and hard shadows |
| **`--neo-yellow`** | `#FFE156` | Primary action buttons, AI badges, hero accents |
| **`--neo-blue`** | `#4D7CFE` | Customer chat bubbles, technical indicators, links |
| **`--neo-lime`** | `#B8F56A` | Successful resolutions, verified policy stickers |
| **`--neo-coral`** | `#FF6B6B` | Escalations, urgent tickets, human handoff buttons |
| **`--neo-white`** | `#FFFFFF` | Card backgrounds, inputs, modal containers |

- **Borders**: 3px solid `#171717`
- **Shadows**: 4px to 6px offset hard shadows (`box-shadow: 4px 4px 0 #171717`) with 0 blur
- **Corners**: Subtle 2px to 4px border radius
- **Typography**: Space Grotesk (headings) & Inter (body text)
- **Interactions**: Buttons depress 2px on hover, 4px on active click with shadow flattening

---

## 🤖 The AI Personality: Funny, Empathetic & Grounded

Sidekick AI is engineered with contextual sentiment analysis and strict boundaries:
- **Calibrated Humor**: Uses witty observations in **20–35%** of suitable, relaxed conversations.
- **Empathy Override (0% Humor)**: When customer frustration, anger, duplicate charges, or financial disputes are detected, humor is **completely suppressed** in favor of calm, validating empathy.
- **Honest Identity**: Never falsely claims to be a human. Explicitly discloses its AI identity with good humor.
- **Grounded Tool Execution**: Queries order statuses, checks 30-day return policies, searches catalog specifications, and creates tickets using real database transactions.

---

## 📁 Project Architecture

```text
CHATBOT/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application & lifespan startup
│   │   ├── config.py                # Pydantic BaseSettings & environment loader
│   │   ├── database.py              # SQLAlchemy engine & session factory
│   │   ├── seed_data.py             # Realistic fictional products, orders, tickets, FAQs
│   │   ├── seed_demo_orders.py      # 13 Idempotent retail demo orders & scenarios
│   │   ├── models/                  # SQLAlchemy ORM Models
│   │   │   ├── user.py              # User & customer sessions
│   │   │   ├── conversation.py      # Conversation & Message history with sentiments
│   │   │   ├── product.py           # Catalog items, specs, pricing, warranties
│   │   │   ├── order.py             # Orders & OrderItems with carriers and statuses
│   │   │   ├── return_request.py    # Return requests & refund tracking
│   │   │   ├── ticket.py            # Support tickets & agent conversation logs
│   │   │   ├── knowledge.py         # Ground truth knowledge base articles
│   │   │   └── feedback.py          # CSAT ratings and customer comments
│   │   ├── schemas/                 # Pydantic request & response validation schemas
│   │   │   ├── chat.py
│   │   │   ├── order.py
│   │   │   ├── ticket.py
│   │   │   ├── knowledge.py
│   │   │   └── analytics.py
│   │   ├── services/                # Business logic & AI orchestration
│   │   │   ├── ai_service.py        # Conversational engine + prompt injection defenses
│   │   │   ├── humor_service.py     # Sentiment analysis & contextual humor rules
│   │   │   ├── tools.py             # Tool calling definitions & backend executors
│   │   │   ├── order_service.py     # Order verification & customer authorization
│   │   │   ├── return_service.py    # 30-day return eligibility evaluation
│   │   │   ├── escalation_service.py# Automatic ticket creation & summary generation
│   │   │   └── knowledge_service.py # Verified policy search & RAG retrieval
│   │   ├── api/                     # REST API Routers
│   │   │   ├── chat.py              # POST /api/chat, GET /api/conversations/{id}
│   │   │   ├── orders.py            # GET /api/orders, GET /api/orders/{id}
│   │   │   ├── returns.py           # POST /api/returns, GET /api/returns/check/{id}
│   │   │   ├── tickets.py           # GET /api/tickets, PATCH /api/tickets/{id}
│   │   │   ├── knowledge.py         # Full CRUD on knowledge base articles
│   │   │   ├── analytics.py         # Genuine operational analytics & trends
│   │   │   └── feedback.py          # Customer CSAT submission
│   │   └── tests/                   # Pytest automated test suite (30 scenarios)
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── SupportOrb.tsx       # Three.js 3D Astra Orb with custom GLSL shaders & inertia
│   │   │   │   ├── shaders.ts           # Custom GLSL vertex & fragment shaders (Simplex 3D noise, mouse ripples)
│   │   │   │   └── HeroShowcase.tsx     # GSAP ScrollTrigger landing showcase with 3D assistant
│   │   │   ├── Header.tsx               # Neo-Brutalism header with view toggle
│   │   │   ├── ChatInterface.tsx        # Customer chat canvas with docked 3D Astra companion
│   │   │   ├── QuickActions.tsx         # Hero banner and action cards
│   │   │   ├── MessageBubble.tsx        # Bubbles with tool breakdown drawers
│   │   │   ├── TypingIndicator.tsx      # Humorous animated thinking indicator
│   │   │   ├── FeedbackModal.tsx        # CSAT review modal
│   │   │   ├── ReturnModal.tsx          # Return eligibility & label wizard
│   │   │   ├── TicketModal.tsx          # Customer escalation ticket inspector
│   │   │   ├── TicketDetailModal.tsx    # Agent desk ticket response composer
│   │   │   ├── OrderDetailModal.tsx     # Demo order inspector modal
│   │   │   ├── KnowledgeManager.tsx     # Knowledge base article manager
│   │   │   └── AdminDashboard.tsx       # Order desk, analytics, and queue manager
│   │   ├── ui/
│   │   │   ├── NeoButton.tsx            # Tactile mechanical button
│   │   │   ├── NeoCard.tsx              # Shadowed card container
│   │   │   ├── NeoBadge.tsx             # Bold status sticker
│   │   │   └── NeoInput.tsx             # High-contrast form field
│   │   ├── services/
│   │   │   └── api.ts                   # Type-safe API client
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript interfaces
│   │   ├── index.css                    # Neo-Brutalism Tailwind directives & variables
│   │   └── App.tsx                      # Main router and state manager
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## 🔮 Interactive 3D Design: GPT-6 Astra-Inspired Assistant Core

Inspired by the organic visual language of [OpenAI Astra](https://openai.com/index/gpt-6-astra/), Sidekick AI features a floating liquid-metal 3D assistant core:

### 1. Custom GLSL Vertex Shaders & Real-Time Physics
* **Simplex 3D Noise**: Continuous organic liquid surface movement that avoids repetitive baked loop cycles.
* **Cursor Proximity Vertex Displacement**: When the cursor approaches the 3D orb, the vertex shader calculates distance and pushes vertices outward/inward, bulging and rippling toward the pointer.
* **Velocity & Inertia Tracking**: Fast cursor movements amplify displacement strength; when the cursor leaves, a spring-back damping algorithm smoothly restores the baseline equilibrium.
* **Sound-Wave Ripples (`uSpeechWave`)**: Concentric surface ripples emit across normal vectors synchronized with AI speech and response formulation.

### 2. Chat-Aware 3D Neural State Synchronization
The 3D Orb's shader uniforms and material properties are directly wired to real backend application events:
* **`idle`**: Warm golden/iridescent metallic breathing and gentle axial rotation.
* **`waiting`**: Attentive subtle tilt and orientation tracking customer typing.
* **`processing`**: High-frequency surface ripples with a cool blue internal core pulse (`#4D7CFE`).
* **`generating`**: Fluid soundwave ripples synchronized with response synthesis.
* **`success`**: Vibrant electric lime pulse (`#B8F56A`) upon verified order lookup or approved return.
* **`error` / `not_found`**: Gentle warm amber pulse without alarming the customer.
* **`escalated`**: High-energy coral red alert state (`#FF6B6B`) indicating handoff to a human support agent.

### 3. GSAP ScrollTrigger Integration
* As users scroll through the landing page, GSAP's `ScrollTrigger` smoothly transforms the 3D Orb from center-stage in the `HeroShowcase` into a docked companion position in the `ChatInterface`.
* Reverse scrolling restores the hero perspective smoothly without jarring page pins or obstructing message feeds.

### 4. Accessibility & Performance Safeguards
* **WebGL Fallback**: Graceful fallback to a lightweight animated SVG assistant if WebGL is unavailable.
* **`prefers-reduced-motion`**: Automatically detected; switches to low-intensity static rendering when requested by the OS.
* **`IntersectionObserver` Rendering Pause**: Completely suspends the Three.js `requestAnimationFrame` loop when the canvas is off-screen.
* **Mobile Touch Support**: Supports single-finger drag and touch proximity deformation.


## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.11+** installed (`python --version`)
- **Node.js 18+** & **npm** installed (`node --version`)

---

### Step 1: Backend Setup (Python FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Note: To run in **Intelligent Demo Mode**, keep `OPENAI_API_KEY=` blank. The system will use its built-in local inference and tool calling engine. To connect live OpenAI GPT-4o-mini, paste your API key.*

5. Run the automated Pytest test suite:
   ```bash
   python -m pytest -v
   ```
   *(All 18 comprehensive test scenarios will run and pass).*

6. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Backend will be running at `http://127.0.0.1:8000`. You can explore interactive Swagger API docs at `http://127.0.0.1:8000/docs`.

---

### Step 2: Frontend Setup (React + Vite + Tailwind CSS)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173/
   ```

---

## 🧪 Comprehensive QA Test Scenarios (30/30 Passed)

The backend includes two dedicated test suites (`backend/app/tests/test_all_flows.py` and `backend/app/tests/test_demo_orders.py`) validating all 30 customer journeys and demonstration scenarios:
* **Core Flows Test Suite** (`test_all_flows.py`): 18 comprehensive tests covering orders, prompt injection, human handoff, feedback, and sentiment.
* **Demo Orders Test Suite** (`test_demo_orders.py`): 12 targeted tests verifying every demo order scenario (`ORD-DEMO-1001` through `ORD-DEMO-1013`), cancellation, refund tracking, and payment issue escalation.

To execute the full test suite:
```bash
cd backend
python -m pytest app/tests
```

---

## 📦 Realistic Seed Data & Demo Orders Seeding

The database includes automated seeding for retail demo orders. To seed or re-verify demo records at any time:
```bash
# From the backend directory
python -m app.seed_demo_orders
```

This populates the 13 comprehensive demonstration orders (`ORD-DEMO-1001` to `ORD-DEMO-1013`) with full support notes, shipping carriers, masked payments, return requests, and escalation tickets. Full documentation is provided in [DEMO_ORDERS_README.md](DEMO_ORDERS_README.md).

---

## 🛡️ Security & Privacy Guardrails

1. **Prompt Injection Mitigation**: Regex and semantic token screening blocks prompt-override patterns (e.g. *"ignore previous instructions"*).
2. **Payment Card & Credential Defense**: The assistant never solicits or stores credit card CVVs, full card numbers, passwords, or one-time passcodes (OTPs).
3. **Authorization Isolation**: Orders cannot be retrieved without validating matching customer credentials.
4. **Environment Isolation**: Secret keys are never bundled in client-side code; all external interactions route through the Python backend.

---

## 🎓 College Demonstration & Evaluation Highlights

When showcasing this project for academic review or portfolio presentation:
1. **Highlight the Visual Identity**: Point out that the frontend is not another bland SaaS template — it implements a bespoke Neo-Brutalism design system with custom CSS variables, tactile mechanical buttons, and custom shadows.
2. **Demonstrate Grounded Tool Calling**: Show the customer chat, click `ORD-1001`, and expand the **"1 Verified Database Tool Called"** dropdown to prove that answers come directly from SQLAlchemy database models.
3. **Demonstrate Humor & Empathy Control**:
   - Send *"Where is my order? It's been 5 days!"* ➡️ Observe the witty response.
   - Send *"Your service is terrible. I've been waiting for hours!"* ➡️ Observe that jokes are **instantly suppressed** in favor of calm, validating empathy.
4. **Demonstrate Human Handoff**: Ask to *"speak to a human"* or file a duplicate charge complaint. Observe the ticket number generated (`#TCK-XXXX`), switch to the **Agent Desk**, find the ticket, inspect the conversation history, and post an agent reply!
5. **Demonstrate Analytics & Knowledge Management**: Show real-time CSAT scores, resolution trends with Recharts, and create a new store policy live.

---

## 📜 License
Developed for educational demonstration, portfolio presentation, and modern retail customer support innovation. Licensed under the MIT License.
