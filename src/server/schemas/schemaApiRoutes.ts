import { Express, Request, Response } from 'express';
import { getAllSchemas, getSchemaByName, validatePayload } from './validator.ts';

export function registerSchemaRoutes(app: Express) {
  // 1. Получить реестр всех доступных JSON Schema спецификаций
  app.get('/api/schemas', (_req: Request, res: Response) => {
    const schemas = getAllSchemas();
    const summary = Object.entries(schemas).map(([key, schema]) => ({
      key,
      id: schema.$id,
      title: schema.title,
      description: schema.description,
      required: schema.required || [],
      propertiesCount: Object.keys(schema.properties || {}).length,
      standard: 'JSON Schema (Draft-07)'
    }));

    res.json({
      success: true,
      totalCount: summary.length,
      standard: 'JSON Schema (Draft-07)',
      schemas: summary
    });
  });

  // 2. Получить конкретную JSON Schema спецификацию в стандартном формате
  app.get('/api/schemas/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    const schema = getSchemaByName(name);

    if (!schema) {
      return res.status(404).json({
        success: false,
        error: `JSON Schema с именем "${name}" не найдена в реестре.`,
        availableSchemas: Object.keys(getAllSchemas())
      });
    }

    res.setHeader('Content-Type', 'application/schema+json');
    res.json(schema);
  });

  // 3. Тестовая валидация полезной нагрузки (Dry-run Sandbox Validator)
  app.post('/api/schemas/validate/:name', (req: Request, res: Response) => {
    const { name } = req.params;
    const payload = req.body;

    const schema = getSchemaByName(name);
    if (!schema) {
      return res.status(404).json({
        success: false,
        error: `JSON Schema с именем "${name}" не найдена в реестре.`,
        availableSchemas: Object.keys(getAllSchemas())
      });
    }

    const result = validatePayload(name, payload);

    res.json({
      success: true,
      schemaName: name,
      schemaTitle: schema.title,
      valid: result.valid,
      errors: result.errors || [],
      rawErrors: result.rawErrors || [],
      testedAt: new Date().toISOString()
    });
  });
}
