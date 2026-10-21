import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  UserCheck, 
  Phone, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Headphones, 
  RotateCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMPANY_INFO } from '../../data/mockData';
import { OnlineEngineerMessage, OnlineEngineerSuggestion, PageId } from '../../types';
import { queryEngineerAssistant, updateSiteTopics } from '../../utils/engineerKnowledgeBase';
import { formatChatMessage } from '../../utils/chatTextFormatter';
import { apiService } from '../../services/apiService';

const INITIAL_GREETING: OnlineEngineerMessage = {
  id: 'msg-init',
  sender: 'engineer',
  text: 'Здравствуйте! Я интеллектуальный инженер-консультант «ДС‑Инжиниринг».\n\nЯ знаю всё о нашем промышленном софте (TopSolid 7, PolyWorks), метрологическом оборудовании (КИМ, руки PMT, 3D-сканеры Shining 3D) и услугах 3D-контроля. Чем могу помочь?',
  time: 'только что',
  suggestions: [
    { label: '🚀 Каталог ПО TopSolid 7', actionType: 'navigate', page: 'software' },
    { label: '🔬 КИМ и 3D-сканеры', actionType: 'navigate', page: 'hardware' },
    { label: '📐 Онлайн-калькулятор сметы', actionType: 'navigate', page: 'services' },
    { label: '👤 Позвать менеджера', actionType: 'handover' }
  ]
};

export const ChatWidget: React.FC = () => {
  const { openContactModal, navigateTo, currentPage, setIsPrivacyModalOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [handoverSubmitted, setHandoverSubmitted] = useState(false);
  
  // Handover form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);
  const [assignedManagerName, setAssignedManagerName] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem('ds_engineer_chat_session_id');
      if (saved) return saved;
      const newId = `CHAT-${Date.now().toString().slice(-6)}`;
      sessionStorage.setItem('ds_engineer_chat_session_id', newId);
      return newId;
    } catch {
      return `CHAT-${Date.now().toString().slice(-6)}`;
    }
  });

  const [visitorId] = useState<string>(() => {
    try {
      let v = localStorage.getItem('ds_chat_visitor_id');
      if (!v) {
        v = `vis-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('ds_chat_visitor_id', v);
      }
      return v;
    } catch {
      return `vis-${Date.now()}`;
    }
  });

  const [messages, setMessages] = useState<OnlineEngineerMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('ds_engineer_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [INITIAL_GREETING];
    } catch {
      return [INITIAL_GREETING];
    }
  });

  const [managerConnected, setManagerConnected] = useState(false);
  const [agreeChatConsent, setAgreeChatConsent] = useState(false);
  const [chatConsentError, setChatConsentError] = useState('');

  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping, isHandoverOpen]);

  useEffect(() => {
    apiService.getBotTopics().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        updateSiteTopics(res.data);
      }
    }).catch(console.error);
  }, []);


  // Keep ref of current messages to prevent polling resets
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Save messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ds_engineer_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat messages', e);
    }
  }, [messages]);

  // Sync session state to server
  const syncSessionToServer = async (customStatus?: 'active' | 'handover_requested' | 'manager_connected' | 'resolved') => {
    try {
      const currentMsgs = messagesRef.current;
      const lastMsg = currentMsgs[currentMsgs.length - 1];
      await apiService.saveEngineerChatSession({
        id: sessionId,
        visitorId,
        visitorName: clientName || undefined,
        contactPhone: clientPhone || undefined,
        contactEmail: clientEmail || undefined,
        currentPage: String(currentPage || 'home'),
        currentPath: window.location.pathname,
        status: customStatus || (managerConnected ? 'manager_connected' : (isHandoverOpen ? 'handover_requested' : 'active')),
        messages: currentMsgs,
        lastMessageText: lastMsg ? lastMsg.text : 'Новый диалог'
      });
    } catch (e) {
      console.warn('Failed to sync chat session to server', e);
    }
  };

  // Sync on opening the chat
  useEffect(() => {
    if (isOpen) {
      syncSessionToServer();
    }
  }, [isOpen]);

  // Poll for manager responses and lead updates from CMS every 2.0 seconds when chat is open
  useEffect(() => {
    if (!isOpen) return;

    const pollChatSession = async () => {
      try {
        const res = await apiService.getEngineerChatSession(sessionId);
        if (res.success && res.data) {
          if (res.data.leadId) {
            setCreatedLeadId(res.data.leadId);
          }
          if (res.data.assignedManagerName) {
            setAssignedManagerName(res.data.assignedManagerName);
          }
          if (res.data.status === 'manager_connected') {
            setManagerConnected(true);
          }

          if (Array.isArray(res.data.messages) && res.data.messages.length > 0) {
            const currentMsgs = messagesRef.current;
            const currentKeys = new Set(currentMsgs.map(m => m.id || `${m.sender}-${m.text}`));
            
            // Check if server has new messages or manager messages not yet in local state
            const hasNewServerMessages = res.data.messages.some(m => !currentKeys.has(m.id || `${m.sender}-${m.text}`));

            if (hasNewServerMessages || (res.data.messages.length !== currentMsgs.length)) {
              // Merge preserving all items
              const map = new Map<string, OnlineEngineerMessage>();
              currentMsgs.forEach(m => {
                const k = m.id || `${m.sender}-${m.text}`;
                map.set(k, m);
              });
              res.data.messages.forEach(m => {
                const k = m.id || `${m.sender}-${m.text}`;
                map.set(k, m);
              });

              const merged = Array.from(map.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
              setMessages(merged);

              const hasManager = merged.some(m => m.sender === 'manager');
              if (hasManager) {
                setManagerConnected(true);
              }
            }
          }
        }
      } catch (e) {
        // silent polling catch
      }
    };

    pollChatSession();
    const interval = setInterval(pollChatSession, 2000);
    return () => clearInterval(interval);
  }, [isOpen, sessionId]);

  // Close on Escape or click outside
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      const handleClickOutside = (e: MouseEvent) => {
        if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const newMsg: OnlineEngineerMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setIsTyping(true);

    // Sync user message to server immediately
    try {
      await apiService.saveEngineerChatSession({
        id: sessionId,
        visitorId,
        visitorName: clientName || undefined,
        contactPhone: clientPhone || undefined,
        contactEmail: clientEmail || undefined,
        currentPage: String(currentPage || 'home'),
        status: managerConnected ? 'manager_connected' : 'active',
        messages: updatedMessages,
        lastMessageText: userText,
        isUserMessage: true
      });
    } catch {}

    // Process intelligent assistant answer
    setTimeout(async () => {
      const answer = queryEngineerAssistant(userText, { page: currentPage });
      
      const botReplyText = managerConnected 
        ? `${answer.replyText}\n\n💬 *Ваше сообщение также передано дежурному инженеру в CRM. Специалист на связи и при необходимости подключится к диалогу.*`
        : answer.replyText;

      const botMsg: OnlineEngineerMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'engineer',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        suggestions: answer.suggestions,
        isManagerHandover: answer.isHandoverTrigger
      };

      setMessages(prev => {
        const next = [...prev, botMsg];
        return next;
      });
      setIsTyping(false);

      if (answer.isHandoverTrigger) {
        setIsHandoverOpen(true);
      }

      // Sync bot answer to server
      try {
        await apiService.saveEngineerChatSession({
          id: sessionId,
          visitorId,
          currentPage: String(currentPage || 'home'),
          messages: [...updatedMessages, botMsg],
          lastMessageText: botMsg.text,
          status: answer.isHandoverTrigger ? 'handover_requested' : (managerConnected ? 'manager_connected' : 'active')
        });
      } catch {}
    }, 450);
  };

  const handleSuggestionClick = (suggestion: OnlineEngineerSuggestion) => {
    if (suggestion.actionType === 'handover') {
      setIsHandoverOpen(true);
      return;
    }

    if (suggestion.actionType === 'navigate' && suggestion.page) {
      navigateTo(suggestion.page, suggestion.detailId);
      // add a small feedback message in chat
      const sysMsg: OnlineEngineerMessage = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: `Переход в раздел «${suggestion.label}». Окно консультанта остается активным для ваших вопросов.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, sysMsg]);
      return;
    }

    if (suggestion.actionType === 'modal') {
      openContactModal(suggestion.modalConfig || { title: 'Техническая консультация' });
      return;
    }

    if (suggestion.actionType === 'call' && suggestion.url) {
      window.location.href = suggestion.url;
      return;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setClientPhone('');
      return;
    }
    if (raw.startsWith('8')) raw = '7' + raw.slice(1);
    if (!raw.startsWith('7')) raw = '7' + raw;

    let formatted = '+7';
    if (raw.length > 1) {
      formatted += ' (' + raw.substring(1, 4);
    }
    if (raw.length >= 4) {
      formatted += ') ' + raw.substring(4, 7);
    }
    if (raw.length >= 7) {
      formatted += '-' + raw.substring(7, 9);
    }
    if (raw.length >= 9) {
      formatted += '-' + raw.substring(9, 11);
    }
    setClientPhone(formatted);
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeChatConsent) {
      setChatConsentError('Необходимо дать согласие на обработку персональных данных (152-ФЗ)');
      return;
    }
    
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';
    const safeName = sanitize(clientName);
    const safePhone = sanitize(clientPhone);
    const safeEmail = sanitize(clientEmail);
    const safeNote = sanitize(clientNote);

    if (!safeName || safeName.length < 2) {
      alert('Укажите корректное имя (без спецсимволов, минимум 2 буквы)');
      return;
    }

    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!safePhone || !phoneRegex.test(safePhone)) {
      alert('Пожалуйста, укажите полный корректный номер телефона (формат +7 (XXX) XXX-XX-XX)');
      return;
    }

    if (safeEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(safeEmail)) {
        alert('Некорректный формат email');
        return;
      }
    }

    setIsSubmittingHandover(true);

    try {
      // 1. Send handover request and register lead in DB
      const res = await apiService.saveEngineerChatSession({
        id: sessionId,
        visitorId,
        visitorName: safeName || 'Посетитель сайта',
        contactPhone: safePhone || undefined,
        contactEmail: safeEmail || undefined,
        companyName: safeNote || undefined,
        currentPage: String(currentPage || 'home'),
        status: 'handover_requested',
        isHandoverSubmit: true,
        messages: messages,
        lastMessageText: `[Запрос связи]: ${safeName || 'Посетитель'} (${safePhone || safeEmail})`
      });

      const assignedLeadId = res.data?.leadId || `RFQ-2026-CH-${Math.floor(Math.random() * 9000 + 1000)}`;
      setCreatedLeadId(assignedLeadId);

      const handoverMsg: OnlineEngineerMessage = {
        id: `handover-${Date.now()}`,
        sender: 'system',
        text: `🔔 Запрос на подключение специалиста зарегистрирован в единой базе заявок!\n\nНомер обращения: ${assignedLeadId}\n• Контактное лицо: ${clientName || 'Посетитель'}\n• Телефон / Мессенджер: ${clientPhone || 'Не указан'}\n• Email: ${clientEmail || 'Не указан'}${clientNote ? `\n• Примечание / Компания: ${clientNote}` : ''}\n\nДанные внесены в базу данных. Дежурный менеджер проектов и инженер получили оповещение на корпоративную почту и в CRM и подключаются к диалогу.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedMsgs = [...messages, handoverMsg];
      setMessages(updatedMsgs);

      // Update session with system message
      await apiService.saveEngineerChatSession({
        id: sessionId,
        visitorId,
        messages: updatedMsgs,
        lastMessageText: handoverMsg.text
      });

      setHandoverSubmitted(true);
      setIsHandoverOpen(false);
    } catch (err) {
      console.warn('Failed to submit handover', err);
    } finally {
      setIsSubmittingHandover(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('Очистить историю диалога с инженером?')) {
      const newId = `CHAT-${Date.now().toString().slice(-6)}`;
      setSessionId(newId);
      sessionStorage.setItem('ds_engineer_chat_session_id', newId);
      setMessages([INITIAL_GREETING]);
      setIsHandoverOpen(false);
      setHandoverSubmitted(false);
      setManagerConnected(false);
      setCreatedLeadId(null);
      setAssignedManagerName(null);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Symmetrically styled to Callback Floating Button) */}
      {!isOpen && (
        <div 
          className="relative flex items-center justify-center group w-11 h-11 sm:w-14 sm:h-14 shrink-0"
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          {/* Continuous radiating sonar / radar pulse waves (Alive & interactive on tablets/desktop) */}
          <span className="hidden sm:block absolute -inset-1 rounded-full bg-blue-500/35 dark:bg-blue-400/30 animate-floating-pulse-1 pointer-events-none" />
          <span className="hidden sm:block absolute -inset-1 rounded-full bg-blue-400/25 dark:bg-blue-300/20 animate-floating-pulse-2 pointer-events-none" />

          {/* Main Interactive Translucent Button */}
          <button
            id="chat-toggle-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 bg-[#1E3A8A]/90 hover:bg-[#1E3A8A] dark:bg-[#1E3A8A]/80 dark:hover:bg-[#1E3A8A] backdrop-blur-md text-white rounded-full shadow-[0_4px_14px_rgba(30,58,138,0.35)] hover:shadow-[0_8px_28px_rgba(37,99,235,0.45)] border-2 border-white/60 dark:border-white/40 hover:border-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/30 cursor-pointer select-none active:scale-90 hover:scale-105"
            aria-label="Онлайн-инженер: консультация и вызов менеджера"
          >
            {/* Animated Bot Icon with gentle bob and micro-motion */}
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-bot-bob transition-transform duration-300 group-hover:scale-115" />
              
              {/* Animated online status dot with pulsing ping wave */}
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 rounded-full bg-emerald-400">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
            </div>
          </button>

          {/* Floating Hover Tooltip on Desktop */}
          <div 
            className={`hidden md:block absolute right-full mr-4 px-4 py-2 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-xl shadow-sm border border-gray-700/80 whitespace-nowrap transition-all duration-200 pointer-events-none ${
              isButtonHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              Онлайн-инженер
            </div>
            <div className="text-[11px] text-gray-300 mt-0.5">
              Консультация и вызов менеджера
            </div>
          </div>
        </div>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40">
          <div 
            ref={chatRef}
            className="w-[calc(100vw-2rem)] xs:w-[380px] sm:w-[410px] max-w-md bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 h-[520px] sm:h-[560px]"
          >
          {/* Top Bar / Header */}
          <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                {managerConnected ? (
                  <UserCheck className="w-5 h-5 text-emerald-300" />
                ) : (
                  <Bot className="w-5 h-5 text-amber-300" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>{managerConnected ? (assignedManagerName || 'Менеджер «ДС‑Инжиниринг»') : 'Инженер ДС‑Инжиниринг'}</span>
                  {managerConnected && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/30 text-emerald-200 text-[10px] rounded-full border border-emerald-400/40">
                      Живой диалог
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-blue-200 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>{managerConnected ? `${assignedManagerName ? 'Специалист' : 'Менеджер'} проектов на связи` : 'Инженер-технолог онлайн (30+ лет опыта)'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Очистить диалог"
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Закрыть чат"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader Handover Callout Bar */}
          <div className="bg-slate-50 border-b border-gray-200 px-4 py-1.5 flex items-center justify-between text-xs gap-2">
            {managerConnected ? (
              <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium min-w-0 truncate">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Менеджер {assignedManagerName || 'проектов'} на связи в чате</span>
              </div>
            ) : handoverSubmitted || createdLeadId ? (
              <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-medium min-w-0 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Заявка {createdLeadId || 'в CRM'}: дежурный инженер уведомлен</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] min-w-0 truncate">
                <Headphones className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Нужен живой специалист?</span>
              </div>
            )}
            {!managerConnected && (
              <button
                onClick={() => setIsHandoverOpen(prev => !prev)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                  handoverSubmitted || createdLeadId
                    ? 'text-amber-800 hover:text-amber-900 bg-amber-100/80 border border-amber-300'
                    : 'text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80'
                }`}
              >
                <UserPlus className="w-3 h-3 text-current" />
                <span className="whitespace-nowrap">{handoverSubmitted || createdLeadId ? 'Контакты' : 'Позвать менеджера'}</span>
              </button>
            )}
          </div>

          {/* Full Overlay Handover Dialog Form (Clean overlay that does not squash the chat messages) */}
          {isHandoverOpen && (
            <div className="absolute inset-x-0 top-[64px] bottom-0 z-30 bg-white flex flex-col justify-between p-4 overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-150">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="font-bold text-gray-900 flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <span>Связь с дежурным инженером</span>
                  </div>
                  <button 
                    onClick={() => setIsHandoverOpen(false)}
                    className="text-gray-400 hover:text-slate-500 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Вернуться к чату"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-500 text-xs mb-3.5 leading-relaxed">
                  Оставьте контакты для оперативной связи — инженер-технолог «ДС‑Инжиниринг» подключится к диалогу или перезвонит в течение 5–10 минут.
                </p>

                <form id="handover-form" onSubmit={handleHandoverSubmit} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ваше имя *</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder="Алексей"
                        required
                        className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Телефон / MAX *</label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        placeholder="+7 (___) ___-__-__"
                        required
                        className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email (для КП и расчетов)</label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        placeholder="engineer@plant.ru"
                        className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Предприятие / Задача</label>
                      <input
                        type="text"
                        value={clientNote}
                        onChange={e => setClientNote(e.target.value)}
                        placeholder="Оснастка / КИМ / ПО"
                        className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 152-FZ Strictly Separate Consent Checkbox */}
                  <div className="p-2 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeChatConsent}
                        onChange={e => {
                          setAgreeChatConsent(e.target.checked);
                          if (chatConsentError) setChatConsentError('');
                        }}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-gray-300 shrink-0"
                      />
                      <span className="text-[10px] text-slate-500 leading-tight">
                        Я даю <strong>отдельное согласие</strong> на обработку персональных данных (ФЗ № 152-ФЗ) на серверах в РФ в соответствии с{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsPrivacyModalOpen(true);
                          }}
                          className="text-blue-700 font-bold hover:underline inline"
                        >
                          Политикой конфиденциальности
                        </button>
                        .
                      </span>
                    </label>
                    {chatConsentError && (
                      <p className="text-[10px] text-red-600 font-semibold mt-1 pl-5">{chatConsentError}</p>
                    )}
                  </div>
                </form>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <a
                    href={`tel:${COMPANY_INFO.phoneClean}`}
                    className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>{COMPANY_INFO.phone}</span>
                  </a>
                  <span className="text-[10px] text-gray-400">{COMPANY_INFO.workHours}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHandoverOpen(false)}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-slate-500 font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Вернуться к чату
                  </button>
                  <button
                    type="submit"
                    form="handover-form"
                    disabled={isSubmittingHandover}
                    className="flex-1 py-2.5 px-4 bg-[#1E3A8A] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    {isSubmittingHandover ? 'Отправка...' : 'Отправить заявку'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/70 text-xs min-h-0">
            <div className="text-center text-[10px] text-gray-400 uppercase tracking-wider my-1 font-medium">
              ООО «ДС‑Инжиниринг» • Техническая поддержка
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender badge if manager or system */}
                {msg.sender === 'manager' && (
                  <div className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mb-1 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Менеджер проектов «ДС‑Инжиниринг»
                  </div>
                )}

                {msg.sender === 'system' && (
                  <div className="w-full my-1 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed break-words">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                  </div>
                )}

                {msg.sender !== 'system' && (
                  <div
                    className={`max-w-[86%] rounded-xl p-3 leading-relaxed shadow-xs break-words ${
                      msg.sender === 'user'
                        ? 'bg-[#1E40AF] text-white rounded-br-none'
                        : msg.sender === 'manager'
                        ? 'bg-amber-50 text-gray-900 border border-amber-300 rounded-bl-none'
                        : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-none'
                    }`}
                  >
                    <div className="text-xs font-normal">
                      {formatChatMessage(msg.text, msg.sender === 'user')}
                    </div>
                    <span
                      className={`block text-[10px] mt-1 text-right font-light ${
                        msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                )}

                {/* Suggestions / Action Buttons */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(sug)}
                        className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>{sug.label}</span>
                        <ChevronRight className="w-3 h-3 text-blue-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl w-fit text-gray-500 text-xs shadow-2xs animate-pulse">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>Инженер формирует ответ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Navigation Pills (Wrapped neatly so no button is clipped or cut off) */}
          <div className="px-4 py-2 bg-slate-50 border-t border-gray-200 flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => {
                navigateTo('software');
                const sysMsg: OnlineEngineerMessage = {
                  id: `nav-soft-${Date.now()}`,
                  sender: 'system',
                  text: 'Открыт раздел: «Каталог ПО TopSolid 7 и PolyWorks».',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, sysMsg]);
              }}
              className="shrink-0 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full font-medium transition-colors border border-blue-200/60 cursor-pointer"
            >
              ПО TopSolid 7
            </button>
            <button
              onClick={() => {
                navigateTo('hardware');
                const sysMsg: OnlineEngineerMessage = {
                  id: `nav-hw-${Date.now()}`,
                  sender: 'system',
                  text: 'Открыт раздел: «Каталог оборудования: КИМ, руки PMT, 3D-сканеры Shining 3D».',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, sysMsg]);
              }}
              className="shrink-0 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full font-medium transition-colors border border-blue-200/60 cursor-pointer"
            >
              КИМ и 3D-сканеры
            </button>
            <button
              onClick={() => {
                navigateTo('services');
                const sysMsg: OnlineEngineerMessage = {
                  id: `nav-calc-${Date.now()}`,
                  sender: 'system',
                  text: 'Открыт раздел: «Инжиниринговые услуги и онлайн-калькулятор».',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, sysMsg]);
              }}
              className="shrink-0 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full font-medium transition-colors border border-amber-200/60 cursor-pointer"
            >
              Калькулятор услуг
            </button>
            <button
              onClick={() => setIsHandoverOpen(true)}
              className="shrink-0 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full font-semibold transition-colors flex items-center gap-1 border border-emerald-200/70 cursor-pointer"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>Связь с инженером</span>
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={managerConnected ? "Напишите сообщение менеджеру..." : "Задайте технический вопрос инженеру..."}
              className="flex-1 min-w-0 px-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/60"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 bg-[#1E3A8A] hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
              aria-label="Отправить сообщение"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    )}
  </>
);
};
