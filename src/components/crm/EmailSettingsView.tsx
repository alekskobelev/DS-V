import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Send, CheckCircle2, CheckCircle, AlertCircle, AlertTriangle, Settings, Bell, FileText, ShieldCheck, RefreshCw, Search, Eye, ExternalLink, Lock, Server, Zap, Check, X, Clock, User, Building2, Paperclip, Sparkles, KeyRound, HelpCircle, ChevronRight, UserCheck, Info, Camera, Edit3, RotateCcw, Code, LayoutTemplate, Save, Briefcase, UserPlus } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { SmtpSettings, EmailOutboxItem, ManagerSmtpAccount, AuthAccount, DEFAULT_ROLE_PERMISSIONS } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProfilePhotoModal } from '../account/ProfilePhotoModal';

export const EmailSettingsView: React.FC = () => {
  const { showToast, authUsers, updateUser, createUser } = useApp();

  const [activeTab, setActiveTab] = useState<'managers' | 'triggers' | 'templates' | 'outbox'>('managers');
  const [loading, setLoading] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('info@ds-enginering.ru');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; simulated?: boolean; managerAccount?: ManagerSmtpAccount } | null>(null);

  // Global SMTP Settings & Triggers
  const [smtpForm, setSmtpForm] = useState<SmtpSettings>({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    user: 'info@ds-enginering.ru',
    pass: '••••••••••••••••',
    fromName: 'ООО «ДС‑Инжиниринг» | Некрасов С.Ю.',
    fromEmail: 'info@ds-enginering.ru',
    replyTo: 'info@ds-enginering.ru',
    enabled: true,
    provider: 'yandex_360',
    triggers: {
      newRfq: true,
      assignedManager: true,
      stageChanged: true,
      ticketReply: true,
      licenseExpiry: true,
    }
  });

  // Manager SMTP accounts
  const [managerAccounts, setManagerAccounts] = useState<ManagerSmtpAccount[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('adm-01');
  const [selectedManagerForm, setSelectedManagerForm] = useState<Partial<ManagerSmtpAccount>>({});
  const [savingManager, setSavingManager] = useState(false);
  const [showYandexInstructions, setShowYandexInstructions] = useState(false);
  const [photoModalUser, setPhotoModalUser] = useState<AuthAccount | null>(null);

  // Outbox list
  const [outbox, setOutbox] = useState<EmailOutboxItem[]>([]);
  const [outboxSearch, setOutboxSearch] = useState('');
  const [outboxFilterType, setOutboxFilterType] = useState<string>('all');
  const [outboxFilterSender, setOutboxFilterSender] = useState<string>('all');

  // Corporate Templates state & editor
  const [corporateTemplates, setCorporateTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('rfq_created');
  const [editingTemplateForm, setEditingTemplateForm] = useState<any>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateEditMode, setTemplateEditMode] = useState<'edit' | 'preview'>('edit');
  const [templatePreviewManagerId, setTemplatePreviewManagerId] = useState<string>('adm-01');

  // Custom Email Composer Modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerForm, setComposerForm] = useState({
    to: '',
    toName: '',
    subject: '',
    message: '',
    templateType: 'custom_b2b' as EmailOutboxItem['templateType'],
    senderManagerId: 'adm-01',
  });
  const [sendingCustom, setSendingCustom] = useState(false);

  // Positions directory synchronized with database
  const DEFAULT_POSITIONS = [
    "Генеральный директор",
    "Главный метролог",
    "Руководитель отдела продаж",
    "Ведущий инженер метролог",
    "Ведущий инженер сервиса и КИМ",
    "Менеджер по работе с ключевыми клиентами",
    "Менеджер проектов",
    "Инженер технической поддержки",
    "Специалист 3D-сканирования",
    "Администратор CRM",
    "Бухгалтер"
  ];

  const [positions, setPositions] = useState<string[]>(DEFAULT_POSITIONS);
  const [isCreatingNewPosition, setIsCreatingNewPosition] = useState(false);
  const [newPositionInput, setNewPositionInput] = useState('');
  const [isSavingPosition, setIsSavingPosition] = useState(false);

  // Position creation helper that syncs with database (PostgreSQL)
  const handleAddNewPosition = async (customName?: string): Promise<string> => {
    const nameToSave = (customName || newPositionInput).trim();
    if (!nameToSave) return '';
    setIsSavingPosition(true);
    try {
      const res = await fetch('/api/company/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: nameToSave }),
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setPositions(data.data);
        showToast(`Должность «${nameToSave}» сохранена в базе данных`);
      } else {
        if (!positions.includes(nameToSave)) {
          setPositions(prev => [...prev, nameToSave]);
        }
      }
      return nameToSave;
    } catch {
      if (!positions.includes(nameToSave)) {
        setPositions(prev => [...prev, nameToSave]);
      }
      return nameToSave;
    } finally {
      setIsSavingPosition(false);
      setNewPositionInput('');
      setIsCreatingNewPosition(false);
    }
  };

  // Add Manager Corporate Email Account Modal state
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountMode, setNewAccountMode] = useState<'existing_user' | 'new_user'>('new_user');
  const [selectedExistingUserId, setSelectedExistingUserId] = useState<string>('');
  const [newAccountForm, setNewAccountForm] = useState({
    fullName: '',
    roleTitle: 'Менеджер проектов',
    email: '',
    pass: '',
    fromName: '',
    replyTo: '',
    isDirector: false,
  });
  const [isSubmittingNewAccount, setIsSubmittingNewAccount] = useState(false);

  // Load initial settings, outbox, and positions
  useEffect(() => {
    fetchEmailData();
    fetch('/api/company/positions')
      .then(r => r.json())
      .then(d => {
        if (d?.success && Array.isArray(d.data) && d.data.length > 0) {
          setPositions(d.data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchEmailData = async () => {
    setLoading(true);
    try {
      const [settingsRes, accountsRes, outboxRes, templates] = await Promise.all([
        apiService.getEmailSettings(),
        apiService.getManagerEmailAccounts(),
        apiService.getEmailOutbox(),
        apiService.getCorporateEmailTemplates()
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSmtpForm(prev => ({
          ...prev,
          ...settingsRes.data,
          triggers: settingsRes.data?.triggers || prev.triggers
        }));
      }

      if (accountsRes.success && accountsRes.data && accountsRes.data.length > 0) {
        setManagerAccounts(accountsRes.data);
        const currentSelected = accountsRes.data.find(a => a.managerId === selectedManagerId) || accountsRes.data[0];
        setSelectedManagerId(currentSelected.managerId);
        setSelectedManagerForm({
          ...currentSelected,
          pass: '' // Keep password field empty for security unless editing
        });
        setTestEmailAddress(currentSelected.email || 'info@ds-enginering.ru');
      }

      if (outboxRes.success && outboxRes.data) {
        setOutbox(outboxRes.data);
      }

      if (templates && templates.length > 0) {
        setCorporateTemplates(templates);
        const current = templates.find((t: any) => t.id === selectedTemplate) || templates[0];
        setEditingTemplateForm(current);
      }
    } catch (e) {
      console.warn('Could not load email configuration', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId as any);
    const found = corporateTemplates.find(t => t.id === templateId);
    if (found) {
      setEditingTemplateForm({ ...found });
    }
  };

  const handleSaveCorporateTemplate = async () => {
    if (!editingTemplateForm) return;
    setSavingTemplate(true);
    try {
      const res = await apiService.saveCorporateEmailTemplate(editingTemplateForm);
      if (res.success && res.data) {
        showToast(res.message || 'Шаблон успешно сохранен');
        setCorporateTemplates(prev => prev.map(t => t.id === res.data.id ? res.data : t));
        setEditingTemplateForm(res.data);
      } else {
        showToast(res.error || 'Ошибка при сохранении шаблона');
      }
    } catch (e) {
      showToast('Ошибка при связи с сервером');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleResetCorporateTemplates = async () => {
    if (!window.confirm('Сбросить все шаблоны к исходным заводским стандартам «ДС‑Инжиниринг»?')) return;
    setSavingTemplate(true);
    try {
      const res = await apiService.resetCorporateEmailTemplates();
      if (res.success && res.data) {
        showToast('Шаблоны успешно сброшены к стандартным значениям');
        setCorporateTemplates(res.data);
        const found = res.data.find((t: any) => t.id === selectedTemplate) || res.data[0];
        setEditingTemplateForm({ ...found });
      } else {
        showToast(res.error || 'Ошибка при сбросе шаблонов');
      }
    } catch (e) {
      showToast('Ошибка при связи с сервером');
    } finally {
      setSavingTemplate(false);
    }
  };

  const insertVariableTag = (field: 'mainMessage' | 'subject' | 'title', tag: string) => {
    if (!editingTemplateForm) return;
    setEditingTemplateForm({
      ...editingTemplateForm,
      [field]: (editingTemplateForm[field] || '') + tag
    });
  };

  const handleSelectManager = (account: ManagerSmtpAccount) => {
    setSelectedManagerId(account.managerId);
    setSelectedManagerForm({
      ...account,
      pass: '' // Keep empty for user to input new App Password if needed
    });
    setTestEmailAddress(account.email);
    setTestResult(null);
  };

  const handleSaveManagerAvatar = async (newAvatarUrl: string) => {
    if (!photoModalUser) return false;

    // 1. Update in Auth accounts via AppContext (persists to localStorage)
    updateUser(photoModalUser.id, { avatar: newAvatarUrl });

    // 2. Update in manager accounts list state
    setManagerAccounts(prev => prev.map(acc => {
      if (acc.managerId === photoModalUser.id || acc.email === photoModalUser.email) {
        return { ...acc, avatar: newAvatarUrl };
      }
      return acc;
    }));

    // 3. Update selected form if currently editing this manager
    setSelectedManagerForm(prev => ({ ...prev, avatar: newAvatarUrl }));

    // 4. Persist to API if supported
    try {
      const targetAccount = managerAccounts.find(a => a.managerId === photoModalUser.id || a.email === photoModalUser.email);
      if (targetAccount) {
        await apiService.saveManagerEmailAccount({
          ...targetAccount,
          avatar: newAvatarUrl
        } as any);
      }
    } catch (e) {
      console.warn('Avatar saved locally', e);
    }

    showToast('Фото сотрудника успешно обновлено');
    setPhotoModalUser(null);
    return true;
  };

  const handleSaveManagerSettings = async () => {
    if (!selectedManagerId) return;
    setSavingManager(true);
    try {
      const targetAccount = managerAccounts.find(a => a.managerId === selectedManagerId);
      const payload: Partial<ManagerSmtpAccount> = {
        ...targetAccount,
        ...selectedManagerForm,
        managerId: selectedManagerId,
      };

      const res = await apiService.saveManagerEmailAccount(payload);
      if (res.success && res.data) {
        showToast(`Настройки ящика ${res.data.email} успешно сохранены`);
        // Update local list
        setManagerAccounts(prev => prev.map(acc => acc.managerId === selectedManagerId ? res.data! : acc));
        setSelectedManagerForm(prev => ({ ...prev, ...res.data, pass: '' }));

        // Keep authUsers in sync if matching user exists
        const matchedUser = authUsers.find(u => u.id === selectedManagerId || u.email === res.data!.email);
        if (matchedUser && updateUser) {
          updateUser(matchedUser.id, {
            position: res.data.roleTitle || matchedUser.position,
            fullName: res.data.fullName || matchedUser.fullName,
          });
        }
      } else {
        showToast(res.message || 'Ошибка сохранения настроек сотрудника');
      }
    } catch (e) {
      showToast('Ошибка при связи с сервером');
    } finally {
      setSavingManager(false);
    }
  };

  const handleCreateManagerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountForm.email || !newAccountForm.fullName) {
      showToast('Укажите ФИО и корпоративный email');
      return;
    }

    setIsSubmittingNewAccount(true);
    try {
      let managerId = `mgr-${Date.now()}`;
      
      if (newAccountMode === 'existing_user' && selectedExistingUserId) {
        const existing = authUsers.find(u => u.id === selectedExistingUserId);
        if (existing) {
          managerId = existing.id;
        }
      } else if (newAccountMode === 'new_user') {
        // Create user in system authUsers as well
        createUser({
          fullName: newAccountForm.fullName,
          email: newAccountForm.email,
          phone: '+7 (343) 382-52-03',
          company: 'ООО «ДС‑Инжиниринг»',
          position: newAccountForm.roleTitle,
          role: newAccountForm.isDirector ? 'admin' : 'manager',
          password: newAccountForm.pass || 'DsEng' + Math.floor(1000 + Math.random() * 9000),
          permissions: (newAccountForm.isDirector ? DEFAULT_ROLE_PERMISSIONS.admin : DEFAULT_ROLE_PERMISSIONS.manager) as any
        });
      }

      const payload: Partial<ManagerSmtpAccount> = {
        managerId,
        id: `smtp-${managerId}`,
        fullName: newAccountForm.fullName,
        roleTitle: newAccountForm.roleTitle,
        email: newAccountForm.email,
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        user: newAccountForm.email,
        pass: newAccountForm.pass,
        fromName: newAccountForm.fromName || `ООО «ДС‑Инжиниринг» | ${newAccountForm.fullName}`,
        replyTo: newAccountForm.replyTo || newAccountForm.email,
        isDirector: newAccountForm.isDirector,
      };

      const res = await apiService.saveManagerEmailAccount(payload);
      if (res.success && res.data) {
        showToast(`Корпоративный ящик ${res.data.email} успешно подключен!`);
        // Refresh accounts list
        const refreshed = await apiService.getManagerEmailAccounts();
        if (refreshed.data && refreshed.data.length > 0) {
          setManagerAccounts(refreshed.data);
          setSelectedManagerId(res.data.managerId);
          setSelectedManagerForm(res.data);
        } else {
          setManagerAccounts(prev => [...prev, res.data!]);
          setSelectedManagerId(res.data.managerId);
          setSelectedManagerForm(res.data);
        }
        setIsAddAccountModalOpen(false);
        setNewAccountForm({
          fullName: '',
          roleTitle: 'Менеджер проектов',
          email: '',
          pass: '',
          fromName: '',
          replyTo: '',
          isDirector: false,
        });
      } else {
        showToast(res.message || 'Ошибка сохранения корпоративного ящика');
      }
    } catch (err: any) {
      showToast(err?.message || 'Сбой при создании корпоративного аккаунта');
    } finally {
      setIsSubmittingNewAccount(false);
    }
  };

  const handleSaveGlobalTriggers = async () => {
    setLoading(true);
    try {
      const res = await apiService.saveEmailSettings(smtpForm);
      if (res.success) {
        showToast('Параметры триггеров и шлюза успешно сохранены');
      } else {
        showToast(res.message || 'Ошибка сохранения');
      }
    } catch (e) {
      showToast('Ошибка при связи с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      showToast('Введите корректный email для проверки');
      return;
    }
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const activeAccount = managerAccounts.find(a => a.managerId === selectedManagerId);
      const res = await apiService.testSmtpConnection({
        testEmail: testEmailAddress,
        recipientName: activeAccount?.fullName || 'Специалист ДС‑Инжиниринг',
        managerId: selectedManagerId,
        senderEmail: activeAccount?.email
      });

      if (res.success) {
        setTestResult({
          success: true,
          message: res.simulated 
            ? `Тестовое письмо сформировано в режиме безопасной эмуляции Яндекс 360 для ${testEmailAddress} (Отправитель: ${activeAccount?.email})`
            : `Тестовое письмо успешно доставлено через SMTP Яндекс (smtp.yandex.ru:465) для адреса ${testEmailAddress}`,
          simulated: res.simulated,
          managerAccount: res.managerAccount || activeAccount
        });
        showToast('Проверка Яндекс SMTP выполнена');
        // Refresh outbox log
        const outboxRes = await apiService.getEmailOutbox();
        if (outboxRes.data) setOutbox(outboxRes.data);
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Ошибка при отправке тестового сообщения'
        });
        showToast('Ошибка при проверке Яндекс SMTP');
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Сбой подключения к серверу smtp.yandex.ru'
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerForm.to || !composerForm.subject || !composerForm.message) {
      showToast('Заполните все обязательные поля');
      return;
    }
    setSendingCustom(true);
    try {
      const senderAcc = managerAccounts.find(a => a.managerId === composerForm.senderManagerId) || managerAccounts[0];
      const res = await apiService.sendCorporateEmail({
        to: composerForm.to,
        toName: composerForm.toName,
        subject: composerForm.subject,
        message: composerForm.message,
        templateType: composerForm.templateType,
        senderManagerId: composerForm.senderManagerId,
        fromEmail: senderAcc?.email,
        fromName: senderAcc?.fromName
      });

      if (res.success) {
        showToast(`Письмо отправлено от ${senderAcc?.email} на адрес ${composerForm.to}`);
        setIsComposerOpen(false);
        setComposerForm(prev => ({ ...prev, to: '', toName: '', subject: '', message: '' }));
        // Refresh outbox
        const outboxRes = await apiService.getEmailOutbox();
        if (outboxRes.data) setOutbox(outboxRes.data);
      } else {
        showToast(res.error || 'Ошибка при отправке');
      }
    } catch (err) {
      showToast('Сбой отправки сообщения');
    } finally {
      setSendingCustom(false);
    }
  };

  const activeSelectedManager = managerAccounts.find(a => a.managerId === selectedManagerId) || managerAccounts[0];
  const templatePreviewManager = managerAccounts.find(a => a.managerId === templatePreviewManagerId) || managerAccounts[0];

  const filteredOutbox = outbox.filter(item => {
    if (outboxFilterType !== 'all' && item.templateType !== outboxFilterType) {
      return false;
    }
    if (outboxFilterSender !== 'all') {
      if (item.senderManagerId !== outboxFilterSender && item.from !== outboxFilterSender) {
        return false;
      }
    }
    if (!outboxSearch.trim()) return true;
    const query = outboxSearch.toLowerCase();
    return (
      item.to.toLowerCase().includes(query) ||
      (item.toName && item.toName.toLowerCase().includes(query)) ||
      (item.from && item.from.toLowerCase().includes(query)) ||
      (item.fromName && item.fromName.toLowerCase().includes(query)) ||
      item.subject.toLowerCase().includes(query) ||
      (item.dealId && item.dealId.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Корпоративная почта и Яндекс 360 SMTP
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SSL 465 • Яндекс ID
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Индивидуальное подключение корпоративных ящиков менеджеров и генерального директора (info@ds-enginering.ru)
              </p>
            </div>
          </div>
        </div>

        {/* Global Action: Compose Email (Single clean button at top) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setComposerForm({
                to: '',
                toName: '',
                subject: '[ДС‑Инжиниринг] Официальное уведомление',
                message: 'Здравствуйте! Направляем вам актуальную техническую информацию.',
                templateType: 'custom_b2b',
                senderManagerId: selectedManagerId || 'adm-01'
              });
              setIsComposerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Написать письмо</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'managers', label: 'Корпоративная почта сотрудников', icon: UserCheck, count: managerAccounts.length },
          { id: 'triggers', label: 'Триггеры авто-уведомлений', icon: Zap },
          { id: 'templates', label: 'Фирменные HTML-шаблоны', icon: FileText },
          { id: 'outbox', label: 'Журнал отправленных писем', icon: Clock, count: outbox.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. TAB: MANAGERS YANDEX SMTP ACCOUNTS */}
      {activeTab === 'managers' && (
        <div className="space-y-6">
          {/* Yandex App Password Help Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-5 text-white shadow-md border border-blue-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-blue-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Яндекс 360 Корпоративный стандарт
                  </span>
                  <span className="text-blue-200 text-xs">smtp.yandex.ru • Порт 465 (SSL)</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Авторизация сотрудников через Пароли Приложений Яндекс ID
                </h3>
                <p className="text-xs text-blue-100 max-w-3xl leading-relaxed">
                  По регламенту безопасности Яндекс 360, для отправки писем из CRM используется не пароль от почты, а специальный <strong>16-значный пароль приложения</strong>. Генеральный директор отправляет письма с ящика <strong>info@ds-enginering.ru</strong>, а специалисты — со своих персональных рабочих ящиков.
                </p>
              </div>

              <button
                onClick={() => setShowYandexInstructions(!showYandexInstructions)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors cursor-pointer shrink-0"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>{showYandexInstructions ? 'Скрыть инструкцию' : 'Как получить пароль приложения'}</span>
              </button>
            </div>

            {/* Expandable Step-by-Step Instructions */}
            {showYandexInstructions && (
              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/10 p-3.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-black text-[11px]">1</span>
                    Вход в Яндекс ID
                  </div>
                  <p className="text-blue-100 text-[11px] leading-relaxed">
                    Войдите в свой рабочий корпоративный аккаунт на <a href="https://id.yandex.ru" target="_blank" rel="noreferrer" className="underline text-white font-bold">id.yandex.ru</a> или <a href="https://mail.yandex.ru" target="_blank" rel="noreferrer" className="underline text-white font-bold">mail.yandex.ru</a>
                  </p>
                </div>

                <div className="bg-white/10 p-3.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-black text-[11px]">2</span>
                    Раздел «Безопасность»
                  </div>
                  <p className="text-blue-100 text-[11px] leading-relaxed">
                    Перейдите в раздел <strong>«Безопасность»</strong> → найдите блок <strong>«Пароли приложений»</strong>
                  </p>
                </div>

                <div className="bg-white/10 p-3.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-black text-[11px]">3</span>
                    Создание пароля
                  </div>
                  <p className="text-blue-100 text-[11px] leading-relaxed">
                    Выберите тип <strong>«Почта»</strong> (или укажите название «CRM ДС‑Инжиниринг») и нажмите <strong>«Создать»</strong>
                  </p>
                </div>

                <div className="bg-white/10 p-3.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-black text-[11px]">4</span>
                    Вставка в CRM
                  </div>
                  <p className="text-blue-100 text-[11px] leading-relaxed">
                    Скопируйте 16-значный пароль (например: <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200 font-mono">abcdefghijklmnop</code>) и сохраните в форме ниже
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
            {/* Left: Manager Accounts List (5 cols) */}
            <div className="xl:col-span-5 bg-white border border-gray-200/90 rounded-lg p-4 sm:p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Штат сотрудников и ящики</span>
                  </h3>
                  <div className="text-[11px] text-gray-400">
                    {managerAccounts.length} аккаунтов подключено
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewAccountMode('new_user');
                    setSelectedExistingUserId('');
                    setNewAccountForm({
                      fullName: '',
                      roleTitle: positions[0] || 'Менеджер проектов',
                      email: '',
                      pass: '',
                      fromName: '',
                      replyTo: '',
                      isDirector: false,
                    });
                    setIsAddAccountModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить ящик</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {managerAccounts.map((account) => {
                  const isSelected = selectedManagerId === account.managerId;
                  const isCEO = account.isDirector || account.email === 'info@ds-enginering.ru';
                  const matchedUser = authUsers.find(u => u.id === account.managerId || u.email === account.email);

                  return (
                    <div
                      key={account.id}
                      onClick={() => handleSelectManager(account)}
                      className={`p-3 sm:p-3.5 rounded-lg border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white border-gray-200/80 hover:border-gray-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border overflow-hidden ${
                            isSelected 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {matchedUser?.avatar ? (
                              <img src={matchedUser.avatar} alt={account.fullName} className="w-full h-full object-cover" />
                            ) : (
                              account.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                {account.fullName}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 truncate leading-tight">
                              {account.roleTitle}
                            </div>
                            <div className="text-[11px] font-mono font-medium text-blue-700 truncate mt-0.5">
                              {account.email}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          {isCEO ? (
                            <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md border border-amber-300">
                              Руководитель
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                              Специалист
                            </span>
                          )}
                          {account.status === 'connected' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Активен
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              <KeyRound className="w-3 h-3" /> Пароль задан
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Manager SMTP Config Form & Live Test (7 cols) */}
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-white border border-gray-200/90 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
                {/* Employee Profile Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div className="flex items-center gap-3.5">
                    {(() => {
                      const matchedUser = authUsers.find(u => u.id === activeSelectedManager?.managerId || u.email === activeSelectedManager?.email);
                      return (
                        <div className="relative group shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (matchedUser) {
                                setPhotoModalUser(matchedUser);
                              } else if (activeSelectedManager) {
                                setPhotoModalUser({
                                  id: activeSelectedManager.managerId,
                                  fullName: activeSelectedManager.fullName,
                                  email: activeSelectedManager.email,
                                  phone: '',
                                  role: 'manager',
                                  company: 'ООО «ДС‑Инжиниринг»',
                                  position: activeSelectedManager.roleTitle
                                });
                              }
                            }}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-blue-200 hover:border-blue-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all hover:scale-105 block"
                            title="Нажмите на фото сотрудника, чтобы загрузить или изменить"
                          >
                            {matchedUser?.avatar ? (
                              <img
                                src={matchedUser.avatar}
                                alt={activeSelectedManager?.fullName}
                                className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-base group-hover:bg-blue-200 transition-all">
                                {activeSelectedManager?.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-4 h-4 text-white" />
                              <span className="text-[9px] font-bold text-white mt-0.5">Фото</span>
                            </div>
                          </button>
                          <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-lg shadow-xs pointer-events-none border border-white">
                            <Camera className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      );
                    })()}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          {activeSelectedManager?.fullName}
                        </h3>
                        {activeSelectedManager?.isDirector && (
                          <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                            Главный ящик организации
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{activeSelectedManager?.roleTitle}</p>
                      <div className="text-xs font-mono font-medium text-slate-500">
                        ID: <span className="font-bold text-slate-800">{activeSelectedManager?.managerId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Row 0: Position / Job Title with Database Sync */}
                  <div className="sm:col-span-2 space-y-1.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>Должность сотрудника (Синхронизация с БД) *</span>
                      </label>
                      {!isCreatingNewPosition && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingNewPosition(true)}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Создать новую</span>
                        </button>
                      )}
                    </div>

                    {isCreatingNewPosition ? (
                      <div className="space-y-1.5 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-[11px] font-bold text-blue-900">Новая должность для штатного расписания:</div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Например: Старший инженер КИМ и 3D-сканирования"
                            value={newPositionInput}
                            onChange={(e) => setNewPositionInput(e.target.value)}
                            className="flex-1 p-2 text-xs bg-white border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={!newPositionInput.trim() || isSavingPosition}
                            onClick={async () => {
                              const val = newPositionInput.trim();
                              const saved = await handleAddNewPosition(val);
                              if (saved) {
                                setSelectedManagerForm({ ...selectedManagerForm, roleTitle: saved });
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                          >
                            {isSavingPosition ? 'Сохранение...' : 'В базу'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingNewPosition(false);
                              setNewPositionInput('');
                            }}
                            className="px-2.5 py-2 bg-gray-200 hover:bg-gray-300 text-slate-500 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={positions.includes(selectedManagerForm.roleTitle || '') ? selectedManagerForm.roleTitle : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCreatingNewPosition(true);
                          } else if (e.target.value === '__custom__') {
                            // keep
                          } else {
                            setSelectedManagerForm({ ...selectedManagerForm, roleTitle: e.target.value });
                          }
                        }}
                        className="w-full h-10 px-4 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800"
                      >
                        <option value="" disabled>-- Выберите должность из справочника БД --</option>
                        {positions.map((pos) => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                        {!positions.includes(selectedManagerForm.roleTitle || '') && selectedManagerForm.roleTitle && (
                          <option value="__custom__">{selectedManagerForm.roleTitle} (Текущая)</option>
                        )}
                        <option value="__add_new__">+ Создать новую должность в базе данных...</option>
                      </select>
                    )}
                  </div>

                  {/* Row 1, Col 1: Corporate Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 h-5 flex items-center">
                      Корпоративный Email (Яндекс 360) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email"
                        required
                        value={selectedManagerForm.email || ''}
                        onChange={(e) => setSelectedManagerForm({ ...selectedManagerForm, email: e.target.value, user: e.target.value })}
                        className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-slate-50/80 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                        placeholder="s.nekrasov@ds-enginering.ru"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 h-4 flex items-center truncate">
                      {activeSelectedManager?.isDirector ? 'Основная почта: info@ds-enginering.ru' : 'Персональный рабочий ящик'}
                    </p>
                  </div>

                  {/* Row 1, Col 2: Yandex App Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 h-5 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>Пароль приложения Яндекс ID *</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="password"
                        placeholder="16-значный пароль приложения"
                        value={selectedManagerForm.pass || ''}
                        onChange={(e) => setSelectedManagerForm({ ...selectedManagerForm, pass: e.target.value })}
                        className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-slate-50/80 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 h-4 flex items-center truncate">
                      16-значный ключ кабинета безопасности
                    </p>
                  </div>

                  {/* Row 2: Sender Name (Full Width for spacious editing) */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Отображаемое имя отправителя (From Name)</span>
                      </span>
                      <span className="text-[11px] font-normal text-gray-400 hidden sm:inline">
                        Заголовок поля «От кого» в исходящих письмах
                      </span>
                    </label>
                    <input 
                      type="text"
                      value={selectedManagerForm.fromName || ''}
                      onChange={(e) => setSelectedManagerForm({ ...selectedManagerForm, fromName: e.target.value })}
                      className="w-full h-10 px-4.5 text-xs sm:text-sm bg-slate-50/80 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                      placeholder="ООО «ДС‑Инжиниринг» | Некрасов Сергей Юрьевич"
                    />
                    <p className="text-[11px] text-gray-400 sm:hidden">
                      Заголовок поля «От кого» в исходящих письмах
                    </p>
                  </div>

                  {/* Row 3, Col 1: Reply-To */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 h-5 flex items-center">
                      Email для ответов клиентов (Reply-To)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email"
                        value={selectedManagerForm.replyTo || ''}
                        onChange={(e) => setSelectedManagerForm({ ...selectedManagerForm, replyTo: e.target.value })}
                        className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-slate-50/80 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                        placeholder="info@ds-enginering.ru"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 h-4 flex items-center truncate">
                      Адрес, на который поступят ответы клиента
                    </p>
                  </div>

                  {/* Row 3, Col 2: Server Info Preset */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 h-5 flex items-center">
                      Параметры защищенного шлюза
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Server className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={`${selectedManagerForm.host || 'smtp.yandex.ru'}:${selectedManagerForm.port || 465}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            const parts = val.split(':');
                            setSelectedManagerForm({
                              ...selectedManagerForm,
                              host: parts[0] || 'smtp.yandex.ru',
                              port: parts.length > 1 ? (parseInt(parts[1], 10) || 465) : 465
                            });
                          }}
                          className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-semibold text-slate-800"
                          placeholder="smtp.yandex.ru:465"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg border border-emerald-200 shrink-0 flex items-center gap-1 h-10 cursor-help" title="SSL Соединение активно">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SSL
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 font-medium h-4 flex items-center">
                      Авторизация шлюза настраиваемая
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-3 border-t border-gray-100">
                  <button
                    onClick={handleSaveManagerSettings}
                    disabled={savingManager}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-white text-white hover:text-blue-600 border-2 border-transparent hover:border-blue-600 rounded-lg shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 group"
                  >
                    <Check className="w-4 h-4 text-white group-hover:text-blue-600 transition-colors" />
                    <span>{savingManager ? 'Сохранение...' : 'Сохранить параметры сотрудника'}</span>
                  </button>
                </div>
              </div>

              {/* Realtime Live Test Card for this manager */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Проверка подключения Яндекс SMTP ({activeSelectedManager?.email})
                  </h3>
                  <span className="text-xs text-gray-400">Диагностика шлюза</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Куда отправить тестовое письмо (напр. info@ds-enginering.ru)"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleTestSmtp}
                    disabled={testingSmtp}
                    className="flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${testingSmtp ? 'animate-spin' : ''}`} />
                    <span>{testingSmtp ? 'Отправка...' : 'Отправить тестовое письмо'}</span>
                  </button>
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div className={`p-4 rounded-lg text-xs sm:text-sm flex items-start gap-3 border ${
                    testResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold">
                        {testResult.success ? 'Соединение с сервером Яндекс подтверждено' : 'Ошибка отправки'}
                      </div>
                      <div className="text-xs leading-relaxed">{testResult.message}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: AUTOMATED TRIGGERS */}
      {activeTab === 'triggers' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-6">
          
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Автоматические триггеры корпоративных Email-оповещений
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Система автоматически отправляет фирменные письма при ключевых бизнес-событиях в CRM и на портале
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = 'custom_trigger_' + Date.now();
                setSmtpForm({
                  ...smtpForm,
                  customTriggersMetadata: [
                    ...(smtpForm.customTriggersMetadata || []),
                    { id, name: 'Новый триггер', description: 'Описание', icon: 'Zap' }
                  ],
                  triggers: {
                    ...smtpForm.triggers,
                    [id]: false
                  }
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Добавить триггер
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(smtpForm.customTriggersMetadata || []).map((trigger: any) => (
              <div key={trigger.id} className="p-4 rounded-lg border border-gray-200 bg-slate-50/50 flex flex-col gap-3 group relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <input
                      type="text"
                      value={trigger.name}
                      onChange={(e) => {
                        const updated = smtpForm.customTriggersMetadata.map((t: any) => t.id === trigger.id ? { ...t, name: e.target.value } : t);
                        setSmtpForm({ ...smtpForm, customTriggersMetadata: updated });
                      }}
                      className="font-bold text-sm text-gray-900 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none w-full"
                    />
                    <textarea
                      value={trigger.description}
                      onChange={(e) => {
                        const updated = smtpForm.customTriggersMetadata.map((t: any) => t.id === trigger.id ? { ...t, description: e.target.value } : t);
                        setSmtpForm({ ...smtpForm, customTriggersMetadata: updated });
                      }}
                      className="text-xs text-gray-500 bg-transparent border border-transparent focus:border-gray-300 focus:bg-white rounded p-1 focus:outline-none w-full resize-none"
                      rows={2}
                    />
                  </div>
                  <input 
                    type="checkbox"
                    checked={!!smtpForm.triggers[trigger.id]}
                    onChange={(e) => setSmtpForm({
                      ...smtpForm,
                      triggers: { ...smtpForm.triggers, [trigger.id]: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer flex-shrink-0 mt-1"
                  />
                </div>
                {trigger.id.startsWith('custom_trigger_') && (
                  <button
                    onClick={() => {
                      if(confirm('Удалить этот триггер?')) {
                        setSmtpForm({
                          ...smtpForm,
                          customTriggersMetadata: smtpForm.customTriggersMetadata.filter((t: any) => t.id !== trigger.id)
                        });
                      }
                    }}
                    className="absolute bottom-2 right-2 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Удалить триггер"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

            {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              onClick={handleSaveGlobalTriggers}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              <span>{loading ? 'Сохранение...' : 'Сохранить настройки'}</span>
            </button>
          </div>
        </div>
      )}


      {activeTab === 'templates' && (
        <div className="flex flex-col xl:flex-row gap-6 mt-4">
          {/* Left: Templates List */}
          <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-lg flex flex-col h-[600px] shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                HTML Шаблоны
              </h3>
              <button 
                onClick={() => {
                  setEditingTemplateForm({
                    id: 'custom_' + Date.now(),
                    name: 'Новый шаблон',
                    description: '',
                    subject: 'Уведомление',
                    title: 'Уведомление',
                    headerBadge: 'ИНФОРМАЦИЯ',
                    greeting: 'Здравствуйте, {recipientName}!',
                    mainMessage: 'Текст сообщения...',
                    ctaText: '',
                    ctaUrl: '',
                    footerNote: 'С уважением, ДС‑Инжиниринг',
                    showDetailsTable: false
                  });
                  setSelectedTemplate('custom_' + Date.now());
                  setTemplateEditMode('edit');
                }}
                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                title="Создать новый шаблон"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {corporateTemplates.map((template: any) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setEditingTemplateForm(template);
                    setTemplateEditMode('edit');
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedTemplate === template.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold truncate ${selectedTemplate === template.id ? 'text-blue-800' : 'text-slate-800'}`}>{template.name}</h4>
                    {template.id.startsWith('custom_') && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Точно удалить шаблон?')) {
                            apiService.deleteCorporateEmailTemplate(template.id).then(() => {
                              fetchEmailData();
                              setEditingTemplateForm(null);
                            });
                          }
                        }}
                        className="text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Editor */}
          <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-lg flex flex-col min-h-[600px] shadow-sm">
            {editingTemplateForm ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-800">Редактор шаблона</h3>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
                      <button 
                        onClick={() => setTemplateEditMode('edit')}
                        className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-colors ${templateEditMode === 'edit' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        <Code className="w-3 h-3 inline mr-1" /> Код
                      </button>
                      <button 
                        onClick={() => setTemplateEditMode('preview')}
                        className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-colors ${templateEditMode === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        <Eye className="w-3 h-3 inline mr-1" /> Превью
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      setSavingTemplate(true);
                      const res = await apiService.saveCorporateEmailTemplate(editingTemplateForm);
                      if (res.success) {
                        showToast(res.message || 'Шаблон сохранен');
                        fetchEmailData();
                      } else {
                        showToast(res.error || 'Ошибка');
                      }
                      setSavingTemplate(false);
                    }}
                    disabled={savingTemplate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingTemplate ? 'Сохранение...' : 'Сохранить шаблон'}
                  </button>
                </div>
                
                {templateEditMode === 'edit' ? (
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Название шаблона (внутреннее)</label>
                        <input type="text" value={editingTemplateForm.name || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, name: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Описание</label>
                        <input type="text" value={editingTemplateForm.description || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, description: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Тема письма (Subject)</label>
                      <input type="text" value={editingTemplateForm.subject || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, subject: e.target.value})} className="w-full text-sm font-semibold p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Заголовок H2 в письме</label>
                        <input type="text" value={editingTemplateForm.title || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, title: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Бейджик в шапке</label>
                        <input type="text" value={editingTemplateForm.headerBadge || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, headerBadge: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Приветствие</label>
                      <input type="text" value={editingTemplateForm.greeting || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, greeting: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase flex items-center justify-between">
                        Основной текст (HTML)
                        <span className="text-[9px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Доступны: {'{recipientName}'}, {'{dealId}'}, {'{managerName}'}</span>
                      </label>
                      <textarea rows={5} value={editingTemplateForm.mainMessage || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, mainMessage: e.target.value})} className="w-full text-sm font-mono p-3 bg-slate-900 text-slate-300 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none custom-scrollbar" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Текст кнопки (CTA)</label>
                        <input type="text" value={editingTemplateForm.ctaText || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, ctaText: e.target.value})} className="w-full text-sm p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">URL кнопки</label>
                        <input type="text" value={editingTemplateForm.ctaUrl || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, ctaUrl: e.target.value})} className="w-full text-sm font-mono p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase">Заметка в футере</label>
                      <textarea rows={2} value={editingTemplateForm.footerNote || ''} onChange={e => setEditingTemplateForm({...editingTemplateForm, footerNote: e.target.value})} className="w-full text-xs p-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <input type="checkbox" checked={editingTemplateForm.showDetailsTable || false} onChange={e => setEditingTemplateForm({...editingTemplateForm, showDetailsTable: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm font-bold text-blue-900">Отображать таблицу с деталями сделки/заявки</span>
                    </label>

                  </div>
                ) : (
                  <div className="flex-1 p-4 bg-slate-100 flex justify-center overflow-y-auto">
                    <div className="w-[600px] bg-white rounded-lg shadow-sm border border-gray-200 p-8 h-fit">
                      <div className="flex justify-between items-start mb-6">
                        <img src="/logo.svg" alt="Logo" className="h-6" />
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{editingTemplateForm.headerBadge}</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 mb-4">{editingTemplateForm.title}</h2>
                      <p className="text-sm text-slate-500 mb-4 font-semibold">{editingTemplateForm.greeting?.replace('{recipientName}', 'Иван Иванович')}</p>
                      
                      <div className="text-sm text-slate-500 space-y-4 mb-6 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: editingTemplateForm.mainMessage?.replace('{dealId}', 'PRJ-1024')?.replace('{managerName}', 'Сергей Некрасов') }} />
                      
                      {editingTemplateForm.showDetailsTable && (
                        <div className="bg-slate-50 border border-gray-200 rounded-lg p-4 mb-6">
                          <div className="text-xs text-gray-500 text-center">[ Таблица деталей заявки ]</div>
                        </div>
                      )}

                      {editingTemplateForm.ctaText && editingTemplateForm.ctaUrl && (
                        <div className="text-center mb-6">
                          <span className="inline-block px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-sm">{editingTemplateForm.ctaText}</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 text-center">
                        {editingTemplateForm.footerNote}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Выберите шаблон для редактирования</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outbox Tab */}
      {activeTab === 'outbox' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-4">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Журнал отправленных писем (Outbox)
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={outboxSearch}
                  onChange={e => setOutboxSearch(e.target.value)}
                  placeholder="Поиск по журналу..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                />
              </div>
              <button
                onClick={() => {
                  setComposerForm({
                    to: '',
                    toName: '',
                    subject: 'Информационное сообщение',
                    message: '',
                    templateType: 'custom_b2b',
                    senderManagerId: selectedManagerId || 'adm-01'
                  });
                  setIsComposerOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Написать письмо
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex gap-4 border-b border-gray-100 pb-4">
            <select 
              value={outboxFilterType}
              onChange={e => setOutboxFilterType(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все типы писем</option>
              {corporateTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            
            <select 
              value={outboxFilterSender}
              onChange={e => setOutboxFilterSender(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все отправители</option>
              {managerAccounts.map(m => (
                <option key={m.managerId} value={m.managerId}>{m.fullName} ({m.email})</option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            {filteredOutbox.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-slate-50 rounded-lg border border-dashed border-gray-200">
                <Clock className="w-8 h-8 mx-auto mb-3 text-gray-400 opacity-50" />
                <p className="font-medium">В журнале пока нет отправленных писем</p>
                <p className="text-xs mt-1">Отправленные системные уведомления будут отображаться здесь</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOutbox.map(item => (
                  <div key={item.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${item.status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {item.status === 'sent' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-sm">{item.subject}</h4>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase">{item.templateType}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-4">
                          <span><strong>Кому:</strong> {item.to}</span>
                          <span><strong>От:</strong> {item.from}</span>
                          <span><strong>Дата:</strong> {new Date(item.timestamp).toLocaleString('ru-RU')}</span>
                        </div>
                        {item.error && (
                          <div className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Ошибка: {item.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Email Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsComposerOpen(false)}>
          <div className="bg-white rounded-lg shadow-sm w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-300" />
                  Новое письмо клиенту
                </h3>
                <p className="text-xs text-blue-200 mt-1">Отправка официального B2B-письма через корпоративный шлюз</p>
              </div>
              <button onClick={() => setIsComposerOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendCustomEmail} className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Отправитель (Менеджер)</label>
                  <select 
                    value={composerForm.senderManagerId}
                    onChange={e => setComposerForm({...composerForm, senderManagerId: e.target.value})}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {managerAccounts.map(m => (
                      <option key={m.managerId} value={m.managerId}>{m.fullName} ({m.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">HTML-Шаблон оформления</label>
                  <select 
                    value={composerForm.templateType}
                    onChange={e => setComposerForm({...composerForm, templateType: e.target.value as any})}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {corporateTemplates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email получателя <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required
                    value={composerForm.to}
                    onChange={e => setComposerForm({...composerForm, to: e.target.value})}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="client@company.ru"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Имя получателя (необязательно)</label>
                  <input 
                    type="text" 
                    value={composerForm.toName}
                    onChange={e => setComposerForm({...composerForm, toName: e.target.value})}
                    className="w-full p-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Иван Иванович"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Тема письма <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={composerForm.subject}
                  onChange={e => setComposerForm({...composerForm, subject: e.target.value})}
                  className="w-full p-2.5 text-sm font-semibold bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Коммерческое предложение / Технический запрос"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Текст сообщения (поддерживается HTML) <span className="text-red-500">*</span>
                </label>
                <textarea 
                  required
                  rows={6}
                  value={composerForm.message}
                  onChange={e => setComposerForm({...composerForm, message: e.target.value})}
                  className="w-full p-3 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Здравствуйте! Направляем вам актуальную техническую информацию..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  disabled={sendingCustom}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendingCustom ? 'Отправка...' : 'Отправить письмо'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Photo Upload Modal */}
      {photoModalUser && (
        <ProfilePhotoModal
          key={photoModalUser.id}
          isOpen={!!photoModalUser}
          onClose={() => setPhotoModalUser(null)}
          user={photoModalUser}
          onSavePhoto={handleSaveManagerAvatar}
        />
      )}

      {/* Add New Corporate Email Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    Подключение корпоративного ящика Яндекс 360
                  </h3>
                  <p className="text-xs text-gray-500">
                    Привязка сотрудника и авторизация по протоколу SSL (smtp.yandex.ru:465)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="p-2 text-gray-400 hover:text-slate-500 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNewAccountMode('new_user')}
                className={`py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  newAccountMode === 'new_user'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Новый сотрудник</span>
              </button>
              <button
                type="button"
                onClick={() => setNewAccountMode('existing_user')}
                className={`py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  newAccountMode === 'existing_user'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-gray-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Выбрать из пользователей БД</span>
              </button>
            </div>

            <form onSubmit={handleCreateManagerAccount} className="space-y-4">
              {newAccountMode === 'existing_user' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500">
                    Выберите сотрудника из базы пользователей *
                  </label>
                  <select
                    value={selectedExistingUserId}
                    onChange={(e) => {
                      const uId = e.target.value;
                      setSelectedExistingUserId(uId);
                      const matched = authUsers.find(u => u.id === uId);
                      if (matched) {
                        setNewAccountForm({
                          fullName: matched.fullName,
                          roleTitle: matched.position || 'Менеджер проектов',
                          email: matched.email.includes('@ds-enginering.ru') ? matched.email : `${matched.email.split('@')[0]}@ds-enginering.ru`,
                          pass: '',
                          fromName: `ООО «ДС‑Инжиниринг» | ${matched.fullName}`,
                          replyTo: matched.email,
                          isDirector: matched.role === 'admin' || matched.role === 'superadmin',
                        });
                      }
                    }}
                    required
                    className="w-full h-10 px-4 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="" disabled>-- Выберите сотрудника --</option>
                    {authUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.position}) — {u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">
                  ФИО сотрудника *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Например: Морозов Кирилл Сергеевич"
                    value={newAccountForm.fullName}
                    onChange={(e) => setNewAccountForm({ 
                      ...newAccountForm, 
                      fullName: e.target.value,
                      fromName: newAccountForm.fromName || `ООО «ДС‑Инжиниринг» | ${e.target.value}`
                    })}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Job Title / Position with Database Sync */}
              <div className="space-y-1.5 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Должность (Синхронизация с БД) *</span>
                  </label>
                  {!isCreatingNewPosition && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewPosition(true)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Создать новую</span>
                    </button>
                  )}
                </div>

                {isCreatingNewPosition ? (
                  <div className="space-y-1.5 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-[11px] font-bold text-blue-900">Новая должность для штатного расписания:</div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Например: Менеджер направления 3D-оборудования"
                        value={newPositionInput}
                        onChange={(e) => setNewPositionInput(e.target.value)}
                        className="flex-1 p-2 text-xs bg-white border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={!newPositionInput.trim() || isSavingPosition}
                        onClick={async () => {
                          const val = newPositionInput.trim();
                          const saved = await handleAddNewPosition(val);
                          if (saved) {
                            setNewAccountForm({ ...newAccountForm, roleTitle: saved });
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        {isSavingPosition ? 'Сохранение...' : 'В базу'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewPosition(false);
                          setNewPositionInput('');
                        }}
                        className="px-2.5 py-2 bg-gray-200 hover:bg-gray-300 text-slate-500 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={positions.includes(newAccountForm.roleTitle) ? newAccountForm.roleTitle : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsCreatingNewPosition(true);
                      } else if (e.target.value === '__custom__') {
                        // keep
                      } else {
                        setNewAccountForm({ ...newAccountForm, roleTitle: e.target.value });
                      }
                    }}
                    className="w-full h-10 px-4 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800"
                  >
                    <option value="" disabled>-- Выберите должность из справочника БД --</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                    {!positions.includes(newAccountForm.roleTitle) && newAccountForm.roleTitle && (
                      <option value="__custom__">{newAccountForm.roleTitle} (Текущая)</option>
                    )}
                    <option value="__add_new__">+ Создать новую должность в базе данных...</option>
                  </select>
                )}
              </div>

              {/* Corporate Email & Yandex Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500">
                    Корпоративный Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="k.morozov@ds-enginering.ru"
                      value={newAccountForm.email}
                      onChange={(e) => setNewAccountForm({ 
                        ...newAccountForm, 
                        email: e.target.value,
                        replyTo: newAccountForm.replyTo || e.target.value
                      })}
                      className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500">
                    Пароль приложения Яндекс ID *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="16-значный ключ"
                      value={newAccountForm.pass}
                      onChange={(e) => setNewAccountForm({ ...newAccountForm, pass: e.target.value })}
                      className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sender Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">
                  Отображаемое имя отправителя (From Name)
                </label>
                <input
                  type="text"
                  placeholder="ООО «ДС‑Инжиниринг» | Морозов Кирилл Сергеевич"
                  value={newAccountForm.fromName}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, fromName: e.target.value })}
                  className="w-full h-10 px-4.5 text-xs bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Director checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newAccountIsDirector"
                  checked={newAccountForm.isDirector}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, isDirector: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="newAccountIsDirector" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                  Главный корпоративный ящик организации (Руководитель)
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewAccount}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingNewAccount ? 'Подключение...' : 'Подключить и сохранить в БД'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailSettingsView;
