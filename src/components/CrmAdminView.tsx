import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Bot, 
  UserCheck, 
  Send, 
  User, 
  Building2, 
  ExternalLink, 
  Bell, 
  Sparkles,
  Filter,
  CheckCheck,
  BarChart3,
  TrendingUp,
  BookOpen,
  Activity
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { OnlineEngineerSession } from '../types';
import { formatChatMessage } from '../utils/chatTextFormatter';
import { BotSettingsView } from './crm/BotSettingsView';
import { NotificationSettingsView } from './notifications/NotificationSettingsView';
import { CrmRealtimeLogsView } from './crm/CrmRealtimeLogsView';
import { CrmAnalyticsDashboard } from './crm/CrmAnalyticsDashboard';
import { AssetsManagerView } from './crm/AssetsManagerView';
import { TelephonyCallsTab } from './crm/TelephonyCallsTab';
import { Image, Calendar } from 'lucide-react';

export function CrmAdminView() {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'chats' | 'rfqs' | 'tickets' | 'telephony' | 'bot-settings' | 'notifications' | 'assets' | 'logs' | 'all'>('analytics');
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<OnlineEngineerSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [managerReplyText, setManagerReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'handover' | 'active' | 'resolved'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [r, t, chatsRes] = await Promise.all([
        apiService.getServiceRequests(),
        apiService.getB2BTickets(),
        apiService.getEngineerChatSessions()
      ]);
      const seenR = new Set<string>();
      const uniqueR = (r || []).filter((item: any) => {
        if (!item?.id || seenR.has(item.id)) return false;
        seenR.add(item.id);
        return true;
      });
      setRfqs(uniqueR);

      const seenT = new Set<string>();
      const uniqueT = (t || []).filter((item: any) => {
        if (!item?.id || seenT.has(item.id)) return false;
        seenT.add(item.id);
        return true;
      });
      setTickets(uniqueT);
      if (chatsRes.success && Array.isArray(chatsRes.data)) {
        setChatSessions(chatsRes.data);
        setUnreadChatCount(chatsRes.unreadCount || 0);
        if (!selectedChatId && chatsRes.data.length > 0) {
          setSelectedChatId(chatsRes.data[0].id);
        }
      }
    } catch (e) {
      console.error('Error loading CRM data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchData();
    // Poll for new chats every 2.5 seconds in CRM view for rapid manager interaction
    const timer = setInterval(async () => {
      try {
        const res = await apiService.getEngineerChatSessions();
        if (res.success && Array.isArray(res.data)) {
          setChatSessions(res.data);
          setUnreadChatCount(res.unreadCount || 0);
        }
      } catch (e) {}
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateRfqStatus = async (id: string, status: string) => {
    const success = await apiService.updateServiceRequestStatus(id, status);
    if (success) {
      setRfqs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: string) => {
    const success = await apiService.updateB2BTicketStatus(id, status);
    if (success) {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    }
  };

  const handleUpdateChatStatus = async (sessionId: string, status: string) => {
    const res = await apiService.updateEngineerChatStatus(sessionId, status);
    if (res.success && res.data) {
      setChatSessions(prev => prev.map(s => s.id === sessionId ? res.data! : s));
    }
  };

  const handleClaimChat = async (sessionId: string) => {
    try {
      const res = await apiService.claimEngineerChatSession(sessionId, 'Ведущий инженер «ДС‑Инжиниринг»');
      if (res.success && res.data) {
        setChatSessions(prev => prev.map(s => s.id === sessionId ? res.data! : s));
        setUnreadChatCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Failed to claim chat session', e);
    }
  };

  const handleSendManagerReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !managerReplyText.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await apiService.sendManagerChatReply(selectedChatId, managerReplyText.trim(), 'Дежурный инженер «ДС‑Инжиниринг»');
      if (res.success && res.data) {
        setChatSessions(prev => prev.map(s => s.id === selectedChatId ? res.data! : s));
        setManagerReplyText('');
        setTimeout(scrollToBottom, 50);
      }
    } catch (e) {
      console.error('Failed to send manager reply', e);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedChatId(sessionId);
    apiService.markEngineerChatRead(sessionId).then(() => {
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, unreadByManager: false } : s));
      setUnreadChatCount(prev => Math.max(0, prev - 1));
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new':
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_customer': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': 
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedSession = chatSessions.find(s => s.id === selectedChatId);

  const filteredChatSessions = chatSessions.filter(s => {
    if (chatFilter === 'handover') return s.status === 'handover_requested';
    if (chatFilter === 'active') return s.status === 'active' || s.status === 'manager_connected';
    if (chatFilter === 'resolved') return s.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* CRM Header & Notifications Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">CRM & Обращения клиентов</h2>
              {unreadChatCount > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                  <Bell className="w-3 h-3" />
                  {unreadChatCount} новых в чате
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Входящие диалоги с виджета «Онлайн-инженер», заявки из онлайн-калькулятора и сервисные обращения клиентов
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-gray-100 text-slate-500 rounded-xl text-xs sm:text-sm font-medium transition-colors border border-gray-200 ${isLoading ? 'opacity-50' : ''}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Обновить данные</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-gray-100 text-xs sm:text-sm">
          <button
            id="crm-subtab-analytics"
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Аналитика & Воронка лидов</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'analytics' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Recharts
            </span>
          </button>

          <button
            id="crm-subtab-chats"
            onClick={() => setActiveSubTab('chats')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'chats'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Онлайн-инженер: Диалоги</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSubTab === 'chats' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {chatSessions.length}
            </span>
            {unreadChatCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('rfqs')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'rfqs'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Заявки с калькулятора (Лиды)</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSubTab === 'rfqs' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {rfqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'tickets'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>B2B Служба поддержки</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSubTab === 'tickets' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {tickets.length}
            </span>
          </button>

          <button
            id="crm-subtab-telephony"
            onClick={() => setActiveSubTab('telephony')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'telephony'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Телефония & SIP-звонки</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'telephony' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-emerald-100 text-emerald-800'
            }`}>
              SIP
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'all'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <span>Сводная панель (Все вместе)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bot-settings')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'bot-settings'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>База ответов бота</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'notifications'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Оповещения и каналы связи</span>
          </button>

          <button
            onClick={() => setActiveSubTab('assets')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'assets'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <Image className="w-4 h-4 text-teal-500" />
            <span>Логотипы и Печати</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4.5 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'logs'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Live-Логи и Аудит БД</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 0: ANALYTICS & LEAD GENERATION DASHBOARD (RECHARTS) */}
      {(activeSubTab === 'analytics' || activeSubTab === 'all') && (
        <CrmAnalyticsDashboard />
      )}

      {/* SUBTAB 1: LIVE CHATS OF ONLINE ENGINEER */}
      {(activeSubTab === 'chats' || activeSubTab === 'all') && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  Диалоги модуля «Онлайн-инженер»
                </h3>
                <p className="text-xs text-gray-500">
                  Менеджер может в реальном времени отвечать посетителю сайта и переводить лид в сделку
                </p>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => setChatFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chatFilter === 'all' ? 'bg-blue-600 text-white font-medium' : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Все ({chatSessions.length})
              </button>
              <button
                onClick={() => setChatFilter('handover')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chatFilter === 'handover' ? 'bg-amber-600 text-white font-medium' : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                Вызов менеджера ({chatSessions.filter(s => s.status === 'handover_requested').length})
              </button>
              <button
                onClick={() => setChatFilter('active')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chatFilter === 'active' ? 'bg-blue-600 text-white font-medium' : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                В диалоге
              </button>
              <button
                onClick={() => setChatFilter('resolved')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chatFilter === 'resolved' ? 'bg-emerald-600 text-white font-medium' : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Завершенные
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 min-h-[560px]">
            {/* Left Column: Chat Sessions List */}
            <div className="xl:col-span-5 border-r border-gray-200 p-3 space-y-2 overflow-y-auto max-h-[640px] bg-slate-50/50">
              {filteredChatSessions.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Диалогов по выбранному фильтру нет
                </div>
              )}

              {filteredChatSessions.map((s) => {
                const isSelected = s.id === selectedChatId;
                const isHandover = s.status === 'handover_requested';
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {s.unreadByManager && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-ping"></span>
                        )}
                        <span className="font-bold text-gray-900 text-xs truncate max-w-[170px]">
                          {s.visitorName || 'Посетитель сайта'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Badge Status & Lead ID */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {isHandover ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <Bell className="w-3 h-3 text-amber-700" />
                          ВЫЗОВ МЕНЕДЖЕРА
                        </span>
                      ) : s.status === 'manager_connected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-900">
                          <UserCheck className="w-3 h-3 text-blue-700" />
                          Менеджер на связи
                        </span>
                      ) : s.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Завершен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-slate-500">
                          Диалог с ботом
                        </span>
                      )}

                      {s.leadId && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <FileText className="w-2.5 h-2.5" />
                          {s.leadId}
                        </span>
                      )}

                      {s.currentPage && (
                        <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                          Стр: {s.currentPage}
                        </span>
                      )}
                    </div>

                    {/* Contacts info snippet */}
                    {(s.contactPhone || s.contactEmail) && (
                      <div className="text-[11px] text-slate-500 mb-1.5 flex flex-wrap gap-2">
                        {s.contactPhone && (
                          <span className="font-semibold text-blue-700">{s.contactPhone}</span>
                        )}
                        {s.contactEmail && (
                          <span className="text-gray-500">{s.contactEmail}</span>
                        )}
                      </div>
                    )}

                    {/* Snippet */}
                    <p className="text-gray-500 text-[11px] line-clamp-2 italic">
                      "{s.lastMessageText || 'Диалог'}"
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Dialogue & Live Manager Console */}
            <div className="xl:col-span-7 flex flex-col bg-white">
              {selectedSession ? (
                <>
                  {/* Selected Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {selectedSession.visitorName || 'Посетитель сайта'}
                        </h4>
                        <span className="text-[11px] text-gray-400">({selectedSession.id})</span>
                        {selectedSession.leadId && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-bold text-xs rounded-md border border-blue-200 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-600" />
                            Заявка в CRM: {selectedSession.leadId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        {selectedSession.contactPhone ? (
                          <a
                            href={`tel:${selectedSession.contactPhone}`}
                            className="flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {selectedSession.contactPhone}
                          </a>
                        ) : (
                          <span className="text-gray-400">Телефон не указан</span>
                        )}
                        {selectedSession.contactEmail && (
                          <a
                            href={`mailto:${selectedSession.contactEmail}`}
                            className="flex items-center gap-1 text-slate-500 hover:underline"
                          >
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {selectedSession.contactEmail}
                          </a>
                        )}
                        {selectedSession.companyName && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {selectedSession.companyName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Claim Button & Status Dropdown */}
                    <div className="flex items-center gap-2">
                      {selectedSession.status !== 'manager_connected' && (
                        <button
                          onClick={() => handleClaimChat(selectedSession.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                          title="Подключиться к диалогу и ответить посетителю от имени менеджера"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Взять в работу</span>
                        </button>
                      )}
                      <select
                        value={selectedSession.status}
                        onChange={(e) => handleUpdateChatStatus(selectedSession.id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="active">Активен (бот)</option>
                        <option value="handover_requested">Вызов менеджера</option>
                        <option value="manager_connected">В диалоге с менеджером</option>
                        <option value="resolved">Завершен / Лид обработан</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70 max-h-[380px]">
                    <div className="text-center text-[10px] text-gray-400 uppercase tracking-wider my-1">
                      Начало диалога • {new Date(selectedSession.createdAt).toLocaleString('ru-RU')}
                    </div>

                    {selectedSession.messages && selectedSession.messages.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${
                          m.sender === 'user'
                            ? 'items-start'
                            : m.sender === 'manager'
                            ? 'items-end'
                            : 'items-start'
                        }`}
                      >
                        <div className="text-[10px] text-gray-400 mb-0.5 px-1">
                          {m.sender === 'user' ? 'Посетитель сайта' : m.sender === 'manager' ? 'Менеджер «ДС‑Инжиниринг»' : 'Инженер-консультант (AI)'} • {m.time}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                            m.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-tl-none'
                              : m.sender === 'manager'
                              ? 'bg-amber-100 text-amber-950 border border-amber-300 rounded-tr-none font-medium'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                          }`}
                        >
                          <div>{formatChatMessage(m.text, m.sender === 'user')}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Live Manager Reply Console */}
                  <div className="p-3 border-t border-gray-200 bg-white">
                    {/* Fast template buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-2 text-[11px]">
                      <span className="text-gray-400 text-[10px] shrink-0 font-medium">Быстрый ответ:</span>
                      <button
                        type="button"
                        onClick={() => setManagerReplyText('Здравствуйте! Дежурный инженер-технолог на связи. Готов ответить на ваши вопросы.')}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-md shrink-0 transition-colors"
                      >
                        «На связи»
                      </button>
                      <button
                        type="button"
                        onClick={() => setManagerReplyText('Добрый день! Подскажите, пожалуйста, какой станок или CAD-систему вы используете сейчас?')}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-md shrink-0 transition-colors"
                      >
                        «Уточнить станок/ПО»
                      </button>
                      <button
                        type="button"
                        onClick={() => setManagerReplyText('Мы подготовим расчет стоимости и коммерческое предложение. Ожидайте звонка инженера в течение 15 минут.')}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-slate-500 rounded-md shrink-0 transition-colors"
                      >
                        «КП в подготовке»
                      </button>
                    </div>

                    <form onSubmit={handleSendManagerReply} className="flex items-center gap-2">
                      <textarea
                        rows={2}
                        value={managerReplyText}
                        onChange={(e) => setManagerReplyText(e.target.value)}
                        placeholder="Напишите сообщение клиенту в виджет сайта..."
                        className="flex-1 px-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50/50"
                      />
                      <button
                        type="submit"
                        disabled={isSendingReply || !managerReplyText.trim()}
                        className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingReply ? 'Отправка...' : 'Ответить'}</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="font-semibold text-slate-500 text-sm">Выберите диалог слева</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Здесь отобразится полная переписка клиента с ботом Онлайн-Инженер и консоль для живого ответа менеджера
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2 & ALL: RFQs & B2B TICKETS */}
      {(activeSubTab === 'rfqs' || activeSubTab === 'all') && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Заявки с калькулятора (Лиды)</h3>
                <p className="text-xs text-gray-500">Запросы на расчет инжиниринговых услуг и поставку ПО</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-4 py-1 rounded-full">
              {rfqs.length} шт.
            </span>
          </div>
          <div className="p-4 overflow-y-auto max-h-[500px] space-y-3">
            {rfqs.length === 0 && !isLoading && (
              <div className="text-center py-10 text-gray-500 text-sm">Нет входящих заявок</div>
            )}
            {rfqs.map((r, idx) => (
              <div key={r.id ? `${r.id}-${idx}` : `rfq-${idx}`} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-400">ID: {r.id}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{r.customerName} {r.companyName && ("(" + r.companyName + ")")}</h4>
                  </div>
                  <select 
                    value={r.status || 'pending'}
                    onChange={(e) => handleUpdateRfqStatus(r.id, e.target.value)}
                    className={"text-xs font-bold px-2 py-1 border rounded-lg cursor-pointer outline-none " + getStatusColor(r.status || 'pending')}
                  >
                    <option value="pending">Ожидает</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {r.email}</div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {r.phone}</div>
                  <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-gray-400" /> {r.serviceType}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {new Date(r.createdAt).toLocaleString('ru-RU')}</div>
                </div>

                {r.details && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs sm:text-sm text-slate-500">
                    {r.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeSubTab === 'tickets' || activeSubTab === 'all') && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">B2B Служба поддержки</h3>
                <p className="text-xs text-gray-500">Обращения предприятий по постпроцессорам и калибровке</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-purple-100 text-purple-800 px-4 py-1 rounded-full">
              {tickets.length} шт.
            </span>
          </div>
          <div className="p-4 overflow-y-auto max-h-[500px] space-y-3">
            {tickets.length === 0 && !isLoading && (
              <div className="text-center py-10 text-gray-500 text-sm">Нет B2B обращений</div>
            )}
            {tickets.map((t, idx) => (
              <div key={t.id ? `${t.id}-${idx}` : `ticket-${idx}`} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-400">ID: {t.id} • {t.organizationId}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{t.title}</h4>
                  </div>
                  <select 
                    value={t.status || 'new'}
                    onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                    className={"text-xs font-bold px-2 py-1 border rounded-lg cursor-pointer outline-none " + getStatusColor(t.status || 'new')}
                  >
                    <option value="new">Новое</option>
                    <option value="in_progress">В работе</option>
                    <option value="awaiting_customer">Ждет ответа</option>
                    <option value="completed">Закрыто</option>
                  </select>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-gray-400" /> {t.category}</div>
                  <div className="flex items-center gap-1.5 font-medium">Срочность: {
                    t.urgency === 'critical' ? <span className="text-red-600">Критическая</span> : 
                    t.urgency === 'high' ? <span className="text-orange-500">Высокая</span> : 
                    t.urgency === 'medium' ? <span className="text-blue-500">Средняя</span> : 
                    <span className="text-gray-500">Низкая</span>
                  }</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {new Date(t.createdAt).toLocaleString('ru-RU')}</div>
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs sm:text-sm text-slate-500 whitespace-pre-wrap">
                  {t.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB: CORPORATE TELEPHONY & SIP CALLS */}
      {activeSubTab === 'telephony' && (
        <TelephonyCallsTab />
      )}

      {/* SUBTAB 4: BOT RESPONSES & KNOWLEDGE BASE */}
      {activeSubTab === 'bot-settings' && (
        <BotSettingsView />
      )}

      {/* SUBTAB 5: NOTIFICATION CHANNELS & SETTINGS */}
      {activeSubTab === 'notifications' && (
        <NotificationSettingsView />
      )}

      {/* SUBTAB 8: ASSETS MANAGER */}
      {activeSubTab === 'assets' && (
        <AssetsManagerView />
      )}

      {/* SUBTAB 7: REALTIME LOGS & DB AUDIT */}
      {activeSubTab === 'logs' && (
        <CrmRealtimeLogsView />
      )}
    </div>
  );
}
