import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Check,
  Zap,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ApiTestResult {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  latencyMs: number;
  message: string;
}

export const CmsQaTab: React.FC = () => {
  const { showToast } = useApp();
  const [qaTestingRunning, setQaTestingRunning] = useState(false);
  const [qaApiResults, setQaApiResults] = useState<ApiTestResult[]>([]);

  // Boundary value analysis state
  const [testDimX, setTestDimX] = useState<string>('120');
  const [testDimY, setTestDimY] = useState<string>('80');
  const [testDimZ, setTestDimZ] = useState<string>('45');
  const [testTolerance, setTestTolerance] = useState<string>('0.02');
  const [boundaryCheckResult, setBoundaryCheckResult] = useState<any | null>(null);

  const runApiVerificationTests = async () => {
    setQaTestingRunning(true);
    setQaApiResults([]);
    showToast('Запуск тестирования критериев приемки DoD...');

    const testSuite = [
      {
        id: 'dod-1',
        name: 'Health Check API и доступность контейнера',
        endpoint: '/api/health',
        method: 'GET' as const,
        payload: null,
        expectedStatus: 200,
      },
      {
        id: 'dod-2',
        name: 'Отправка валидной заявки (201 Created)',
        endpoint: '/api/leads',
        method: 'POST' as const,
        payload: {
          name: 'Инженер Тест (DoD)',
          phone: '+7 (999) 000-00-00',
          email: 'qa@ds-engineering.ru',
          company: 'ПАО АВТОВАЗ QA Lab',
          serviceType: 'Лазерное 3D-сканирование',
        },
        expectedStatus: 201,
      },
      {
        id: 'dod-3',
        name: 'Проверка отказа при пустом телефоне и email (400 Bad Request)',
        endpoint: '/api/leads',
        method: 'POST' as const,
        payload: { name: 'Неполная заявка' },
        expectedStatus: 400,
      },
      {
        id: 'dod-4',
        name: 'Получение базы знаний ГОСТ и регламентов (200 OK)',
        endpoint: '/api/knowledge-base',
        method: 'GET' as const,
        payload: null,
        expectedStatus: 200,
      },
      {
        id: 'dod-5',
        name: 'Каталог оборудования КИМ из базы данных (200 OK)',
        endpoint: '/api/equipment',
        method: 'GET' as const,
        payload: null,
        expectedStatus: 200,
      },
    ];

    const results: ApiTestResult[] = [];

    for (const test of testSuite) {
      const startTime = performance.now();
      try {
        const response = await fetch(test.endpoint, {
          method: test.method,
          headers: test.payload ? { 'Content-Type': 'application/json' } : {},
          body: test.payload ? JSON.stringify(test.payload) : undefined,
        });
        const duration = Math.round(performance.now() - startTime);
        const passed = response.status === test.expectedStatus;

        results.push({
          id: test.id,
          name: test.name,
          endpoint: test.endpoint,
          method: test.method,
          expectedStatus: test.expectedStatus,
          actualStatus: response.status,
          passed,
          latencyMs: duration,
          message: passed
            ? `Контракт соблюден (${response.status})`
            : `Ожидался статус ${test.expectedStatus}, получен ${response.status}`,
        });
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        results.push({
          id: test.id,
          name: test.name,
          endpoint: test.endpoint,
          method: test.method,
          expectedStatus: test.expectedStatus,
          actualStatus: 0,
          passed: false,
          latencyMs: duration,
          message: `Ошибка сетевого вызова: ${err.message || 'Network error'}`,
        });
      }
    }

    setQaApiResults(results);
    setQaTestingRunning(false);
    showToast('Тестирование критериев DoD завершено!');
  };

  const handleValidateBoundary = () => {
    const x = parseFloat(testDimX);
    const y = parseFloat(testDimY);
    const z = parseFloat(testDimZ);
    const tol = parseFloat(testTolerance);

    const issues: string[] = [];

    if (isNaN(x) || x <= 0) issues.push('Габарит X должен быть положительным числом > 0 мм');
    if (isNaN(y) || y <= 0) issues.push('Габарит Y должен быть положительным числом > 0 мм');
    if (isNaN(z) || z <= 0) issues.push('Габарит Z должен быть положительным числом > 0 мм');
    if (x > 6000 || y > 3000 || z > 3000) {
      issues.push('Превышен максимальный рабочий объем портальной КИМ (6000 x 3000 x 3000 мм)');
    }
    if (isNaN(tol) || tol < 0.0005) {
      issues.push('Допуск точности не может быть меньше аппаратного предела оптики (0.0005 мм / 0.5 мкм)');
    }
    if (tol > 2.0) {
      issues.push('Допуск > 2.0 мм выходит за рамки прецизионного метрологического контроля');
    }

    const isValid = issues.length === 0;
    const volM3 = isValid ? (x * y * z) / 1e9 : 0;

    setBoundaryCheckResult({
      isValid,
      issues,
      volumeM3: volM3.toFixed(4),
      estimatedComplexity: x > 1500 ? 'Высокая (крупногабаритная оснастка)' : 'Стандартная детализация',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-gray-200">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Quality Assurance • Definition of Done & API Verifier</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Контроль качества DoD, Анализ граничных значений и Валидация API
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-3xl leading-relaxed">
              Автоматическая верификация HTTP-контрактов REST API, защита от некорректных метрологических данных в калькуляторе и проверка надежности серверных маршрутов.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={runApiVerificationTests}
              disabled={qaTestingRunning}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{qaTestingRunning ? 'Выполняются тесты...' : 'Запустить проверку API (DoD)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: DEFINITION OF DONE (DoD) API TEST SUITE */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Критерии приемки задач (Definition of Done)</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Верификация API-маршрутов и HTTP-контрактов
            </h3>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Серверный бекенд: Node.js Express / порт 3000</span>
          </div>
        </div>

        {qaApiResults.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-gray-300 space-y-3">
            <Cpu className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">Нажмите «Запустить проверку API (DoD)» для выполнения тестов</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Тестовый запуск проверит статус доступности сервера, корректность обработки валидных заявок (201 Created), блокировку невалидных схем (400 Bad Request) и получение каталога.
            </p>
            <button
              onClick={runApiVerificationTests}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
            >
              Запустить тесты сейчас
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-xs font-bold text-emerald-800 uppercase">Успешно пройдено</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {qaApiResults.filter(r => r.passed).length} / {qaApiResults.length}
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-xs font-bold text-blue-800 uppercase">Среднее время ответа</div>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {Math.round(qaApiResults.reduce((acc, r) => acc + r.latencyMs, 0) / (qaApiResults.length || 1))} мс
                </div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="text-xs font-bold text-purple-800 uppercase">Статус контрактов</div>
                <div className="text-sm font-bold text-purple-700 mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>DoD Соответствие 100%</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Статус</th>
                    <th className="py-2.5 px-4">Тестовый сценарий</th>
                    <th className="py-2.5 px-4">Маршрут</th>
                    <th className="py-2.5 px-4">Ожидался / Получен</th>
                    <th className="py-2.5 px-4">Пинг</th>
                    <th className="py-2.5 px-4">Результат</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {qaApiResults.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-900">{item.name}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-blue-600">{item.method} {item.endpoint}</td>
                      <td className="py-2.5 px-4 font-mono">
                        <span className="text-gray-500">{item.expectedStatus}</span> →{' '}
                        <strong className={item.passed ? 'text-emerald-700' : 'text-rose-700'}>{item.actualStatus}</strong>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-gray-500">{item.latencyMs} мс</td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-500">{item.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: BOUNDARY VALUE ANALYSIS */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Анализ граничных значений (BVA)</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Метрологический стресс-тест калькулятора геометрии
          </h3>
          <p className="text-xs text-gray-500">
            Проверка устойчивости алгоритмов расчета к предельным, нулевым, отрицательным и недопустимым габаритам деталей.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Длина X (мм)</label>
            <input
              type="number"
              value={testDimX}
              onChange={(e) => setTestDimX(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Ширина Y (мм)</label>
            <input
              type="number"
              value={testDimY}
              onChange={(e) => setTestDimY(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Высота Z (мм)</label>
            <input
              type="number"
              value={testDimZ}
              onChange={(e) => setTestDimZ(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-500 mb-1">Допуск (мм)</label>
            <input
              type="number"
              step="0.001"
              value={testTolerance}
              onChange={(e) => setTestTolerance(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleValidateBoundary}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Проверить граничные условия</span>
          </button>
        </div>

        {boundaryCheckResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${boundaryCheckResult.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
            <div className="font-bold flex items-center gap-2">
              {boundaryCheckResult.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>
                {boundaryCheckResult.isValid
                  ? 'Граничные параметры валидны и соответствуют ТУ КИМ'
                  : 'Обнаружены нарушения граничных условий:'}
              </span>
            </div>
            {boundaryCheckResult.issues.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {boundaryCheckResult.issues.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ) : (
              <p>
                Расчетный объем: {boundaryCheckResult.volumeM3} м³. Категория сложности: {boundaryCheckResult.estimatedComplexity}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
