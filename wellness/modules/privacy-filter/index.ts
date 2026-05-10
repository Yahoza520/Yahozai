import crypto from 'crypto';

const HASH_SALT = process.env.PRIVACY_SALT ?? 'wellness-default-salt';

/**
 * Kullanıcı kimliğini tek yönlü hash ile anonimleştirir.
 * Gerçek kimlik loglanmaz; aynı girdi her zaman aynı anonim çıktıyı üretir.
 * @param {string} rawId - Ham kullanıcı kimliği
 * @returns {string} Anonimleştirilmiş kimlik (8 karakter prefix)
 */
export function anonymizeId(rawId: string): string {
  const hash = crypto
    .createHmac('sha256', HASH_SALT)
    .update(rawId)
    .digest('hex');
  return `usr_${hash.slice(0, 8)}`;
}

/**
 * Kaynak kimliğini anonimleştirir.
 * @param {string} rawId - Ham kaynak kimliği
 * @returns {string} Anonimleştirilmiş kaynak kimliği
 */
export function anonymizeResourceId(rawId: string): string {
  const hash = crypto
    .createHmac('sha256', HASH_SALT)
    .update(`res_${rawId}`)
    .digest('hex');
  return `rec_${hash.slice(0, 8)}`;
}

/** TC kimlik numarasını maskeler: ilk 3 ve son 2 hane görünür. */
export function maskTcId(tc: string): string {
  if (tc.length !== 11) return '***********';
  return `${tc.slice(0, 3)}${'*'.repeat(6)}${tc.slice(-2)}`;
}

/** E-posta adresini maskeler: kullanıcı adının ilk 2 karakteri görünür. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

/** Telefon numarasını maskeler: son 2 hane görünür. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${'*'.repeat(Math.max(digits.length - 2, 6))}${digits.slice(-2)}`;
}

/**
 * Nesne içindeki bilinen PII alanlarını otomatik maskeler.
 * Log satırlarına geçmeden önce her objeye uygulanır.
 * @param {Record<string, unknown>} data - Ham veri objesi
 * @returns {Record<string, unknown>} Maskelenmiş veri objesi
 */
export function sanitizeForLog(data: Record<string, unknown>): Record<string, unknown> {
  const PII_FIELDS = new Set(['email', 'phone', 'tcId', 'name', 'surname', 'address']);
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (PII_FIELDS.has(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  }

  return result;
}
