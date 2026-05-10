import { z } from 'zod';
import type { Answers, ProgramDuration } from '../../shared/types';

// ─── Şemalar ──────────────────────────────────────────────────────────────────

export const AgeRangeSchema = z.enum(['18-29', '30-44', '45-59', '60+']);

export const BiologicalSexSchema = z.enum(['F', 'M', 'X']);

export const ProgramDurationSchema = z.enum(['short', 'medium', 'full'] as const);

export const SingleAnswerSchema = z.string().min(1);

export const MultiAnswerSchema = z.array(z.string().min(1)).min(1);

export const ScaleAnswerSchema = z.number().int().min(1).max(10);

export const BooleanAnswerSchema = z.boolean();

export const AnswerValueSchema = z.union([
  SingleAnswerSchema,
  MultiAnswerSchema,
  ScaleAnswerSchema,
  BooleanAnswerSchema,
  z.null(),
]);

export const AnswersSchema = z.record(z.string(), AnswerValueSchema);

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Wizard cevaplarının tamamını doğrular.
 * @param {unknown} data - Ham cevap objesi
 * @returns {{ success: true; data: Answers } | { success: false; errors: string[] }}
 */
export function validateAnswers(
  data: unknown,
): { success: true; data: Answers } | { success: false; errors: string[] } {
  const result = AnswersSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as Answers };
  }
  const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
}

/**
 * Tek bir soru cevabını tipine göre doğrular.
 * @param {unknown} value - Ham cevap değeri
 * @param {'single' | 'multi' | 'scale' | 'boolean'} type - Soru tipi
 * @returns {boolean}
 */
export function validateSingleAnswer(
  value: unknown,
  type: 'single' | 'multi' | 'scale' | 'boolean',
): boolean {
  const schemaMap = {
    single: SingleAnswerSchema,
    multi: MultiAnswerSchema,
    scale: ScaleAnswerSchema,
    boolean: BooleanAnswerSchema,
  };
  return schemaMap[type].safeParse(value).success;
}

/**
 * Program süresi değerini doğrular.
 * @param {unknown} value
 * @returns {value is ProgramDuration}
 */
export function isProgramDuration(value: unknown): value is ProgramDuration {
  return ProgramDurationSchema.safeParse(value).success;
}
