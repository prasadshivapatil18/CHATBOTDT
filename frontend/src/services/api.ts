import type { Order, SupportTicket, KnowledgeArticle, AnalyticsData } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Chat
  sendMessage: async (data: {
    conversation_id?: number | null;
    session_id: string;
    message: string;
    customer_name?: string;
    customer_email?: string;
  }) => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send message');
    }
    return res.json();
  },

  getConversationHistory: async (conversationId: number) => {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}`);
    return res.json();
  },

  // Orders
  getOrders: async (filters?: { is_demo?: boolean; query?: string; status?: string }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.is_demo !== undefined) params.append('is_demo', String(filters.is_demo));
    if (filters?.query) params.append('query', filters.query);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
    return res.json();
  },

  getOrderByNumber: async (orderNumber: string, email?: string): Promise<Order> => {
    const url = email
      ? `${API_BASE}/orders/${orderNumber}?email=${encodeURIComponent(email)}`
      : `${API_BASE}/orders/${orderNumber}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Order ${orderNumber} not found.`);
    }
    return res.json();
  },

  // Returns
  checkReturnEligibility: async (orderNumber: string) => {
    const res = await fetch(`${API_BASE}/returns/check/${orderNumber}`);
    return res.json();
  },

  submitReturnRequest: async (data: {
    order_number: string;
    reason: string;
    item_details?: string;
    customer_email?: string;
  }) => {
    const res = await fetch(`${API_BASE}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Return request failed');
    }
    return res.json();
  },

  // Tickets
  getTickets: async (filters?: { status?: string; category?: string; priority?: string }): Promise<SupportTicket[]> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);

    const res = await fetch(`${API_BASE}/tickets?${params.toString()}`);
    return res.json();
  },

  getTicketById: async (id: number): Promise<SupportTicket> => {
    const res = await fetch(`${API_BASE}/tickets/${id}`);
    return res.json();
  },

  createTicket: async (data: {
    conversation_id?: number | null;
    customer_name?: string;
    customer_email?: string;
    category: string;
    priority: string;
    subject: string;
    summary: string;
    order_id?: string;
  }): Promise<SupportTicket> => {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateTicket: async (id: number, data: Partial<SupportTicket>): Promise<SupportTicket> => {
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  addTicketResponse: async (id: number, data: { sender_name: string; sender_role: string; message: string }) => {
    const res = await fetch(`${API_BASE}/tickets/${id}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Knowledge Base
  getKnowledgeArticles: async (query?: string): Promise<KnowledgeArticle[]> => {
    const url = query ? `${API_BASE}/knowledge?q=${encodeURIComponent(query)}` : `${API_BASE}/knowledge`;
    const res = await fetch(url);
    return res.json();
  },

  createKnowledgeArticle: async (data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    const res = await fetch(`${API_BASE}/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateKnowledgeArticle: async (id: number, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    const res = await fetch(`${API_BASE}/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteKnowledgeArticle: async (id: number) => {
    const res = await fetch(`${API_BASE}/knowledge/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  // Feedback
  submitFeedback: async (data: {
    conversation_id?: number | null;
    ticket_id?: number | null;
    rating: number;
    comment?: string;
    resolved_satisfactorily: boolean;
  }) => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getFeedbackList: async () => {
    const res = await fetch(`${API_BASE}/feedback`);
    return res.json();
  },
};
