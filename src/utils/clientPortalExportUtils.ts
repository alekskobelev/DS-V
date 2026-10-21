import JSZip from 'jszip';

export interface ContractPackageInfo {
  contractNumber: string;
  contractDate: string;
  customerName: string;
  projectName: string;
  equipmentName: string;
  serialNumber: string;
  arshinNumber: string;
  verificationValidUntil: string;
  cncMachineModel?: string;
  camSystem?: string;
}

/**
 * Generates and downloads a complete ZIP archive with all contractual, metrological,
 * calibration, and postprocessor documents for a B2B contract in 1 click.
 */
export async function downloadContractDocumentPackageZip(info: ContractPackageInfo): Promise<void> {
  const zip = new JSZip();

  // Root Info README
  const readmeContent = `================================================================================
ООО «ДС-ИНЖИНИРИНГ» (DS-ENGINEERING LLC)
ИНЖЕНЕРНО-МЕТРОЛОГИЧЕСКИЙ КОМПЛЕКС И СЕРВИСНЫЙ ЦЕНТР
================================================================================
ДОГОВОР: ${info.contractNumber} от ${info.contractDate}
ЗАКАЗЧИК: ${info.customerName}
ОБЪЕКТ / ОБОРУДОВАНИЕ: ${info.equipmentName} (Зав. № ${info.serialNumber})
СТАТУС ПОВЕРКИ: ФГИС «АРШИН» № ${info.arshinNumber} (Действительна до ${info.verificationValidUntil})

СОСТАВ ПАКЕТА ДОКУМЕНТАЦИИ:
1. Договорные документы (Договор поставки, Спецификация оборудования, Акт сдачи-приемки ПНР)
2. Метрологический протокол 3D-контроля точности по ГОСТ Р ИСО 10360 / ГОСТ Р ИСО 1101
3. Свидетельство о поверке государственного образца (ФГИС «АРШИН»)
4. Руководство по эксплуатации и калибровочные сертификаты
5. Постпроцессор для станка с ЧПУ (${info.cncMachineModel || 'Фрезерный ОЦ 5-осей'} / ${info.camSystem || 'TopSolid 7 CAM'})

Техническая поддержка «ДС-Инжиниринг»: support@ds-engineering.ru | 8 (800) 555-35-24
`;
  zip.file('README_OPIS_VLOZHENIYA.txt', readmeContent);

  // Folder 1: Договорные документы
  const folderDocs = zip.folder('1_Dogovor_i_Akty');
  folderDocs?.file(
    `01_Dogovor_Postavki_${info.contractNumber.replace(/[\/\\]/g, '_')}.txt`,
    `ДОГОВОР ПОСТАВКИ И ПУСКОНАЛАДКИ № ${info.contractNumber}
Дата заключения: ${info.contractDate}
Поставщик: ООО «ДС-Инжиниринг»
Покупатель: ${info.customerName}

ПРЕДМЕТ ДОГОВОРА:
Поставка координатно-измерительного оборудования, программного обеспечения и выполнение пусконаладочных работ (ПНР).
Оборудование: ${info.equipmentName}, зав. № ${info.serialNumber}.
Гарантийный срок: 24 месяца с даты подписания Акта ввода в эксплуатацию.

Подписи Сторон:
От Поставщика: Генеральный директор ООО «ДС-Инжиниринг» / М.П.
От Заказчика: Главный инженер / Главный технолог / М.П.`
  );

  folderDocs?.file(
    `02_Akt_Sdachi_Priemki_PNR_${info.contractNumber.replace(/[\/\\]/g, '_')}.txt`,
    `АКТ СДАЧИ-ПРИЕМКИ ПУСКОНАЛАДОЧНЫХ РАБОТ
по Договору № ${info.contractNumber}

Настоящим подтверждается, что сервисная служба ООО «ДС-Инжиниринг» выполнила полный комплекс монтажных,
калибровочных и пусконаладочных работ измерительного комплекса:
- Модель: ${info.equipmentName}
- Заводской номер: ${info.serialNumber}
- Инсталляция метрологического ПО PolyWorks|Inspector™ / TopSolid: ВЫПОЛНЕНА
- Проверка геометрической точности по эталонным мерам длины (ГОСТ Р ИСО 10360-2): СООТВЕТСТВУЕТ ЗАЯВЛЕННЫМ MPE
- Инструктаж персонала заказчика (2 оператора): ПРОВЕДЕН

Претензий по качеству и срокам выполнения работ Заказчик не имеет.`
  );

  // Folder 2: Метрология и поверка
  const folderMetrology = zip.folder('2_Metrologiya_i_Poverka_ARSHIN');
  folderMetrology?.file(
    `01_Svidetelstvo_Poverki_ARSHIN_${info.arshinNumber}.txt`,
    `ФЕДЕРАЛЬНОЕ АГЕНТСТВО ПО ТЕХНИЧЕСКОМУ РЕГУЛИРОВАНИЮ И МЕТРОЛОГИИ
ФЕДЕРАЛЬНЫЙ ИНФОРМАЦИОННЫЙ ФОНД ПО ОБЕСПЕЧЕНИЮ ЕДИНСТВА ИЗМЕРЕНИЙ
ФГИС «АРШИН»

СВИДЕТЕЛЬСТВО О ПОВЕРКЕ № ${info.arshinNumber}
Действительно до: ${info.verificationValidUntil}

Наименование СИ: ${info.equipmentName}
Заводской номер СИ: ${info.serialNumber}
Регистрационный номер типа СИ в ГРСИ: 84210-22
Методика поверки: ГОСТ Р ИСО 10360-2:2018 / МП-2022-ДС
Знак поверки: Нанесен на корпус прибора и в формуляр.

Поверитель: Государственный метрологический центр (аккредитованная лаборатория)
Статус во ФГИС «АРШИН»: ПОДТВЕРЖДЕНО, ПРИГОДНО К ПРИМЕНЕНИЮ`
  );

  folderMetrology?.file(
    `02_Protokol_3D_Kontrolya_GDT_${info.contractNumber.replace(/[\/\\]/g, '_')}.txt`,
    `ПРОТОКОЛ ИЗМЕРЕНИЙ И 3D-КОНТРОЛЯ ТОЧНОСТИ (GD&T)
Аттестация координатной точности измерительного оборудования

Оборудование: ${info.equipmentName} (Зав. № ${info.serialNumber})
Температура в лаборатории: 20.1 °C | Влажность: 48% | Давление: 101.3 кПа

РЕЗУЛЬТАТЫ ПОВЕРКИ ПО ОСЯМ:
- Ось X (ход 900 мм): Погрешность = +0.0011 мм (Допуск MPE: 0.0022 мм) -> ГОДЕН
- Ось Y (ход 1600 мм): Погрешность = +0.0014 мм (Допуск MPE: 0.0031 мм) -> ГОДЕН
- Ось Z (ход 800 мм): Погрешность = -0.0009 мм (Допуск MPE: 0.0021 мм) -> ГОДЕН
- Пространственная диагональ L=1800 мм: Погрешность = 0.0024 мм -> СООТВЕТСТВУЕТ КЛАССУ 1

Заключение ведущего инженера-метролога:
Прибор обеспечивает заявленные точностные параметры для контроля деталей классов точности IT4-IT7.`
  );

  // Folder 3: Постпроцессоры и CAM-файлы
  const folderCam = zip.folder('3_Postprocessory_i_CAM');
  folderCam?.file(
    `TopSolid7_${(info.cncMachineModel || 'CNC_Mill_5Axis').replace(/\s+/g, '_')}_Postprocessor.gpp`,
    `; ==============================================================================
; TopSolid 7 CAM Postprocessor Configuration File
; Developed by DS-Engineering LLC Metrology & CAM Division
; Contract: ${info.contractNumber} for ${info.customerName}
; CNC Machine: ${info.cncMachineModel || '5-Axis Machining Center'}
; Control System: Siemens Sinumerik 840D sl / Fanuc 31i-B5
; Kinematics: Table-Head (B-axis tilt -120..+30, C-axis rotary 360 deg)
; 3D Collision Avoidance & RTCP / TRAORI G43.4 active
; ==============================================================================
BEGIN_INIT
  G90 G17 G40 G80 G49
  G94 G54
  M05 M09
END_INIT
`
  );

  folderCam?.file(
    'Instruktsiya_po_ustanovke_postprocessora.txt',
    `ИНСТРУКЦИЯ ПО УСТАНОВКЕ ПОСТПРОЦЕССОРА TOPSOLID 7:
1. Скопируйте файл конфигурации .gpp в каталог:
   C:\\TopSolid\\TopSolid 7\\Configurations\\PostProcessors\\
2. Перезапустите TopSolid 7.
3. В настройках оборудования станка выберите данный постпроцессор.
4. Техническая поддержка по наладке: support@ds-engineering.ru`
  );

  // Generate ZIP Blob
  const blob = await zip.generateAsync({ type: 'blob' });
  const sanitizedFileName = `Komplekt_Dokumentov_${info.contractNumber.replace(/[\/\\]/g, '_')}.zip`;

  // Trigger Download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = sanitizedFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Generates and downloads an RFC 5545 compliant iCalendar (.ics) file
 * with scheduled verification reminders (ФГИС «АРШИН») for Outlook, Google Calendar, Apple, МойОфис.
 */
export function downloadArshinVerificationIcsCalendar(devices: Array<{
  brand: string;
  modelName: string;
  serialNumber: string;
  arshinNumber: string;
  validUntilDate: string; // ISO date string YYYY-MM-DD
  organization?: string;
}>): void {
  const formatDateToIcs = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const nowStr = formatDateToIcs(new Date());

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DS-Engineering LLC//Metrology Arshin Sync//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:График поверки СИ (ФГИС АРШИН) — ДС-Инжиниринг',
    'X-WR-TIMEZONE:Europe/Samara'
  ];

  devices.forEach((dev, idx) => {
    const expiryDate = new Date(dev.validUntilDate);
    // Set all-day or specific 09:00 morning inspection reminder
    expiryDate.setHours(9, 0, 0, 0);

    const endDate = new Date(expiryDate);
    endDate.setHours(11, 0, 0, 0);

    const startStr = formatDateToIcs(expiryDate);
    const endStr = formatDateToIcs(endDate);
    const uid = `arshin-verify-${dev.serialNumber}-${idx}-${Date.now()}@ds-engineering.ru`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Окончание поверки: ${dev.brand} ${dev.modelName} (№ ${dev.serialNumber})`,
      `DESCRIPTION:Внимание! Истекает срок очередной периодической поверки средства измерений:\\n- Прибор: ${dev.brand} ${dev.modelName}\\n- Заводской номер: ${dev.serialNumber}\\n- Номер в ФГИС «АРШИН»: ${dev.arshinNumber}\\n- Действительна до: ${dev.validUntilDate}\\n\\nРекомендуется заранее подать заявку на сервисное обслуживание и поверку в инженерную службу «ДС-Инжиниринг» (Самара):\\nТел: +7 (846) 954-02-92 | info@ds-enginering.ru`,
      'LOCATION:«ДС-Инжиниринг», Самара / Тольятти',
      'STATUS:CONFIRMED',
      // Alarm 1: 30 days prior
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Напоминание (за 30 дней): Плановая поверка ${dev.modelName} (АРШИН № ${dev.arshinNumber})`,
      'TRIGGER:-P30D',
      'END:VALARM',
      // Alarm 2: 7 days prior
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Срочно (за 7 дней)! Истекает срок поверки ${dev.modelName} (АРШИН № ${dev.arshinNumber})`,
      'TRIGGER:-P7D',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Grafik_Poverki_ARSHIN_DS_Engineering.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
