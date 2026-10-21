import React, { useState, useRef, useCallback, useEffect, Component, type ReactNode } from 'react';
import { 
  YMaps, 
  Map as YandexMap, 
  Placemark, 
  ZoomControl, 
  FullscreenControl, 
  GeolocationControl, 
  TypeSelector 
} from '@pbe/react-yandex-maps';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Car, 
  Bus, 
  Maximize2, 
  Minimize2, 
  Layers, 
  X, 
  Footprints, 
  RotateCcw 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface OfficeLocation {
  id: 'samara' | 'tolyatti';
  city: string;
  name: string;
  badge: string;
  address: string;
  shortAddress: string;
  coords: [number, number]; // [lat, lng]
  coordsStr: string;
  phone: string;
  phoneClean: string;
  workHours: string;
  landmarks: string;
  description: string;
  color: string;
  preset: string;
}

export const SAMARA_OFFICE: OfficeLocation = {
  id: 'samara',
  city: 'Самара',
  name: 'Инжиниринговая компания «ДС‑Инжиниринг» — Главный офис',
  badge: 'Главный офис',
  address: '443051, Россия, г. Самара, ул. Свободы, д. 198',
  shortAddress: 'ул. Свободы, 198',
  coords: [53.231904, 50.277625],
  coordsStr: '53.231904, 50.277625',
  phone: '+7 (846) 954-02-92',
  phoneClean: '+78469540292',
  workHours: 'Пн-Пт: 09:00 — 17:00 (МСК+1 / Самара)',
  landmarks: 'Детская школа искусств и Речевик (угол ул. Свободы и ул. Елизарова)',
  description: 'Центральный офис компании, внедрение САПР TopSolid 7, разработка постпроцессоров для станков с ЧПУ, 3D-сканирование и реверс-инжиниринг.',
  color: '#2563eb',
  preset: 'islands#blueDotIconWithCaption'
};

export const TOLYATTI_OFFICE: OfficeLocation = {
  id: 'tolyatti',
  city: 'Тольятти',
  name: 'Инжиниринговая компания «ДС‑Инжиниринг» — Представительство в Тольятти',
  badge: 'Представительство',
  address: '445032, Самарская область, г. Тольятти, Южное шоссе, 161В',
  shortAddress: 'Южное шоссе, 161В',
  coords: [53.556090, 49.219736],
  coordsStr: '53.556090, 49.219736',
  phone: '+7 (846) 954-02-92',
  phoneClean: '+78469540292',
  workHours: 'Пн-Пт: 09:00 — 17:00 (по согласованию)',
  landmarks: 'Отдел координатно-измерительных машин (КИМ), 3D-контроль геометрии',
  description: 'Отдел координатно-измерительных машин (КИМ), прецизионный 3D-контроль геометрии изделий на соответствие GD&T, выездные измерения и калибровка.',
  color: '#059669',
  preset: 'islands#darkGreenDotIconWithCaption'
};

export interface YandexInteractiveMapProps {
  selectedLocation?: 'samara' | 'tolyatti';
  onLocationChange?: (location: 'samara' | 'tolyatti') => void;
  className?: string;
  showRoutePanelDefault?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeMapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('Map Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const YandexInteractiveMap: React.FC<YandexInteractiveMapProps> = ({
  selectedLocation: externalLocation,
  onLocationChange,
  className = '',
  showRoutePanelDefault = false
}) => {
  const { showToast } = useApp();
  const [internalLocation, setInternalLocation] = useState<'samara' | 'tolyatti'>('samara');
  const activeLocation = externalLocation || internalLocation;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapTimeoutFallback, setMapTimeoutFallback] = useState(false);

  // If external Yandex Maps API does not load within 8s, display friendly fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isMapLoaded) {
        setMapTimeoutFallback(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isMapLoaded]);

  // Route building state
  const [showRouteTools, setShowRouteTools] = useState(showRoutePanelDefault);
  const [routeFromInput, setRouteFromInput] = useState('');
  const [routeMode, setRouteMode] = useState<'auto' | 'masstransit' | 'pedestrian'>('auto');
  const [isRouting, setIsRouting] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Yandex Maps API and instance refs
  const ymapsRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const multiRouteRef = useRef<any>(null);

  const currentOffice = activeLocation === 'samara' ? SAMARA_OFFICE : TOLYATTI_OFFICE;

  // Pan map when external selectedLocation changes
  useEffect(() => {
    if (externalLocation && mapRef.current) {
      const targetCoords = externalLocation === 'samara' ? SAMARA_OFFICE.coords : TOLYATTI_OFFICE.coords;
      mapRef.current.setCenter(targetCoords, 16, {
        checkZoomRange: true,
        duration: 400
      });
    }
  }, [externalLocation]);

  // Handle office switch and pan map
  const handleLocationSwitch = (loc: 'samara' | 'tolyatti') => {
    if (onLocationChange) {
      onLocationChange(loc);
    } else {
      setInternalLocation(loc);
    }

    const targetCoords = loc === 'samara' ? SAMARA_OFFICE.coords : TOLYATTI_OFFICE.coords;
    if (mapRef.current) {
      mapRef.current.setCenter(targetCoords, 16, {
        checkZoomRange: true,
        duration: 400
      });
    }
  };

  // Show both offices on the map (fit bounds covering Samara and Tolyatti)
  const handleShowBothOffices = () => {
    if (mapRef.current) {
      mapRef.current.setBounds(
        [
          [53.18, 49.12],
          [53.62, 50.35]
        ],
        {
          checkZoomRange: true,
          duration: 450,
          zoomMargin: [40, 40, 40, 40]
        }
      );
    }
  };

  // Clear active route from map
  const clearRoute = useCallback(() => {
    if (mapRef.current && multiRouteRef.current) {
      mapRef.current.geoObjects.remove(multiRouteRef.current);
      multiRouteRef.current = null;
    }
    setRouteInfo(null);
    setRouteError(null);
    setIsRouting(false);
  }, []);

  // Build route using Yandex multiRouter
  const buildRouteOnMap = useCallback((from: string | [number, number], targetLoc: 'samara' | 'tolyatti', mode: 'auto' | 'masstransit' | 'pedestrian') => {
    if (!ymapsRef.current || !mapRef.current) {
      showToast('Инициализация Яндекс.Карт... Попробуйте через пару секунд');
      return;
    }

    const ymaps = ymapsRef.current;
    const map = mapRef.current;
    const targetOffice = targetLoc === 'samara' ? SAMARA_OFFICE : TOLYATTI_OFFICE;

    setIsRouting(true);
    setRouteError(null);

    // Remove any previous route
    if (multiRouteRef.current) {
      map.geoObjects.remove(multiRouteRef.current);
      multiRouteRef.current = null;
    }

    try {
      const multiRoute = new ymaps.multiRouter.MultiRoute(
        {
          referencePoints: [from, targetOffice.coords],
          params: {
            routingMode: mode
          }
        },
        {
          boundsAutoApply: true,
          routeActiveStrokeWidth: 5,
          routeActiveStrokeColor: mode === 'auto' ? '#2563eb' : mode === 'masstransit' ? '#7c3aed' : '#059669',
          routeActiveStrokeStyle: 'solid'
        }
      );

      multiRoute.model.events.add('requestsuccess', () => {
        setIsRouting(false);
        const routes = multiRoute.getRoutes();
        if (routes && routes.getLength() > 0) {
          const activeRoute = routes.get(0);
          const distanceText = activeRoute.properties.get('distance')?.text || '';
          const durationText = activeRoute.properties.get('duration')?.text || '';
          setRouteInfo({ distance: distanceText, duration: durationText });
          showToast(`Маршрут построен: ${distanceText}, ~${durationText}`);
        }
      });

      multiRoute.model.events.add('requestfail', (error: any) => {
        setIsRouting(false);
        const errDetail = error.get('error')?.message || 'Не удалось проложить маршрут между точками';
        setRouteError(errDetail);
        showToast('Не удалось построить маршрут. Проверьте адрес отправления.');
      });

      map.geoObjects.add(multiRoute);
      multiRouteRef.current = multiRoute;
    } catch (e: any) {
      setIsRouting(false);
      setRouteError('Ошибка сервиса маршрутизации');
      console.error('Route builder error:', e);
    }
  }, [showToast]);

  // Request user geolocation and route
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Геолокация не поддерживается вашим браузером');
      return;
    }

    setIsRouting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setRouteFromInput('Моё местоположение');
        setShowRouteTools(true);
        buildRouteOnMap(userCoords, activeLocation, routeMode);
      },
      (err) => {
        setIsRouting(false);
        showToast('Доступ к геолокации отклонен. Введите адрес вручную.');
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Submit manual route form
  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeFromInput.trim()) {
      showToast('Введите начальную точку маршрута');
      return;
    }
    buildRouteOnMap(routeFromInput.trim(), activeLocation, routeMode);
  };

  // Links for external apps
  const yandexNaviUrl = `https://yandex.ru/maps/?rtext=~${currentOffice.coords[0]},${currentOffice.coords[1]}&rtt=${routeMode}`;
  const gis2Url = activeLocation === 'samara' 
    ? 'https://2gis.ru/samara/geo/50.277625%2C53.231904'
    : 'https://2gis.ru/togliatti/search/Южное+шоссе+161В';

  return (
    <div 
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col ${
        isFullscreen ? 'fixed inset-2 sm:inset-4 z-[300] shadow-2xl rounded-2xl bg-white dark:bg-slate-900' : ''
      } ${className}`}
    >
      {/* Sleek, Single-Line Map Header */}
      <div className="h-11 sm:h-12 px-3 sm:px-4 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
            {currentOffice.city}: {currentOffice.shortAddress}
          </span>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleShowBothOffices}
            className="px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
            title="Показать Самару и Тольятти одновременно"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Оба офиса</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRouteTools(!showRouteTools)}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer border ${
              showRouteTools
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Построить маршрут к офису"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Маршрут</span>
          </button>

          <a
            href={yandexNaviUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors font-medium hidden sm:flex items-center gap-1"
            title="Открыть в Яндекс.Картах"
          >
            <span>Яндекс</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href={gis2Url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors font-medium hidden sm:flex items-center gap-1"
            title="Открыть карточку в 2ГИС"
          >
            <span>2ГИС</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Свернуть' : 'Во весь экран'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Map Viewport (Fills 100% of remaining height) */}
      <div className="relative flex-1 w-full h-full min-h-[360px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {/* Floating Route Calculator Overlay */}
        {showRouteTools && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-80 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 space-y-2.5 transition-all text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Маршрут до {currentOffice.city}
              </span>
              <button
                type="button"
                onClick={() => setShowRouteTools(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg font-semibold">
              <button
                type="button"
                onClick={() => setRouteMode('auto')}
                className={`flex-1 py-1 rounded text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  routeMode === 'auto' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>Авто</span>
              </button>
              <button
                type="button"
                onClick={() => setRouteMode('masstransit')}
                className={`flex-1 py-1 rounded text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  routeMode === 'masstransit' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bus className="w-3 h-3" />
                <span>Транспорт</span>
              </button>
              <button
                type="button"
                onClick={() => setRouteMode('pedestrian')}
                className={`flex-1 py-1 rounded text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  routeMode === 'pedestrian' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Footprints className="w-3 h-3" />
                <span>Пешком</span>
              </button>
            </div>

            {/* Input & Actions */}
            <form onSubmit={handleRouteSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={routeFromInput}
                  onChange={(e) => setRouteFromInput(e.target.value)}
                  placeholder="Откуда (адрес или город)..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 pr-16 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="absolute right-1 top-1 bottom-1 px-2 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded"
                >
                  GPS
                </button>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="submit"
                  disabled={isRouting}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isRouting ? 'Построение...' : 'Построить'}
                </button>
                {multiRouteRef.current && (
                  <button
                    type="button"
                    onClick={clearRoute}
                    className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg"
                    title="Сбросить маршрут"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {routeInfo && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
                <strong>Расстояние:</strong> {routeInfo.distance} • <strong>В пути:</strong> ~{routeInfo.duration}
              </div>
            )}
            {routeError && (
              <div className="p-2 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
                {routeError}
              </div>
            )}
          </div>
        )}

        {/* Fallback View if Yandex Maps API blocked or timed out */}
        {mapTimeoutFallback && !isMapLoaded ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Интерактивная карта готова к навигации
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4">
              Внешний скрипт карт загружается дольше обычного. Вы можете перейти к маршруту напрямую:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <a
                href={yandexNaviUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <span>Яндекс.Карты ({currentOffice.city})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={gis2Url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <span>Открыть в 2ГИС</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setMapTimeoutFallback(false)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg"
              >
                Повторить попытку
              </button>
            </div>
          </div>
        ) : (
          <SafeMapErrorBoundary
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900">
                <MapPin className="w-10 h-10 text-blue-500 mb-2" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  Карта временно недоступна в предпросмотре
                </h4>
                <div className="flex gap-2">
                  <a
                    href={yandexNaviUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <span>Маршрут в Яндекс</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={gis2Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <span>2ГИС</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            }
          >
            <YMaps query={{ lang: 'ru_RU', load: 'package.full' }}>
              <YandexMap
                defaultState={{
                  center: SAMARA_OFFICE.coords,
                  zoom: 15,
                  controls: []
                }}
                width="100%"
                height="100%"
                instanceRef={(ref: any) => {
                  if (ref) {
                    mapRef.current = ref;
                    // Center properly once ref is available
                    const targetCoords = activeLocation === 'samara' ? SAMARA_OFFICE.coords : TOLYATTI_OFFICE.coords;
                    ref.setCenter(targetCoords, 16);
                  }
                }}
                onLoad={(ymaps: any) => {
                  ymapsRef.current = ymaps;
                  setIsMapLoaded(true);
                }}
              >
                {/* Standard Map Controls positioned neatly */}
                <ZoomControl options={{ position: { right: 12, top: 12 } } as any} />
                <TypeSelector options={{ position: { right: 12, bottom: 20 } } as any} />
                <GeolocationControl options={{ position: { right: 12, top: 96 } } as any} />

                {/* Marker 1: Samara Main Office */}
                <Placemark
                  geometry={SAMARA_OFFICE.coords}
                  properties={{
                    hintContent: 'ДС-Инжиниринг — Главный офис (Самара, ул. Свободы, 198)',
                    iconCaption: 'ДС-Инжиниринг (Самара)',
                    balloonContentHeader: `
                      <div style="font-family:system-ui,-apple-system,sans-serif; padding-bottom:4px; border-bottom:1px solid #e2e8f0;">
                        <span style="font-size:11px; font-weight:700; color:#2563eb; text-transform:uppercase;">Главный офис (г. Самара)</span>
                      </div>
                    `,
                    balloonContentBody: `
                      <div style="font-family:system-ui,-apple-system,sans-serif; font-size:12px; color:#334155; line-height:1.5;">
                        <p style="margin:4px 0;"><strong>Адрес:</strong> ${SAMARA_OFFICE.address}</p>
                        <p style="margin:4px 0;"><strong>Телефон:</strong> <a href="tel:${SAMARA_OFFICE.phoneClean}" style="color:#2563eb; text-decoration:none; font-weight:700;">${SAMARA_OFFICE.phone}</a></p>
                        <p style="margin:4px 0;"><strong>Режим работы:</strong> ${SAMARA_OFFICE.workHours}</p>
                      </div>
                    `,
                    balloonContentFooter: `
                      <div style="font-family:system-ui,-apple-system,sans-serif; margin-top:6px; display:flex; gap:6px;">
                        <a href="https://yandex.ru/maps/?rtext=~53.231904,50.277625&rtt=auto" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:4px 8px; background:#2563eb; color:#fff; font-size:11px; font-weight:600; border-radius:4px; text-decoration:none;">Маршрут в Яндекс</a>
                        <a href="https://2gis.ru/samara/geo/50.277625%2C53.231904" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:4px 8px; background:#16a34a; color:#fff; font-size:11px; font-weight:600; border-radius:4px; text-decoration:none;">2ГИС</a>
                      </div>
                    `
                  }}
                  options={{
                    preset: SAMARA_OFFICE.preset,
                    iconColor: SAMARA_OFFICE.color
                  } as any}
                  modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                  onClick={() => {
                    if (onLocationChange) onLocationChange('samara');
                    else setInternalLocation('samara');
                  }}
                />

                {/* Marker 2: Tolyatti CMM Laboratory */}
                <Placemark
                  geometry={TOLYATTI_OFFICE.coords}
                  properties={{
                    hintContent: 'ДС-Инжиниринг — Лаборатория КИМ (Тольятти, Южное ш., 161В)',
                    iconCaption: 'ДС-Инжиниринг (Тольятти)',
                    balloonContentHeader: `
                      <div style="font-family:system-ui,-apple-system,sans-serif; padding-bottom:4px; border-bottom:1px solid #e2e8f0;">
                        <span style="font-size:11px; font-weight:700; color:#059669; text-transform:uppercase;">Лаборатория КИМ (г. Тольятти)</span>
                      </div>
                    `,
                    balloonContentBody: `
                      <div style="font-family:system-ui,-apple-system,sans-serif; font-size:12px; color:#334155; line-height:1.5;">
                        <p style="margin:4px 0;"><strong>Адрес:</strong> ${TOLYATTI_OFFICE.address}</p>
                        <p style="margin:4px 0;"><strong>Телефон:</strong> <a href="tel:${TOLYATTI_OFFICE.phoneClean}" style="color:#059669; text-decoration:none; font-weight:700;">${TOLYATTI_OFFICE.phone}</a></p>
                        <p style="margin:4px 0;"><strong>Режим работы:</strong> ${TOLYATTI_OFFICE.workHours}</p>
                      </div>
                    `,
                    balloonContentFooter: `
                      <div style="font-family:system-ui,-apple-system,sans-serif; margin-top:6px; display:flex; gap:6px;">
                        <a href="https://yandex.ru/maps/?rtext=~53.556090,49.219736&rtt=auto" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:4px 8px; background:#059669; color:#fff; font-size:11px; font-weight:600; border-radius:4px; text-decoration:none;">Маршрут в Яндекс</a>
                        <a href="https://2gis.ru/togliatti/search/Южное+шоссе+161В" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:4px 8px; background:#16a34a; color:#fff; font-size:11px; font-weight:600; border-radius:4px; text-decoration:none;">2ГИС</a>
                      </div>
                    `
                  }}
                  options={{
                    preset: TOLYATTI_OFFICE.preset,
                    iconColor: TOLYATTI_OFFICE.color
                  } as any}
                  modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                  onClick={() => {
                    if (onLocationChange) onLocationChange('tolyatti');
                    else setInternalLocation('tolyatti');
                  }}
                />
              </YandexMap>
            </YMaps>
          </SafeMapErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default YandexInteractiveMap;
