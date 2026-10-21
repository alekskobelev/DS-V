/**
 * Health Check & Environment Diagnostic Service for DS-Engineering
 * Logs detailed diagnostics, verifies API connectivity, and monitors system resources.
 */

export interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeMs: number;
  api: {
    connected: boolean;
    latencyMs?: number;
    serverTime?: string;
    storageBackend?: string;
    version?: string;
    error?: string;
  };
  client: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    dpr: number;
    webglSupported: boolean;
    localStorageAvailable: boolean;
    online: boolean;
  };
}

const APP_START_TIME = Date.now();

export function checkWebglSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function checkLocalStorageSupport(): boolean {
  try {
    const testKey = '__ds_health_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export async function runSystemHealthCheck(): Promise<SystemHealthReport> {
  const isWebgl = checkWebglSupport();
  const isLocalStorage = checkLocalStorageSupport();
  const clientInfo = {
    userAgent: navigator.userAgent,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    webglSupported: isWebgl,
    localStorageAvailable: isLocalStorage,
    online: navigator.onLine !== false,
  };

  const startTime = performance.now();
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store'
    });
    const latencyMs = Math.round(performance.now() - startTime);

    if (response.ok) {
      const data = await response.json();
      const report: SystemHealthReport = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptimeMs: Date.now() - APP_START_TIME,
        api: {
          connected: true,
          latencyMs,
          serverTime: data.serverTime,
          storageBackend: data.storageBackend,
          version: data.version
        },
        client: clientInfo
      };

      console.info(
        `%c[DS-HealthMonitor]%c System is healthy (API Latency: ${latencyMs}ms, Storage: ${data.storageBackend || 'OK'})`,
        'color: #3b82f6; font-weight: bold;',
        'color: inherit;'
      );

      return report;
    } else {
      const report: SystemHealthReport = {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptimeMs: Date.now() - APP_START_TIME,
        api: {
          connected: false,
          latencyMs,
          error: `HTTP ${response.status} ${response.statusText}`
        },
        client: clientInfo
      };

      console.warn('[DS-HealthMonitor] API returned non-OK status:', response.status);
      return report;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const report: SystemHealthReport = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - APP_START_TIME,
      api: {
        connected: false,
        error: errorMsg
      },
      client: clientInfo
    };

    console.error('[DS-HealthMonitor] API Health Check Failed:', errorMsg);
    return report;
  }
}

export {
  checkAllApiEndpoints,
  checkSingleApiEndpoint,
  checkThirdPartyServices,
  type ApiEndpointCheckResult,
  type ThirdPartyServiceCheckResult
} from './apiEndpointChecker';

