import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Wrench, Shield, Calendar, MapPin, 
  User, Tag, Hash, Sparkles, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanyFleetDevice, FleetDeviceStatus, Product } from '../../types';
import { FileUploadField } from '../common/FileUploadField';
import { AutoResizeTextarea } from '../common/AutoResizeTextarea';
import { apiService } from '../../services/apiService';

interface FleetDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceToEdit?: CompanyFleetDevice | null;
  onSave?: (device: CompanyFleetDevice) => void;
}

export const FleetDeviceModal: React.FC<FleetDeviceModalProps> = ({
  isOpen,
  onClose,
  deviceToEdit,
  onSave
}) => {
  const { products, authUsers, addFleetDevice, updateFleetDevice, showToast } = useApp();

  // Hardware models from website catalog
  const hardwareProducts = products.filter(p => p.type === 'hardware');

  const [crmDeals, setCrmDeals] = useState<any[]>([]);
  const [crmCompanies, setCrmCompanies] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      apiService.getCrmDeals().then(res => {
        if (res.success) setCrmDeals(res.data);
      });
      apiService.getCrmCompanies().then(res => {
        if (res.success) setCrmCompanies(res.data);
      });
    }
  }, [isOpen]);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [modelName, setModelName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [inventoryNumber, setInventoryNumber] = useState('');
  const [status, setStatus] = useState<FleetDeviceStatus>('in_office');
  const [verificationNumber, setVerificationNumber] = useState('');
  const [verificationDate, setVerificationDate] = useState('');
  const [verificationValidUntil, setVerificationValidUntil] = useState('');
  const [verificationDocUrl, setVerificationDocUrl] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [measuringRange, setMeasuringRange] = useState('');

  useEffect(() => {
    if (deviceToEdit) {
      setSelectedProductId(deviceToEdit.catalogProductId || '');
      setModelName(deviceToEdit.modelName || '');
      setBrand(deviceToEdit.brand || '');
      setCategory(deviceToEdit.category || '');
      setSerialNumber(deviceToEdit.serialNumber || '');
      setInventoryNumber(deviceToEdit.inventoryNumber || '');
      setStatus(deviceToEdit.status || 'in_office');
      setVerificationNumber(deviceToEdit.verificationNumber || '');
      setVerificationDate(deviceToEdit.verificationDate || '');
      setVerificationValidUntil(deviceToEdit.verificationValidUntil || '');
      setVerificationDocUrl(deviceToEdit.verificationDocUrl || '');
      setCurrentLocation(deviceToEdit.currentLocation || '');
      setResponsiblePerson(deviceToEdit.responsiblePerson || '');
      setNotes(deviceToEdit.notes || '');
      setPhotoUrl(deviceToEdit.photoUrl || '');
      setAccuracy(deviceToEdit.accuracy || '');
      setMeasuringRange(deviceToEdit.measuringRange || '');
    } else {
      // Default new device state
      setSelectedProductId(hardwareProducts[0]?.id || '');
      if (hardwareProducts[0]) {
        applyProductTemplate(hardwareProducts[0]);
      } else {
        setModelName('');
        setBrand('Hexagon');
        setCategory('Измерительные руки');
      }
      setSerialNumber('');
      setInventoryNumber(`ИНВ-ДС-${Math.floor(100 + Math.random() * 900)}`);
      setStatus('in_office');
      setVerificationNumber('');
      setVerificationDate(new Date().toISOString().split('T')[0]);
      // 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setVerificationValidUntil(nextYear.toISOString().split('T')[0]);
      setVerificationDocUrl('');
      setCurrentLocation('Метрологический отдел («ДС-Инжиниринг», Самара)');
      setResponsiblePerson('Ярыш И.В. (Инженер-метролог)');
      setNotes('');
    }
  }, [deviceToEdit, isOpen]);

  const applyProductTemplate = (product: Product) => {
    setSelectedProductId(product.id);
    setModelName(product.name);
    setBrand(product.brand || 'ДС-Инжиниринг');
    setCategory(product.categoryLabel || product.category || 'Оборудование');
    setPhotoUrl(product.image || '');
    
    // Extract accuracy & range if available in specs
    if (product.specs) {
      const acc = product.specs['Точность'] || product.specs['Предельная погрешность'] || product.specs['Погрешность'] || '';
      const rng = product.specs['Диапазон измерений'] || product.specs['Рабочая зона'] || product.specs['Поле сканирования'] || '';
      if (acc) setAccuracy(acc);
      if (rng) setMeasuringRange(rng);
    }
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    if (prodId === 'custom') {
      return;
    }
    const found = hardwareProducts.find(p => p.id === prodId);
    if (found) {
      applyProductTemplate(found);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelName.trim()) {
      showToast('Укажите наименование модели прибора');
      return;
    }
    if (!serialNumber.trim()) {
      showToast('Укажите заводской серийный номер прибора');
      return;
    }

    const deviceData: CompanyFleetDevice = {
      id: deviceToEdit?.id || `fleet-dev-${Date.now()}`,
      catalogProductId: selectedProductId && selectedProductId !== 'custom' ? selectedProductId : undefined,
      modelName: modelName.trim(),
      brand: brand.trim() || 'ДС-Инжиниринг',
      category: category.trim() || 'Оборудование',
      serialNumber: serialNumber.trim(),
      inventoryNumber: inventoryNumber.trim() || `ИНВ-${serialNumber.trim()}`,
      status,
      verificationNumber: verificationNumber.trim() || 'На оформлении',
      verificationDate: verificationDate || undefined,
      verificationValidUntil: verificationValidUntil.trim(),
      verificationDocUrl: verificationDocUrl.trim() || undefined,
      currentLocation: currentLocation.trim(),
      responsiblePerson: responsiblePerson.trim(),
      notes: notes.trim(),
      photoUrl: photoUrl.trim(),
      accuracy: accuracy.trim(),
      measuringRange: measuringRange.trim(),
      createdAt: deviceToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (deviceToEdit) {
      await updateFleetDevice(deviceToEdit.id, deviceData);
      showToast(`Прибор ${deviceData.modelName} (№ ${deviceData.serialNumber}) обновлен`);
    } else {
      await addFleetDevice(deviceData);
      showToast(`Прибор ${deviceData.modelName} (№ ${deviceData.serialNumber}) успешно добавлен в парк`);
    }

    if (onSave) onSave(deviceData);
    onClose();
  };

  // Check verification validity date
  const isExpired = verificationValidUntil ? new Date(verificationValidUntil) < new Date() : false;
  const daysUntilExpiry = verificationValidUntil 
    ? Math.ceil((new Date(verificationValidUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        id="fleet-device-modal"
        className="bg-white w-full max-w-3xl rounded-lg shadow-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-blue-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Wrench className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {deviceToEdit ? 'Редактирование прибора парка' : 'Добавить оборудование в парк компании'}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Связка с каталогом сайта, учет серийных номеров и контроль поверок ФГИС «АРШИН»
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-fleet-modal-btn"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1: Catalog Link */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Базовая модель из каталога сайта</span>
              </label>
              <span className="text-[11px] text-blue-700 font-medium">
                Автоматически подтягивает название, фото и характеристики
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8 relative">
                <select
                  id="fleet-catalog-product-select"
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="" disabled>-- Выберите модель из каталога оборудования --</option>
                  {hardwareProducts.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.brand}) — {prod.categoryLabel || prod.category}
                    </option>
                  ))}
                  <option value="custom">✏️ Другая модель (ручной ввод характеристик)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {photoUrl && (
                <div className="md:col-span-4 flex items-center gap-2 bg-white p-1.5 rounded-lg border border-blue-200">
                  <img 
                    src={photoUrl} 
                    alt="Предпросмотр" 
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                  />
                  <div className="overflow-hidden text-[11px] leading-tight">
                    <div className="font-bold text-gray-800 truncate">{brand}</div>
                    <div className="text-gray-500 truncate">{category}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device identity fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Наименование модели в актах и отчетах <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                required
                id="fleet-model-name-input"
                placeholder="например: Hexagon Absolute Arm 8525-7 (с AS1)"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span>Заводской серийный номер <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                required
                id="fleet-serial-number-input"
                placeholder="например: 8525-4491-RU / FSUE-2309"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm font-mono font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-500" />
                <span>Внутренний инвентарный номер</span>
              </label>
              <input
                type="text"
                id="fleet-inventory-number-input"
                placeholder="например: ИНВ-ДС-042"
                value={inventoryNumber}
                onChange={(e) => setInventoryNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Производитель (Бренд)</label>
              <input
                type="text"
                placeholder="Hexagon / Shining 3D / Leica / PMT"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Категория прибора</label>
              <input
                type="text"
                placeholder="Измерительные руки / 3D-сканеры / КИМ"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Status & Location Section */}
          <div className="p-4 bg-slate-50 border border-gray-200 rounded-lg space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Текущий статус и местонахождение</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className={`p-3 rounded-lg border-2 flex flex-col gap-1 cursor-pointer transition-all ${
                status === 'in_office' ? 'border-emerald-500 bg-emerald-50/60' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">В офисе / Зале</span>
                  <input 
                    type="radio" 
                    name="fleet_status" 
                    checked={status === 'in_office'} 
                    onChange={() => setStatus('in_office')}
                    className="accent-emerald-600" 
                  />
                </div>
                <span className="text-[11px] text-gray-500 leading-tight">Готов к работе в офисе / зале или выезду</span>
              </label>

              <label className={`p-3 rounded-lg border-2 flex flex-col gap-1 cursor-pointer transition-all ${
                status === 'on_site' ? 'border-blue-500 bg-blue-50/60' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800">На выезде</span>
                  <input 
                    type="radio" 
                    name="fleet_status" 
                    checked={status === 'on_site'} 
                    onChange={() => setStatus('on_site')}
                    className="accent-blue-600" 
                  />
                </div>
                <span className="text-[11px] text-gray-500 leading-tight">На объекте у заказчика</span>
              </label>

              <label className={`p-3 rounded-lg border-2 flex flex-col gap-1 cursor-pointer transition-all ${
                status === 'in_verification' ? 'border-amber-500 bg-amber-50/60' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">На поверке</span>
                  <input 
                    type="radio" 
                    name="fleet_status" 
                    checked={status === 'in_verification'} 
                    onChange={() => setStatus('in_verification')}
                    className="accent-amber-600" 
                  />
                </div>
                <span className="text-[11px] text-gray-500 leading-tight">В аккредитованном центре ЦСМ</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1 relative" ref={locationRef}>
                <label className="text-xs font-semibold text-slate-500">Текущий объект / Местоположение</label>
                <input
                  type="text"
                  placeholder="Самара, Технопарк / ПАО ОДК-Кузнецов"
                  value={currentLocation}
                  onChange={(e) => {
                    setCurrentLocation(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  className="w-full px-4.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                
                {showLocationDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div className="p-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => { setCurrentLocation("В офисе / Метрологический зал"); setShowLocationDropdown(false); }}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                      >
                        В офисе / Метрологический зал
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCurrentLocation("Самара, Технопарк"); setShowLocationDropdown(false); }}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                      >
                        Самара, Технопарк
                      </button>
                      
                      {crmCompanies.filter(c => c.name.toLowerCase().includes(currentLocation.toLowerCase())).length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase mt-2">Компании из базы</div>
                          {crmCompanies.filter(c => c.name.toLowerCase().includes(currentLocation.toLowerCase())).map(c => (
                            <button
                              key={`comp-${c.id}`}
                              type="button"
                              onClick={() => { setCurrentLocation(c.name); setShowLocationDropdown(false); }}
                              className="w-full text-left px-4 py-1.5 text-xs text-slate-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                            >
                              {c.name}
                            </button>
                          ))}
                        </>
                      )}

                      {crmDeals.filter(d => (d.companyName || d.title).toLowerCase().includes(currentLocation.toLowerCase())).length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase mt-2">Открытые сделки</div>
                          {crmDeals.filter(d => (d.companyName || d.title).toLowerCase().includes(currentLocation.toLowerCase())).map(d => {
                            const val = d.companyName ? `${d.companyName} (${d.title})` : d.title;
                            return (
                              <button
                                key={`deal-${d.id}`}
                                type="button"
                                onClick={() => { setCurrentLocation(val); setShowLocationDropdown(false); }}
                                className="w-full text-left px-4 py-1.5 text-xs text-slate-500 hover:bg-blue-50 hover:text-blue-700 rounded-lg truncate"
                              >
                                {val}
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Ответственный метролог / инженер</label>
                <select
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-4.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Ярыш И.В. (Инженер-метролог)">Ярыш И.В. (Инженер-метролог)</option>
                  <option value="Некрасов С.Ю. (Генеральный директор)">Некрасов С.Ю. (Генеральный директор)</option>
                  <option value="Скобелев А.С. (Инженер по внедрению CAD/CAM и постпроцессорам)">Скобелев А.С. (Инженер по внедрению CAD/CAM и постпроцессорам)</option>
                  <option value="Ярыш А.В. (Инженер по подбору оборудования и ПО)">Ярыш А.В. (Инженер по подбору оборудования и ПО)</option>
                  <option value="Морозов В.Г. (Руководитель КТО)">Морозов В.Г. (Руководитель КТО)</option>
                  {authUsers
                    .filter(u => u.role === 'admin' || u.role === 'superadmin' || u.role === 'manager')
                    .filter(u => !['Ярыш И.В.', 'Некрасов С.Ю.', 'Скобелев А.С.', 'Ярыш А.В.', 'Морозов В.Г.'].some(name => u.fullName.includes(name.split(' ')[0])))
                    .map(u => (
                      <option key={u.id} value={`${u.fullName} (${u.position || u.role})`}>
                        {u.fullName} {u.position ? `(${u.position})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Verification (ФГИС «АРШИН») Section */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Метрологическая поверка (ФГИС «АРШИН»)</span>
              </h4>
              
              {isExpired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Поверка просрочена!
                </span>
              ) : isExpiringSoon ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Истекает через {daysUntilExpiry} дн.
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  Поверка действует
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1 md:col-span-1">
                <label className="text-xs font-semibold text-slate-500">Номер свидетельства о поверке</label>
                <input
                  type="text"
                  placeholder="С-СПБ/24-08-2025/119044"
                  value={verificationNumber}
                  onChange={(e) => setVerificationNumber(e.target.value)}
                  className="w-full px-4.5 py-2 bg-white border border-amber-200 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Дата поверки</label>
                <input
                  type="date"
                  value={verificationDate}
                  onChange={(e) => setVerificationDate(e.target.value)}
                  className="w-full px-4.5 py-2 bg-white border border-amber-200 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900">
                  Действует до (Срок поверки) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  id="fleet-verification-valid-until-input"
                  value={verificationValidUntil}
                  onChange={(e) => setVerificationValidUntil(e.target.value)}
                  className={`w-full px-4.5 py-2 bg-white border rounded-lg text-xs font-bold focus:ring-2 outline-none ${
                    isExpired ? 'border-red-400 text-red-700 focus:ring-red-500' : 'border-amber-300 text-gray-900 focus:ring-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Verification document attachment */}
            <div>
              <FileUploadField
                label="Скан свидетельства о поверке / Сертификат калибровки (PDF, JPG)"
                value={verificationDocUrl}
                onChange={setVerificationDocUrl}
                type="document"
                helperText="Прикрепите официальный скан для быстрого скачивания инженерами и аудиторами"
              />
            </div>
          </div>

          {/* Technical Specs & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Паспортная точность (погрешность)</label>
              <input
                type="text"
                placeholder="например: 0.015 мм (MPE-E)"
                value={accuracy}
                onChange={(e) => setAccuracy(e.target.value)}
                className="w-full px-4.5 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Диапазон измерений / Зона охвата</label>
              <input
                type="text"
                placeholder="например: 2.5 м (сфера) / 1000x1200x800 мм"
                value={measuringRange}
                onChange={(e) => setMeasuringRange(e.target.value)}
                className="w-full px-4.5 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500">
                Комплектация, установленные датчики и примечания
              </label>
              <AutoResizeTextarea
                id="fleet-notes-input"
                minRows={2}
                placeholder="Укажите установленные щупы, скан-насадки, магнитные стойки, доп. адаптеры и номер защитного кейса..."
                value={notes}
                onChange={setNotes}
                className="w-full px-4.5 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              id="cancel-fleet-modal-btn"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              id="save-fleet-device-btn"
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{deviceToEdit ? 'Сохранить изменения' : 'Внести прибор в парк'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
