// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'CLINICIAN' | 'VIEWER';

export type AuditAction =
  | 'KULLANICI_GIRIS'
  | 'VERI_GORUNTULEME'
  | 'VERI_DEGISTIRME'
  | 'VERI_SILME'
  | 'YETKISIZ_ERISIM'
  | 'UZMAN_YONLENDIRME'
  | 'SEANS_BASLANGIC'
  | 'SEANS_BITIS';

export type AuditStatus = 'SUCCESS' | 'FAILURE';

export type QuestionType = 'single' | 'multi' | 'scale' | 'boolean' | 'text';

export type ProgramDuration = 'short' | 'medium' | 'full';

export type SessionTime = 'morning' | 'midday' | 'afternoon' | 'pre_meal' | 'evening' | 'night';

export type FrequencyType =
  | 'binaural_beat'
  | 'isochronic'
  | 'solfeggio'
  | 'schumann'
  | 'monaural'
  | 'natural_tuning';

export type Waveform = 'sine' | 'square' | 'triangle';

// ─── Score Dimensions ─────────────────────────────────────────────────────────

export interface ScoreDimensions {
  enerji: number;
  norolojik: number;
  metabolik: number;
  inflamasyon: number;
  sindirim: number;
  hormonal: number;
  immun: number;
  kardiyovaskuler: number;
  biyorezonans: number;
}

export type ScoreDimension = keyof ScoreDimensions;

// ─── Questions ────────────────────────────────────────────────────────────────

export interface QuestionOption {
  label: string;
  value: string;
  score?: Partial<ScoreDimensions>;
  programDuration?: ProgramDuration;
}

export interface BranchRule {
  value?: boolean | string;
  contains?: string;
  range?: [number, number];
  next?: string;
  addQuestion?: string;
  score?: Partial<ScoreDimensions>;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  placeholder?: string;
  note?: string;
  trigger?: string;
  next: string | null;
  branches: BranchRule[];
}

// ─── Answers ──────────────────────────────────────────────────────────────────

export type AnswerValue = string | string[] | number | boolean | null;

export interface Answers {
  [questionId: string]: AnswerValue;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  userId: string;
  role: UserRole;
  action: AuditAction;
  module: string;
  resourceId?: string;
  status: AuditStatus;
  errorCode?: string;
}

export interface AuditLogEntry extends AuditEvent {
  logId: string;
  timestamp: string;
  resourceId: string;
  errorCode: string | null;
}

// ─── Frequency Protocol ───────────────────────────────────────────────────────

export interface FrequencySession {
  time: SessionTime;
  label: string;
  frequency: number;
  type: FrequencyType;
  carrierHz?: number;
  durationMin: number;
  waveform: Waveform;
  notes: string;
}

export interface FrequencyProtocol {
  protocolId: string;
  targetDimension: ScoreDimension;
  minScore: number;
  sessions: FrequencySession[];
}

// ─── Program ──────────────────────────────────────────────────────────────────

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface WeeklyPlan {
  [day: string]: string[];
}

export interface UserProgram {
  userId: string;
  generatedAt: string;
  programDuration: ProgramDuration;
  dominantDimensions: ScoreDimension[];
  scores: ScoreDimensions;
  weeklyPlan: WeeklyPlan;
  notes: string[];
}

// ─── Session Tracking ─────────────────────────────────────────────────────────

export interface SessionRecord {
  sessionId: string;
  protocolId: string;
  sessionTime: SessionTime;
  startedAt: string;
  completedAt: string | null;
  durationSec: number;
  completed: boolean;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  userId: string;
  consentGiven: boolean;
  consentTimestamp: string;
  program: UserProgram | null;
  sessionHistory: SessionRecord[];
  createdAt: string;
}
