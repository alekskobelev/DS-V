/**
 * Real-Time Diagnostic Logger for CRM & Online Engineer Gateway
 * Provides structured real-time tracing of all incoming client requests,
 * engineer/manager messages, DB persistence statuses, and notification dispatches.
 */

export interface RealtimeLogEntry {
  id: string;
  timestamp: string;
  category: 'CRM_REQUEST' | 'ENGINEER_CHAT' | 'MANAGER_REPLY' | 'DB_PERSISTENCE' | 'NOTIFICATION' | 'SECURITY' | 'ERROR' | 'CMS_UPDATE';
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  sessionId?: string;
  requestId?: string;
  action: string;
  summary: string;
  details?: Record<string, any>;
  dbStatus?: 'SAVED_MEMORY' | 'SAVED_DISK' | 'SAVED_POSTGRESQL' | 'DB_FALLBACK' | 'FAILED';
  durationMs?: number;
}

const MAX_LOG_HISTORY = 200;
const realtimeLogBuffer: RealtimeLogEntry[] = [];

function getTimestamp(): string {
  const d = new Date();
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export function logRealtimeEvent(entry: Omit<RealtimeLogEntry, 'id' | 'timestamp'>): RealtimeLogEntry {
  const fullEntry: RealtimeLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: getTimestamp(),
    ...entry
  };

  realtimeLogBuffer.unshift(fullEntry);
  if (realtimeLogBuffer.length > MAX_LOG_HISTORY) {
    realtimeLogBuffer.length = MAX_LOG_HISTORY;
  }

  // Visual terminal output with clear tags and emoji
  const categoryIcons: Record<string, string> = {
    CRM_REQUEST: '📥 [CRM-REQ]',
    ENGINEER_CHAT: '💬 [CHAT-IN]',
    MANAGER_REPLY: '👨‍💼 [MGR-REPLY]',
    DB_PERSISTENCE: '💾 [DB-SYNC]',
    NOTIFICATION: '🔔 [ALERT-OUT]',
    ERROR: '🚨 [ERROR]',
    CMS_UPDATE: '⚙️ [CMS-UPDATE]'
  };

  const tag = categoryIcons[entry.category] || `[${entry.category}]`;
  const levelTag = entry.level === 'SUCCESS' ? '✅' : entry.level === 'ERROR' ? '❌' : entry.level === 'WARN' ? '⚠️' : 'ℹ️';

  const sessionPart = entry.sessionId ? ` [Session: ${entry.sessionId}]` : (entry.requestId ? ` [Req: ${entry.requestId}]` : '');
  const dbPart = entry.dbStatus ? ` [DB: ${entry.dbStatus}]` : '';
  const durPart = entry.durationMs !== undefined ? ` (${entry.durationMs}ms)` : '';

  const logMessage = `[${fullEntry.timestamp}] ${tag} ${levelTag} ${entry.action}${sessionPart}${dbPart}${durPart} — ${entry.summary}`;

  if (entry.level === 'ERROR') {
    console.error(logMessage, entry.details ? JSON.stringify(entry.details, null, 2) : '');
  } else if (entry.level === 'WARN') {
    console.warn(logMessage, entry.details ? JSON.stringify(entry.details) : '');
  } else {
    console.log(logMessage);
    if (entry.details && Object.keys(entry.details).length > 0) {
      console.log(`   ↳ Payload:`, JSON.stringify(entry.details));
    }
  }

  return fullEntry;
}

export function getRealtimeLogs(filterCategory?: string, limit = 50): RealtimeLogEntry[] {
  if (filterCategory && filterCategory !== 'all') {
    return realtimeLogBuffer.filter(l => l.category === filterCategory).slice(0, limit);
  }
  return realtimeLogBuffer.slice(0, limit);
}

export function clearRealtimeLogs(): void {
  realtimeLogBuffer.length = 0;
}
