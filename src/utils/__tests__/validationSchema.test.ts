import { describe, it, expect } from 'vitest';
import { validatePayload } from '../../server/schemas/validator.ts';
import { JSON_SCHEMAS } from '../../server/schemas/jsonSchemas.ts';

describe('Contact Form JSON Schema Validation (Draft-07)', () => {
  const schemaName = 'contactForm';

  describe('Schema Definition and Metadata', () => {
    it('should be registered in the JSON_SCHEMAS registry', () => {
      expect(JSON_SCHEMAS.contactForm).toBeDefined();
      expect(JSON_SCHEMAS.contactForm.type).toBe('object');
    });

    it('should comply with JSON Schema Draft-07 standard', () => {
      expect(JSON_SCHEMAS.contactForm.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(JSON_SCHEMAS.contactForm.$id).toBe('https://ds-enginering.ru/schemas/contact-form.json');
    });

    it('should require exactly name and phone fields', () => {
      expect(JSON_SCHEMAS.contactForm.required).toEqual(['name', 'phone']);
    });

    it('should validate the bundled schema examples successfully', () => {
      const examples = JSON_SCHEMAS.contactForm.examples || [];
      expect(examples.length).toBeGreaterThan(0);
      for (const example of examples) {
        const result = validatePayload(schemaName, example);
        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      }
    });
  });

  describe('Valid Payloads', () => {
    it('should accept a complete, valid contact request', () => {
      const payload = {
        name: 'Иванов Петр Сергеевич',
        phone: '+7 (846) 954-02-92',
        email: 'p.ivanov@samara-aviation.ru',
        company: 'АО «Авиаагрегат-Самара»',
        serviceType: '3D-контроль геометрии и калибровка КИМ',
        city: 'Самара',
        message: 'Требуется провести лазерное 3D-сканирование штамповой оснастки.',
        source: 'header_modal',
        honeypot: ''
      };

      const result = validatePayload(schemaName, payload);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should accept minimal payload with only required name and phone', () => {
      const minimalPayload = {
        name: 'Александр',
        phone: '+79270001122'
      };

      const result = validatePayload(schemaName, minimalPayload);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should accept various valid phone number formats', () => {
      const validPhoneFormats = [
        '+7 (846) 954-02-92',
        '89271234567',
        '+79271234567',
        '+7 (999) 111-22-33',
        '(846) 200-11-22',
        '8 846 954 02 92',
        '8-846-954-02-92'
      ];

      for (const phone of validPhoneFormats) {
        const result = validatePayload(schemaName, {
          name: 'Инженер Тестов',
          phone
        });
        expect(result.valid).toBe(true);
      }
    });

    it('should accept valid corporate and personal email formats', () => {
      const validEmails = [
        'info@ds-enginering.ru',
        'alexskobelev2025@gmail.com',
        'engineer.lead@corp.subdomain.ru',
        'first.last+tag@domain.co'
      ];

      for (const email of validEmails) {
        const result = validatePayload(schemaName, {
          name: 'Михаил',
          phone: '+7 (846) 954-02-92',
          email
        });
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('Invalid Payloads', () => {
    it('should reject empty object with missing required fields', () => {
      const result = validatePayload(schemaName, {});
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.includes('name') || e.includes('Обязательное поле "name"'))).toBe(true);
    });

    it('should reject payload missing required name', () => {
      const result = validatePayload(schemaName, {
        phone: '+7 (846) 954-02-92'
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('name') || e.includes('Обязательное поле "name"'))).toBe(true);
    });

    it('should reject payload missing required phone', () => {
      const result = validatePayload(schemaName, {
        name: 'Сергей'
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('phone') || e.includes('Обязательное поле "phone"'))).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = validatePayload(schemaName, {
        name: 'А',
        phone: '+7 (846) 954-02-92'
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('короткое') || e.includes('name'))).toBe(true);
    });

    it('should reject name exceeding 120 characters', () => {
      const result = validatePayload(schemaName, {
        name: 'A'.repeat(121),
        phone: '+7 (846) 954-02-92'
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('максимальную длину') || e.includes('name'))).toBe(true);
    });

    it('should reject phone shorter than 7 characters', () => {
      const result = validatePayload(schemaName, {
        name: 'Александр',
        phone: '123'
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('phone'))).toBe(true);
    });

    it('should reject phone containing alphabetical letters or forbidden characters', () => {
      const invalidPhones = [
        'phone-number',
        '+7 (846) CALL-ME',
        '89271234567abc',
        '+7 927 111 22 33 !@#'
      ];

      for (const phone of invalidPhones) {
        const result = validatePayload(schemaName, {
          name: 'Александр',
          phone
        });
        expect(result.valid).toBe(false);
        expect(result.errors?.some(e => e.includes('phone'))).toBe(true);
      }
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'username@domain..com'
      ];

      for (const email of invalidEmails) {
        const result = validatePayload(schemaName, {
          name: 'Иван',
          phone: '+7 (846) 954-02-92',
          email
        });
        expect(result.valid).toBe(false);
        expect(result.errors?.some(e => e.includes('email') || e.includes('электронной почты'))).toBe(true);
      }
    });

    it('should reject payload when anti-spam honeypot is filled', () => {
      const result = validatePayload(schemaName, {
        name: 'Spam Bot',
        phone: '+7 (846) 954-02-92',
        honeypot: 'http://spam-link.com'
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('honeypot'))).toBe(true);
    });

    it('should reject non-string types for string fields', () => {
      const result = validatePayload(schemaName, {
        name: 12345 as any,
        phone: '+7 (846) 954-02-92'
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('тип') || e.includes('string'))).toBe(true);
    });

    it('should reject message exceeding 5000 characters', () => {
      const result = validatePayload(schemaName, {
        name: 'Владимир',
        phone: '+7 (846) 954-02-92',
        message: 'M'.repeat(5001)
      });
      expect(result.valid).toBe(false);
      expect(result.errors?.some(e => e.includes('message'))).toBe(true);
    });
  });
});
