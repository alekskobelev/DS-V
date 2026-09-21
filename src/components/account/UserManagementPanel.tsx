import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AuthAccount, 
  UserPermissions, 
  DEFAULT_ROLE_PERMISSIONS, 
  getUserPermissions 
} from '../../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Shield,
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  X, 
  Building2, 
  Phone, 
  Mail, 
  Briefcase, 
  Lock, 
  UserCheck, 
  Sliders, 
  Layers, 
  FileText, 
  AlertCircle,
  KeyRound,
  Database,
  Camera,
  Plus,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  CheckSquare,
  Square,
  Zap,
  Info
} from 'lucide-react';
import { ProfilePhotoModal } from './ProfilePhotoModal';

export const UserManagementPanel: React.FC = () => {
  const { 
    authUsers, 
    currentUser, 
    createUser, 
    updateUser, 
    deleteUser, 
    updateUserPermissions, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthAccount | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<AuthAccount | null>(null);
  const [userToDelete, setUserToDelete] = useState<AuthAccount | null>(null);
  const [photoModalUser, setPhotoModalUser] = useState<AuthAccount | null>(null);
  const [permSearchQuery, setPermSearchQuery] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (permissionsUser) setPermissionsUser(null);
        else if (isCreateModalOpen) setIsCreateModalOpen(false);
        else if (editingUser) setEditingUser(null);
        else if (userToDelete) setUserToDelete(null);
        else if (photoModalUser) setPhotoModalUser(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [permissionsUser, isCreateModalOpen, editingUser, userToDelete, photoModalUser]);

  // Lock background scroll when any modal is open
  useEffect(() => {
    const hasModal = !!(permissionsUser || isCreateModalOpen || editingUser || userToDelete || photoModalUser);
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [permissionsUser, isCreateModalOpen, editingUser, userToDelete, photoModalUser]);

  // New user form state
  const [newUserData, setNewUserData] = useState<Omit<AuthAccount, 'id'>>({
    fullName: '',
    email: '',
    phone: '',
    company: 'ООО «ДС‑Инжиниринг»',
    position: 'Менеджер проектов',
    role: 'manager',
    password: '',
    permissions: DEFAULT_ROLE_PERMISSIONS.manager,
  });

  // Edit user form state
  const [editUserData, setEditUserData] = useState<Partial<AuthAccount>>({});

  // Positions directory synchronized with database (PostgreSQL)
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
  const [isCreatingEditPosition, setIsCreatingEditPosition] = useState(false);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const [newPositionInput, setNewPositionInput] = useState('');
  const [newEditPositionInput, setNewEditPositionInput] = useState('');
  const [isSavingPosition, setIsSavingPosition] = useState(false);

  // Fetch positions from database
  useEffect(() => {
    fetch('/api/company/positions')
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setPositions(data.data);
        }
      })
      .catch(() => {});
  }, []);

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
      setNewEditPositionInput('');
      setIsCreatingNewPosition(false);
      setIsCreatingEditPosition(false);
    }
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return authUsers.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.company.toLowerCase().includes(q) ||
        user.position.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q)
      );
    });
  }, [authUsers, roleFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = authUsers.length;
    const superadmins = authUsers.filter((u) => u.role === 'superadmin').length;
    const admins = authUsers.filter((u) => u.role === 'admin').length;
    const moderators = authUsers.filter((u) => u.role === 'moderator').length;
    const managers = authUsers.filter((u) => u.role === 'manager').length;
    const clients = authUsers.filter((u) => u.role === 'client').length;
    return { total, superadmins, admins, moderators, managers, clients };
  }, [authUsers]);

  // Handle create submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.fullName || !newUserData.email) {
      showToast('Заполните обязательные поля: ФИО и Email');
      return;
    }

    const success = createUser(newUserData);
    if (success) {
      setIsCreateModalOpen(false);
      setNewUserData({
        fullName: '',
        email: '',
        phone: '',
        company: 'ООО «ДС‑Инжиниринг»',
        position: 'Менеджер проектов',
        role: 'manager',
        password: '',
        permissions: DEFAULT_ROLE_PERMISSIONS.manager,
      });
    }
  };

  // Open edit modal
  const handleOpenEdit = (user: AuthAccount) => {
    setEditingUser(user);
    setEditUserData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      company: user.company,
      position: user.position,
      role: user.role,
      password: user.password || '',
    });
  };

  // Save edit user
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const success = updateUser(editingUser.id, editUserData);
    if (success) {
      setEditingUser(null);
    }
  };

  // Open permissions modal
  const handleOpenPermissions = (user: AuthAccount) => {
    setPermissionsUser(user);
  };

  // Toggle permission item for selected user
  const handleTogglePermission = (key: keyof UserPermissions) => {
    if (!permissionsUser) return;
    
    if (!isSuperAdmin) {
      showToast('Изменение прав и ролей доступно только Супер Администратору');
      return;
    }

    const currentPerms = getUserPermissions(permissionsUser);
    const updatedPerms: UserPermissions = {
      ...currentPerms,
      [key]: !currentPerms[key],
    };

    updateUserPermissions(permissionsUser.id, updatedPerms);
    setPermissionsUser((prev) => (prev ? { ...prev, permissions: updatedPerms } : null));
  };

  // Set all permissions to true or false
  const handleSetAllPermissions = (value: boolean) => {
    if (!permissionsUser) return;
    if (!isSuperAdmin) {
      showToast('Изменение прав и ролей доступно только Супер Администратору');
      return;
    }
    const allKeys: (keyof UserPermissions)[] = [
      'canAccessCrm',
      'canEditDeals',
      'canReopenClosedDeals',
      'canDeleteDeals',
      'canAccessCms',
      'canManageContracts',
      'canManageTickets',
      'canManageLicenses',
      'canManageUsers',
      'canExportReports',
    ];
    const newPerms: UserPermissions = {} as UserPermissions;
    allKeys.forEach((k) => {
      newPerms[k] = value;
    });
    updateUserPermissions(permissionsUser.id, newPerms);
    setPermissionsUser((prev) => (prev ? { ...prev, permissions: newPerms } : null));
    showToast(value ? 'Предоставлены все 10 прав доступа' : 'Все индивидуальные права отключены');
  };

  // Reset to default role permissions
  const handleResetToRoleDefault = () => {
    if (!permissionsUser) return;
    if (!isSuperAdmin) {
      showToast('Изменение прав и ролей доступно только Супер Администратору');
      return;
    }
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[permissionsUser.role] || DEFAULT_ROLE_PERMISSIONS.manager;
    updateUserPermissions(permissionsUser.id, defaultPerms);
    setPermissionsUser((prev) => (prev ? { ...prev, permissions: defaultPerms } : null));
    showToast(`Права сброшены к стандартным для роли «${permissionsUser.role}»`);
  };

  // Apply a specific functional preset
  const handleApplyPreset = (presetPerms: Partial<UserPermissions>, title: string) => {
    if (!permissionsUser) return;
    if (!isSuperAdmin) {
      showToast('Изменение прав и ролей доступно только Супер Администратору');
      return;
    }
    const current = getUserPermissions(permissionsUser);
    const updated: UserPermissions = {
      ...current,
      ...presetPerms,
    };
    updateUserPermissions(permissionsUser.id, updated);
    setPermissionsUser((prev) => (prev ? { ...prev, permissions: updated } : null));
    showToast(`Применен профиль: «${title}»`);
  };

  // Delete user confirm
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const success = deleteUser(userToDelete.id);
    if (success) {
      setUserToDelete(null);
    }
  };

  // Direct toggle permission for any user from the table
  const handleToggleUserPermission = (
    user: AuthAccount,
    key: keyof UserPermissions,
    label: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    
    if (!isSuperAdmin) {
      showToast('Изменение прав и ролей доступно только Супер Администратору');
      return;
    }

    const currentPerms = getUserPermissions(user);
    const isNowActive = !currentPerms[key];
    const updatedPerms: UserPermissions = {
      ...currentPerms,
      [key]: isNowActive,
    };

    updateUserPermissions(user.id, updatedPerms);
    showToast(
      isNowActive
        ? `Право «${label}» предоставлено (${user.fullName})`
        : `Право «${label}» отключено (${user.fullName})`
    );

    if (permissionsUser && permissionsUser.id === user.id) {
      setPermissionsUser((prev) => (prev ? { ...prev, permissions: updatedPerms } : null));
    }
  };

  // Role pill styles
  const getRoleBadge = (role: 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client') => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3.5 h-3.5" /> Супер админ
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" /> Админ
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
            <UserCheck className="w-3.5 h-3.5" /> Модератор
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" /> Менеджер проектов
          </span>
        );
      case 'client':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Users className="w-3.5 h-3.5" /> Клиент / Заказчик
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Управление пользователями и правами
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3 h-3 text-emerald-500" /> Хранение: PostgreSQL (DB)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Настройка ролей, создание учетных записей сотрудников и разграничение доступа к модулям CRM, CMS и воронкам. Права сохраняются напрямую в базе данных.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/users');
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                  showToast(`Синхронизировано ${json.data.length} пользователей из базы данных`);
                  window.location.reload();
                }
              } catch {
                showToast('Ошибка при синхронизации пользователей из БД');
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Синхронизировать пользователей с базой данных"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" /> Обновить из БД
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Добавить пользователя
          </button>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Всего аккаунтов</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Супер админы</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{stats.superadmins}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Админы</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{stats.admins}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-100 bg-purple-50/20">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Модераторы</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.moderators}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Менеджеры</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.managers}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Клиенты</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.clients}</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по ФИО, email, телефону, организации..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'superadmin', 'admin', 'moderator', 'manager', 'client'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              {r === 'all' && `Все (${stats.total})`}
              {r === 'superadmin' && `Супер админы (${stats.superadmins})`}
              {r === 'admin' && `Админы (${stats.admins})`}
              {r === 'moderator' && `Модераторы (${stats.moderators})`}
              {r === 'manager' && `Менеджеры (${stats.managers})`}
              {r === 'client' && `Клиенты (${stats.clients})`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Users Table & Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Пользователь</th>
                <th className="py-3.5 px-4">Организация и должность</th>
                <th className="py-3.5 px-4">Роль</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span>Права доступа</span>
                    <span className="text-[9px] font-normal normal-case text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">клик для вкл/выкл</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredUsers.map((user) => {
                const perms = getUserPermissions(user);
                const isCurrent = currentUser?.id === user.id;
                const isMainAdmin = user.id === 'adm-01' || user.email === 's.nekrasov@ds-enginering.ru';

                return (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPhotoModalUser(user)}
                          className="relative group w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-blue-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Нажмите, чтобы изменить фотографию пользователя"
                        >
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm group-hover:bg-blue-200 transition-all">
                              {user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-blue-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-3.5 h-3.5 text-white" />
                          </div>
                        </button>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            <span>{user.fullName}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                Вы
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-[11px] flex flex-col gap-1 mt-1">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" /> <span className="truncate">{user.email}</span>
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-gray-400 shrink-0" /> {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company & Position */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{user.company}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5">{user.position}</div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Permissions summary - clean structured preview */}
                    <td className="py-3 px-4">
                      {(() => {
                        const activeCount = Object.values(perms).filter(Boolean).length;
                        const isSuper = user.role === 'superadmin';
                        const isFull = isSuper || activeCount === 10;

                        return (
                          <div className="flex flex-col gap-1.5 min-w-[220px] max-w-[280px]">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                  isFull
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : activeCount > 0
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                }`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{isFull ? 'Полный доступ (10/10)' : `${activeCount} из 10 прав`}</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => handleOpenPermissions(user)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Открыть матрицу прав доступа"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>Настроить</span>
                              </button>
                            </div>

                            {/* 5 compact domain status pills */}
                            <div className="flex items-center gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => handleToggleUserPermission(user, 'canAccessCrm', 'CRM', e)}
                                title={perms.canAccessCrm ? 'CRM: Доступ активен (клик для откл)' : 'CRM: Доступ отключен (клик для вкл)'}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  perms.canAccessCrm
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-xs'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 line-through opacity-60'
                                }`}
                              >
                                CRM
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleToggleUserPermission(user, 'canAccessCms', 'CMS', e)}
                                title={perms.canAccessCms ? 'CMS: Доступ активен (клик для откл)' : 'CMS: Доступ отключен (клик для вкл)'}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  perms.canAccessCms
                                    ? 'bg-purple-100 text-purple-800 border border-purple-300 shadow-xs'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 line-through opacity-60'
                                }`}
                              >
                                CMS
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleToggleUserPermission(user, 'canManageContracts', 'Договоры', e)}
                                title={perms.canManageContracts ? 'Договоры: Управление активно' : 'Договоры: Отключено'}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  perms.canManageContracts
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 line-through opacity-60'
                                }`}
                              >
                                Договоры
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleToggleUserPermission(user, 'canManageTickets', 'Сервис', e)}
                                title={perms.canManageTickets ? 'Сервис: Активно' : 'Сервис: Отключено'}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  perms.canManageTickets
                                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-xs'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 line-through opacity-60'
                                }`}
                              >
                                Сервис
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleToggleUserPermission(user, 'canManageUsers', 'Админ прав', e)}
                                title={perms.canManageUsers ? 'Управление правами: Активно' : 'Управление правами: Отключено'}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  perms.canManageUsers
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200 line-through opacity-60'
                                }`}
                              >
                                Админ
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPermissions(user)}
                          title="Настроить права доступа"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Редактировать данные"
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-500 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isMainAdmin && !isCurrent && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            title="Удалить пользователя"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                    Пользователи по заданным критериям не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: CREATE USER ================= */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div 
            className="bg-white w-full max-w-xl rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-gray-900 text-white flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base">Создание нового пользователя</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Закрыть (Esc)"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">ФИО сотрудника <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Иванов Сергей Павлович"
                      value={newUserData.fullName}
                      onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Email (логин) <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="s.ivanov@ds-enginering.ru"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Телефон</label>
                    <input
                      type="text"
                      placeholder="+7 (846) 200-00-00"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Пароль</label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Организация</label>
                    <input
                      type="text"
                      placeholder="ООО «ДС‑Инжиниринг»"
                      value={newUserData.company}
                      onChange={(e) => setNewUserData({ ...newUserData, company: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
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
                      <div className="mt-1 space-y-1.5 p-2 bg-blue-50/80 border border-blue-200 rounded-xl animate-in fade-in duration-150">
                        <div className="text-[11px] font-bold text-blue-900">Новая должность для штатного расписания:</div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Например: Инженер-метролог КИМ"
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
                                setNewUserData({ ...newUserData, position: saved });
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
                      <div className="mt-1 flex items-center gap-1.5">
                        <select
                          value={positions.includes(newUserData.position) ? newUserData.position : '__custom__'}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setIsCreatingNewPosition(true);
                            } else if (e.target.value === '__custom__') {
                              // keep current
                            } else {
                              setNewUserData({ ...newUserData, position: e.target.value });
                            }
                          }}
                          className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        >
                          <option value="" disabled>-- Выберите должность из справочника БД --</option>
                          {positions.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                          {!positions.includes(newUserData.position) && newUserData.position && (
                            <option value="__custom__">{newUserData.position} (Текущая)</option>
                          )}
                          <option value="__add_new__">+ Создать новую должность в базе данных...</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Роль в системе</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client';
                      setNewUserData({
                        ...newUserData,
                        role: newRole,
                        permissions: DEFAULT_ROLE_PERMISSIONS[newRole],
                      });
                    }}
                    disabled={!isSuperAdmin}
                    className={`w-full p-2.5 text-xs border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-bold ${!isSuperAdmin ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-slate-50'}`}
                  >
                    <option value="superadmin">Супер админ — Генеральный директор</option>
                    <option value="admin">Админ — Администраторы</option>
                    <option value="moderator">Модератор — Наполнение и ведение сайта</option>
                    <option value="manager">Менеджер проектов</option>
                    <option value="client">Клиент</option>
                  </select>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Создать пользователя
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER DETAILS ================= */}
      {editingUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-gray-900 text-white flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base truncate">Редактирование: {editingUser.fullName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
                title="Закрыть (Esc)"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">ФИО <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editUserData.fullName || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, fullName: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={editUserData.email || ''}
                      onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Телефон</label>
                    <input
                      type="text"
                      value={editUserData.phone || ''}
                      onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Организация</label>
                    <input
                      type="text"
                      value={editUserData.company || ''}
                      onChange={(e) => setEditUserData({ ...editUserData, company: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>Должность (Синхронизация с БД) *</span>
                      </label>
                      {!isCreatingEditPosition && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingEditPosition(true)}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Создать новую</span>
                        </button>
                      )}
                    </div>

                    {isCreatingEditPosition ? (
                      <div className="mt-1 space-y-1.5 p-2 bg-blue-50/80 border border-blue-200 rounded-xl animate-in fade-in duration-150">
                        <div className="text-[11px] font-bold text-blue-900">Новая должность для штатного расписания:</div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Например: Главный конструктор CAD"
                            value={newEditPositionInput}
                            onChange={(e) => setNewEditPositionInput(e.target.value)}
                            className="flex-1 p-2 text-xs bg-white border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={!newEditPositionInput.trim() || isSavingPosition}
                            onClick={async () => {
                              const val = newEditPositionInput.trim();
                              const saved = await handleAddNewPosition(val);
                              if (saved) {
                                setEditUserData({ ...editUserData, position: saved });
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                          >
                            {isSavingPosition ? 'Сохранение...' : 'В базу'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingEditPosition(false);
                              setNewEditPositionInput('');
                            }}
                            className="px-2.5 py-2 bg-gray-200 hover:bg-gray-300 text-slate-500 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5">
                        <select
                          value={positions.includes(editUserData.position || '') ? editUserData.position : '__custom__'}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setIsCreatingEditPosition(true);
                            } else if (e.target.value === '__custom__') {
                              // keep current
                            } else {
                              setEditUserData({ ...editUserData, position: e.target.value });
                            }
                          }}
                          className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        >
                          <option value="" disabled>-- Выберите должность из справочника БД --</option>
                          {positions.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                          {!positions.includes(editUserData.position || '') && editUserData.position && (
                            <option value="__custom__">{editUserData.position} (Текущая)</option>
                          )}
                          <option value="__add_new__">+ Создать новую должность в базе данных...</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Пароль учетной записи</label>
                  <input
                    type="text"
                    value={editUserData.password || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                    placeholder="Оставьте без изменений или введите новый пароль"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Роль</label>
                  <select
                    value={editUserData.role || 'manager'}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value as any })}
                    disabled={!isSuperAdmin}
                    className={`w-full p-2.5 text-xs border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-bold ${!isSuperAdmin ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-slate-50'}`}
                  >
                    <option value="superadmin">Супер админ — Генеральный директор</option>
                    <option value="admin">Админ — Администраторы</option>
                    <option value="moderator">Модератор — Наполнение и ведение сайта</option>
                    <option value="manager">Менеджер проектов</option>
                    <option value="client">Клиент</option>
                  </select>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-slate-50 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIGURE PERMISSIONS ================= */}
      {permissionsUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPermissionsUser(null);
          }}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm z-10 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white truncate">Матрица прав доступа</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      PostgreSQL 17
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                    {permissionsUser.fullName} &bull; {permissionsUser.position || permissionsUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermissionsUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
                title="Закрыть окно (Esc)"
                aria-label="Закрыть окно настройки прав"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
              {/* User Overview & Active Counter Card */}
              {(() => {
                const perms = getUserPermissions(permissionsUser);
                const activeCount = Object.values(perms).filter(Boolean).length;
                const percent = Math.round((activeCount / 10) * 100);

                return (
                  <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/60 rounded-xl border border-blue-100/90 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>Роль в системе:</span>
                          {getRoleBadge(permissionsUser.role)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {permissionsUser.role === 'superadmin' && 'Супер админ — Полные права управления предприятием и сайтом'}
                          {permissionsUser.role === 'admin' && 'Администратор — Полный доступ к модулям за вычетом деструктивных настроек'}
                          {permissionsUser.role === 'moderator' && 'Модератор — Управление контентом каталога и статей CMS'}
                          {permissionsUser.role === 'manager' && 'Менеджер — Ведение клиентских сделок, договоров и сервисных тикетов'}
                          {permissionsUser.role === 'client' && 'Клиент — Личный кабинет заказчика (просмотр своих заявок и лицензий)'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">
                          Активно: <span className="text-blue-700">{activeCount} из 10</span>
                        </div>
                        <div className="w-28 h-2 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 rounded-full ${
                              activeCount === 10 ? 'bg-purple-600' : activeCount >= 5 ? 'bg-blue-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets Bar */}
                    <div className="pt-2 border-t border-blue-200/50">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Готовые профили в 1 клик:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetAllPermissions(true)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Полный доступ (10/10)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset({
                            canAccessCrm: true,
                            canEditDeals: true,
                            canReopenClosedDeals: true,
                            canDeleteDeals: false,
                            canAccessCms: false,
                            canManageContracts: true,
                            canManageTickets: true,
                            canManageLicenses: false,
                            canManageUsers: false,
                            canExportReports: true,
                          }, 'Менеджер проектов')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Briefcase className="w-3 h-3" />
                          <span>Менеджер проектов</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset({
                            canAccessCrm: true,
                            canEditDeals: false,
                            canReopenClosedDeals: false,
                            canDeleteDeals: false,
                            canAccessCms: false,
                            canManageContracts: false,
                            canManageTickets: true,
                            canManageLicenses: true,
                            canManageUsers: false,
                            canExportReports: true,
                          }, 'Инженер-метролог')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs hover:border-teal-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Инженер-метролог</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyPreset({
                            canAccessCrm: false,
                            canEditDeals: false,
                            canReopenClosedDeals: false,
                            canDeleteDeals: false,
                            canAccessCms: true,
                            canManageContracts: false,
                            canManageTickets: false,
                            canManageLicenses: false,
                            canManageUsers: false,
                            canExportReports: false,
                          }, 'Редактор сайта CMS')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Редактор CMS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetToRoleDefault()}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>По роли ({permissionsUser.role})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Search & Bulk Operations Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={permSearchQuery}
                    onChange={(e) => setPermSearchQuery(e.target.value)}
                    placeholder="Быстрый поиск разрешения (например: сделки, cms, удалить)..."
                    className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {permSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPermSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSetAllPermissions(true)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Все ВКЛ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllPermissions(false)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Все ВЫКЛ</span>
                  </button>
                </div>
              </div>

              {/* Categorized Permissions Groups */}
              {(() => {
                const perms = getUserPermissions(permissionsUser);

                const GROUPS = [
                  {
                    id: 'crm',
                    title: 'CRM и воронки продаж',
                    icon: Layers,
                    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
                    items: [
                      {
                        key: 'canAccessCrm' as keyof UserPermissions,
                        title: 'Доступ к CRM и воронкам продаж',
                        desc: 'Просмотр канбан-досок оборудования, услуг, ТО и базы контактов',
                        level: 'Базовое',
                        levelColor: 'bg-blue-100 text-blue-700',
                      },
                      {
                        key: 'canEditDeals' as keyof UserPermissions,
                        title: 'Создание и редактирование сделок',
                        desc: 'Регистрация новых заявок, изменение сумм и Drag-and-Drop по этапам',
                        level: 'Операционное',
                        levelColor: 'bg-blue-100 text-blue-700',
                      },
                      {
                        key: 'canReopenClosedDeals' as keyof UserPermissions,
                        title: 'Возобновление закрытых сделок (Возврат)',
                        desc: 'Право переоткрывать сделки из статусов «Успешно закрыто» и «Отказ / Архив»',
                        level: 'Контроль',
                        levelColor: 'bg-amber-100 text-amber-800',
                      },
                      {
                        key: 'canDeleteDeals' as keyof UserPermissions,
                        title: 'Безвозвратное удаление сделок',
                        desc: 'Полное удаление карточек заявок из базы данных PostgreSQL без возможности отката',
                        level: 'Критическое',
                        levelColor: 'bg-rose-100 text-rose-700',
                      },
                    ]
                  },
                  {
                    id: 'cms',
                    title: 'CMS и управление сайтом',
                    icon: FileText,
                    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
                    items: [
                      {
                        key: 'canAccessCms' as keyof UserPermissions,
                        title: 'Доступ к панели управления CMS',
                        desc: 'Редактирование каталога оборудования КИМ, прайс-листов, новостей и страниц сайта',
                        level: 'Публикация',
                        levelColor: 'bg-purple-100 text-purple-700',
                      }
                    ]
                  },
                  {
                    id: 'documents',
                    title: 'B2B-документы, сервис и лицензии',
                    icon: Briefcase,
                    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    items: [
                      {
                        key: 'canManageContracts' as keyof UserPermissions,
                        title: 'Управление договорами и проектами',
                        desc: 'Создание и редактирование договоров, спецификаций, контроль сроков и актов',
                        level: 'Коммерческое',
                        levelColor: 'bg-emerald-100 text-emerald-800',
                      },
                      {
                        key: 'canManageTickets' as keyof UserPermissions,
                        title: 'Обработка сервисных заявок (Тикеты)',
                        desc: 'Назначение ответственных инженеров, ответы клиентам, смена статусов и файлов',
                        level: 'Сервисное',
                        levelColor: 'bg-cyan-100 text-cyan-800',
                      },
                      {
                        key: 'canManageLicenses' as keyof UserPermissions,
                        title: 'Управление лицензиями ПО и ключами защиты',
                        desc: 'Регистрация ключей HASP/Dongle, сетевых серверов PDM и загрузка файлов (.v2c/.lic)',
                        level: 'Техническое',
                        levelColor: 'bg-teal-100 text-teal-800',
                      }
                    ]
                  },
                  {
                    id: 'security',
                    title: 'Безопасность и отчетность',
                    icon: Lock,
                    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
                    items: [
                      {
                        key: 'canManageUsers' as keyof UserPermissions,
                        title: 'Управление пользователями и правами',
                        desc: 'Создание сотрудников, редактирование профилей и назначение ролей',
                        level: 'Админ',
                        levelColor: 'bg-rose-100 text-rose-700',
                      },
                      {
                        key: 'canExportReports' as keyof UserPermissions,
                        title: 'Экспорт финансовой аналитики и отчетов',
                        desc: 'Выгрузка сводных таблиц пайплайна, прогнозов выручки и конверсий в Excel/CSV',
                        level: 'Финансы',
                        levelColor: 'bg-indigo-100 text-indigo-700',
                      }
                    ]
                  }
                ];

                const query = permSearchQuery.trim().toLowerCase();

                const filteredGroups = GROUPS.map(group => {
                  const filteredItems = group.items.filter(item => {
                    if (!query) return true;
                    return item.title.toLowerCase().includes(query) ||
                           item.desc.toLowerCase().includes(query) ||
                           item.level.toLowerCase().includes(query);
                  });
                  return { ...group, items: filteredItems };
                }).filter(group => group.items.length > 0);

                if (filteredGroups.length === 0) {
                  return (
                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-700">Ничего не найдено</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        По запросу «{permSearchQuery}» нет совпадающих параметров
                      </div>
                      <button
                        type="button"
                        onClick={() => setPermSearchQuery('')}
                        className="mt-3 px-4 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50"
                      >
                        Сбросить фильтр
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filteredGroups.map(group => {
                      const GroupIcon = group.icon;
                      const allGroupActive = group.items.every(i => !!perms[i.key]);

                      return (
                        <div key={group.id} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                                <GroupIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                {group.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                ({group.items.filter(i => !!perms[i.key]).length}/{group.items.length})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newPerms = { ...perms };
                                group.items.forEach(i => {
                                  newPerms[i.key] = !allGroupActive;
                                });
                                updateUserPermissions(permissionsUser.id, newPerms);
                                setPermissionsUser(prev => prev ? { ...prev, permissions: newPerms } : null);
                              }}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {allGroupActive ? 'Снять все в группе' : 'Включить группу'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {group.items.map(item => {
                              const isEnabled = !!perms[item.key];

                              return (
                                <div
                                  key={item.key}
                                  onClick={() => handleTogglePermission(item.key)}
                                  className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                    isEnabled
                                      ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-500/10'
                                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white opacity-85 hover:opacity-100'
                                  }`}
                                >
                                  <div className="pr-3 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-xs font-bold ${isEnabled ? 'text-blue-950' : 'text-slate-800'}`}>
                                        {item.title}
                                      </span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${item.levelColor}`}>
                                        {item.level}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                      {item.desc}
                                    </div>
                                  </div>

                                  <div
                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 mt-0.5 ${
                                      isEnabled ? 'bg-blue-600 justify-end shadow-xs' : 'bg-slate-300 justify-start'
                                    }`}
                                  >
                                    <div className="bg-white w-4 h-4 rounded-full shadow-sm transition-transform" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                <Database className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Синхронизировано с базой PostgreSQL 17</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPermissionsUser(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPermissionsUser(null);
                    showToast(`Права доступа для ${permissionsUser.fullName} сохранены`);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {userToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setUserToDelete(null);
          }}
        >
          <div 
            className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setUserToDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-400 hover:text-slate-500 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Закрыть (Esc)"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base text-gray-900">Удалить пользователя?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Вы действительно хотите удалить учетную запись{' '}
                <strong className="text-gray-800 font-semibold">{userToDelete.fullName}</strong> ({userToDelete.email})? Это действие нельзя отменить.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Modal */}
      {photoModalUser && (
        <ProfilePhotoModal
          isOpen={!!photoModalUser}
          user={photoModalUser}
          onClose={() => setPhotoModalUser(null)}
          onSavePhoto={(newAvatarUrl) => {
            updateUser(photoModalUser.id, { avatar: newAvatarUrl });
            showToast(`Фотография пользователя «${photoModalUser.fullName}» обновлена`);
            setPhotoModalUser(null);
            return true;
          }}
        />
      )}
    </div>
  );
};
