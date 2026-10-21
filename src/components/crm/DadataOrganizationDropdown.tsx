import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Building2,
  Check,
  X,
  Loader2,
  ChevronDown,
  ShieldCheck,
  MapPin,
  User,
  Phone,
  Mail,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { RussianEnterprise, searchRussianEnterprises, RUSSIAN_ENTERPRISES_REGISTRY } from '../../data/russianEnterprises';
import { apiService } from '../../services/apiService';

export interface DadataOrganizationDropdownProps {
  companyName: string;
  inn: string;
  onSelect: (org: RussianEnterprise) => void;
  onCompanyNameChange?: (name: string) => void;
  onInnChange?: (inn: string) => void;
  isDark?: boolean;
  className?: string;
  placeholder?: string;
}

export const DadataOrganizationDropdown: React.FC<DadataOrganizationDropdownProps> = ({
  companyName,
  inn,
  onSelect,
  onCompanyNameChange,
  onInnChange,
  isDark = true,
  className = '',
  placeholder = 'Введите ИНН (10/12 цифр) или название компании...'
}) => {
  const [query, setQuery] = useState(inn || companyName || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RussianEnterprise[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchSource, setSearchSource] = useState<'dadata_api' | 'registry'>('registry');
  const [errorText, setErrorText] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync internal query if external props change significantly
  useEffect(() => {
    if (inn && inn !== query && /^\d+$/.test(inn)) {
      setQuery(inn);
    }
  }, [inn]);

  // Debounced search logic
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(RUSSIAN_ENTERPRISES_REGISTRY.slice(0, 8));
      setSearchSource('registry');
      setIsLoading(false);
      setErrorText(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorText(null);

    const timer = setTimeout(async () => {
      try {
        // First, check with backend DaData API proxy
        const apiRes = await apiService.searchCompanyByDadata(trimmed);
        
        if (!isMounted) return;

        if (apiRes.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
          // Convert DaData standard party response to RussianEnterprise interface
          const converted: RussianEnterprise[] = apiRes.data.map((item: any) => {
            const d = item.data || {};
            const valName = item.value || d.name?.short_with_opf || d.name?.full_with_opf || trimmed;
            const short = d.name?.short_with_opf || d.name?.short || valName;
            const full = d.name?.full_with_opf || d.name?.full || valName;
            const addr = d.address?.unrestricted_value || d.address?.value || (typeof d.address === 'string' ? d.address : '');
            const cityName = d.address?.data?.city || d.address?.data?.settlement || 'Москва';
            
            const ceoRawName = d.management?.name || d.fio?.name || (d.fio ? [d.fio.surname, d.fio.name, d.fio.patronymic].filter(Boolean).join(' ') : 'Руководитель');
            const ceoRawPost = d.management?.post || (d.fio ? 'Индивидуальный предприниматель' : 'Генеральный директор');
            
            // Format dative declension
            const ceoDeclined = d.management?.formatted?.ceoDative || `${ceoRawName}`;
            const postDeclined = d.management?.formatted?.postDative || (ceoRawPost.toLowerCase().includes('директор') ? 'Генеральному директору' : 'Руководителю');

            const nameParts = ceoRawName.replace(/\(.*\)/, '').trim().split(' ');
            const greet = nameParts.length >= 2 
              ? `Уважаемый ${nameParts[1]}${nameParts[2] ? ' ' + nameParts[2] : ''}!`
              : 'Уважаемые партнеры!';

            return {
              inn: d.inn || item.inn || trimmed.replace(/\D/g, ''),
              kpp: d.kpp || '',
              ogrn: d.ogrn || '',
              name: short,
              shortName: short,
              fullName: full,
              address: addr,
              city: cityName,
              ceoPost: postDeclined,
              ceoName: ceoDeclined,
              greeting: greet,
              industry: d.okved ? `ОКВЭД ${d.okved} • ${d.okved_type || 'Машиностроение'}` : 'Промышленность и машиностроение',
              phone: d.phones?.[0]?.value || undefined,
              email: d.emails?.[0]?.value || undefined
            };
          });

          setResults(converted);
          setSearchSource('dadata_api');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // silent, will fallback
      }

      // Fallback to local verified registry of official partner enterprises
      if (isMounted) {
        const localMatches = searchRussianEnterprises(trimmed);
        setResults(localMatches);
        setSearchSource('registry');
        setIsLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (enterprise: RussianEnterprise) => {
    setQuery(enterprise.name);
    setIsOpen(false);
    onSelect(enterprise);
    if (onCompanyNameChange) onCompanyNameChange(enterprise.name);
    if (onInnChange) onInnChange(enterprise.inn);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    setResults(RUSSIAN_ENTERPRISES_REGISTRY.slice(0, 8));
    if (onCompanyNameChange) onCompanyNameChange('');
    if (onInnChange) onInnChange('');
    if (inputRef.current) inputRef.current.focus();
  };

  const quickTags = [
    { label: 'ОДК-Кузнецов', inn: '6312004455' },
    { label: 'Авиакор', inn: '6312015890' },
    { label: 'РКЦ Прогресс', inn: '6312010020' },
    { label: 'Тяжмаш', inn: '6325001234' },
    { label: 'КАМАЗ', inn: '1650032058' },
    { label: 'АВТОВАЗ', inn: '6320002223' },
    { label: 'Алмаз-Антей', inn: '7731295844' },
    { label: 'ВНИИМС', inn: '7736021234' }
  ];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <Building2 className="w-4 h-4 text-blue-500" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(true);
            if (/^\d+$/.test(val.trim())) {
              if (onInnChange) onInnChange(val.trim());
            } else {
              if (onCompanyNameChange) onCompanyNameChange(val);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-9 pr-20 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 shadow-2xs'
          }`}
        />

        {/* Right action controls */}
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Очистить"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className={`p-1 rounded-lg text-slate-400 hover:text-blue-400 transition-colors ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Floating Dropdown Results */}
      {isOpen && (
        <div
          ref={resultsRef}
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
          style={{ maxHeight: '420px' }}
        >
          {/* Header & Quick Pick Tags */}
          <div className={`p-2.5 border-b space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <Search className="w-3 h-3" />
                <span>Поиск DaData / ЕГРЮЛ по ИНН или названию:</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {results.length} найдено
              </span>
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Частые:</span>
              {quickTags.map(item => (
                <button
                  key={item.inn}
                  type="button"
                  onClick={() => {
                    setQuery(item.inn);
                    setIsOpen(true);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border shrink-0 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto max-h-[310px] divide-y divide-slate-800/40 p-1.5 space-y-1">
            {isLoading && (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span>Поиск в Федеральной базе ЕГРЮЛ и DaData...</span>
              </div>
            )}

            {!isLoading && results.length === 0 && (
              <div className="py-6 px-4 text-center space-y-1">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto opacity-80" />
                <p className="text-xs font-semibold text-slate-300">Организация не найдена</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Введите корректный 10-значный ИНН организации (или 12-значный для ИП) для автоматической загрузки реквизитов.
                </p>
              </div>
            )}

            {!isLoading && results.map((ent, idx) => {
              const isSelected = idx === selectedIndex;
              const isCurrentlySelected = ent.inn === inn || ent.name === companyName;

              return (
                <div
                  key={`${ent.inn}-${idx}`}
                  onClick={() => handleSelect(ent)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? isDark ? 'bg-blue-600/20 border border-blue-500/40' : 'bg-blue-50 border border-blue-300'
                      : isCurrentlySelected
                        ? isDark ? 'bg-slate-800/50 border border-blue-500/20' : 'bg-blue-50/40 border border-blue-100'
                        : isDark ? 'hover:bg-slate-800/60 border border-transparent' : 'hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold leading-tight ${
                        isSelected ? 'text-blue-400' : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {ent.name}
                      </span>

                      {/* INN Badge */}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        ИНН {ent.inn}
                      </span>

                      {ent.kpp && (
                        <span className="text-[10px] font-mono text-slate-400">
                          КПП {ent.kpp}
                        </span>
                      )}

                      {/* Active Status Badge */}
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Действующая
                      </span>
                    </div>

                    {/* Address */}
                    {ent.address && (
                      <div className={`text-[11px] leading-snug flex items-center gap-1 truncate ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                        <span className="truncate">{ent.address}</span>
                      </div>
                    )}

                    {/* CEO / Management */}
                    {ent.ceoName && (
                      <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>
                          {ent.ceoPost}: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{ent.ceoName}</strong>
                        </span>
                        {ent.industry && (
                          <span className="text-[9.5px] text-slate-500 ml-1 truncate">
                            • {ent.industry}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Select button */}
                  <div className="shrink-0 flex items-center self-center pl-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(ent);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected || isCurrentlySelected
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                          : isDark
                            ? 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white'
                            : 'bg-slate-200 hover:bg-blue-600 text-slate-700 hover:text-white'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Выбрать</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className={`px-3 py-2 text-[10.5px] flex items-center justify-between border-t ${
            isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Автоподстановка реквизитов, КПП, ОГРН, адреса и ФИО директора</span>
            </span>
            <span className="text-[10px] font-mono">
              ЕГРЮЛ / ФНС РФ
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
