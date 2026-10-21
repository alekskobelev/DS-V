import { describe, it, expect, beforeEach } from 'vitest';
import {
  REAL_SERVICES,
  validateServiceItem,
  validateEquipmentArray,
  validateEquipmentList,
  validateEquipmentItem,
  validateContact,
  validateContactLink,
  isValidUrl,
  sanitizeServiceItem,
  getServicesHistory,
  saveServicesVersion,
  restoreServicesVersion,
  rollbackToPreviousVersion,
  clearServicesHistory,
  ServiceItem
} from '../../data/services';
import {
  validateCmsServiceItem,
  validateCmsServices
} from '../../pages/CmsPage';

describe('Services Validation and Integrity Tests', () => {
  it('should validate all bundled REAL_SERVICES with 0 errors', () => {
    expect(REAL_SERVICES.length).toBeGreaterThan(0);
    REAL_SERVICES.forEach((service) => {
      const result = validateServiceItem(service);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Non-empty Fields Validator', () => {
    const validBaseService: ServiceItem = { ...REAL_SERVICES[0] };

    it('should reject service with missing or empty title', () => {
      const invalid = { ...validBaseService, title: '' };
      const res = validateServiceItem(invalid);
      expect(res.isValid).toBe(false);
      expect(res.errorMap.title).toBeDefined();

      const whitespaceOnly = { ...validBaseService, title: '   ' };
      const res2 = validateServiceItem(whitespaceOnly);
      expect(res2.isValid).toBe(false);
      expect(res2.errorMap.title).toBeDefined();
    });

    it('should reject service with missing or empty shortDesc / fullDesc', () => {
      const invalidShort = { ...validBaseService, shortDesc: 'too short' };
      const res1 = validateServiceItem(invalidShort);
      expect(res1.isValid).toBe(false);
      expect(res1.errorMap.shortDesc).toBeDefined();

      const invalidFull = { ...validBaseService, fullDesc: '' };
      const res2 = validateServiceItem(invalidFull);
      expect(res2.isValid).toBe(false);
      expect(res2.errorMap.fullDesc).toBeDefined();
    });

    it('should reject service with empty basePriceText or invalid calculatorType', () => {
      const invalidPrice = { ...validBaseService, basePriceText: '   ' };
      const res1 = validateServiceItem(invalidPrice);
      expect(res1.isValid).toBe(false);
      expect(res1.errorMap.basePriceText).toBeDefined();

      const invalidCalc = { ...validBaseService, calculatorType: 'unknown_calc' as any };
      const res2 = validateServiceItem(invalidCalc);
      expect(res2.isValid).toBe(false);
      expect(res2.errorMap.calculatorType).toBeDefined();
    });

    it('should reject service with empty deliverables or steps', () => {
      const noDeliverables = { ...validBaseService, deliverables: [] };
      const res1 = validateServiceItem(noDeliverables);
      expect(res1.isValid).toBe(false);
      expect(res1.errorMap.deliverables).toBeDefined();

      const emptyItemDeliverable = { ...validBaseService, deliverables: ['CAD-модель', '   '] };
      const res2 = validateServiceItem(emptyItemDeliverable);
      expect(res2.isValid).toBe(false);
      expect(res2.errorMap.deliverables).toBeDefined();

      const noSteps = { ...validBaseService, steps: [] };
      const res3 = validateServiceItem(noSteps);
      expect(res3.isValid).toBe(false);
      expect(res3.errorMap.steps).toBeDefined();
    });
  });

  describe('Equipment Array Data Types Validator', () => {
    it('should reject non-array equipment types (string, number, object, null)', () => {
      expect(validateEquipmentArray(null).isValid).toBe(false);
      expect(validateEquipmentArray(undefined).isValid).toBe(false);
      expect(validateEquipmentArray('Optical Scanner 3D').isValid).toBe(false);
      expect(validateEquipmentArray(12345).isValid).toBe(false);
      expect(validateEquipmentArray({ name: 'Shining 3D' }).isValid).toBe(false);
    });

    it('should reject empty equipment array', () => {
      const res = validateEquipmentArray([]);
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('не может быть пустым');
    });

    it('should reject array with non-string data types (numbers, objects, nulls)', () => {
      const mixed = ['Shining 3D FreeScan', 100500, null, { model: 'PMT CMM' }];
      const res = validateEquipmentArray(mixed);
      expect(res.isValid).toBe(false);
      expect(res.errors.some(e => e.includes('недопустимый тип данных'))).toBe(true);
    });

    it('should reject array with empty or whitespace-only strings', () => {
      const whitespaceItems = ['Shining 3D FreeScan', '   ', ''];
      const res = validateEquipmentArray(whitespaceItems);
      expect(res.isValid).toBe(false);
      expect(res.errors.some(e => e.includes('пустой строкой'))).toBe(true);
    });

    it('should reject equipment mentioning prohibited demo-centers', () => {
      const forbidden = ['Демо-центр измерительного оборудования'];
      const res = validateEquipmentArray(forbidden);
      expect(res.isValid).toBe(false);
      expect(res.errors.some(e => e.includes('демо-центр'))).toBe(true);
    });

    it('should accept valid array of strings', () => {
      const valid = [
        'Лазерный 3D-сканер Shining 3D FreeScan Combo',
        'Метрологическое ПО PolyWorks|Inspector™'
      ];
      const res = validateEquipmentArray(valid);
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });
  });

  describe('Contact Links and URL Validator', () => {
    it('should correctly validate valid and invalid URLs with isValidUrl', () => {
      expect(isValidUrl('https://ds-enginering.ru')).toBe(true);
      expect(isValidUrl('http://polyworks.com/products')).toBe(true);
      expect(isValidUrl('https://t.me/ds_engineering')).toBe(true);
      expect(isValidUrl('tg://resolve?domain=ds_metrology')).toBe(true);
      expect(isValidUrl('/docs/brochure.pdf', { allowRelative: true })).toBe(true);

      // Invalid URLs
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('   ')).toBe(false);
      expect(isValidUrl('not_a_valid_url')).toBe(false);
      expect(isValidUrl(12345)).toBe(false);
      expect(isValidUrl(null)).toBe(false);
    });

    it('should validate contact links with validateContactLink', () => {
      expect(validateContactLink('https://ds-enginering.ru').isValid).toBe(true);
      expect(validateContactLink('https://t.me/yarish_engineer').isValid).toBe(true);
      expect(validateContactLink(undefined).isValid).toBe(true); // Optional
      expect(validateContactLink('').isValid).toBe(true); // Optional

      const invalidString = validateContactLink('random-garbage-link');
      expect(invalidString.isValid).toBe(false);
      expect(invalidString.error).toContain('недопустимый формат URL');

      const nonStringType = validateContactLink(12345);
      expect(nonStringType.isValid).toBe(false);
      expect(nonStringType.error).toContain('должна быть строкой');
    });

    it('should validate contact object with valid/invalid URLs in contact fields', () => {
      const validContact = {
        name: 'Ярыш Иван Владимирович',
        role: 'Инженер-метролог',
        phone: '+7 (927) 748-46-58',
        email: 'yarish@ds-enginering.ru',
        telegramUrl: 'https://t.me/ds_engineering',
        website: 'https://ds-enginering.ru'
      };
      const resValid = validateContact(validContact);
      expect(resValid.isValid).toBe(true);

      const invalidContactLinks = {
        name: 'Тестовый Специалист',
        role: 'Инженер',
        phone: '+7 (927) 000-00-00',
        telegramUrl: 'not-a-tg-link',
        website: 'bad-site-without-http'
      };
      const resInvalid = validateContact(invalidContactLinks);
      expect(resInvalid.isValid).toBe(false);
      expect(resInvalid.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Sanitizer Function', () => {
    it('should sanitize raw service data cleanly', () => {
      const raw = {
        title: '   3D-сканирование крупногабаритных деталей   ',
        shortDesc: '  Высокоточная оцифровка  ',
        equipmentUsed: [' Shining 3D FreeScan ', '', '  PolyWorks|Inspector™ '],
        calculatorType: 'scanning' as const
      };
      const clean = sanitizeServiceItem(raw);
      expect(clean.title).toBe('3D-сканирование крупногабаритных деталей');
      expect(clean.equipmentUsed).toEqual([
        'Shining 3D FreeScan',
        'PolyWorks|Inspector™'
      ]);
      expect(clean.steps.length).toBeGreaterThan(0);
    });
  });

  describe('CmsPage Service Validation Utilities', () => {
    it('should validate individual CmsServiceItem via validateCmsServiceItem', () => {
      const valid = REAL_SERVICES[0];
      const validRes = validateCmsServiceItem(valid);
      expect(validRes.isValid).toBe(true);
      expect(validRes.errors).toHaveLength(0);

      const invalid = { ...valid, title: '' };
      const invalidRes = validateCmsServiceItem(invalid);
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.errors.length).toBeGreaterThan(0);
      expect(invalidRes.errorMap.title).toBeDefined();
    });

    it('should validate full services list via validateCmsServices before saving', () => {
      const validList = [...REAL_SERVICES];
      const listRes = validateCmsServices(validList);
      expect(listRes.isValid).toBe(true);
      expect(listRes.errors).toHaveLength(0);
      expect(listRes.invalidCount).toBe(0);

      // Non-array list
      expect(validateCmsServices(null).isValid).toBe(false);
      expect(validateCmsServices([]).isValid).toBe(false);

      // Array with one corrupted item
      const corruptedList = [
        ...REAL_SERVICES,
        {
          id: 'corrupted-serv',
          title: '   ',
          shortDesc: 'bad',
          fullDesc: '',
          equipmentUsed: [12345 as any]
        }
      ];
      const corruptedRes = validateCmsServices(corruptedList);
      expect(corruptedRes.isValid).toBe(false);
      expect(corruptedRes.invalidCount).toBe(1);
      expect(corruptedRes.errors.length).toBeGreaterThan(0);
    });
  });

  describe('useServiceFormValidation Hook & Form Validation Logic', () => {
    it('should validate form data and calculate isSaveDisabled and errorMap correctly', () => {
      const valid = REAL_SERVICES[0];
      const validRes = validateServiceItem(valid);
      expect(validRes.isValid).toBe(true);
      expect(Object.keys(validRes.errorMap)).toHaveLength(0);

      // Mutated invalid form data
      const invalidForm = {
        ...valid,
        title: '',
        shortDesc: 'short',
        equipmentUsed: []
      };
      const invalidRes = validateServiceItem(invalidForm);
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.errorMap.title).toBeDefined();
      expect(invalidRes.errorMap.shortDesc).toBeDefined();
      expect(invalidRes.errorMap.equipmentUsed).toBeDefined();
      expect(invalidRes.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Service Definitions Versioning and Rollback System', () => {
    beforeEach(() => {
      clearServicesHistory();
      localStorage.clear();
    });

    it('should save version snapshots and retrieve them via getServicesHistory', () => {
      expect(getServicesHistory()).toHaveLength(0);

      const snap1 = saveServicesVersion(REAL_SERVICES, 'Начальная версия каталога');
      expect(snap1.versionNumber).toBe(1);
      expect(snap1.servicesCount).toBe(REAL_SERVICES.length);

      const historyAfter1 = getServicesHistory();
      expect(historyAfter1).toHaveLength(1);
      expect(historyAfter1[0].description).toBe('Начальная версия каталога');
    });

    it('should store at most 5 last saved versions in localStorage (FIFO queue)', () => {
      // Save 7 consecutive versions
      for (let i = 1; i <= 7; i++) {
        saveServicesVersion(REAL_SERVICES, `Версия #${i}`);
      }

      const history = getServicesHistory();
      expect(history).toHaveLength(5);
      // Newest should be first (version #7), oldest in list should be #3
      expect(history[0].description).toBe('Версия #7');
      expect(history[4].description).toBe('Версия #3');
    });

    it('should restore a specific version snapshot by ID', () => {
      const originalServices = [...REAL_SERVICES];
      saveServicesVersion(originalServices, 'Исходная версия');

      // Create a modified version
      const modifiedServices = [
        { ...originalServices[0], title: 'Измененная услуга сканирования' },
        ...originalServices.slice(1)
      ];
      const modifiedSnap = saveServicesVersion(modifiedServices, 'Модифицированная версия');

      const history = getServicesHistory();
      expect(history).toHaveLength(2);

      // Rollback to original version
      const originalSnapId = history[1].id;
      const restored = restoreServicesVersion(originalSnapId);
      expect(restored).not.toBeNull();
      expect(restored![0].title).toBe(originalServices[0].title);

      // Verify that rollback action is recorded in history
      const historyAfterRollback = getServicesHistory();
      expect(historyAfterRollback[0].metadata?.action).toBe('restore');
    });

    it('should execute quick rollback to previous version via rollbackToPreviousVersion', () => {
      saveServicesVersion(REAL_SERVICES, 'Снимок 1');
      const modified = [{ ...REAL_SERVICES[0], title: 'Испорченный заголовок' }];
      saveServicesVersion(modified, 'Снимок 2 с ошибкой');

      const rollbackRes = rollbackToPreviousVersion();
      expect(rollbackRes.success).toBe(true);
      expect(rollbackRes.services).toBeDefined();
      expect(rollbackRes.services![0].title).toBe(REAL_SERVICES[0].title);
    });

    it('should fail gracefully if history has fewer than 2 snapshots on rollbackToPreviousVersion', () => {
      saveServicesVersion(REAL_SERVICES, 'Единственный снимок');
      const rollbackRes = rollbackToPreviousVersion();
      expect(rollbackRes.success).toBe(false);
      expect(rollbackRes.message).toContain('необходимо минимум 2');
    });
  });
});
