-- Migration: 002_wellness_tables
-- Wellness modülü tabloları
-- Geri alınamaz: audit_logs tablosunda ON DELETE RESTRICT uygulanır.

BEGIN;

CREATE TABLE IF NOT EXISTS wellness_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_id    VARCHAR(64) NOT NULL UNIQUE,
    consent_date    TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wellness_users_anonymous_id ON wellness_users(anonymous_id);

-- ─── Program ─────────────────────────────────────────────────────────────────
-- program_data ve score_snapshot AES-256-GCM şifreli TEXT olarak saklanır.

CREATE TABLE IF NOT EXISTS wellness_programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES wellness_users(id) ON DELETE CASCADE,
    program_duration VARCHAR(16) NOT NULL CHECK (program_duration IN ('short', 'medium', 'full')),
    program_data    TEXT NOT NULL,
    score_snapshot  TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wellness_programs_user_active ON wellness_programs(user_id, is_active);

-- ─── Sessions ─────────────────────────────────────────────────────────────────
-- Append-only: UPDATE ve DELETE yasaklanmıştır (trigger ile korunur).

CREATE TABLE IF NOT EXISTS wellness_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES wellness_users(id) ON DELETE CASCADE,
    session_key     VARCHAR(128) NOT NULL,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    duration_sec    INTEGER NOT NULL CHECK (duration_sec > 0 AND duration_sec <= 7200)
);

CREATE INDEX IF NOT EXISTS idx_wellness_sessions_user_date ON wellness_sessions(user_id, completed_at);

-- Append-only güvencesi
CREATE OR REPLACE FUNCTION prevent_session_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'wellness_sessions tablosu append-only''dur; kayıt değiştirilemez veya silinemez.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_no_update ON wellness_sessions;
CREATE TRIGGER trg_sessions_no_update
    BEFORE UPDATE OR DELETE ON wellness_sessions
    FOR EACH ROW EXECUTE FUNCTION prevent_session_modification();

-- ─── Audit Logs ──────────────────────────────────────────────────────────────
-- Append-only. ON DELETE RESTRICT ile user silme engellenir.

CREATE TABLE IF NOT EXISTS wellness_audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES wellness_users(id) ON DELETE RESTRICT,
    anonymous_user_id   VARCHAR(64) NOT NULL,
    role                VARCHAR(32) NOT NULL DEFAULT 'VIEWER',
    action              VARCHAR(64) NOT NULL,
    module              VARCHAR(64) NOT NULL,
    resource_id         VARCHAR(128),
    status              VARCHAR(16) NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE')),
    error_code          VARCHAR(64),
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wellness_audit_user ON wellness_audit_logs(anonymous_user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_audit_action ON wellness_audit_logs(action, timestamp);

-- Audit log append-only güvencesi
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'wellness_audit_logs tablosu append-only''dur; kayıt değiştirilemez veya silinemez.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_no_update ON wellness_audit_logs;
CREATE TRIGGER trg_audit_no_update
    BEFORE UPDATE OR DELETE ON wellness_audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ─── Expert Referrals ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expert_referrals (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES wellness_users(id) ON DELETE CASCADE,
    score_snapshot          TEXT NOT NULL,
    kardiyovaskuler_score   INTEGER NOT NULL CHECK (kardiyovaskuler_score >= 8),
    acknowledged            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_user ON expert_referrals(user_id);

COMMIT;
