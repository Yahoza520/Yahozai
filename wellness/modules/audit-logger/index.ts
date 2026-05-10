import crypto from 'crypto';
import type { AuditEvent, AuditLogEntry } from '../../shared/types';
import { anonymizeId, anonymizeResourceId } from '../privacy-filter';

/**
 * Uygulama genelinde kullanılan audit log arayüzü.
 * Winston veya başka bir transport'a bağlanabilir.
 */
export interface LogTransport {
  append(entry: AuditLogEntry): Promise<void>;
}

let transport: LogTransport | null = null;

/**
 * Audit logger transport'unu başlatır.
 * Uygulama init sırasında bir kez çağrılmalıdır.
 * @param {LogTransport} t - Log transport implementasyonu
 */
export function initAuditLogger(t: LogTransport): void {
  transport = t;
}

/**
 * Audit log kaydı oluşturur ve transport'a yazar.
 * PII içermeyen, anonimleştirilmiş kayıt üretir.
 * @param {AuditEvent} event - Loglanacak işlem detayları
 * @returns {Promise<void>}
 * @throws Transport yazma hatası sessiz bırakılmaz; sistem logu tetiklenir.
 */
export async function writeAuditLog(event: AuditEvent): Promise<void> {
  const entry: AuditLogEntry = {
    logId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: anonymizeId(event.userId),
    role: event.role,
    action: event.action,
    module: event.module,
    resourceId: event.resourceId ? anonymizeResourceId(event.resourceId) : 'N/A',
    status: event.status,
    errorCode: event.errorCode ?? null,
  };

  if (!transport) {
    console.error('[AuditLogger] Transport başlatılmamış — kayıt yazılamadı:', entry);
    return;
  }

  try {
    await transport.append(entry);
  } catch (error) {
    // Audit log hatası asla sessiz bırakılmaz.
    console.error('[AuditLogger] Kritik: kayıt yazılamadı', { error, entry });
    throw error;
  }
}

/**
 * Belirli bir aksiyon için convenience wrapper.
 */
export async function logAction(
  userId: string,
  action: AuditEvent['action'],
  module: string,
  status: AuditEvent['status'] = 'SUCCESS',
  resourceId?: string,
): Promise<void> {
  await writeAuditLog({
    userId,
    role: 'VIEWER',
    action,
    module,
    resourceId,
    status,
  });
}
