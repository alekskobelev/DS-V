import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Building2, 
  User, 
  Clock, 
  CheckCircle, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Bell, 
  Sparkles,
  Send,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { ManagerNotificationItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { playNotificationChime } from '../../utils/audioAlert';

export const ManagerLiveAlerts: React.FC = () => {
  const { navigateTo, isAdmin, userPermissions, showToast, currentUser } = useApp();
  const hasCrmAccess = !!currentUser && (isAdmin || !!userPermissions?.canAccessCrm || currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'manager');

  const [activeAlert, setActiveAlert] = useState<ManagerNotificationItem | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [unreadList, setUnreadList] = useState<ManagerNotificationItem[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Clear any existing alert if user logs out or does not have CRM access
  useEffect(() => {
    if (!hasCrmAccess) {
      setActiveAlert(null);
      setUnreadList([]);
    }
  }, [hasCrmAccess]);

  // Poll for live notifications every 5 seconds (ONLY for logged-in managers/admins)
  useEffect(() => {
    if (!hasCrmAccess) return;

    const fetchLive = async () => {
      try {
        const res = await apiService.getLiveNotifications();
        if (res.success && Array.isArray(res.notifications)) {
          const unread = res.notifications.filter(n => !n.read);
          setUnreadList(unread);

          // On first load, record existing IDs without firing alarms
          if (isFirstLoadRef.current) {
            res.notifications.forEach(n => seenIdsRef.current.add(n.id));
            isFirstLoadRef.current = false;
            // If there's an unread alert on load, optionally surface the newest one
            if (unread.length > 0 && !activeAlert) {
              setActiveAlert(unread[0]);
            }
            return;
          }

          // Check if any brand-new notification arrived
          const brandNew = unread.find(n => !seenIdsRef.current.has(n.id));
          if (brandNew) {
            seenIdsRef.current.add(brandNew.id);
            setActiveAlert(brandNew);

            // Play Web Audio chime if enabled and not muted
            if (res.settings?.soundAlert !== false && !soundMuted) {
              playNotificationChime(0.45);
            }
          }
        }
      } catch (e) {
        // Silent poll error
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, [soundMuted, activeAlert, hasCrmAccess]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(true);
    showToast('Номер телефона скопирован в буфер');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleDismiss = () => {
    if (activeAlert) {
      apiService.markNotificationRead(activeAlert.id);
      setUnreadList(prev => prev.filter(n => n.id !== activeAlert.id));
      setActiveAlert(null);
    }
  };

  const handleOpenCrm = () => {
    if (activeAlert) {
      apiService.markNotificationRead(activeAlert.id);
      setUnreadList(prev => prev.filter(n => n.id !== activeAlert.id));
      setActiveAlert(null);
    }
    navigateTo('crm');
  };

  // Listen for custom dispatch events inside client window (only for managers)
  useEffect(() => {
    if (!hasCrmAccess) return;
    const handleCustomTrigger = (e: any) => {
      if (e?.detail) {
        setActiveAlert(e.detail);
        if (!soundMuted) {
          playNotificationChime(0.45);
        }
      }
    };
    window.addEventListener('ds_manager_alert', handleCustomTrigger);
    return () => window.removeEventListener('ds_manager_alert', handleCustomTrigger);
  }, [soundMuted, hasCrmAccess]);

  if (!hasCrmAccess || !activeAlert) {
    return null;
  }

  const cleanPhone = activeAlert.phone.replace(/\D/g, '');

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-sm border-2 border-amber-500/80 p-5 ring-4 ring-amber-500/20">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              {activeAlert.type === 'callback' ? 'Срочный заказ звонка' : 'Новая сервисная заявка'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              title={soundMuted ? 'Включить звук оповещения' : 'Отключить звук'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Закрыть уведомление"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-3 space-y-2.5">
          {/* Client Name & Company */}
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{activeAlert.customerName}</span>
            </h4>
            {activeAlert.companyName && (
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 ml-6">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{activeAlert.companyName}</span>
              </p>
            )}
          </div>

          {/* Big Phone Number */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Телефон клиента</div>
                <a 
                  href={`tel:${cleanPhone}`} 
                  className="text-sm sm:text-base font-mono font-bold text-emerald-400 hover:underline"
                >
                  {activeAlert.phone}
                </a>
              </div>
            </div>

            <button
              onClick={() => handleCopyPhone(activeAlert.phone)}
              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              title="Скопировать номер"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPhone ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>

          {/* Details: Topic & Time */}
          <div className="text-xs text-slate-300 space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
            {activeAlert.topic && (
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 font-medium shrink-0">Тема:</span>
                <span className="text-white font-medium">{activeAlert.topic}</span>
              </div>
            )}
            {activeAlert.preferredTime && (
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Время связи: {activeAlert.preferredTime}</span>
              </div>
            )}
            {activeAlert.comment && (
              <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-700/60">
                «{activeAlert.comment}»
              </div>
            )}
          </div>

          {/* Delivery Channels Status Indicator */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
            <span>Каналы доставки:</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-medium border border-blue-700/40">
              Pop-up ✓
            </span>
            {activeAlert.channels.telegram === 'sent' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 font-medium border border-sky-700/40">
                Telegram ✓
              </span>
            )}
            {activeAlert.channels.email === 'sent' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-medium border border-indigo-700/40">
                Email ✓
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
          <a
            href={`tel:${cleanPhone}`}
            onClick={handleDismiss}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all text-center"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Набрать клиента</span>
          </a>

          <button
            onClick={handleOpenCrm}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>В CRM</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Принять и закрыть"
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
