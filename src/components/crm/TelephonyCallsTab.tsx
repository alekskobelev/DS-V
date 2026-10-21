import React, { useState, useMemo, useRef } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  PhoneForwarded, 
  Play, 
  Pause, 
  Volume2, 
  Mic, 
  MicOff, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sliders, 
  Settings, 
  RefreshCw, 
  Plus, 
  Download, 
  Sparkles, 
  Hash,
  Activity,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface CallRecord {
  id: string;
  type: 'inbound' | 'outbound' | 'missed';
  callerNumber: string;
  callerName: string;
  companyName: string;
  dealId?: string;
  dealTitle?: string;
  managerName: string;
  extension: string;
  timestamp: string;
  durationSeconds: number;
  status: 'answered' | 'missed' | 'busy' | 'voicemail';
  recordingUrl?: string;
  tags: string[];
  disposition: 'qualified' | 'rfq_created' | 'proposal_sent' | 'technical_inquiry' | 'callback_scheduled' | 'spam';
  notes: string;
}

const INITIAL_CALL_RECORDS: CallRecord[] = [
  {
    id: 'CALL-2026-0928-01',
    type: 'inbound',
    callerNumber: '+7 (846) 219-55-12',
    callerName: 'Смирнов Андрей Васильевич',
    companyName: 'ПАО «ОДК-Кузнецов»',
    dealId: 'DL-2026-081',
    dealTitle: 'Поставка и пусконаладка КИМ PMT Future Plus',
    managerName: 'Некрасов С.Ю.',
    extension: '101',
    timestamp: '2026-09-28 10:14:22',
    durationSeconds: 248,
    status: 'answered',
    recordingUrl: 'mock-audio',
    tags: ['КИМ', 'ТЗ на согласование', 'Самара'],
    disposition: 'technical_inquiry',
    notes: 'Обсудили требования к виброизолирующему фундаменту для КИМ PMT Future Plus. Заказчик вышлет строительный план цеха № 14 до конца рабочего дня.'
  },
  {
    id: 'CALL-2026-0928-02',
    type: 'outbound',
    callerNumber: '+7 (8482) 73-44-10',
    callerName: 'Ковалев Михаил Дмитриевич',
    companyName: 'АО «АвтоВАЗ» (НТЦ)',
    dealId: 'DL-2026-082',
    dealTitle: 'Оптический 3D-сканер ScanLine EasyScan Omni',
    managerName: 'Ковалев М.Д.',
    extension: '103',
    timestamp: '2026-09-28 11:30:05',
    durationSeconds: 185,
    status: 'answered',
    recordingUrl: 'mock-audio',
    tags: ['3D-сканирование', 'Демонстрация', 'Тольятти'],
    disposition: 'proposal_sent',
    notes: 'Подтвердили дату выездного замера деталей оптическим сканером ScanLine EasyScan Omni на пятницу 3 октября. Оформляется пропуск на 2 инженеров.'
  },
  {
    id: 'CALL-2026-0928-03',
    type: 'inbound',
    callerNumber: '+7 (846) 374-11-90',
    callerName: 'Федоров Игорь Сергеевич',
    companyName: 'АО «Авиакор — авиационный завод»',
    dealId: 'DL-2026-084',
    dealTitle: 'Контроль геометрии оснастки и крыла GD&T',
    managerName: 'Смирнов А.В.',
    extension: '102',
    timestamp: '2026-09-28 12:05:40',
    durationSeconds: 312,
    status: 'answered',
    recordingUrl: 'mock-audio',
    tags: ['Лазерный трекер', 'Срочно', 'Самара'],
    disposition: 'qualified',
    notes: 'Требуется срочный выезд с лазерным трекером для контроля положения базовых балок стапеля сборки. Согласован тариф с надбавкой за срочность.'
  },
  {
    id: 'CALL-2026-0928-04',
    type: 'missed',
    callerNumber: '+7 (495) 820-19-45',
    callerName: 'Неизвестный абонент',
    companyName: 'ООО «ТехноПромМаш»',
    managerName: 'Некрасов С.Ю.',
    extension: '101',
    timestamp: '2026-09-28 13:20:11',
    durationSeconds: 0,
    status: 'missed',
    tags: ['Пропущенный', 'Требует перезвона'],
    disposition: 'callback_scheduled',
    notes: 'Входящий вызов с сайта (кнопка обратного звонка). Назначена задача на перезвон дежурному инженеру в течение 10 минут.'
  },
  {
    id: 'CALL-2026-0928-05',
    type: 'outbound',
    callerNumber: '+7 (846) 998-02-33',
    callerName: 'Павлова Елена Викторовна',
    companyName: 'АО «РКЦ «Прогресс»',
    dealId: 'DL-2026-083',
    dealTitle: 'Лицензии TopSolid 7 Cam 5-Axis + Постпроцессоры',
    managerName: 'Некрасов С.Ю.',
    extension: '101',
    timestamp: '2026-09-28 14:10:00',
    durationSeconds: 142,
    status: 'answered',
    recordingUrl: 'mock-audio',
    tags: ['TopSolid', 'Постпроцессор', 'ЧПУ'],
    disposition: 'rfq_created',
    notes: 'Уточнили модель стойки ЧПУ: Siemens Sinumerik 840D sl. Сформировано дополнительное ТКП на разработку специализированного кинематического симулятора.'
  }
];

export const TelephonyCallsTab: React.FC = () => {
  const { showToast } = useApp();
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALL_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inbound' | 'outbound' | 'missed'>('all');
  const [dispositionFilter, setDispositionFilter] = useState<string>('all');
  
  // Softphone State
  const [softphoneOpen, setSoftphoneOpen] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [lineStatus, setLineStatus] = useState<'online' | 'busy' | 'dnd'>('online');
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Player State
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = calls.length;
    const answered = calls.filter(c => c.status === 'answered').length;
    const missed = calls.filter(c => c.status === 'missed').length;
    const totalDuration = calls.reduce((acc, c) => acc + c.durationSeconds, 0);
    const avgDuration = answered > 0 ? Math.round(totalDuration / answered) : 0;
    const qualified = calls.filter(c => ['qualified', 'rfq_created', 'proposal_sent'].includes(c.disposition)).length;
    const conversion = total > 0 ? ((qualified / total) * 100).toFixed(1) : '0';

    return { total, answered, missed, avgDuration, conversion };
  }, [calls]);

  // Filtering
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      if (typeFilter !== 'all' && call.type !== typeFilter) return false;
      if (dispositionFilter !== 'all' && call.disposition !== dispositionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          call.callerNumber.toLowerCase().includes(q) ||
          call.callerName.toLowerCase().includes(q) ||
          call.companyName.toLowerCase().includes(q) ||
          (call.dealTitle && call.dealTitle.toLowerCase().includes(q)) ||
          call.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [calls, typeFilter, dispositionFilter, searchQuery]);

  // Softphone Actions
  const handleStartCall = (numberToDial?: string) => {
    const target = numberToDial || dialNumber;
    if (!target.trim()) {
      showToast('Введите номер телефона для набора', 'error');
      return;
    }
    setIsCalling(true);
    setLineStatus('busy');
    setCallDuration(0);
    showToast(`Соединение с ${target} через SIP-шлюз...`, 'info');

    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const handleEndCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setIsCalling(false);
    setLineStatus('online');

    const newRecord: CallRecord = {
      id: `CALL-${Date.now()}`,
      type: 'outbound',
      callerNumber: dialNumber || '+7 (846) 200-00-00',
      callerName: 'Исходящий вызов менеджера',
      companyName: 'Контрагент',
      managerName: 'Некрасов С.Ю.',
      extension: '101',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      durationSeconds: callDuration,
      status: 'answered',
      recordingUrl: 'mock-audio',
      tags: ['Исходящий', 'SIP'],
      disposition: 'qualified',
      notes: `Вызов завершен. Длительность: ${Math.floor(callDuration / 60)} мин ${callDuration % 60} сек.`
    };

    setCalls(prev => [newRecord, ...prev]);
    showToast(`Вызов завершен (${callDuration} сек). Запись сохранена в CDR.`, 'success');
    setDialNumber('');
    setCallDuration(0);
  };

  const handleTogglePlayback = (callId: string) => {
    if (playingCallId === callId) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setPlayingCallId(null);
      setPlaybackProgress(0);
    } else {
      setPlayingCallId(callId);
      setPlaybackProgress(0);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            clearInterval(playbackTimerRef.current!);
            setPlayingCallId(null);
            return 0;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Telephony Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Корпоративная телефония & SIP-интеграция
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SIP Trunk: Активен (Самара, АТС)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Журнал вызовов дежурных инженеров, Click-to-Call из CRM, аудиозаписи разговоров и SLA первого контакта (&lt; 15 сек).
          </p>
        </div>

        {/* Softphone Quick Launcher */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 font-medium">Внутр. доб.:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">101</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className={`w-2 h-2 rounded-full ${lineStatus === 'online' ? 'bg-emerald-500' : lineStatus === 'busy' ? 'bg-amber-500' : 'bg-red-500'}`} />
            <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{lineStatus === 'online' ? 'На линии' : lineStatus === 'busy' ? 'В разговоре' : 'DND'}</span>
          </div>

          <button
            type="button"
            onClick={() => setSoftphoneOpen(!softphoneOpen)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{softphoneOpen ? 'Скрыть софтфон' : 'Открыть софтфон'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1">Всего звонков</span>
          <strong className="text-lg font-bold text-slate-900 dark:text-white font-mono">{stats.total} вызовов</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mb-1">Принято инженерами</span>
          <strong className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.answered} ({((stats.answered / stats.total) * 100).toFixed(0)}%)</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-red-500 font-medium block mb-1">Пропущено</span>
          <strong className="text-lg font-bold text-red-600 dark:text-red-400 font-mono">{stats.missed}</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1">Средняя длина (AHT)</span>
          <strong className="text-lg font-bold text-slate-900 dark:text-white font-mono">{formatSeconds(stats.avgDuration)} мин</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mb-1">Конверсия в КП</span>
          <strong className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{stats.conversion}%</strong>
        </div>
      </div>

      {/* Main Grid: Calls List & Optional Softphone Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Softphone Widget Panel (if open) */}
        {softphoneOpen && (
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">WebRTC Softphone</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLineStatus(prev => prev === 'online' ? 'dnd' : 'online')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    lineStatus === 'online' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' 
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
                  }`}
                >
                  {lineStatus === 'online' ? 'Online' : 'DND'}
                </button>
              </div>
            </div>

            {/* Dial Display */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-center">
              <input
                type="text"
                value={dialNumber}
                onChange={e => setDialNumber(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="w-full text-center text-lg font-mono font-bold bg-transparent text-slate-900 dark:text-white outline-none"
              />
              {isCalling && (
                <div className="mt-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  Идет разговор: {formatSeconds(callDuration)}
                </div>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => setDialNumber(prev => prev + digit)}
                  className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold transition-all active:scale-95 cursor-pointer font-mono"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Call Control Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {!isCalling ? (
                <button
                  type="button"
                  onClick={() => handleStartCall()}
                  className="flex-1 min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Позвонить</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="flex-1 min-h-[42px] rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <PhoneMissed className="w-4 h-4" />
                  <span>Завершить вызов</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDialNumber('')}
                className="px-3 min-h-[42px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                title="Очистить"
              >
                C
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`px-3 min-h-[42px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Микрофон"
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Calls Log List */}
        <div className={softphoneOpen ? 'lg:col-span-8 space-y-3' : 'lg:col-span-12 space-y-3'}>
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по номеру, компании, ФИО ЛПР или заметкам..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'Все' },
                { id: 'inbound', label: 'Входящие' },
                { id: 'outbound', label: 'Исходящие' },
                { id: 'missed', label: 'Пропущенные' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTypeFilter(f.id as any)}
                  className={`min-h-[32px] px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    typeFilter === f.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCalls.map(call => {
                const isPlaying = playingCallId === call.id;

                return (
                  <div key={call.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      
                      {/* Left: Direction Icon + Caller Info */}
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          call.type === 'inbound' 
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                            : call.type === 'outbound'
                            ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                        }`}>
                          {call.type === 'inbound' && <PhoneIncoming className="w-4 h-4" />}
                          {call.type === 'outbound' && <PhoneOutgoing className="w-4 h-4" />}
                          {call.type === 'missed' && <PhoneMissed className="w-4 h-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                              {call.callerNumber}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {call.callerName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              (доб. {call.extension} • {call.managerName})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {call.companyName}
                            </span>
                            {call.dealTitle && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {call.dealTitle}
                                </span>
                              </>
                            )}
                          </div>

                          {call.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-1.5 leading-relaxed">
                              {call.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Duration, Player, Call Button */}
                      <div className="flex items-center gap-2.5 sm:self-center shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                            {formatSeconds(call.durationSeconds)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {call.timestamp.substring(11, 16)}
                          </span>
                        </div>

                        {/* Audio Recording Player */}
                        {call.durationSeconds > 0 && (
                          <button
                            type="button"
                            onClick={() => handleTogglePlayback(call.id)}
                            className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isPlaying 
                                ? 'bg-amber-500 text-white shadow-xs' 
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                            }`}
                            title="Слушать запись вызова"
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPlaying ? 'Играет...' : 'Запись'}</span>
                          </button>
                        )}

                        {/* Direct Click-to-Call */}
                        <button
                          type="button"
                          onClick={() => {
                            setDialNumber(call.callerNumber);
                            setSoftphoneOpen(true);
                            handleStartCall(call.callerNumber);
                          }}
                          className="min-h-[32px] px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Позвонить контакту в 1 клик"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Перезвонить</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}

              {filteredCalls.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Вызовы по указанным критериям фильтрации не найдены.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
