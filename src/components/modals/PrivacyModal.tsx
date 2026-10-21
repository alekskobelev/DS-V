import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Building, Mail, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrivacyModal: React.FC = () => {
  const { isPrivacyModalOpen, setIsPrivacyModalOpen, companyInfo } = useApp();

  React.useEffect(() => {
    if (isPrivacyModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsPrivacyModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isPrivacyModalOpen, setIsPrivacyModalOpen]);

  if (!isPrivacyModalOpen) return null;

  return (
    <div 
      onClick={() => setIsPrivacyModalOpen(false)}
      className="fixed inset-0 z-[350] overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-4 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col cursor-default m-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-5 pr-12 relative shrink-0">
          <button
            onClick={() => setIsPrivacyModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Соответствие законодательству РФ • 152-ФЗ</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Политика конфиденциальности и обработки персональных данных
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            ООО «ДС‑Инжиниринг» • Редакция от 10 января 2026 г.
          </p>
        </div>

        {/* Modal Body - Scrollable content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm text-slate-500 leading-relaxed">
          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 space-y-1">
              <strong>Правовое уведомление для пользователей сайта:</strong>
              <p>
                Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта <code>ds-enginering.ru</code> в строгом соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных», Федеральным законом от 21.07.2014 № 242-ФЗ (об обязательной локализации баз данных в РФ) и Федеральным законом от 28.02.2023 № 52-ФЗ / № 168-ФЗ (о государственном языке РФ).
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">1</span>
              <span>Оператор персональных данных и идентификация домена</span>
            </h3>
            <p className="pl-7 text-xs text-slate-500 leading-relaxed">
              Оператором, организующим и осуществляющим обработку персональных данных, является <strong>{companyInfo.legalName}</strong> (ИНН: {companyInfo.inn}, ОГРН: {companyInfo.ogrn}, КПП: {companyInfo.kpp}), адрес местонахождения: {companyInfo.address}.<br />
              Администратор доменного имени <code>ds-enginering.ru</code> в национальной доменной зоне .RU прошел обязательную верификацию личности и полномочий через Единую систему идентификации и аутентификации (ЕСИА «Госуслуги») в соответствии с требованиями законодательства РФ.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">2</span>
              <span>Раздельность согласий и правовые основания</span>
            </h3>
            <div className="pl-7 text-xs text-slate-500 space-y-1.5 leading-relaxed">
              <p>В соответствии с нормами ст. 9 Федерального закона № 152-ФЗ:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Строгая раздельность согласий:</strong> Согласие на обработку персональных данных оформляется строго отдельно от любых иных документов, пользовательских соглашений или коммерческих оферт. Пользователь выражает согласие отдельным активным действием (чекбоксом).</li>
                <li><strong>Добровольность:</strong> Согласие является конкретным, предметным, информированным, сознательным и однозначным.</li>
                <li><strong>Отсутствие предустановленных отметок:</strong> Все формы согласия на сайте не содержат заранее проставленных галочек.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">3</span>
              <span>Состав обрабатываемых персональных данных</span>
            </h3>
            <div className="pl-7 text-xs text-slate-500 space-y-1.5 leading-relaxed">
              <p>При использовании интерактивных форм обратной связи, калькулятора стоимости, онлайн-диалога с инженером или запросе демонстраций ПО обрабатываются:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Фамилия, имя, отчество субъекта;</li>
                <li>Контактный номер телефона;</li>
                <li>Адрес электронной почты (e-mail);</li>
                <li>Наименование производственного предприятия / компании и должность;</li>
                <li>Технические параметры деталей, чертежи и спецификации станков с ЧПУ / КИМ;</li>
                <li>Обезличенные технические параметры сессии (IP-адрес, файлы cookies).</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">4</span>
              <span>Локализация баз данных и безопасность (242-ФЗ)</span>
            </h3>
            <p className="pl-7 text-xs text-slate-500 leading-relaxed">
              Все базы данных, информационные системы и серверное оборудование, содержащие персональные данные граждан Российской Федерации, физически размещены на серверах в защищенных ЦОД <strong>строго на территории Российской Федерации</strong> в соответствии с требованиями ст. 18 ч. 5 ФЗ-152 и ФЗ-242. Оператор применяет криптографическую защиту передаваемых данных (TLS 1.3/HTTPS) и современные СЗИ.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">5</span>
              <span>Права субъекта персональных данных и порядок отзыва</span>
            </h3>
            <p className="pl-7 text-xs text-slate-500 leading-relaxed">
              Субъект ПДн имеет право на получение информации, касающейся обработки его данных, на их уточнение, блокирование или уничтожение в случае неполноты или неточности. Отзыв согласия осуществляется путем направления электронного заявления на адрес <a href={`mailto:${companyInfo.email}`} className="text-blue-600 font-semibold underline">{companyInfo.email}</a> или почтового отправления по адресу местонахождения Оператора. Срок рассмотрения и прекращения обработки — не более 10 рабочих дней.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Соответствует ФЗ № 152-ФЗ РФ</span>
          </div>
          <button
            onClick={() => setIsPrivacyModalOpen(false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
          >
            Понятно, принимаю условия
          </button>
        </div>
      </div>
    </div>
  );
};
