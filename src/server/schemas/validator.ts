import { Request, Response, NextFunction } from 'express';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { JSON_SCHEMAS, SchemaDefinition } from './jsonSchemas.ts';
import { logRealtimeEvent } from '../logger.ts';

// Initialize Ajv with high-performance configuration
const ajv = new Ajv({
  allErrors: true,
  coerceTypes: false,
  useDefaults: true,
  strict: false,
  // removeAdditional: 'all' здесь ВЫКЛЮЧЕН намеренно. Он закрыл бы mass-assignment
  // (обработчики с {...current, ...payload}), но молча потерял бы поля, которые
  // обработчики читают, а схемы не описывают: analyticsEvent.userAgent,
  // ticketCreate.attachments, contactForm.department / contactForm.sourcePage.
  // Порядок включения строгости: (1) дополнить схемы этими полями и свободными
  // вложенностями (details/specifications объявить через patternProperties), (2)
  // прогнать контрактовые тесты всех четырёх роутов, (3) затем включать опцию.
  // Сейчас подмена полей закрыта на границах: sanitizeUserInput, SMTP-белый список,
  // белый список полей прайс-листа (см. priceListsModule).
});

// Add standard JSON Schema formats (email, uri, date-time, etc.)
addFormats(ajv);

// Pre-compile validators for maximum runtime speed
const compiledValidators = new Map<string, ReturnType<typeof ajv.compile>>();

Object.entries(JSON_SCHEMAS).forEach(([name, schema]) => {
  try {
    compiledValidators.set(name, ajv.compile(schema));
  } catch (err) {
    console.error(`[JSON Schema] Failed to compile schema "${name}":`, err);
  }
});

/**
 * Format Ajv errors into clean, engineering-grade Russian messages
 */
export function formatAjvErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors || errors.length === 0) return ['Неизвестная ошибка валидации'];

  return errors.map((err) => {
    const fieldPath = err.instancePath
      ? err.instancePath.replace(/^\//, '').replace(/\//g, '.')
      : (err.params as any)?.missingProperty || 'Запрос';

    switch (err.keyword) {
      case 'required':
        return `Обязательное поле "${(err.params as any).missingProperty}" не заполнено`;
      case 'type':
        return `Поле "${fieldPath}" должно иметь тип "${err.params.type}"`;
      case 'minLength':
        return `Поле "${fieldPath}" слишком короткое (минимум ${(err.params as any).limit} симв.)`;
      case 'maxLength':
        return `Поле "${fieldPath}" превышает максимальную длину (${(err.params as any).limit} симв.)`;
      case 'minimum':
        return `Значение поля "${fieldPath}" должно быть не менее ${(err.params as any).limit}`;
      case 'maximum':
        return `Значение поля "${fieldPath}" не должно превышать ${(err.params as any).limit}`;
      case 'format':
        if ((err.params as any).format === 'email') {
          return `Поле "${fieldPath}" должно содержать корректный адрес электронной почты (например, name@company.ru)`;
        }
        return `Поле "${fieldPath}" должно соответствовать формату "${(err.params as any).format}"`;
      case 'pattern':
        return `Поле "${fieldPath}" не соответствует требуемому шаблону`;
      case 'enum':
        return `Поле "${fieldPath}" должно принимать одно из допустимых значений: ${(err.params as any).allowedValues?.join(', ')}`;
      case 'additionalProperties':
        return `Обнаружено непредусмотренное поле "${(err.params as any).additionalProperty}"`;
      default:
        return `Ошибка в поле "${fieldPath}": ${err.message || 'некорректное значение'}`;
    }
  });
}

/**
 * Validate a payload against a registered JSON Schema by name
 */
export function validatePayload(schemaName: string, data: any): { valid: boolean; errors?: string[]; rawErrors?: ErrorObject[] } {
  let validator = compiledValidators.get(schemaName);

  if (!validator) {
    const schema = JSON_SCHEMAS[schemaName];
    if (!schema) {
      return {
        valid: false,
        errors: [`Схема с именем "${schemaName}" не зарегистрирована в реестре JSON Schema.`]
      };
    }
    validator = ajv.compile(schema);
    compiledValidators.set(schemaName, validator);
  }

  const valid = validator(data) as boolean;
  if (!valid && validator.errors) {
    return {
      valid: false,
      errors: formatAjvErrors(validator.errors),
      rawErrors: validator.errors
    };
  }

  return { valid: true };
}

/**
 * Express middleware for strict JSON Schema validation of req.body
 */
export function validateBody(schemaName: string | SchemaDefinition) {
  return (req: Request, res: Response, next: NextFunction) => {
    // If schemaName is a string, lookup from registry
    let validateFn: any;
    let name = typeof schemaName === 'string' ? schemaName : schemaName.title;

    if (typeof schemaName === 'string') {
      validateFn = compiledValidators.get(schemaName);
      if (!validateFn) {
        const schema = JSON_SCHEMAS[schemaName];
        if (!schema) {
          console.warn(`[JSON Schema Middleware] Schema "${schemaName}" not found in registry`);
          return next();
        }
        validateFn = ajv.compile(schema);
        compiledValidators.set(schemaName, validateFn);
      }
    } else {
      validateFn = ajv.compile(schemaName);
    }

    const payload = req.body || {};
    const valid = validateFn(payload);

    if (!valid && validateFn.errors) {
      const errorList = formatAjvErrors(validateFn.errors);

      logRealtimeEvent({
        category: 'SECURITY',
        level: 'WARN',
        action: 'SCHEMA_VALIDATION_FAILED',
        summary: `Отклонен запрос к ${req.path} по схеме ${name}: ${errorList[0]}`
      });

      return res.status(400).json({
        success: false,
        error: errorList[0],
        errors: errorList,
        schema: typeof schemaName === 'string' ? schemaName : schemaName.$id,
        validationEngine: 'JSON Schema (Draft-07) / Ajv'
      });
    }

    next();
  };
}

/**
 * Express middleware for strict JSON Schema validation of req.query
 */
export function validateQuery(schemaName: string | SchemaDefinition) {
  return (req: Request, res: Response, next: NextFunction) => {
    let validateFn: any;

    if (typeof schemaName === 'string') {
      validateFn = compiledValidators.get(schemaName);
      if (!validateFn) {
        const schema = JSON_SCHEMAS[schemaName];
        if (!schema) return next();
        validateFn = ajv.compile(schema);
        compiledValidators.set(schemaName, validateFn);
      }
    } else {
      validateFn = ajv.compile(schemaName);
    }

    const valid = validateFn(req.query || {});

    if (!valid && validateFn.errors) {
      const errorList = formatAjvErrors(validateFn.errors);
      return res.status(400).json({
        success: false,
        error: errorList[0],
        errors: errorList,
        validationEngine: 'JSON Schema (Draft-07) / Ajv'
      });
    }

    next();
  };
}

/**
 * Get all registered JSON Schemas
 */
export function getAllSchemas(): Record<string, SchemaDefinition> {
  return JSON_SCHEMAS;
}

/**
 * Get schema by name
 */
export function getSchemaByName(name: string): SchemaDefinition | null {
  return JSON_SCHEMAS[name] || null;
}
