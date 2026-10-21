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
  FileText,
  Headphones,
  Briefcase
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
import { HeaderSearch } from './HeaderSearch';




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
      <div className="border-t border-gray-100 pt-2 space-y-1">
        <button
          onClick={() => handleNav('account')}
          className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 text-gray-800 hover:text-blue-600 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-xs text-gray-900">{formattedName}</span>
          </div>
          <span className="text-[10px] text-gray-400">Личный кабинет</span>
        </button>

        {(isAdmin || isManagerUser || isSuperUser) && (
          <button
            onClick={() => handleNav('crm')}
            className="w-full text-left px-4 py-2.5 rounded-lg bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-semibold flex items-center justify-between border border-amber-200/80"
          >
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-amber-600" />
              <span className="text-xs">CRM & Онлайн-инженер</span>
            </div>
            <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">CRM</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => handleNav('cms')}
            className="w-full text-left px-4 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold flex items-center justify-between border border-blue-200/80"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span className="text-xs">Панель управления CMS</span>
            </div>
            <span className="text-[9px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded">CMS</span>
          </button>
        )}
      </div>
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
        className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-lg transition-all border border-white/25 text-[11px] font-medium cursor-pointer shadow-2xs group shrink-0 max-w-[125px] sm:max-w-none"
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

        <span className="font-semibold tracking-tight text-white truncate max-w-[65px] min-[390px]:max-w-[80px] sm:max-w-[140px]">
          {formattedName}
        </span>

        <ChevronDown className={`w-3 h-3 text-blue-200 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
      </button>

      {/* Interactive Profile Dropdown from TopBar with Framer Motion */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full pt-1.5 w-64 z-[70] origin-top-right"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden ring-1 ring-black/5 text-slate-900">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
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
                {(isAdmin || isManagerUser || isSuperUser) && (
                  <button
                    onClick={() => {
                      setDropdownOpen?.(false);
                      handleNav('crm');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-blue-950 bg-blue-50/80 hover:bg-blue-100 flex items-center justify-between font-bold transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-bold text-blue-900">Единая панель CRM</div>
                        <div className="text-[10px] text-blue-700/80 font-normal">Сделки, Канбан, Контрагенты, ТКП, АРШИН</div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded shadow-2xs">
                      Сотрудник
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setDropdownOpen?.(false);
                    handleNav('account');
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 font-medium transition-colors cursor-pointer ${
                    (isAdmin || isManagerUser || isSuperUser) ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <User className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {(isAdmin || isManagerUser || isSuperUser) ? 'Личный кабинет сотрудника' : 'Личный кабинет заказчика'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(isAdmin || isManagerUser || isSuperUser) ? 'Служебные реестры, лицензии и безопасность' : 'Договоры, лицензии ПО, сервисные заявки'}
                    </div>
                  </div>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setDropdownOpen?.(false);
                      handleNav('cms');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-amber-900 bg-amber-50/50 hover:bg-amber-100 flex items-center gap-2.5 font-medium transition-colors border-t border-slate-100 cursor-pointer"
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
                <div className="pt-1 border-t border-slate-100 bg-slate-50/40">
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
          </motion.div>
        )}
      </AnimatePresence>
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
    setActiveCategory,
    openConfiguratorModal
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
      if (window.scrollY > 15) {
        setProfileDropdownOpen(false);
      }
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
      <div className="bg-[#1E3A8A] text-white text-xs font-normal border-b border-blue-900/40 w-full py-1.5 relative z-[60]">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-y-1.5 gap-x-3">
          {/* TopBar Line 1 (on <xl) / Left group (on xl+) */}
          <div className="flex items-center justify-between xl:justify-start gap-2 sm:gap-4 text-[11px] sm:text-xs min-w-0">
            <span className="hidden sm:flex items-center text-blue-200 shrink-0">
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
      <header className={`sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-200 border-b ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 shadow-md border-gray-200/90 dark:border-slate-800' 
          : 'bg-white/90 dark:bg-slate-900/90 shadow-xs border-gray-100 dark:border-slate-800/60'
      }`}>
        {/* Main Nav Bar */}
        <div className="relative z-40 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
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
                  className="absolute top-full left-1/2 -translate-x-1/3 xl:-translate-x-1/4 w-[1040px] xl:w-[1160px] 2xl:w-[1260px] max-h-[82vh] h-[520px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 p-3.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseEnter={() => setHardwareDropdown(true)}
                >
                  {/* Top Bar with Title, Search and Global Link */}
                  <div className="flex items-center justify-between gap-4 pb-2.5 mb-2 border-b border-gray-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>Каталог метрологического оборудования</span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-700">
                            {PRODUCTS_DATA.filter(p => p.type === 'hardware').length} моделей
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-400">Прецизионные КИМ, 3D-сканеры, лазерные трекеры и оснастка</div>
                      </div>
                    </div>

                    {/* Quick Search Bar inside Menu */}
                    <div className="relative w-72 xl:w-80">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Поиск по названию или бренду..."
                        value={hardwareNavSearch}
                        onFocus={() => setIsHardwareSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsHardwareSearchFocused(false), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && hardwareNavSearch.trim()) {
                            addRecentSearch(hardwareNavSearch);
                          }
                        }}
                        onChange={(e) => setHardwareNavSearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-gray-100/80 focus:bg-white dark:focus:bg-slate-700 border border-gray-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none transition-all"
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

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setHardwareDropdown(false);
                          openConfiguratorModal();
                        }}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Интерактивный расчет СИ по ГОСТ Р ИСО 1101"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Конфигуратор СИ</span>
                      </button>

                      <button
                        onClick={() => {
                          setHardwareDropdown(false);
                          handleNav('hardware');
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                      >
                        <span>Все {PRODUCTS_DATA.filter(p => p.type === 'hardware').length} моделей</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* 2-Panel Master-Detail Layout */}
                  {hardwareNavSearch.trim() ? (
                    /* Search results view */
                    <div className="p-1 flex-1 min-h-0 flex flex-col">
                      <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                        <span>Результаты поиска «{hardwareNavSearch}»:</span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                          Найдено {PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.name.toLowerCase().includes(hardwareNavSearch.toLowerCase()) || p.brand.toLowerCase().includes(hardwareNavSearch.toLowerCase()) || p.shortDescription.toLowerCase().includes(hardwareNavSearch.toLowerCase()))).length} моделей
                        </span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 flex-1 overflow-y-auto pr-1">
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
                            className="text-left p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 hover:border-blue-200 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">{item.brand.split(' ')[0]}</span>
                              {item.badge && <span className="text-[8px] px-1 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded font-semibold shrink-0 truncate max-w-[110px]">{item.badge}</span>}
                            </div>
                            <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 leading-snug">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {item.shortDescription}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 flex-1 min-h-0">
                      {/* Left Rail: Categories & Brands Tabs */}
                      <div className="w-56 xl:w-60 shrink-0 bg-slate-50/80 dark:bg-slate-800/60 p-1.5 rounded-xl border border-gray-100 dark:border-slate-800 flex flex-col justify-between overflow-y-auto min-h-0">
                        {[
                          {
                            groupName: 'ПО ТЕХНОЛОГИИ',
                            items: [
                              {
                                id: 'tech-laser',
                                title: '🔴 Лазерные сканеры',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.technology === 'laser' || (p.category.includes('scanner') && !p.id.includes('combo') && !p.id.includes('hx') && !p.id.includes('libre') && !p.id.includes('pronova') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('trio') || p.name.toLowerCase().includes('as1'))))).length,
                                icon: Zap,
                                badgeColor: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                              },
                              {
                                id: 'tech-optical',
                                title: '🔵 Оптический свет (LED)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.technology === 'optical' || (p.category.includes('scanner') && (p.name.toLowerCase().includes('pro hd') || p.name.toLowerCase().includes('pro 2x') || p.name.toLowerCase().includes('se v2') || p.name.toLowerCase().includes('sp v2') || p.name.toLowerCase().includes('transcan') || p.name.toLowerCase().includes('optimscan') || p.name.toLowerCase().includes('smartscan') || p.name.toLowerCase().includes('stereoscan') || p.name.toLowerCase().includes('primescan') || p.name.toLowerCase().includes('autoscan'))))).length,
                                icon: Scan,
                                badgeColor: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              },
                              {
                                id: 'tech-hybrid',
                                title: '🟣 Оптический гибрид (ИК)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.technology === 'hybrid' || (p.category.includes('scanner') && (p.name.toLowerCase().includes('combo') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('libre') || p.name.toLowerCase().includes('pronova') || p.name.toLowerCase().includes('einscan h'))))).length,
                                icon: Sparkles,
                                badgeColor: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              },
                              {
                                id: 'tech-cmm',
                                title: '🔵 Стационарные КИМ',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm')).length,
                                icon: Cpu,
                                badgeColor: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              },
                              {
                                id: 'tech-mobile',
                                title: '🟢 Мобильные КИМ (руки)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm')).length,
                                icon: Compass,
                                badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              },
                              {
                                id: 'tech-trackers',
                                title: '🎯 Лазерные трекеры',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && p.category === 'trackers').length,
                                icon: Target,
                                badgeColor: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              }
                            ]
                          },
                          {
                            groupName: 'ПО ПРОИЗВОДИТЕЛЯМ',
                            items: [
                              {
                                id: 'brand-scanline',
                                title: '🇷🇺 ScanLine (Россия)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline'))).length,
                                icon: Box,
                                badgeColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              },
                              {
                                id: 'brand-shining',
                                title: '🇨🇳 Shining 3D',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan'))).length,
                                icon: Sparkles,
                                badgeColor: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              },
                              {
                                id: 'brand-pmt',
                                title: '🏛️ PMT Arm & CMM',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('pmt') || p.id.startsWith('pmt') || p.id.startsWith('eq-pmt') || p.name.toLowerCase().includes('pmt'))).length,
                                icon: Compass,
                                badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              },
                              {
                                id: 'brand-hexagon',
                                title: '🔷 Hexagon & Leica',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon'))).length,
                                icon: Target,
                                badgeColor: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                              },
                              {
                                id: 'brand-renishaw',
                                title: '⚡ Renishaw (Оснастка)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('renishaw') || p.id.startsWith('renishaw') || p.id.startsWith('eq-renishaw') || p.category === 'renishaw' || p.name.toLowerCase().includes('renishaw'))).length,
                                icon: Settings,
                                badgeColor: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              }
                            ]
                          }
                        ].map((group, groupIdx) => (
                          <div key={groupIdx} className="space-y-0.5">
                            <div className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-gray-400 dark:text-slate-400 uppercase">{group.groupName}</div>
                            {group.items.map((cat) => {
                              const isActive = activeHardwareNavTab === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  onMouseEnter={() => setActiveHardwareNavTab(cat.id)}
                                  onClick={() => setActiveHardwareNavTab(cat.id)}
                                  className={`w-full text-left px-2 py-1 rounded-lg transition-all flex items-center justify-between group cursor-pointer ${
                                    isActive 
                                      ? 'bg-white dark:bg-slate-700 shadow-xs border border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 font-bold translate-x-0.5' 
                                      : 'hover:bg-white/80 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-[11px] truncate">{cat.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 ml-1">
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold border ${cat.badgeColor}`}>
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
                      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-0">
                        {/* Category Heading Description */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-slate-800 shrink-0">
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {activeHardwareNavTab === 'tech-laser' && '🔴 Лазерные 3D-сканеры'}
                              {activeHardwareNavTab === 'tech-optical' && '🔵 Оптические 3D-сканеры (Структурированный свет LED)'}
                              {activeHardwareNavTab === 'tech-hybrid' && '🟣 Гибридные 3D-сканеры (Лазер + ИК подсвет)'}
                              {activeHardwareNavTab === 'tech-cmm' && '🔵 Стационарные координатно-измерительные машины (КИМ)'}
                              {activeHardwareNavTab === 'tech-mobile' && '🟢 Мобильные КИМ (Измерительные руки-манипуляторы)'}
                              {activeHardwareNavTab === 'tech-trackers' && '🎯 Лазерные трекеры сверхбольшого радиуса'}
                              {activeHardwareNavTab === 'brand-scanline' && '🇷🇺 Измерительное оборудование ScanLine (Россия)'}
                              {activeHardwareNavTab === 'brand-shining' && '🇨🇳 Метрологические 3D-сканеры Shining 3D'}
                              {activeHardwareNavTab === 'brand-pmt' && '🏛️ Измерительные руки и КИМ PMT (Precision Measuring Tool)'}
                              {activeHardwareNavTab === 'brand-hexagon' && '🔷 Премиальные системы Hexagon Manufacturing Intelligence & Leica'}
                              {activeHardwareNavTab === 'brand-renishaw' && '⚡ Прецизионные щупы, измерительные головки и датчики Renishaw'}
                            </h4>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                              {activeHardwareNavTab === 'tech-laser' && 'Высокая точность и стабильность на зеркальных и черных поверхностях.'}
                              {activeHardwareNavTab === 'tech-optical' && 'Максимальное разрешение и детализация, безопасный свет для сложной геометрии.'}
                              {activeHardwareNavTab === 'tech-hybrid' && 'Два источника света для универсальной оцифровки: от микродеталей до крупных узлов.'}
                              {activeHardwareNavTab === 'tech-cmm' && 'Высочайшая субмикронная точность в условиях метрологической лаборатории.'}
                              {activeHardwareNavTab === 'tech-mobile' && 'Свобода контактных и оптических измерений деталей прямо в цеху и на станке.'}
                              {activeHardwareNavTab === 'tech-trackers' && 'Контроль крупногабаритных объектов до 160 метров с точностью микронного уровня.'}
                              {activeHardwareNavTab === 'brand-scanline' && 'Отечественная разработка с гарантией, сервисом в РФ и внесением в Госреестр СИ.'}
                              {activeHardwareNavTab === 'brand-shining' && 'Официальные поставки ручных и стационарных 3D-сканеров FreeScan, EinScan, Transcan.'}
                              {activeHardwareNavTab === 'brand-pmt' && 'Швейцарско-азиатские прецизионные мобильные руки PMT Gamma+/Alpha и мостовые КИМ.'}
                              {activeHardwareNavTab === 'brand-hexagon' && 'Мировой эталон метрологии: мобильные руки Absolute Arm, сканеры AS1 и трекеры Leica.'}
                              {activeHardwareNavTab === 'brand-renishaw' && 'Оригинальные контактные и сканирующие датчики, стилусы и оснастка для КИМ.'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setHardwareDropdown(false);
                              setActiveCategory(activeHardwareNavTab);
                              handleNav('hardware');
                            }}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 shrink-0 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            В каталог →
                          </button>
                        </div>

                        {/* Items Grid with Compact Cards (CSS Grid) */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 flex-1 min-h-0 py-1 overflow-y-auto">
                          {PRODUCTS_DATA.filter((p) => {
                            if (p.type !== 'hardware') return false;
                            
                            const isLaser = p.technology === 'laser' || (p.category.includes('scanner') && !p.id.includes('combo') && !p.id.includes('hx') && !p.id.includes('libre') && !p.id.includes('pronova') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('trio') || p.name.toLowerCase().includes('as1')));
                            const isHybrid = p.technology === 'hybrid' || (p.category.includes('scanner') && (p.name.toLowerCase().includes('combo') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('libre') || p.name.toLowerCase().includes('pronova') || p.name.toLowerCase().includes('einscan h')));
                            const isOptical = (p.technology === 'optical' || p.category.includes('scanner')) && !isLaser && !isHybrid;
                            
                            if (activeHardwareNavTab === 'tech-laser') return isLaser;
                            if (activeHardwareNavTab === 'tech-optical') return isOptical;
                            if (activeHardwareNavTab === 'tech-hybrid') return isHybrid;
                            if (activeHardwareNavTab === 'tech-cmm') return p.category === 'cmm' || p.category === 'stationary_cmm';
                            if (activeHardwareNavTab === 'tech-mobile') return p.category === 'arms' || p.category === 'mobile_cmm';
                            if (activeHardwareNavTab === 'tech-trackers') return p.category === 'trackers';
                            
                            if (activeHardwareNavTab === 'brand-scanline') return p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline');
                            if (activeHardwareNavTab === 'brand-shining') return p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan');
                            if (activeHardwareNavTab === 'brand-pmt') return p.brand?.toLowerCase().includes('pmt') || p.id.startsWith('pmt') || p.id.startsWith('eq-pmt') || p.name.toLowerCase().includes('pmt');
                            if (activeHardwareNavTab === 'brand-hexagon') return p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon');
                            if (activeHardwareNavTab === 'brand-renishaw') return p.brand?.toLowerCase().includes('renishaw') || p.id.startsWith('renishaw') || p.id.startsWith('eq-renishaw') || p.category === 'renishaw' || p.name.toLowerCase().includes('renishaw');
                            
                            return true;
                          }).slice(0, 6).map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setHardwareDropdown(false);
                                handleNav('hardware', item.id);
                              }}
                              className="text-left p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 transition-all group flex flex-col justify-between cursor-pointer"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">{item.brand.split(' ')[0]}</span>
                                  {item.badge && (
                                    <span className="text-[8px] px-1 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded font-semibold truncate max-w-[85px]">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 leading-snug">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {item.shortDescription}
                                </div>
                              </div>
                              <div className="mt-1 flex items-center justify-end text-[9px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Перейти к модели →</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Bottom Actions Toolbar */}
                        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
                          <div className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1.5 truncate pr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">Поверка по ГОСТ/ISO • Выездная демонстрация • Гарантия и шеф-монтаж</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setHardwareDropdown(false);
                                openContactModal({
                                  title: 'Подбор оборудования под задачу',
                                  formType: 'consultation'
                                });
                              }}
                              className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer whitespace-nowrap"
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
                <div className="absolute top-full left-1/2 -translate-x-1/4 xl:-translate-x-1/3 w-[840px] xl:w-[940px] max-h-[82vh] h-[490px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 p-3.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Top Bar with Title, Software Count and Link */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-gray-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>Лицензионное программное обеспечение</span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-700">
                            {PRODUCTS_DATA.filter(p => p.type === 'software').length} комплексов
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-400">CAD/CAM/PDM, 3D-метрология, контроль геометрии GD&T и реверс-инжиниринг</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software');
                      }}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Все программы →
                    </button>
                  </div>

                  {/* Fast Sub-category routing bar */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-2 mb-2 border-b border-gray-100 dark:border-slate-800 text-xs shrink-0">
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'topsolid');
                      }}
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold rounded-lg border border-blue-200 dark:border-blue-800 text-[11px] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      TopSolid 7 (CAD/CAM/PDM)
                    </button>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'polyworks');
                      }}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      PolyWorks (Метрология)
                    </button>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'geomagic');
                      }}
                      className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-semibold rounded-lg border border-amber-200 dark:border-amber-800 text-[11px] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Geomagic (Реверс & Контроль)
                    </button>
                    <button
                      onClick={() => {
                        setSoftwareDropdown(false);
                        handleNav('software', 'shining3d-sw');
                      }}
                      className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-semibold rounded-lg border border-purple-200 dark:border-purple-800 text-[11px] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      ПО Shining 3D / ScanLine
                    </button>
                  </div>

                  {/* Software Grid: 3 columns x 2 rows (fits all 6 software suites neatly without scroll) */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 flex-1 min-h-0 py-1 overflow-y-auto">
                    {PRODUCTS_DATA.filter(p => p.type === 'software').map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          setSoftwareDropdown(false);
                          handleNav('software', item.id);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-slate-700/80 border border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500 transition-all flex flex-col justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate">
                              {item.brand.split(' ')[0]}
                            </span>
                            {item.badge && (
                              <span className="text-[8px] font-semibold px-1.5 py-0.2 bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded truncate max-w-[120px]">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                            {item.shortDescription}
                          </div>
                        </div>

                        {item.specs && item.specs['Интегрированные модули'] && (
                          <div className="mt-1.5 pt-1.5 border-t border-gray-100/80 dark:border-slate-700/60 flex flex-wrap gap-1">
                            {item.specs['Интегрированные модули'].split(', ').slice(0, 2).map((m) => (
                              <span key={m} className="px-1.5 py-0.2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-medium rounded border border-gray-200 dark:border-slate-600 truncate max-w-[90px]">
                                {m}
                              </span>
                            ))}
                            {item.specs['Интегрированные модули'].split(', ').length > 2 && (
                              <span className="px-1 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[8px] font-bold rounded">
                                +{item.specs['Интегрированные модули'].split(', ').length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Bottom Actions Toolbar */}
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1.5 truncate pr-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">Официальные лицензии • Постпроцессоры под ключ • Обучение и техподдержка</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSoftwareDropdown(false);
                          openContactModal({
                            title: 'Запрос КП и демонстрации ПО',
                            formType: 'demo'
                          });
                        }}
                        className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        Запросить КП / Демо
                      </button>
                    </div>
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
              id="nav-glossary-btn"
              onClick={() => handleNav('glossary')}
              className={`px-1.5 2xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'glossary' 
                  ? 'text-[#2563EB] font-bold bg-blue-50/80' 
                  : 'hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              ГЛОССАРИЙ
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
            {/* Full-text Search with Dropdown Results */}
            <HeaderSearch />

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

                  {(isAdmin || currentUser?.role === 'manager' || currentUser?.role === 'superadmin') && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNav('crm');
                      }}
                      className="w-full mt-2 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-blue-900">Единая панель CRM</span>
                      </div>
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Сотрудник
                      </span>
                    </button>
                  )}
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
                          id: 'shining',
                          title: '🇨🇳 Shining 3D (FreeScan / EinScan)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan'))),
                          categoryKey: 'brand-shining'
                        },
                        {
                          id: 'pmt',
                          title: '🏛️ PMT Arm & CMM (Руки и КИМ)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('pmt') || p.id.startsWith('pmt') || p.id.startsWith('eq-pmt') || p.name.toLowerCase().includes('pmt'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('pmt') || p.id.startsWith('pmt') || p.id.startsWith('eq-pmt') || p.name.toLowerCase().includes('pmt'))),
                          categoryKey: 'brand-pmt'
                        },
                        {
                          id: 'hexagon',
                          title: '🔷 Hexagon & Leica (Премиум метрология)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon'))),
                          categoryKey: 'brand-hexagon'
                        },
                        {
                          id: 'renishaw',
                          title: '⚡ Renishaw (Щупы и датчики)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('renishaw') || p.id.startsWith('renishaw') || p.id.startsWith('eq-renishaw') || p.category === 'renishaw' || p.name.toLowerCase().includes('renishaw'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('renishaw') || p.id.startsWith('renishaw') || p.id.startsWith('eq-renishaw') || p.category === 'renishaw' || p.name.toLowerCase().includes('renishaw'))),
                          categoryKey: 'brand-renishaw'
                        },
                        {
                          id: 'cmm',
                          title: '🔵 Стационарные КИМ (Все бренды)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm' || p.id.startsWith('pmt-cmm') || p.name.toLowerCase().includes('ким'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm' || p.id.startsWith('pmt-cmm') || p.name.toLowerCase().includes('ким'))),
                          categoryKey: 'tech-cmm'
                        },
                        {
                          id: 'arms',
                          title: '🟢 Мобильные КИМ (Измерительные руки)',
                          count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm' || p.id.startsWith('pmt-arm'))).length,
                          items: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm' || p.id.startsWith('pmt-arm'))),
                          categoryKey: 'tech-mobile'
                        },
                        {
                          id: 'trackers',
                          title: '🎯 Лазерные трекеры (до 160 м)',
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
                    onClick={() => { setMobileMenuOpen(false); handleNav('glossary'); }}
                    className={`text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 flex items-center justify-between ${
                      currentPage === 'glossary' ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-gray-800 hover:text-blue-600'
                    }`}
                  >
                    <span>ТЕХНИЧЕСКИЙ ГЛОССАРИЙ</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">GD&T</span>
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

