import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  Building2,
  FileText,
  CreditCard,
  Globe,
  Share2,
  CheckCircle2,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CmsContactsEditor: React.FC = () => {
  const { companyInfo, updateCompanyInfo, showToast } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: companyInfo.name || 'ДС-Инжиниринг',
    legalName: companyInfo.legalName || 'ООО «ДС-Инжиниринг»',
    address: companyInfo.address || '',
    addressShort: companyInfo.addressShort || '',
    phone: companyInfo.phone || '',
    phoneClean: companyInfo.phoneClean || '',
    email: companyInfo.email || '',
    website: companyInfo.website || '',
    workHours: companyInfo.workHours || '',
    vkUrl: companyInfo.vkUrl || '',
    vkName: companyInfo.vkName || '',
    inn: companyInfo.inn || '',
    kpp: companyInfo.kpp || '',
    ogrn: companyInfo.ogrn || '',
    okpo: companyInfo.okpo || '',
    oktmo: companyInfo.oktmo || '',
    bank: companyInfo.bank || '',
    bik: companyInfo.bik || '',
    rs: companyInfo.rs || '',
    ks: companyInfo.ks || '',
    tolyattiCity: companyInfo.tolyattiBranch?.city || 'Тольятти',
    tolyattiLocation: companyInfo.tolyattiBranch?.locationName || 'Технопарк «Жигулевская долина»',
    tolyattiAddress: companyInfo.tolyattiBranch?.address || '',
    tolyattiOffice: companyInfo.tolyattiBranch?.office || '',
    tolyattiLab: companyInfo.tolyattiBranch?.lab || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo({
      name: formData.name,
      legalName: formData.legalName,
      address: formData.address,
      addressShort: formData.addressShort,
      phone: formData.phone,
      phoneClean: formData.phoneClean,
      email: formData.email,
      website: formData.website,
      workHours: formData.workHours,
      vkUrl: formData.vkUrl,
      vkName: formData.vkName,
      inn: formData.inn,
      kpp: formData.kpp,
      ogrn: formData.ogrn,
      okpo: formData.okpo,
      oktmo: formData.oktmo,
      bank: formData.bank,
      bik: formData.bik,
      rs: formData.rs,
      ks: formData.ks,
      tolyattiBranch: {
        city: formData.tolyattiCity,
        locationName: formData.tolyattiLocation,
        address: formData.tolyattiAddress,
        office: formData.tolyattiOffice,
        lab: formData.tolyattiLab,
      },
    });

    setSavedSuccess(true);
    showToast('Контактные и юридические данные компании сохранены');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Организация и юридические реквизиты</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Контакты, офисы и банковские реквизиты
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Данные автоматически обновляются в шапке (Header), подвале (Footer), на странице «Контакты» и в бланках официальных коммерческих предложений (ТКП).
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Сохранено!' : 'Сохранить изменения'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Section 1: Main Contacts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Основные контакты и связь</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Название бренда</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Юридическое наименование</label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Основной телефон</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Телефон без пробелов (+7846...)</label>
              <input
                type="text"
                value={formData.phoneClean}
                onChange={(e) => handleChange('phoneClean', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Email для заявок</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Официальный сайт</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-500 mb-1">Режим работы</label>
              <input
                type="text"
                value={formData.workHours}
                onChange={(e) => handleChange('workHours', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Addresses & Branches */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Адреса филиалов и офисов</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Главный офис (полный почтовый адрес)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Краткий адрес (для шапки и подвала)</label>
              <input
                type="text"
                value={formData.addressShort}
                onChange={(e) => handleChange('addressShort', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 space-y-2">
              <span className="font-bold text-gray-800 text-[11px] block">Филиал в г. Тольятти (Жигулевская долина):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 text-[10px]">Адрес</label>
                  <input
                    type="text"
                    value={formData.tolyattiAddress}
                    onChange={(e) => handleChange('tolyattiAddress', e.target.value)}
                    className="w-full p-2 text-[11px] rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px]">Метрологический зал</label>
                  <input
                    type="text"
                    value={formData.tolyattiLab}
                    onChange={(e) => handleChange('tolyattiLab', e.target.value)}
                    className="w-full p-2 text-[11px] rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Legal & Bank Requisites */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4 xl:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Юридические и банковские реквизиты (для счетов и ТКП)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">ИНН</label>
              <input
                type="text"
                value={formData.inn}
                onChange={(e) => handleChange('inn', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">КПП</label>
              <input
                type="text"
                value={formData.kpp}
                onChange={(e) => handleChange('kpp', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">ОГРН</label>
              <input
                type="text"
                value={formData.ogrn}
                onChange={(e) => handleChange('ogrn', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">ОКПО</label>
              <input
                type="text"
                value={formData.okpo}
                onChange={(e) => handleChange('okpo', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-500 mb-1">Банк</label>
              <input
                type="text"
                value={formData.bank}
                onChange={(e) => handleChange('bank', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">БИК</label>
              <input
                type="text"
                value={formData.bik}
                onChange={(e) => handleChange('bik', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Расчетный счет (Р/С)</label>
              <input
                type="text"
                value={formData.rs}
                onChange={(e) => handleChange('rs', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
