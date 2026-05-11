/**
 * Wellness Backend API client.
 * Tüm istekler /api/v1/wellness prefix'i altındadır.
 */

const BASE_URL = process.env.WELLNESS_API_URL ?? 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new ApiError(response.status, body.detail ?? 'API hatası');
  }

  return response.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  anonymous_id: string;
  consent_date: string;
  created_at: string;
}

export interface ApiProgram {
  id: string;
  program_duration: string;
  program_data: Record<string, unknown>;
  score_snapshot: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface ApiSession {
  id: string;
  session_key: string;
  completed_at: string;
  duration_sec: number;
}

export interface ApiTodaySessions {
  date: string;
  completions: ApiSession[];
  total_duration_sec: number;
}

export interface ApiStreak {
  count: number;
  last_completed_date: string | null;
}

export interface ApiAuditLog {
  id: string;
  anonymous_user_id: string;
  action: string;
  module: string;
  status: string;
  timestamp: string;
}

export interface ApiReferral {
  id: string;
  kardiyovaskuler_score: number;
  acknowledged: boolean;
  created_at: string;
}

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * Anonim kullanıcıyı backend'e kaydeder.
 */
export async function registerUser(
  anonymousId: string,
  consentDate: Date,
): Promise<ApiUser> {
  return request<ApiUser>('/wellness/users', {
    method: 'POST',
    body: JSON.stringify({
      anonymous_id: anonymousId,
      consent_date: consentDate.toISOString(),
    }),
  });
}

/**
 * Kullanıcı bilgilerini getirir; yoksa null.
 */
export async function fetchUser(anonymousId: string): Promise<ApiUser | null> {
  try {
    return await request<ApiUser>(`/wellness/users/${anonymousId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ─── Program ──────────────────────────────────────────────────────────────────

/**
 * Programı backend'e kaydeder (upsert — eski program pasifleşir).
 */
export async function syncProgram(
  anonymousId: string,
  programData: Record<string, unknown>,
  programDuration: string,
  scoreSnapshot?: Record<string, unknown>,
): Promise<ApiProgram> {
  return request<ApiProgram>(`/wellness/users/${anonymousId}/program`, {
    method: 'POST',
    body: JSON.stringify({
      program_duration: programDuration,
      program_data: programData,
      score_snapshot: scoreSnapshot ?? null,
    }),
  });
}

/**
 * Aktif programı getirir; yoksa null.
 */
export async function fetchProgram(anonymousId: string): Promise<ApiProgram | null> {
  try {
    return await request<ApiProgram>(`/wellness/users/${anonymousId}/program`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

/**
 * Tamamlanan seansı backend'e bildirir.
 */
export async function syncSessionCompletion(
  anonymousId: string,
  sessionKey: string,
  durationSec: number,
): Promise<ApiSession> {
  return request<ApiSession>(`/wellness/users/${anonymousId}/sessions`, {
    method: 'POST',
    body: JSON.stringify({ session_key: sessionKey, duration_sec: durationSec }),
  });
}

/**
 * Bugünün tamamlanan seanslarını getirir.
 */
export async function fetchTodaySessions(
  anonymousId: string,
): Promise<ApiTodaySessions> {
  return request<ApiTodaySessions>(`/wellness/users/${anonymousId}/sessions/today`);
}

/**
 * Kullanıcının streak verisini getirir.
 */
export async function fetchStreak(anonymousId: string): Promise<ApiStreak> {
  return request<ApiStreak>(`/wellness/users/${anonymousId}/streak`);
}

// ─── Audit ────────────────────────────────────────────────────────────────────

/**
 * Audit log girişini backend'e gönderir.
 */
export async function pushAuditLog(entry: {
  anonymous_user_id: string;
  action: string;
  module: string;
  status: 'SUCCESS' | 'FAILURE';
  resource_id?: string;
  error_code?: string;
}): Promise<ApiAuditLog> {
  return request<ApiAuditLog>('/wellness/audit', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

// ─── Expert Referral ──────────────────────────────────────────────────────────

/**
 * Uzman yönlendirme kaydı oluşturur (kardiyovasküler >= 8).
 */
export async function createExpertReferral(
  anonymousId: string,
  scoreSnapshot: Record<string, unknown>,
  kardiyovaskulerScore: number,
): Promise<ApiReferral> {
  return request<ApiReferral>(`/wellness/users/${anonymousId}/referrals`, {
    method: 'POST',
    body: JSON.stringify({
      score_snapshot: scoreSnapshot,
      kardiyovaskuler_score: kardiyovaskulerScore,
    }),
  });
}

export { ApiError };
