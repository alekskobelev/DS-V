import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Layers,
  Box,
  Wrench,
  Sparkles,
  Clock,
  Settings,
  Scan,
  Target,
  Cpu,
  Printer,
  Compass,
  Zap,
  CheckCircle2,
  Lock,
  ShieldCheck,
  LogOut,
  LogIn,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId, SYSTEM_PAGE_IDS } from '../../types';
import { DsLogo } from '../common/DsLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { RecentSearchesDropdown } from '../common/RecentSearchesDropdown';
import { PRODUCTS_DATA, SERVICES_DATA } from '../../data/mockData';
import { PWAInstallButton } from '../PWAInstallButton';
import { formatUserInitials } from '../../utils/userFormatting';




interface AccountButtonProps {
  isMobile?: boolean;
  handleNav: (page: PageId, detailId?: string) => void;
  currentUser: any;
  isAdmin?: boolean;
  isSuper?: boolean;
  isManager?: boolean;
  isMod?: boolean;
  logout?: () => void;
  dropdownOpen?: boolean;
  setDropdownOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const AccountButton: React.FC<AccountButtonProps> = ({ 
  isMobile, 
  handleNav, 
  currentUser, 
  isAdmin,
  isSuper,
  isManager,
  isMod,
  logout,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onMouseEnter,
  onMouseLeave
}) => {
  const isSuperUser = isSuper ?? (currentUser?.role === 'superadmin');
  const isManagerUser = isManager ?? (currentUser?.role === 'manager');
  const isModUser = isMod ?? (currentUser?.role === 'moderator');
  const formattedName = formatUserInitials(currentUser?.fullName);
  
  if (isMobile) {
    return (
      <button
        onClick={() => handleNav('account')}
        className="text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 text-gray-800 hover:text-blue-600 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-gray-900">{formattedName}</span>
        </div>
        {isSuperUser && (
          <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded font-black border border-amber-300">SuperAdmin</span>
        )}
        {!isSuperUser && isAdmin && (
          <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-bold">Admin</span>
        )}
        {isModUser && (
          <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">Модератор</span>
        )}
        {isManagerUser && (
          <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">Manager</span>
        )}
      </button>
    );
  }

  // Not logged in: Clean square/rectangular button with icon and label
  if (!currentUser) {
    return (
      <button
        id="topbar-login-btn"
        onClick={() => handleNav('account')}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-lg transition-all border border-white/20 text-[11px] font-medium cursor-pointer shadow-2xs hover:shadow-xs group"
        title="Вход в личный кабинет и портал"
      >
        <div className="w-4 h-4 rounded-md bg-blue-300/20 text-blue-200 flex items-center justify-center shrink-0 group-hover:bg-blue-300/30">
          <User className="w-3 h-3 text-blue-200 group-hover:text-white transition-colors" />
        </div>
        <span className="whitespace-nowrap">Личный кабинет</span>
      </button>
    );
  }

  // Logged in: Square/rectangular button with initials, role badge and dropdown
  return (
    <div 
      ref={dropdownRef as React.RefObject<HTMLDivElement>}
      className="relative shrink-0" 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        id="topbar-account-btn"
        onClick={() => setDropdownOpen?.(prev => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-lg transition-all border border-white/25 text-[11px] font-medium cursor-pointer shadow-2xs group"
        title={`Профиль: ${currentUser.fullName}`}
        aria-label="Личный кабинет и профиль"
      >
        <div className="relative shrink-0">
          {currentUser?.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.fullName} 
              className="w-4 h-4 rounded-md object-cover ring-1 ring-white/40" 
            />
          ) : (
            <div className="w-4 h-4 rounded-md bg-blue-400/30 text-white flex items-center justify-center font-bold text-[9px] border border-white/25">
              <User className="w-2.5 h-2.5 text-blue-100" />
            </div>
          )}
          {isAdmin && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full ring-1 ring-blue-900" title="Администратор" />
          )}
        </div>

        <span className="font-semibold tracking-tight text-white whitespace-nowrap">
          {formattedName}
        </span>

        {isSuperUser ? (
          <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-xs font-black uppercase tracking-wider">Super</span>
        ) : isAdmin ? (
          <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-xs font-bold uppercase tracking-wider">Admin</span>
        ) : isModUser ? (
          <span className="text-[9px] bg-purple-300 text-purple-950 px-1.5 py-0.2 rounded-xs font-bold">Модератор</span>
        ) : isManagerUser ? (
          <span className="text-[9px] bg-blue-200 text-blue-950 px-1.5 py-0.2 rounded-xs font-bold">CRM</span>
        ) : null}

        <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
      </button>

      {/* Interactive Profile Dropdown from TopBar */}
      <div 
        className={`absolute right-0 top-full pt-1.5 w-64 z-50 transition-all duration-150 ${dropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 py-2 overflow-hidden ring-1 ring-black/5 text-slate-900">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
            <div className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</div>
            <div className="text-[11px] text-blue-600 font-medium truncate">{currentUser.company || currentUser.email}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                isSuperUser ? 'bg-amber-100 text-amber-950 border border-amber-300' : isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-200' : isManagerUser ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-800'
              }`}>
                {isSuperUser ? '⚡ Главный администратор' : isAdmin ? '🛡️ Администратор сайта' : isManagerUser ? '💼 Менеджер (Сотрудник)' : '👤 Корпоративный клиент'}
              </span>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setDropdownOpen?.(false);
                handleNav('account');
              }}
              className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Личный кабинет</div>
                <div className="text-[10px] text-slate-400">Заказы, КП, лицензии, тикеты</div>
              </div>
            </button>

            {(isAdmin || isManagerUser) && (
              <button
                onClick={() => {
                  setDropdownOpen?.(false);
                  handleNav('account');
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900">CRM-система (Воронки)</div>
                  <div className="text-[10px] text-slate-400">Сделки, лиды, аналитика</div>
                </div>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setDropdownOpen?.(false);
                  handleNav('cms');
                }}
                className="w-full text-left px-4 py-2 text-xs text-amber-900 bg-amber-50/70 hover:bg-amber-100 flex items-center gap-2.5 font-medium transition-colors border-t border-amber-100 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold">Панель управления CMS</div>
                  <div className="text-[10px] text-amber-700">Редактор каталога и страниц</div>
                </div>
              </button>
            )}
          </div>

          {logout && (
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setDropdownOpen?.(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Выйти из профиля</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const { 
    currentPage, 
    navigateTo, 
    compareList, 
    setIsCompareDrawerOpen, 
    setIsSearchOpen, 
    openContactModal,
    favorites,
    customPages,
    companyInfo,
    currentUser,
    userPermissions,
    isAdmin,
    logout,
    setActiveCategory
  } = useApp();

  const hasCmsAccess = isAdmin || !!userPermissions?.canAccessCms;
  const hasCrmAccess = isAdmin || !!userPermissions?.canAccessCrm;

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const [softwareDropdown, setSoftwareDropdown] = useState(false);
  const [hardwareDropdown, setHardwareDropdown] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [activeHardwareNavTab, setActiveHardwareNavTab] = useState<string>('tech-laser');
  const [activeServiceNavTab, setActiveServiceNavTab] = useState<string>('all');
  const [hardwareNavSearch, setHardwareNavSearch] = useState<string>('');
  const [isHardwareSearchFocused, setIsHardwareSearchFocused] = useState(false);
  const [mobileHardwareExpandedCat, setMobileHardwareExpandedCat] = useState<string | null>(null);

  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

  const handleProfileMouseEnter = () => {
    if (profileLeaveTimerRef.current) {
      clearTimeout(profileLeaveTimerRef.current);
      profileLeaveTimerRef.current = null;
    }
  };

  const handleProfileMouseLeave = () => {
    if (profileLeaveTimerRef.current) {
      clearTimeout(profileLeaveTimerRef.current);
    }
    // Smooth 250ms grace period so moving mouse or clicking won't abruptly dismiss menu
    profileLeaveTimerRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 250);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSoftwareDropdown(false);
        setHardwareDropdown(false);
        setServicesDropdown(false);
        setProfileDropdownOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (profileLeaveTimerRef.current) {
        clearTimeout(profileLeaveTimerRef.current);
      }
    };
  }, []);

  const handleNav = (page: PageId, detailId?: string) => {
    navigateTo(page, detailId);
    setMobileMenuOpen(false);
    setSoftwareDropdown(false);
    setHardwareDropdown(false);
    setServicesDropdown(false);
    setProfileDropdownOpen(false);
  };

  return (
    <>
      {/* Top Bar for desktop & mobile: in natural document flow, scrolls away smoothly without layout jumps */}
      <div className="bg-[#1E3A8A] text-white text-xs font-normal border-b border-blue-900/40 w-full py-1.5 relative z-40">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-y-1.5 gap-x-3">
          {/* TopBar Line 1 (on <xl) / Left group (on xl+) */}
          <div className="flex items-center justify-between xl:justify-start gap-2 sm:gap-4 text-[11px] sm:text-xs min-w-0">
            <span className="flex items-center text-blue-200 shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 sm:mr-2 animate-pulse shrink-0"></span>
              <span className="whitespace-nowrap">Опыт: <strong className="ml-1 text-white font-semibold">более 30 лет</strong></span>
            </span>
            <span className="hidden xl:flex items-center text-blue-200 text-xs min-w-0 truncate">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
              <span className="truncate max-w-[280px] 2xl:max-w-none">{companyInfo.address}</span>
            </span>
            <span className="hidden 2xl:flex items-center text-blue-200 text-xs whitespace-nowrap shrink-0">
              <Clock className="w-3.5 h-3.5 mr-1 text-blue-300 shrink-0" />
              <span>{companyInfo.workHours}</span>
            </span>

            {/* Mobile & Tablet Phone & Account (shown in Line 1 on <xl) */}
            <div className="flex xl:hidden items-center gap-2 sm:gap-4 shrink-0">
              <a 
                href={`tel:${companyInfo.phoneClean}`} 
                className="flex items-center text-white hover:text-amber-300 font-semibold tracking-wide transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
                <span>{companyInfo.phone}</span>
              </a>

              { /* Account Button (Tablet) */ }
              <div className="xl:hidden"><PWAInstallButton /></div>
              <div className="xl:hidden">
                <AccountButton 
                  isMobile={false} 
                  handleNav={handleNav} 
                  currentUser={currentUser} 
                  isAdmin={isAdmin}
                  isSuper={currentUser?.role === 'superadmin'}
                  isManager={currentUser?.role === 'manager'}
                  isMod={currentUser?.role === 'moderator'}
                  logout={logout}
                  dropdownOpen={profileDropdownOpen}
                  setDropdownOpen={setProfileDropdownOpen}
                  dropdownRef={profileDropdownRef}
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
                />
              </div>
            </div>
          </div>

          {/* TopBar Line 2 (on <xl) / Right group (on xl+) */}
          <div className="flex items-center justify-between xl:justify-end gap-2 sm:gap-3 text-[11px] sm:text-xs shrink-0 pt-1 xl:pt-0 border-t xl:border-t-0 border-blue-800/60 min-w-0">
            {/* Address on Tablet/Mobile (<xl) */}
            <span className="flex xl:hidden items-center text-blue-200 text-[11px] sm:text-xs min-w-0 truncate mr-2">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-[450px]">{companyInfo.address}</span>
            </span>

            {/* Desktop right contacts & social links */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto xl:ml-0">
              { /* Account Button (Desktop) */ }
              <div className="hidden xl:block"><PWAInstallButton /></div>
              <div className="hidden xl:block">
                <AccountButton 
                  isMobile={false} 
                  handleNav={handleNav} 
                  currentUser={currentUser} 
                  isAdmin={isAdmin}
                  isSuper={currentUser?.role === 'superadmin'}
                  isManager={currentUser?.role === 'manager'}
                  isMod={currentUser?.role === 'moderator'}
                  logout={logout}
                  dropdownOpen={profileDropdownOpen}
                  setDropdownOpen={setProfileDropdownOpen}
                  dropdownRef={profileDropdownRef}
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
                />
              </div>

              <a 
                href={`tel:${companyInfo.phoneClean}`} 
                className="hidden xl:flex items-center text-white hover:text-amber-300 font-semibold tracking-wide transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
                <span>{companyInfo.phone}</span>
              </a>

              <a 
                href={`mailto:${companyInfo.email}`} 
                className="flex items-center text-blue-200 hover:text-white transition-colors whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5 mr-1 text-blue-300 shrink-0" />
                <span className="hidden sm:inline">{companyInfo.email}</span>
                <span className="sm:hidden">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Main Nav Bar: pins to top on scroll, invariant height prevents any trembling/jitter */}
      <header className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 border-b ${
        isScrolled ? 'shadow-md border-gray-200' : 'shadow-xs border-gray-100'
      }`}>
        {/* Main Nav Bar */}
        <div className="relative z-40 bg-white w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4 sm:gap-6 xl:gap-8 w-full min-w-0">
          {/* Logo Brand Lockup */}
          <a 
            id="header-logo-btn"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home');
            }} 
            className="flex items-center gap-1.5 sm:gap-2 text-left group focus:outline-none shrink-0"
          >
            <div className="shrink-0 flex items-center">
              <DsLogo size={40} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="font-black tracking-tight text-[#003882] leading-none group-hover:text-[#2563EB] transition-colors whitespace-nowrap text-[clamp(14px,3.5vw,19px)] 2xl:text-[21px]">
                ДС‑ИНЖИНИРИНГ
              </div>
              <div className="hidden min-[1680px]:block text-[10px] text-gray-500 font-normal leading-tight mt-0.5 truncate max-w-[240px]">
                Инжиниринговые услуги и оборудование
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-0.5 2xl:space-x-1 text-[11px] 2xl:text-xs font-bold uppercase tracking-tight text-[#374151] shrink-0">
            <button
              id="nav-home-btn"
              onClick={() => handleNav('home')}
              className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'home' 
                  ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                  : 'hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              ГЛАВНАЯ
            </button>

            {/* Hardware Dropdown */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setHardwareDropdown(true)}
              onMouseLeave={() => setHardwareDropdown(false)}
            >
              <button
                id="nav-hardware-btn"
                onClick={() => handleNav('hardware')}
                className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg flex items-center gap-0.5 2xl:gap-1 transition-colors whitespace-nowrap shrink-0 ${
                  currentPage === 'hardware' 
                    ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                    : 'hover:text-[#2563EB] hover:bg-slate-50'
                }`}
              >
                <span>ОБОРУДОВАНИЕ</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${hardwareDropdown ? 'rotate-180' : ''}`} />
              </button>

              {hardwareDropdown && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/3 xl:-translate-x-1/4 w-[960px] xl:w-[1020px] max-h-[65vh] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseEnter={() => setHardwareDropdown(true)}
                >
                  {/* Top Bar with Title, Search and Global Link */}
                  <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                          <span>Каталог оборудования</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                            {PRODUCTS_DATA.filter(p => p.type === 'hardware').length} моделей
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">Прецизионные КИМ, 3D-сканеры, лазерные трекеры и оснастка</div>
                      </div>
                    </div>

                    {/* Quick Search Bar inside Menu */}
                    <div className="relative w-72">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Быстрый поиск модели..."
                        value={hardwareNavSearch}
                        onFocus={() => setIsHardwareSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsHardwareSearchFocused(false), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && hardwareNavSearch.trim()) {
                            addRecentSearch(hardwareNavSearch);
                          }
                        }}
                        onChange={(e) => setHardwareNavSearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-blue-500 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none transition-all"
                      />
                      {hardwareNavSearch && (
                        <button
                          onClick={() => setHardwareNavSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Recent searches dropdown in header menu */}
                      {isHardwareSearchFocused && recentSearches.length > 0 && (
                        <RecentSearchesDropdown
                          searches={recentSearches}
                          onSelect={(term) => {
                            setHardwareNavSearch(term);
                            addRecentSearch(term);
                          }}
                          onRemove={removeRecentSearch}
                          onClear={clearRecentSearches}
                        />
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setHardwareDropdown(false);
                        handleNav('hardware');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors shrink-0"
                    >
                      <span>Все {PRODUCTS_DATA.filter(p => p.type === 'hardware').length} моделей в каталоге</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* 2-Panel Master-Detail Layout */}
                  {hardwareNavSearch.trim() ? (
                    /* Search results view */
                    <div className="p-2 flex-1 min-h-0 flex flex-col">
                      <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center justify-between">
                        <span>Результаты поиска «{hardwareNavSearch}»:</span>
                        <span className="text-[11px] text-blue-600">
                          Найдено {PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.name.toLowerCase().includes(hardwareNavSearch.toLowerCase()) || p.brand.toLowerCase().includes(hardwareNavSearch.toLowerCase()) || p.shortDescription.toLowerCase().includes(hardwareNavSearch.toLowerCase()))).length} моделей
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 flex-1 overflow-y-auto pr-1">
                        {PRODUCTS_DATA.filter(p => p.type === 'hardware' && (
                          p.name.toLowerCase().includes(hardwareNavSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(hardwareNavSearch.toLowerCase()) ||
                          p.shortDescription.toLowerCase().includes(hardwareNavSearch.toLowerCase())
                        )).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setHardwareDropdown(false);
                              handleNav('hardware', item.id);
                            }}
                            className="text-left p-2.5 rounded-xl bg-slate-50/70 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider truncate max-w-[130px]">{item.brand}</span>
                              {item.badge && <span className="text-[8px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-semibold shrink-0">{item.badge}</span>}
                            </div>
                            <div className="font-bold text-xs text-gray-900 group-hover:text-blue-600 mt-1 line-clamp-1">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                              {item.shortDescription}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 flex-1 min-h-0">
                      {/* Left Rail: Categories Tabs */}
                      <div className="w-64 shrink-0 space-y-4 bg-slate-50/70 p-2 rounded-xl border border-gray-100 overflow-y-auto min-h-0">
                        {[
                          {
                            groupName: 'ПО ТЕХНОЛОГИИ',
                            items: [
                              {
                                id: 'tech-laser',
                                title: '🔴 Лазерная технология',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.technology === 'laser' || (p.category.includes('scanner') && !p.id.includes('combo') && !p.id.includes('hx') && !p.id.includes('libre') && !p.id.includes('pronova') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('trio') || p.name.toLowerCase().includes('as1'))))).length,
                                icon: Zap,
                                badgeColor: 'bg-red-50 text-red-700 border-red-200'
                              },
                              {
                                id: 'tech-optical',
                                title: '🔵 Оптический подсвет (LED)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.technology === 'optical' || (p.category.includes('scanner') && (p.name.toLowerCase().includes('pro hd') || p.name.toLowerCase().includes('pro 2x') || p.name.toLowerCase().includes('se v2') || p.name.toLowerCase().includes('sp v2') || p.name.toLowerCase().includes('transcan') || p.name.toLowerCase().includes('optimscan') || p.name.toLowerCase().includes('smartscan') || p.name.toLowerCase().includes('stereoscan') || p.name.toLowerCase().includes('primescan') || p.name.toLowerCase().includes('autoscan'))))).length,
                                icon: Scan,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              },
                              {
                                id: 'tech-hybrid',
                                title: '🟣 Оптический гибрид (Лазер + ИК)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.technology === 'hybrid' || (p.category.includes('scanner') && (p.name.toLowerCase().includes('combo') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('libre') || p.name.toLowerCase().includes('pronova') || p.name.toLowerCase().includes('einscan h'))))).length,
                                icon: Sparkles,
                                badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
                              },
                              {
                                id: 'tech-cmm',
                                title: '🔵 Стационарные КИМ',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm')).length,
                                icon: Cpu,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              },
                              {
                                id: 'tech-mobile',
                                title: '🟢 Мобильные КИМ',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm')).length,
                                icon: Compass,
                                badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
                              },
                              {
                                id: 'tech-trackers',
                                title: '🔵 Лазерные трекеры',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && p.category === 'trackers').length,
                                icon: Target,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              }
                            ]
                          },
                          {
                            groupName: 'ПО БРЕНДАМ',
                            items: [
                              {
                                id: 'brand-scanline',
                                title: 'ScanLine',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline'))).length,
                                icon: Box,
                                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              },
                              {
                                id: 'brand-shining',
                                title: 'Shining 3D',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan'))).length,
                                icon: Sparkles,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              },
                              {
                                id: 'brand-hexagon',
                                title: 'Hexagon / Leica',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon'))).length,
                                icon: Target,
                                badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              }
                            ]
                          }
                        ].map((group, groupIdx) => (
                          <div key={groupIdx} className="space-y-1">
                            <div className="px-2 text-[10px] font-bold text-gray-400 mb-1">{group.groupName}</div>
                            {group.items.map((cat) => {
                              const IconComp = cat.icon;
                              const isActive = activeHardwareNavTab === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  onMouseEnter={() => setActiveHardwareNavTab(cat.id)}
                                  onClick={() => setActiveHardwareNavTab(cat.id)}
                                  className={`w-full text-left px-4 py-2 rounded-xl transition-all flex items-center justify-between group ${
                                    isActive 
                                      ? 'bg-white shadow-md border border-blue-200 text-blue-700 font-bold translate-x-1' 
                                      : 'hover:bg-white/80 text-slate-500 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs truncate">{cat.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 ml-1">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${cat.badgeColor}`}>
                                      {cat.count}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      {/* Right Panel: Compact Cards of Active Category */}
                      <div className="flex-1 min-w-0 flex flex-col min-h-0">
                        {/* Category Heading Description */}
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              {activeHardwareNavTab === 'tech-laser' && '🔴 Лазерные 3D-сканеры'}
                              {activeHardwareNavTab === 'tech-optical' && '🔵 Оптические 3D-сканеры (Структурированный свет)'}
                              {activeHardwareNavTab === 'tech-ir' && '🟢 Инфракрасные сканеры (IR)'}
                              {activeHardwareNavTab === 'tech-cmm' && '🔵 Стационарные КИМ'}
                              {activeHardwareNavTab === 'tech-mobile' && '🟢 Мобильные КИМ'}
                              {activeHardwareNavTab === 'tech-trackers' && '🔵 Лазерные трекеры'}
                              {activeHardwareNavTab === 'brand-scanline' && '🇷🇺 Оборудование ScanLine'}
                              {activeHardwareNavTab === 'brand-shining' && '🇨🇳 Оборудование Shining 3D'}
                              {activeHardwareNavTab === 'brand-hexagon' && '🔷 Оборудование Hexagon / Leica'}
                            </h4>
                            <p className="text-[10px] text-gray-500">
                              {activeHardwareNavTab === 'tech-laser' && 'Высокая точность и стабильность на зеркальных и черных поверхностях, идеально для цеховых условий.'}
                              {activeHardwareNavTab === 'tech-optical' && 'Максимальное разрешение и детализация, безопасный свет, оптимально для сложных геометрий и реверс-инжиниринга.'}
                              {activeHardwareNavTab === 'tech-ir' && 'Безопасное сканирование людей, медицина, VR/AR и сканирование без маркеров.'}
                              {activeHardwareNavTab === 'tech-cmm' && 'Высочайшая метрологическая точность в прецизионных условиях метрологического зала, портальные и мостовые машины.'}
                              {activeHardwareNavTab === 'tech-mobile' && 'Свобода измерений сложных крупногабаритных деталей прямо на производстве.'}
                              {activeHardwareNavTab === 'tech-trackers' && 'Метрологический контроль крупногабаритных объектов до 160 метров.'}
                              {activeHardwareNavTab === 'brand-scanline' && 'Отечественная разработка с гарантией и сервисом в РФ.'}
                              {activeHardwareNavTab === 'brand-shining' && 'Официальные поставки высокоточного оборудования Shining 3D.'}
                              {activeHardwareNavTab === 'brand-hexagon' && 'Премиальные промышленные решения Hexagon Manufacturing Intelligence.'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setHardwareDropdown(false);
                              setActiveCategory(activeHardwareNavTab);
                              handleNav('hardware');
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 shrink-0 ml-2 cursor-pointer"
                          >
                            Подробнее в каталоге →
                          </button>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 flex-1 overflow-y-auto pr-1 py-2">
                          {PRODUCTS_DATA.filter((p) => {
                            if (p.type !== 'hardware') return false;
                            
                            const isLaser = p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1'));
                            const isIr = p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'));
                            const isOptical = p.category.includes('scanner') && !isLaser && !isIr;
                            
                            if (activeHardwareNavTab === 'tech-laser') return isLaser;
                            if (activeHardwareNavTab === 'tech-optical') return isOptical;
                            if (activeHardwareNavTab === 'tech-ir') return isIr;
                            if (activeHardwareNavTab === 'tech-cmm') return p.category === 'cmm' || p.category === 'stationary_cmm';
                            if (activeHardwareNavTab === 'tech-mobile') return p.category === 'arms' || p.category === 'mobile_cmm';
                            if (activeHardwareNavTab === 'tech-trackers') return p.category === 'trackers';
                            
                            if (activeHardwareNavTab === 'brand-scanline') return p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline');
                            if (activeHardwareNavTab === 'brand-shining') return p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan');
                            if (activeHardwareNavTab === 'brand-hexagon') return p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon');
                            
                            return true;
                          }).map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setHardwareDropdown(false);
                                handleNav('hardware', item.id);
                              }}
                              className="text-left p-2 rounded-xl bg-slate-50/60 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider truncate">{item.brand.split(' ')[0]}</span>
                                  {item.badge && (
                                    <span className="text-[8px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-semibold truncate max-w-[90px]">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-xs text-gray-900 group-hover:text-blue-600 line-clamp-1 leading-snug">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                  {item.shortDescription}
                                </div>
                              </div>
                              <div className="mt-1 flex items-center justify-end text-[9px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Перейти к модели →</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        {/* Bottom Actions Toolbar */}
                        <div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between text-xs shrink-0">
                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Поверка по ГОСТ/ISO • Выездная демонстрация • Официальная гарантия и шеф-монтаж</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setHardwareDropdown(false);
                                openContactModal({
                                  title: 'Подбор оборудования под задачу',
                                  formType: 'consultation'
                                });
                              }}
                              className="px-4 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                            >
                              Подобрать под задачу
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Software Dropdown */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setSoftwareDropdown(true)}
              onMouseLeave={() => setSoftwareDropdown(false)}
            >
              <button
                id="nav-software-btn"
                onClick={() => handleNav('software')}
                className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg flex items-center gap-0.5 2xl:gap-1 transition-colors whitespace-nowrap shrink-0 ${
                  currentPage === 'software' 
                    ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                    : 'hover:text-[#2563EB] hover:bg-slate-50'
                }`}
              >
                <span>ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${softwareDropdown ? 'rotate-180' : ''}`} />
              </button>

              {softwareDropdown && (
                <div className="absolute top-full left-0 w-[680px] max-h-[70vh] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 shrink-0">
                    <div className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Лицензионное ПО</span>
                    </div>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      Все программы →
                    </button>
                  </div>

                  {/* Fast Sub-category routing bar */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-3 mb-3 border-b border-gray-100 text-xs">
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'topsolid');
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      TopSolid 7 (CAD/CAM)
                    </button>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'polyworks');
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      PolyWorks (Метрология)
                    </button>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'geomagic');
                      }}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg border border-amber-200 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Geomagic (Реверс-инжиниринг)
                    </button>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'shining3d-sw');
                      }}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg border border-purple-200 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      ПО Shining 3D
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
                    {PRODUCTS_DATA.filter(p => p.type === 'software').map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          setSoftwareDropdown(false);
                          handleNav('software', item.id);
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-blue-50/80 border border-gray-100 hover:border-blue-200 transition-all flex flex-col justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                              {item.brand}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-blue-100/70 text-blue-800 rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                            {item.shortDescription}
                          </div>
                        </div>

                        {item.specs && item.specs['Интегрированные модули'] && (
                          <div className="mt-2.5 pt-2 border-t border-gray-100/80 flex flex-wrap gap-1">
                            {item.specs['Интегрированные модули'].split(', ').slice(0, 3).map((m) => (
                              <span key={m} className="px-1.5 py-0.5 bg-white text-slate-500 text-[9px] font-medium rounded border border-gray-200">
                                {m}
                              </span>
                            ))}
                            {item.specs['Интегрированные модули'].split(', ').length > 3 && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">
                                +{item.specs['Интегрированные модули'].split(', ').length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setServicesDropdown(true)}
              onMouseLeave={() => setServicesDropdown(false)}
            >
              <button
                id="nav-services-btn"
                onClick={() => handleNav('services')}
                className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg flex items-center gap-0.5 2xl:gap-1 transition-colors whitespace-nowrap shrink-0 ${
                  currentPage === 'services' 
                    ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                    : 'hover:text-[#2563EB] hover:bg-slate-50'
                }`}
              >
                <span>УСЛУГИ</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdown ? 'rotate-180' : ''}`} />
              </button>

              {servicesDropdown && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[700px] max-h-[75vh] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseEnter={() => setServicesDropdown(true)}
                >
                  {/* Top Header Bar */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 shrink-0">
                    <div className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <span>Инжиниринговые услуги ({SERVICES_DATA.length} главных направлений)</span>
                    </div>
                    <button
                      onClick={() => {
                        setServicesDropdown(false);
                        handleNav('services');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      <span>Все услуги</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* 2-Column Grid of Services */}
                  <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-y-auto pr-1">
                    {SERVICES_DATA.map((srv) => {
                      // Select icon based on service ID
                      let ServiceIcon = Scan;
                      let categoryTag = '3D-МЕТРОЛОГИЯ';
                      
                      if (srv.id === '3d-scanning') {
                        ServiceIcon = Scan;
                        categoryTag = '3D-СКАНИРОВАНИЕ';
                      } else if (srv.id === 'reverse-engineering') {
                        ServiceIcon = Layers;
                        categoryTag = 'CAD & РЕВЕРС';
                      } else if (srv.id === 'parts-inspection') {
                        ServiceIcon = ShieldCheck;
                        categoryTag = 'КОНТРОЛЬ ГЕОМЕТРИИ';
                      } else if (srv.id === 'tooling-design') {
                        ServiceIcon = Box;
                        categoryTag = 'ОСНАСТКА И ШТАМПЫ';
                      } else if (srv.id === 'cmm-maintenance') {
                        ServiceIcon = Wrench;
                        categoryTag = 'СЕРВИС КИМ';
                      } else if (srv.id === 'postprocessors-dev') {
                        ServiceIcon = Cpu;
                        categoryTag = 'ЧПУ ПОСТПРОЦЕССОРЫ';
                      }

                      return (
                        <button 
                          key={srv.id}
                          onClick={() => {
                            setServicesDropdown(false);
                            handleNav('services', srv.id);
                          }}
                          className="w-full text-left p-3 rounded-xl bg-slate-50/50 hover:bg-blue-50/80 border border-gray-100 hover:border-blue-200 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
                        >
                          <div>
                            {/* Card Header: Icon + Category Tag + Price */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                                  <ServiceIcon className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide truncate">
                                  {categoryTag}
                                </span>
                              </div>
                              <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200/60 shrink-0">
                                {srv.basePriceText}
                              </span>
                            </div>

                            {/* Service Title */}
                            <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {srv.title}
                            </div>

                            {/* Short Description */}
                            <div className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                              {srv.shortDesc}
                            </div>
                          </div>

                          {/* Deliverables Badges */}
                          {srv.deliverables && srv.deliverables.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex flex-wrap gap-1">
                              {srv.deliverables.slice(0, 2).map((deliv, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-white text-slate-500 text-[9px] font-medium rounded border border-gray-200 truncate max-w-[155px]">
                                  ✓ {deliv}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Footer Toolbar */}
                  <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between text-xs shrink-0">
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Офисы в Самаре и Тольятти • Метрологический зал • Выезд по всей РФ</span>
                    </div>
                    <button
                      onClick={() => {
                        setServicesDropdown(false);
                        handleNav('services');
                      }}
                      className="px-4 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                    >
                      Каталог услуг
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Created Dynamic Pages in Header Menu (excluding standard system sections) */}
            {customPages
              .filter((p) => p.showInHeader && !SYSTEM_PAGE_IDS.has(p.id))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleNav(p.id as any)}
                  className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    currentPage === p.id 
                      ? 'text-[#2563EB] font-semibold bg-blue-50/80' 
                      : 'hover:text-[#2563EB] hover:bg-slate-50'
                  }`}
                >
                  {p.menuTitle || p.title}
                </button>
              ))}

            <button
              id="nav-knowledge-btn"
              onClick={() => handleNav('knowledge')}
              className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'knowledge' 
                  ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                  : 'hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              БАЗА ЗНАНИЙ
            </button>

            <button
              id="nav-news-btn"
              onClick={() => handleNav('news')}
              className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'news' 
                  ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                  : 'hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              НОВОСТИ
            </button>

            <button
              id="nav-about-btn"
              onClick={() => handleNav('about')}
              className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'about' 
                  ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                  : 'hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              О КОМПАНИИ
            </button>

            <button
              id="nav-contacts-btn"
              onClick={() => handleNav('contacts')}
              className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'contacts' 
                  ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                  : 'hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              КОНТАКТЫ
            </button>
          </nav>

          {/* Right Action Icons & CTA Button */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 2xl:space-x-2 shrink-0">
            {/* Search Trigger */}
            <button
              id="header-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors shrink-0"
              title="Поиск по сайту (ПО, оборудование, статьи)"
              aria-label="Поиск по сайту"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Compare Trigger */}
            <button
              id="header-compare-btn"
              onClick={() => setIsCompareDrawerOpen(true)}
              className="relative p-1.5 sm:p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors shrink-0"
              title="Сравнение оборудования и ПО"
              aria-label="Сравнение товаров"
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Theme Toggle (Light / Dark Mode) */}
            <ThemeToggle variant="icon" />

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 text-slate-500 hover:text-[#2563EB] hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="Меню"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Slide-out Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="xl:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm cursor-pointer"
              aria-hidden="true"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="xl:hidden fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[380px] bg-white shadow-sm flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <span className="font-black text-gray-900 text-lg">Меню навигации</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Закрыть меню"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Mobile Auth Quick Access Card */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNav("account");
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      currentPage === "account" 
                        ? "bg-blue-50 border-blue-300 text-blue-900" 
                        : "bg-slate-50 hover:bg-blue-50 border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold truncate">
                        {currentUser ? formatUserInitials(currentUser.fullName) : "Личный кабинет"}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {currentUser ? (isAdmin ? "Администратор" : currentUser.role === 'manager' ? "Менеджер" : "Клиент") : "Войти в профиль"}
                    </span>
                  </button>
                </div>

                {/* Mobile Theme Mode Switch */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <ThemeToggle variant="row" />
                </div>

                <div className="flex flex-col space-y-1 text-sm font-bold uppercase tracking-wide">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleNav('home'); }}
                    className="text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 text-gray-800 hover:text-blue-600"
                  >
                    ГЛАВНАЯ СТРАНИЦА
                  </button>

                  <div className="py-1">
                    <div className="flex items-center justify-between px-4 py-1">
                      <span className="text-xs font-bold uppercase text-gray-400">Оборудование ({PRODUCTS_DATA.filter(p => p.type === 'hardware').length})</span>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleNav('hardware');
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Весь каталог →
                      </button>
                    </div>

                    {/* Mobile Category Accordions */}
                    <div className="space-y-1 mt-1 pl-1">
                      {[
                        {
                          id: 'scanline',
                          title: '🇷🇺 3D-сканеры ScanLine (Россия)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline'))),
                          categoryKey: 'brand-scanline'
                        },
                        {
                          id: 'laser',
                          title: '🔴 Лазерные сканеры FreeScan / Shining 3D',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan'))),
                          categoryKey: 'brand-shining'
                        },
                        {
                          id: 'cmm',
                          title: '🔵 КИМ (Координатно-измерительные машины)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm' || p.id.startsWith('pmt-cmm'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm' || p.id.startsWith('pmt-cmm'))),
                          categoryKey: 'tech-cmm'
                        },
                        {
                          id: 'arms',
                          title: '🟢 Измерительные руки (манипуляторы)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm' || p.id.startsWith('pmt-arm'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm' || p.id.startsWith('pmt-arm'))),
                          categoryKey: 'tech-mobile'
                        },
                        {
                          id: 'trackers',
                          title: '🎯 Лазерные трекеры и Leica (до 160 м)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'trackers' || p.id.includes('tracker'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'trackers' || p.id.includes('tracker'))),
                          categoryKey: 'tech-trackers'
                        }
                      ].map((cat) => {
                        const isExpanded = mobileHardwareExpandedCat === cat.id;
                        return (
                          <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden bg-slate-50/50">
                            <button
                              onClick={() => setMobileHardwareExpandedCat(isExpanded ? null : cat.id)}
                              className="w-full text-left px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer"
                            >
                              <span className="truncate">{cat.title}</span>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                  cat.id === 'scanline' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {cat.count}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="p-2 space-y-1 bg-white border-t border-gray-100 max-h-64 overflow-y-auto">
                                <button
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    setActiveCategory(cat.categoryKey);
                                    handleNav('hardware');
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/70 hover:bg-blue-100 rounded-lg flex items-center justify-between border border-blue-200 cursor-pointer mb-1 transition-colors"
                                >
                                  <span>Открыть раздел «{cat.title}» ({cat.count}) →</span>
                                </button>
                                {cat.items.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      handleNav('hardware', item.id);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                                  >
                                    <span className="font-medium truncate">{item.name}</span>
                                    <span className="text-[9px] text-gray-400 shrink-0 ml-1">{item.brand.split(' ')[0]}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="py-1">
                    <div className="px-4 py-1 text-xs font-bold uppercase text-gray-400">Программное обеспечение</div>
                    <div className="pl-2 space-y-0.5">
                      {PRODUCTS_DATA.filter(p => p.type === 'software').map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleNav('software', item.id);
                          }}
                          className="w-full text-left px-4 py-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-between"
                        >
                          <span className="font-medium truncate">{item.name}</span>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">{item.brand.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="py-1">
                    <div className="flex items-center justify-between px-4 py-1">
                      <span className="text-xs font-bold uppercase text-gray-400">Инжиниринговые услуги</span>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleNav('services');
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Все услуги →
                      </button>
                    </div>
                    <div className="pl-2 space-y-0.5">
                      {[
                        { id: '3d-scanning', title: '1. 3D-сканирование объектов' },
                        { id: 'reverse-engineering', title: '2. Обратный инжиниринг (CAD)' },
                        { id: 'parts-inspection', title: '3. Контроль геометрии деталей' },
                        { id: 'tooling-design', title: '4. Проектирование и изготовление оснастки' },
                        { id: 'cmm-maintenance', title: '5. Модернизация, ремонт и ТО КИМ' },
                        { id: 'postprocessors-dev', title: '6. Разработка постпроцессоров ЧПУ' },
                      ].map((srv) => (
                        <button
                          key={srv.id}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleNav('services', srv.id);
                          }}
                          className="w-full text-left px-4 py-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-between"
                        >
                          <span className="font-medium truncate">{srv.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {customPages.filter((p) => p.showInHeader && !SYSTEM_PAGE_IDS.has(p.id)).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setMobileMenuOpen(false); handleNav(p.id as any); }}
                      className="text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 text-blue-700 font-semibold flex items-center justify-between"
                    >
                      <span>{p.menuTitle || p.title}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Раздел</span>
                    </button>
                  ))}

                  <button
                    onClick={() => { setMobileMenuOpen(false); handleNav('knowledge'); }}
                    className="text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 text-gray-800 hover:text-blue-600"
                  >
                    БАЗА ЗНАНИЙ
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); handleNav('news'); }}
                    className="text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 text-gray-800 hover:text-blue-600"
                  >
                    НОВОСТИ И СТАТЬИ
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); handleNav('about'); }}
                    className={`text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 flex items-center justify-between ${
                      currentPage === 'about' ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-gray-800 hover:text-blue-600 font-medium'
                    }`}
                  >
                    <span>О КОМПАНИИ</span>
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); handleNav('contacts'); }}
                    className={`text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 flex items-center justify-between ${
                      currentPage === 'contacts' ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-gray-800 hover:text-blue-600 font-medium'
                    }`}
                  >
                    <span>КОНТАКТЫ И РЕКВИЗИТЫ</span>
                  </button>

                  <div className="px-4 py-2 flex justify-center"><PWAInstallButton /></div>
                  <AccountButton isMobile={true} handleNav={(p, s) => { setMobileMenuOpen(false); handleNav(p, s); }} currentUser={currentUser} isAdmin={isAdmin} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </header>
    </>
  );
};

