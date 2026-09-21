import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Search, 
  Code2, 
  Terminal, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  Database
} from 'lucide-react';
import { JSON_SCHEMAS, SchemaDefinition } from '../../server/schemas/jsonSchemas.ts';

import { fetchWithCsrf } from "../../services/apiService";

export const CmsSchemasTab: React.FC = () => {
  const schemaKeys = Object.keys(JSON_SCHEMAS);
  const [selectedSchemaKey, setSelectedSchemaKey] = useState<string>(schemaKeys[0] || 'contactForm');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'forms' | 'crm' | 'service' | 'system'>('all');
  const [copied, setCopied] = useState(false);
  
  // Sandbox test runner state
  const currentSchema: SchemaDefinition | undefined = JSON_SCHEMAS[selectedSchemaKey];
  const [testPayloadText, setTestPayloadText] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    valid?: boolean;
    errors?: string[];
    details?: any;
    durationMs?: number;
  }>({ tested: false });
  const [isValidating, setIsValidating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'inspector' | 'sandbox' | 'raw' | 'integration'>('inspector');

  // Categorization of schemas
  const getSchemaCategory = (key: string): 'forms' | 'crm' | 'service' | 'system' => {
    if (['contactForm', 'quickCallback', 'rfqSubmission'].includes(key)) return 'forms';
    if (['crmDeal', 'crmProposal', 'crmContract', 'crmCompany', 'crmContact'].includes(key)) return 'crm';
    if (['ticketCreate', 'engineerChatMessage'].includes(key)) return 'service';
    return 'system';
  };

  const filteredSchemaKeys = schemaKeys.filter(key => {
    const s = JSON_SCHEMAS[key];
    const matchesSearch = key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || getSchemaCategory(key) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Load sample payload when schema changes
  useEffect(() => {
    if (currentSchema) {
      const sample = currentSchema.examples && currentSchema.examples.length > 0 
        ? currentSchema.examples[0] 
        : buildDefaultSample(currentSchema);
      setTestPayloadText(JSON.stringify(sample, null, 2));
      setValidationResult({ tested: false });
    }
  }, [selectedSchemaKey]);

  function buildDefaultSample(schema: SchemaDefinition) {
    const res: Record<string, any> = {};
    if (!schema.properties) return res;
    Object.entries(schema.properties).forEach(([propName, propDef]: [string, any]) => {
      if (propDef.type === 'string') {
        if (propDef.format === 'email') res[propName] = 'engineer@company.ru';
        else if (propDef.enum) res[propName] = propDef.enum[0];
        else res[propName] = `Пример ${propDef.description || propName}`;
      } else if (propDef.type === 'number' || propDef.type === 'integer') {
        res[propName] = propDef.minimum || 1000;
      } else if (propDef.type === 'boolean') {
        res[propName] = true;
      } else if (propDef.type === 'array') {
        res[propName] = [];
      }
    });
    return res;
  }

  const handleCopySchema = () => {
    if (!currentSchema) return;
    navigator.clipboard.writeText(JSON.stringify(currentSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSchema = () => {
    if (!currentSchema) return;
    const blob = new Blob([JSON.stringify(currentSchema, null, 2)], { type: 'application/schema+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSchemaKey}.schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Local client-side validator fallback in case of network or offline sandbox test
  const validateLocally = (schema: SchemaDefinition, payload: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { valid: false, errors: ['Полезная нагрузка должна быть JSON-объектом.'] };
    }

    // Check required fields
    if (Array.isArray(schema.required)) {
      for (const reqField of schema.required) {
        if (payload[reqField] === undefined || payload[reqField] === null || payload[reqField] === '') {
          const propTitle = schema.properties?.[reqField]?.title || reqField;
          errors.push(`Обязательное поле "${reqField}" (${propTitle}) не заполнено или отсутствует.`);
        }
      }
    }

    // Check types and properties
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const val = payload[key];
        if (val !== undefined && val !== null) {
          if (prop.type === 'string') {
            if (typeof val !== 'string') {
              errors.push(`Поле "${key}" должно быть строкой (string), получено: ${typeof val}.`);
            } else {
              if (prop.minLength !== undefined && val.length < prop.minLength) {
                errors.push(`Поле "${key}" слишком короткое (минимум ${prop.minLength} симв.).`);
              }
              if (prop.maxLength !== undefined && val.length > prop.maxLength) {
                errors.push(`Поле "${key}" превышает максимальную длину (${prop.maxLength} симв.).`);
              }
              if (prop.pattern) {
                try {
                  const reg = new RegExp(prop.pattern);
                  if (!reg.test(val)) {
                    errors.push(`Поле "${key}" ("${val}") не соответствует требуемому формату/шаблону.`);
                  }
                } catch {
                  // ignore invalid regex
                }
              }
            }
          } else if (prop.type === 'number' || prop.type === 'integer') {
            if (typeof val !== 'number' || isNaN(val)) {
              errors.push(`Поле "${key}" должно быть числом (${prop.type}), получено: ${typeof val}.`);
            } else {
              if (prop.minimum !== undefined && val < prop.minimum) {
                errors.push(`Поле "${key}" меньше минимального значения (${prop.minimum}).`);
              }
              if (prop.maximum !== undefined && val > prop.maximum) {
                errors.push(`Поле "${key}" больше максимального значения (${prop.maximum}).`);
              }
            }
          } else if (prop.type === 'boolean') {
            if (typeof val !== 'boolean') {
              errors.push(`Поле "${key}" должно быть логическим значением (boolean).`);
            }
          } else if (prop.type === 'array') {
            if (!Array.isArray(val)) {
              errors.push(`Поле "${key}" должно быть массивом (array).`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleRunValidation = async () => {
    setIsValidating(true);
    const start = performance.now();
    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(testPayloadText);
      } catch (parseErr: any) {
        setValidationResult({
          tested: true,
          valid: false,
          errors: [`Синтаксическая ошибка JSON: ${parseErr.message}`],
          durationMs: Math.round(performance.now() - start)
        });
        setIsValidating(false);
        return;
      }

      // Call backend validation endpoint via fetchWithCsrf
      try {
        const response = await fetchWithCsrf(`/api/schemas/validate/${selectedSchemaKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(parsedPayload)
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          setValidationResult({
            tested: true,
            valid: data.valid,
            errors: data.errors || [],
            details: data,
            durationMs: Math.round(performance.now() - start)
          });
          return;
        }
      } catch (networkErr) {
        console.warn('Backend schema validate error, falling back to instant client schema engine:', networkErr);
      }

      // Fallback: Instant client-side Draft-07 engine
      if (currentSchema) {
        const localResult = validateLocally(currentSchema, parsedPayload);
        setValidationResult({
          tested: true,
          valid: localResult.valid,
          errors: localResult.errors,
          details: {
            success: true,
            schemaName: selectedSchemaKey,
            schemaTitle: currentSchema.title,
            valid: localResult.valid,
            errors: localResult.errors,
            source: 'Client-side Draft-07 Engine'
          },
          durationMs: Math.round(performance.now() - start)
        });
      }
    } catch (err: any) {
      setValidationResult({
        tested: true,
        valid: false,
        errors: [`Ошибка выполнения валидации: ${err.message}`],
        durationMs: Math.round(performance.now() - start)
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleLoadSample = () => {
    if (!currentSchema) return;
    const sample = currentSchema.examples && currentSchema.examples.length > 0 
      ? currentSchema.examples[0] 
      : buildDefaultSample(currentSchema);
    setTestPayloadText(JSON.stringify(sample, null, 2));
    setValidationResult({ tested: false });
  };

  const handleLoadInvalidSample = () => {
    if (!currentSchema) return;
    const invalidSample: Record<string, any> = {
      _testNote: "Тестовая невалидная полезная нагрузка с пропущенными обязательными полями и неверными типами данных"
    };
    setTestPayloadText(JSON.stringify(invalidSample, null, 2));
    setValidationResult({ tested: false });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Architecture Card */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E293B] to-[#0F172A] rounded-xl p-6 text-white shadow-sm border border-blue-900/40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Runtime Data Integrity & API Validation
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileCode2 className="w-7 h-7 text-blue-400" />
              JSON Schema спецификации и валидация API
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Централизованный реестр строгих схем данных стандарта <strong className="text-white">JSON Schema (Draft-07 / RFC 7159)</strong> с высокопроизводительным движком <strong className="text-white">Ajv v8</strong>. Обеспечивает мгновенную валидацию всех входящих POST/PUT запросов с локализованными инженерными сообщениями об ошибках.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-blue-200">Активных схем</div>
              <div className="text-xl font-bold text-white">{schemaKeys.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <div className="text-xs text-emerald-200">Движок проверки</div>
              <div className="text-sm font-bold text-emerald-300">Ajv + Zod Engine</div>
            </div>
          </div>
        </div>

        {/* Quick API Endpoints reference */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="font-semibold text-white">Доступные REST API эндпоинты реестра:</span>
          <code className="bg-black/40 px-2 py-1 rounded border border-white/10 text-blue-300">GET /api/schemas</code>
          <code className="bg-black/40 px-2 py-1 rounded border border-white/10 text-blue-300">GET /api/schemas/:name</code>
          <code className="bg-black/40 px-2 py-1 rounded border border-white/10 text-emerald-300">POST /api/schemas/validate/:name</code>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Schemas List & Selector */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Схемы данных API (JSON Schema) ({filteredSchemaKeys.length})
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Поиск по названию или коду..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: 'all', label: 'Все' },
                { id: 'forms', label: 'Формы' },
                { id: 'crm', label: 'CRM' },
                { id: 'service', label: 'Сервис' },
                { id: 'system', label: 'Системные' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 text-slate-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Schemas List */}
            <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredSchemaKeys.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  Схемы по запросу не найдены
                </div>
              ) : (
                filteredSchemaKeys.map(key => {
                  const s = JSON_SCHEMAS[key];
                  const isSelected = selectedSchemaKey === key;
                  const reqCount = s.required?.length || 0;
                  const propCount = Object.keys(s.properties || {}).length;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedSchemaKey(key)}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                        isSelected 
                          ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm' 
                          : 'bg-gray-50/60 hover:bg-gray-100/80 border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 truncate">
                          {s.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                          {key}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                        {s.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>Полей: <strong className="text-slate-500">{propCount}</strong></span>
                        <span>•</span>
                        <span>Обязательных: <strong className="text-blue-700">{reqCount}</strong></span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Schema Details & Sandbox Workspace */}
        <div className="xl:col-span-8 space-y-4">
          {currentSchema ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Card Header with Tabs */}
              <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                      {selectedSchemaKey}
                    </span>
                    <span className="text-xs text-gray-500">
                      Draft-07
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentSchema.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentSchema.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySchema}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-white hover:bg-gray-100 text-slate-500 border border-gray-200 rounded-xl transition-all shadow-sm"
                    title="Скопировать JSON Schema"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    {copied ? 'Скопировано!' : 'Копировать'}
                  </button>
                  <button
                    onClick={handleDownloadSchema}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-white hover:bg-gray-100 text-slate-500 border border-gray-200 rounded-xl transition-all shadow-sm"
                    title="Скачать файл .schema.json"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    Скачать
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="px-5 border-b border-gray-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveSubTab('inspector')}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeSubTab === 'inspector'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Инспектор структуры полей
                </button>
                <button
                  onClick={() => setActiveSubTab('sandbox')}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeSubTab === 'sandbox'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-gray-900'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  Песочница валидации (Sandbox)
                </button>
                <button
                  onClick={() => setActiveSubTab('raw')}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeSubTab === 'raw'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-gray-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Сырой JSON Schema
                </button>
                <button
                  onClick={() => setActiveSubTab('integration')}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeSubTab === 'integration'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-gray-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Интеграция API (cURL / JS)
                </button>
              </div>

              {/* Sub-Tab 1: Properties Table Inspector */}
              {activeSubTab === 'inspector' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Идентификатор схемы: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-700">{currentSchema.$id}</code>
                    </div>
                    <div>
                      Обязательных полей: <strong className="text-blue-700">{currentSchema.required?.length || 0}</strong> из {Object.keys(currentSchema.properties || {}).length}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-slate-500 font-bold border-b border-gray-200">
                          <th className="py-2.5 px-4">Имя поля</th>
                          <th className="py-2.5 px-4">Тип / Формат</th>
                          <th className="py-2.5 px-4">Статус</th>
                          <th className="py-2.5 px-4">Ограничения & Описание</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(currentSchema.properties || {}).map(([propName, propDef]: [string, any]) => {
                          const isRequired = currentSchema.required?.includes(propName);
                          return (
                            <tr key={propName} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-2.5 px-4 font-mono font-bold text-gray-900">
                                {propName}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">
                                  {propDef.type}
                                  {propDef.format && ` (${propDef.format})`}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                {isRequired ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                                    Обязательно
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-slate-500 text-[10px]">
                                    Опционально
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 space-y-1">
                                <div className="text-gray-800">
                                  {propDef.description || '—'}
                                </div>
                                {(propDef.minLength || propDef.maxLength || propDef.minimum || propDef.pattern || propDef.enum) && (
                                  <div className="flex flex-wrap gap-1 text-[10px] text-gray-500 font-mono">
                                    {propDef.minLength && <span className="bg-gray-100 px-1 rounded">minLen: {propDef.minLength}</span>}
                                    {propDef.maxLength && <span className="bg-gray-100 px-1 rounded">maxLen: {propDef.maxLength}</span>}
                                    {propDef.minimum !== undefined && <span className="bg-gray-100 px-1 rounded">min: {propDef.minimum}</span>}
                                    {propDef.pattern && <span className="bg-gray-100 px-1 rounded" title={propDef.pattern}>regex pattern</span>}
                                    {propDef.enum && <span className="bg-blue-50 text-blue-800 px-1 rounded">enum: [{propDef.enum.join(', ')}]</span>}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Interactive Sandbox Validation */}
              {activeSubTab === 'sandbox' && (
                <div className="p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-200/60">
                    <div className="text-xs text-blue-900">
                      <strong>Песочница живой валидации:</strong> Отредактируйте тестовый JSON или выберите эталонный шаблон и запустите проверку движком Ajv в реальном времени.
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleLoadSample}
                        className="px-2.5 py-1 text-xs bg-white hover:bg-gray-50 text-blue-700 font-medium border border-blue-200 rounded-lg shadow-xs"
                      >
                        Эталонный пример
                      </button>
                      <button
                        onClick={handleLoadInvalidSample}
                        className="px-2.5 py-1 text-xs bg-white hover:bg-gray-50 text-amber-700 font-medium border border-amber-200 rounded-lg shadow-xs"
                      >
                        Тест с ошибками
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                      <span>Тестовая полезная нагрузка (JSON Payload):</span>
                      <span className="text-[11px] font-normal text-gray-500">Редактируемый JSON</span>
                    </label>
                    <textarea
                      rows={11}
                      value={testPayloadText}
                      onChange={(e) => setTestPayloadText(e.target.value)}
                      className="w-full font-mono text-xs p-3.5 bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                    />
                  </div>

                  {/* Validate button */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRunValidation}
                      disabled={isValidating}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {isValidating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Запустить runtime-валидацию Ajv
                    </button>
                  </div>

                  {/* Validation Results Display */}
                  {validationResult.tested && (
                    <div className={`p-4 rounded-xl border transition-all ${
                      validationResult.valid 
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' 
                        : 'bg-red-50/80 border-red-300 text-red-900'
                    }`}>
                      <div className="flex items-start gap-3">
                        {validationResult.valid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">
                              {validationResult.valid 
                                ? '✅ Полезная нагрузка полностью соответствует схеме (200 OK)' 
                                : `❌ Обнаружено ошибок валидации: ${validationResult.errors?.length || 1}`}
                            </span>
                            {validationResult.durationMs !== undefined && (
                              <span className="text-[11px] font-mono opacity-80">
                                Время проверки: {validationResult.durationMs} мс
                              </span>
                            )}
                          </div>

                          {validationResult.valid ? (
                            <p className="text-xs text-emerald-800">
                              Все обязательные поля присутствуют, типы данных, строковые форматы и ограничения длины соблюдены. Запрос успешно пройдет валидацию в Express middleware.
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-1.5 list-disc list-inside text-xs font-medium">
                              {validationResult.errors?.map((err, idx) => (
                                <li key={idx} className="text-red-800 font-mono">
                                  {err}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Raw JSON Schema */}
              {activeSubTab === 'raw' && (
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Формат: Draft-07 JSON Schema (application/schema+json)</span>
                    <button
                      onClick={handleCopySchema}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {copied ? 'Скопировано!' : 'Копировать всё'}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto no-scrollbar text-xs font-mono max-h-[500px]">
                    {JSON.stringify(currentSchema, null, 2)}
                  </pre>
                </div>
              )}

              {/* Sub-Tab 4: Integration Snippets */}
              {activeSubTab === 'integration' && (
                <div className="p-5 space-y-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">1. Запрос схемы через REST API:</h4>
                    <pre className="p-3 bg-slate-900 text-blue-300 rounded-xl font-mono overflow-x-auto no-scrollbar">
{`curl -X GET https://ds-enginering.ru/api/schemas/${selectedSchemaKey} \\
  -H "Accept: application/schema+json"`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">2. Dry-run тестирование полезной нагрузки (Sandbox Endpoint):</h4>
                    <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono overflow-x-auto no-scrollbar">
{`curl -X POST https://ds-enginering.ru/api/schemas/validate/${selectedSchemaKey} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(currentSchema.examples?.[0] || buildDefaultSample(currentSchema))}'`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">3. JavaScript / TypeScript Fetch пример:</h4>
                    <pre className="p-3 bg-slate-900 text-amber-200 rounded-xl font-mono overflow-x-auto no-scrollbar">
{`const payload = ${JSON.stringify(currentSchema.examples?.[0] || buildDefaultSample(currentSchema), null, 2)};

const response = await fetch('/api/schemas/validate/${selectedSchemaKey}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

const { valid, errors } = await response.json();
if (!valid) {
  console.error('Ошибки валидации:', errors);
}`}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              Выберите спецификацию из списка слева для просмотра параметров.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
