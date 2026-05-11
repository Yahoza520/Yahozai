/**
 * Wellness Module — Public API
 *
 * Re-exports key types, utilities, and components from the wellness application.
 * Use these imports instead of reaching into internal module structure.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  UserRole,
  AuditAction,
  AuditStatus,
  QuestionType,
  ProgramDuration,
  SessionTime,
  FrequencyType,
  Waveform,
  ScoreDimensions,
  ScoreDimension,
  QuestionOption,
  BranchRule,
  Question,
  AnswerValue,
  Answers,
  AuditEvent,
  AuditLogEntry,
  FrequencySession,
  FrequencyProtocol,
  UserProgram,
  SessionRecord,
  WeekDay,
} from './shared/types';

// ─── Utilities ────────────────────────────────────────────────────────────────
export { calculateScores, getDominantDimensions, requiresExpertReferral } from './shared/utils/score-engine';
export { matchProtocols, prioritizeProtocols } from './shared/utils/protocol-matcher';
export { buildProgram } from './shared/utils/program-builder';

// ─── Security ─────────────────────────────────────────────────────────────────
export {
  anonymizeId,
  anonymizeResourceId,
  maskEmail,
  maskPhone,
  maskTcId,
  sanitizeForLog,
} from './modules/privacy-filter';
export { initAuditLogger, writeAuditLog, logAction } from './modules/audit-logger';

// ─── Data Validation ──────────────────────────────────────────────────────────
export {
  validateAnswers,
  validateSingleAnswer,
  isProgramDuration,
} from './modules/data-validation';

// ─── Clinical Data ────────────────────────────────────────────────────────────
export { QUESTIONS } from './modules/clinical-dashboard/question-bank';
export { FREQUENCY_PROTOCOLS } from './modules/clinical-dashboard/frequency-catalog';

// ─── Components ────────────────────────────────────────────────────────────────
export { ProgressBar } from './shared/components/ProgressBar';
export { QuestionCard } from './shared/components/QuestionCard';

// ─── Screens ──────────────────────────────────────────────────────────────────
// Note: Screens are typically used through React Navigation and not imported directly
// However, they are available if needed:
// export { default as SplashScreen } from './screens/SplashScreen';
// export { default as OnboardingScreen } from './screens/OnboardingScreen';
// etc.

// ─── Navigation ───────────────────────────────────────────────────────────────
export type { RootStackParamList } from './screens/navigation-types';

// ─── Version ───────────────────────────────────────────────────────────────────
export const VERSION = '0.1.0';
export const MODULE_NAME = 'wellness';
