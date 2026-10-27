import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Ticket,
  Filter,
  BarChart2,
  BookOpen,
  RefreshCw,
  Eye,
  Package,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { AnalyticsData, SupportTicket, Order } from '../types';
import { api } from '../services/api';
import { NeoCard } from './ui/NeoCard';
import { NeoBadge } from './ui/NeoBadge';
import { NeoButton } from './ui/NeoButton';
import { TicketDetailModal } from './TicketDetailModal';
import { KnowledgeManager } from './KnowledgeManager';
import { OrderDetailModal } from './OrderDetailModal';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders' | 'knowledge'>('tickets');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Orders desk state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [demoFilter, setDemoFilter] = useState<'all' | 'demo' | 'prod'>('demo');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Inspector modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, demoFilter, orderStatusFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ticketsRes] = await Promise.all([
        api.getAnalytics(),
        api.getTickets({
          status: statusFilter,
          category: categoryFilter,
        }),
      ]);
      setAnalytics(analyticsRes);
      setTickets(ticketsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const isDemoParam = demoFilter === 'all' ? undefined : demoFilter === 'demo';
      const fetchedOrders = await api.getOrders({
        is_demo: isDemoParam,
        query: orderSearch.trim() || undefined,
        status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined,
      });
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Top Controls & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-[#171717] pb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest bg-[#FFE156] border-[2px] border-[#171717] px-2.5 py-0.5 rounded-[2px] shadow-[2px_2px_0_#171717]">
            COMMAND CENTER
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">AGENT & ANALYTICS DESK</h2>
          <p className="text-xs font-bold text-stone-600">
            Real operational metrics, intelligent AI resolution rates, and human handoff queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex border-[3px] border-[#171717] rounded-[4px] overflow-hidden shadow-[3px_3px_0_#171717] bg-white">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase transition-colors ${
                activeTab === 'tickets' ? 'bg-[#FFE156] text-[#171717]' : 'hover:bg-stone-100'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Tickets & Analytics</span>
            </button>
            <div className="w-[2px] bg-[#171717]"></div>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase transition-colors ${
                activeTab === 'orders' ? 'bg-[#B8F56A] text-[#171717]' : 'hover:bg-stone-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Demo Orders & Retail Desk</span>
            </button>
            <div className="w-[2px] bg-[#171717]"></div>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase transition-colors ${
                activeTab === 'knowledge' ? 'bg-[#4D7CFE] text-white' : 'hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Base</span>
            </button>
          </div>

          <NeoButton variant="white" size="sm" onClick={loadDashboardData} title="Refresh Data">
            <RefreshCw className="w-4 h-4" />
          </NeoButton>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <>
          {/* 6 Key Operational Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 1. Total Conversations */}
            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Total Conversations
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {analytics?.total_conversations || 0}
              </p>
              <NeoBadge variant="blue" className="mt-2 text-[9px]">
                <Users className="w-3 h-3 mr-0.5" />
                CUSTOMER ACTIVE
              </NeoBadge>
            </NeoCard>

            {/* 2. AI Resolution Rate */}
            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                AI Resolution Rate
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {analytics?.ai_resolution_rate || 0}%
              </p>
              <NeoBadge variant="lime" className="mt-2 text-[9px]">
                <CheckCircle className="w-3 h-3 mr-0.5" />
                AUTOMATED RESOLVE
              </NeoBadge>
            </NeoCard>

            {/* 3. Response Time */}
            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Avg Response Time
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {analytics?.avg_response_time_sec || 0}s
              </p>
              <NeoBadge variant="yellow" className="mt-2 text-[9px]">
                <Clock className="w-3 h-3 mr-0.5" />
                SUB-SECOND LATENCY
              </NeoBadge>
            </NeoCard>

            {/* 4. Human Escalation Rate */}
            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Human Escalation
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {analytics?.human_escalation_rate || 0}%
              </p>
              <NeoBadge variant="coral" className="mt-2 text-[9px]">
                <AlertTriangle className="w-3 h-3 mr-0.5" />
                TIER-2 HANDOFF
              </NeoBadge>
            </NeoCard>

            {/* 5. CSAT Score */}
            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Customer CSAT
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {analytics?.csat_score ? analytics.csat_score.toFixed(2) : '5.0'}★
              </p>
              <NeoBadge variant="yellow" className="mt-2 text-[9px]">
                <Star className="w-3 h-3 mr-0.5 fill-[#171717]" />
                HIGH SATISFACTION
              </NeoBadge>
            </NeoCard>

            {/* 6. Open Tickets */}
            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Open Tickets
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {analytics?.open_tickets_count || 0}
              </p>
              <NeoBadge variant="coral" className="mt-2 text-[9px]">
                <Ticket className="w-3 h-3 mr-0.5" />
                LIVE QUEUE
              </NeoBadge>
            </NeoCard>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resolution Trends Chart */}
            <div className="p-5 bg-white border-[3px] border-[#171717] rounded-[6px] shadow-[6px_6px_0_#171717]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-sm uppercase flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-[#4D7CFE]" />
                  Resolution Trends (Weekly)
                </h4>
                <span className="text-[10px] font-black uppercase bg-[#F3EFE6] px-2 py-0.5 border border-[#171717] rounded">
                  Grounded Data
                </span>
              </div>
              <div className="h-64 w-full">
                {analytics?.recent_trend ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.recent_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0ded6" />
                      <XAxis dataKey="day" stroke="#171717" fontSize={11} fontWeight={800} />
                      <YAxis stroke="#171717" fontSize={11} fontWeight={800} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFDF5',
                          border: '3px solid #171717',
                          borderRadius: '4px',
                          boxShadow: '4px 4px 0 #171717',
                          fontWeight: 800,
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="conversations" fill="#FFE156" stroke="#171717" strokeWidth={2} name="Total Inquiries" />
                      <Bar dataKey="ai_resolved" fill="#B8F56A" stroke="#171717" strokeWidth={2} name="AI Resolved" />
                      <Bar dataKey="escalated" fill="#FF6B6B" stroke="#171717" strokeWidth={2} name="Escalated to Agent" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* Top FAQs & Sentiment Summary */}
            <div className="p-5 bg-white border-[3px] border-[#171717] rounded-[6px] shadow-[6px_6px_0_#171717] flex flex-col justify-between">
              <div>
                <h4 className="font-black text-sm uppercase mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#FFE156]" />
                  Frequently Handled Topics
                </h4>
                <div className="space-y-2">
                  {analytics?.faq_frequency?.map((faq, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#FFFDF5] border-[2px] border-[#171717] rounded-[3px] shadow-[2px_2px_0_#171717]"
                    >
                      <span className="text-xs font-black">{faq.topic}</span>
                      <span className="text-xs font-mono font-bold bg-[#FFE156] px-2 py-0.5 border border-[#171717] rounded">
                        {faq.inquiries} inquiries
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Badges */}
              <div className="mt-4 pt-3 border-t-[2px] border-[#171717] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-stone-600">Sentiment Distribution:</span>
                <div className="flex items-center gap-2">
                  <NeoBadge variant="lime">
                    POS: {analytics?.sentiment_distribution?.positive || 14}
                  </NeoBadge>
                  <NeoBadge variant="yellow">
                    NEU: {analytics?.sentiment_distribution?.neutral || 22}
                  </NeoBadge>
                  <NeoBadge variant="coral">
                    FRUST: {analytics?.sentiment_distribution?.frustrated || 2}
                  </NeoBadge>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Queue Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-[#FF6B6B]" />
                  HUMAN SUPPORT QUEUE
                </h3>
                <p className="text-xs font-bold text-stone-600">
                  Inspect pending escalations, update statuses, and directly message customers.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-white border-[2px] border-[#171717] rounded-[3px] p-1 shadow-[2px_2px_0_#171717]">
                  <Filter className="w-3.5 h-3.5 text-stone-500 ml-1" />
                  <span className="text-[10px] font-black uppercase mr-1">Status:</span>
                  {['all', 'open', 'queued', 'in_progress', 'resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        statusFilter === st
                          ? 'bg-[#FFE156] text-[#171717] border border-[#171717]'
                          : 'hover:bg-stone-100 text-stone-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2 py-1.5 bg-white border-[2px] border-[#171717] rounded-[3px] font-black text-xs uppercase shadow-[2px_2px_0_#171717] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="order">Orders</option>
                  <option value="return">Returns</option>
                  <option value="payment">Payments</option>
                  <option value="technical">Technical</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {/* Tickets Table / Cards */}
            <div className="border-[3px] border-[#171717] rounded-[6px] shadow-[6px_6px_0_#171717] bg-white overflow-hidden">
              {loading ? (
                <div className="py-12 text-center font-black text-xs uppercase animate-pulse">
                  Loading Support Queue...
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-12 text-center font-bold text-sm text-stone-500">
                  No tickets match the selected criteria. All customer cases resolved! 🎉
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-bold border-collapse">
                    <thead className="bg-[#FFE156] border-b-[3px] border-[#171717] uppercase tracking-wider text-[#171717]">
                      <tr>
                        <th className="p-3.5">Ticket ID</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Subject & AI Summary</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Priority</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Assigned Agent</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[2px] divide-[#171717]">
                      {tickets.map((t) => (
                        <tr
                          key={t.id}
                          className="hover:bg-[#FFFDF5] transition-colors cursor-pointer"
                          onClick={() => handleOpenTicket(t)}
                        >
                          <td className="p-3.5 font-mono font-black text-sm text-[#4D7CFE]">
                            {t.ticket_number}
                          </td>
                          <td className="p-3.5">
                            <div>{t.customer_name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">{t.customer_email}</div>
                          </td>
                          <td className="p-3.5 max-w-xs truncate">
                            <span className="font-black text-[#171717] block">{t.subject}</span>
                            <span className="text-stone-600 font-normal truncate block">{t.summary}</span>
                          </td>
                          <td className="p-3.5 uppercase font-black text-[11px]">
                            {t.category}
                          </td>
                          <td className="p-3.5">
                            <NeoBadge
                              variant={
                                t.priority === 'urgent'
                                  ? 'coral'
                                  : t.priority === 'high'
                                  ? 'yellow'
                                  : 'white'
                              }
                            >
                              {t.priority.toUpperCase()}
                            </NeoBadge>
                          </td>
                          <td className="p-3.5">
                            <NeoBadge
                              variant={
                                t.status === 'resolved'
                                  ? 'lime'
                                  : t.status === 'in_progress'
                                  ? 'yellow'
                                  : 'coral'
                              }
                            >
                              {t.status.toUpperCase()}
                            </NeoBadge>
                          </td>
                          <td className="p-3.5 font-bold text-stone-700">
                            {t.assigned_agent || (
                              <span className="text-stone-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTicket(t);
                              }}
                              className="px-2.5 py-1 bg-[#171717] text-white hover:bg-[#FFE156] hover:text-[#171717] border-[2px] border-[#171717] rounded-[2px] text-xs font-black uppercase transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : activeTab === 'orders' ? (
        /* Orders Desk & Demo Catalogue View */
        <div className="space-y-6">
          {/* Top Demo Order Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Total Demo Orders
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {orders.filter((o) => o.is_demo).length || 13}
              </p>
              <NeoBadge variant="lime" className="mt-2 text-[9px]">
                <Package className="w-3 h-3 mr-0.5" />
                SEEDED & GROUNDED
              </NeoBadge>
            </NeoCard>

            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Delivered & Return Eligible
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {orders.filter((o) => o.status === 'delivered' && o.return_eligibility).length}
              </p>
              <NeoBadge variant="lime" className="mt-2 text-[9px]">
                <CheckCircle className="w-3 h-3 mr-0.5" />
                30-DAY WINDOW
              </NeoBadge>
            </NeoCard>

            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Shipped & Delayed
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {orders.filter((o) => ['shipped', 'delayed'].includes(o.status)).length}
              </p>
              <NeoBadge variant="coral" className="mt-2 text-[9px]">
                <Clock className="w-3 h-3 mr-0.5" />
                COURIER TRACKING
              </NeoBadge>
            </NeoCard>

            <NeoCard variant="white" shadowSize="sm" className="p-4">
              <span className="text-[11px] font-black uppercase text-stone-600 block">
                Refunds & Payment Holds
              </span>
              <p className="text-3xl font-black mt-2 text-[#171717]">
                {orders.filter((o) => ['refund_pending', 'refunded', 'failed', 'duplicate_hold', 'security_hold'].includes(o.payment_status || '')).length}
              </p>
              <NeoBadge variant="yellow" className="mt-2 text-[9px]">
                <AlertTriangle className="w-3 h-3 mr-0.5" />
                HANDOFF ELIGIBLE
              </NeoBadge>
            </NeoCard>
          </div>

          {/* Search & Filter Header */}
          <div className="p-4 bg-white border-[3px] border-[#171717] rounded-[6px] shadow-[4px_4px_0_#171717] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#4D7CFE]" />
                  RETAIL ORDER CATALOGUE
                </h3>
                <p className="text-xs font-bold text-stone-600">
                  Inspect simulated customer orders, courier events, returns, and payment states.
                </p>
              </div>

              {/* Demo vs Real Filter Toggle */}
              <div className="flex items-center gap-1 bg-[#F3EFE6] border-[2px] border-[#171717] rounded-[4px] p-1 shadow-[2px_2px_0_#171717]">
                <button
                  onClick={() => setDemoFilter('demo')}
                  className={`text-xs font-black uppercase px-3 py-1 rounded-[2px] transition-colors ${
                    demoFilter === 'demo'
                      ? 'bg-[#FFE156] text-[#171717] border border-[#171717] shadow-[1px_1px_0_#171717]'
                      : 'hover:bg-white text-stone-600'
                  }`}
                >
                  Demo Orders ({orders.filter((o) => o.is_demo).length})
                </button>
                <button
                  onClick={() => setDemoFilter('all')}
                  className={`text-xs font-black uppercase px-3 py-1 rounded-[2px] transition-colors ${
                    demoFilter === 'all'
                      ? 'bg-[#FFE156] text-[#171717] border border-[#171717] shadow-[1px_1px_0_#171717]'
                      : 'hover:bg-white text-stone-600'
                  }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setDemoFilter('prod')}
                  className={`text-xs font-black uppercase px-3 py-1 rounded-[2px] transition-colors ${
                    demoFilter === 'prod'
                      ? 'bg-[#FFE156] text-[#171717] border border-[#171717] shadow-[1px_1px_0_#171717]'
                      : 'hover:bg-white text-stone-600'
                  }`}
                >
                  Production Only
                </button>
              </div>
            </div>

            {/* Search Input & Status Filter */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order ID (e.g. ORD-DEMO-1001) or customer name..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border-[2px] border-[#171717] rounded-[3px] text-xs font-bold shadow-[2px_2px_0_#171717] focus:outline-none"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border-[2px] border-[#171717] rounded-[3px] text-xs font-black uppercase shadow-[2px_2px_0_#171717] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="shipped">Shipped</option>
                <option value="processing">Processing</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="manual_review">Manual Review</option>
              </select>

              <NeoButton type="submit" variant="yellow" size="sm">
                Filter
              </NeoButton>
              <NeoButton
                type="button"
                variant="white"
                size="sm"
                onClick={() => {
                  setOrderSearch('');
                  setOrderStatusFilter('all');
                  setDemoFilter('demo');
                  loadOrders();
                }}
              >
                Reset
              </NeoButton>
            </form>
          </div>

          {/* Orders Table */}
          <div className="border-[3px] border-[#171717] rounded-[6px] shadow-[6px_6px_0_#171717] bg-white overflow-hidden">
            {ordersLoading ? (
              <div className="py-12 text-center font-black text-xs uppercase animate-pulse">
                Loading Order Catalogue...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center font-bold text-sm text-stone-500">
                No orders found matching the filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold border-collapse">
                  <thead className="bg-[#B8F56A] border-b-[3px] border-[#171717] uppercase tracking-wider text-[#171717]">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer & Account</th>
                      <th className="p-3.5">Product & SKU</th>
                      <th className="p-3.5">Order Status</th>
                      <th className="p-3.5">Payment State</th>
                      <th className="p-3.5">Return Status</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-[2px] divide-[#171717]">
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-[#FFFDF5] transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="p-3.5 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-[#4D7CFE]">
                              {o.order_number}
                            </span>
                            {o.is_demo && (
                              <span className="text-[9px] font-black uppercase bg-[#FFE156] px-1.5 py-0.5 border border-[#171717] rounded">
                                DEMO
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500 block">
                            {new Date(o.order_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-black text-[#171717]">{o.customer_name}</div>
                          <div className="text-[10px] text-stone-500 font-mono">{o.customer_email}</div>
                        </td>
                        <td className="p-3.5 max-w-[200px] truncate">
                          <span className="block font-black truncate">
                            {o.items?.[0]?.product_name || 'Retail Product'}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {o.items?.[0]?.sku || 'SKU-RETAIL'} (Qty: {o.items?.[0]?.quantity || 1})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <NeoBadge
                            variant={
                              o.status === 'delivered'
                                ? 'lime'
                                : o.status === 'shipped'
                                ? 'blue'
                                : o.status === 'delayed'
                                ? 'coral'
                                : o.status === 'processing'
                                ? 'yellow'
                                : 'dark'
                            }
                          >
                            {o.status.toUpperCase()}
                          </NeoBadge>
                        </td>
                        <td className="p-3.5">
                          <NeoBadge
                            variant={
                              o.payment_status === 'paid'
                                ? 'lime'
                                : ['failed', 'duplicate_hold', 'security_hold'].includes(o.payment_status || '')
                                ? 'coral'
                                : 'yellow'
                            }
                          >
                            {(o.payment_status || 'paid').toUpperCase()}
                          </NeoBadge>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 border border-[#171717] rounded ${
                              o.return_eligibility ? 'bg-[#B8F56A]' : 'bg-[#F3EFE6] text-stone-500'
                            }`}
                          >
                            {o.return_eligibility ? 'Eligible' : 'Ineligible'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-black text-sm">
                          ${o.total_amount.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(o);
                            }}
                            className="px-2.5 py-1 bg-[#171717] text-white hover:bg-[#FFE156] hover:text-[#171717] border-[2px] border-[#171717] rounded-[2px] text-xs font-black uppercase transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <KnowledgeManager />
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        associatedTickets={tickets.filter((t) => t.order_id === selectedOrder?.order_number)}
        onOpenTicket={(t) => {
          setSelectedOrder(null);
          setSelectedTicket(t);
        }}
      />

      {/* Ticket Inspector Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        onTicketUpdated={() => {
          loadDashboardData();
        }}
      />
    </div>
  );
};
