export interface ToolCall {
  tool_name: string;
  arguments: Record<string, any>;
  output: Record<string, any>;
}

export interface ChatMessage {
  id: string | number;
  sender: 'customer' | 'ai' | 'agent' | 'system';
  content: string;
  sentiment?: 'positive' | 'neutral' | 'frustrated' | 'negative';
  humor_used?: boolean;
  tools_called?: ToolCall[];
  suggested_actions?: string[];
  ticket_number?: string | null;
  ticket_summary?: string | null;
  is_escalated?: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id?: number;
  sku?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status?: string;
  payment_method?: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  cancellation_status?: string;
  return_eligibility?: boolean;
  return_status?: string;
  refund_amount?: number;
  refund_status?: string;
  support_notes?: string;
  is_demo?: boolean;
  order_date: string;
  total_amount: number;
  shipping_address: string;
  items: OrderItem[];
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  conversation_id?: number;
  customer_name: string;
  customer_email: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  summary: string;
  order_id?: string;
  assigned_agent?: string;
  queue_position?: number;
  created_at: string;
  updated_at: string;
  responses: TicketResponse[];
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  category: string;
  keywords: string;
  content: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  total_conversations: number;
  ai_resolution_rate: number;
  avg_response_time_sec: number;
  human_escalation_rate: number;
  csat_score: number;
  open_tickets_count: number;
  sentiment_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  recent_trend: Array<{ day: string; conversations: number; ai_resolved: number; escalated: number }>;
  faq_frequency: Array<{ topic: string; inquiries: number }>;
}
