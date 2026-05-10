import type { Answers, ScoreDimensions, Question, BranchRule } from '../types';

const EMPTY_SCORES: ScoreDimensions = {
  enerji: 0,
  norolojik: 0,
  metabolik: 0,
  inflamasyon: 0,
  sindirim: 0,
  hormonal: 0,
  immun: 0,
  kardiyovaskuler: 0,
  biyorezonans: 0,
};

/**
 * İki skor objesini birleştirip toplar.
 * @param {ScoreDimensions} base - Mevcut skor
 * @param {Partial<ScoreDimensions>} delta - Eklenecek skor
 * @returns {ScoreDimensions} Güncellenmiş skor
 */
function mergeScores(base: ScoreDimensions, delta: Partial<ScoreDimensions>): ScoreDimensions {
  const result = { ...base };
  for (const key of Object.keys(delta) as Array<keyof ScoreDimensions>) {
    result[key] = (result[key] ?? 0) + (delta[key] ?? 0);
  }
  return result;
}

/**
 * Tek seçimli soru cevabından skor üretir.
 */
function scoreSingleAnswer(answer: string, question: Question): Partial<ScoreDimensions> {
  const option = question.options?.find((o) => o.value === answer);
  return option?.score ?? {};
}

/**
 * Çok seçimli soru cevabından skor üretir.
 */
function scoreMultiAnswer(answers: string[], question: Question): Partial<ScoreDimensions> {
  let combined: Partial<ScoreDimensions> = {};
  for (const val of answers) {
    const option = question.options?.find((o) => o.value === val);
    if (option?.score) {
      for (const dim of Object.keys(option.score) as Array<keyof ScoreDimensions>) {
        combined[dim] = (combined[dim] ?? 0) + (option.score[dim] ?? 0);
      }
    }
  }
  return combined;
}

/**
 * Skala sorusundan branch kurallarına göre skor üretir.
 */
function scoreScaleAnswer(value: number, branches: BranchRule[]): Partial<ScoreDimensions> {
  for (const branch of branches) {
    if (branch.range && value >= branch.range[0] && value <= branch.range[1]) {
      return branch.score ?? {};
    }
  }
  return {};
}

/**
 * Tüm cevapları ve soru tanımlarını alarak 8 boyutlu skor hesaplar.
 * @param {Answers} answers - Kullanıcı cevapları
 * @param {Question[]} questions - Soru tanımları
 * @returns {ScoreDimensions} Hesaplanmış skor boyutları
 */
export function calculateScores(answers: Answers, questions: Question[]): ScoreDimensions {
  let scores = { ...EMPTY_SCORES };

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer == null) continue;

    let delta: Partial<ScoreDimensions> = {};

    if (question.type === 'single' && typeof answer === 'string') {
      delta = scoreSingleAnswer(answer, question);
    } else if (question.type === 'multi' && Array.isArray(answer)) {
      delta = scoreMultiAnswer(answer, question);
    } else if (question.type === 'scale' && typeof answer === 'number') {
      delta = scoreScaleAnswer(answer, question.branches);
    }

    scores = mergeScores(scores, delta);
  }

  return scores;
}

/**
 * Skor boyutlarını yüksekten düşüğe sıralar.
 * @param {ScoreDimensions} scores - Hesaplanmış skorlar
 * @param {number} topN - Kaç dominant boyut döneceği
 * @returns {Array<keyof ScoreDimensions>} Dominant boyutlar
 */
export function getDominantDimensions(
  scores: ScoreDimensions,
  topN = 3,
): Array<keyof ScoreDimensions> {
  return (Object.keys(scores) as Array<keyof ScoreDimensions>)
    .filter((dim) => scores[dim] > 0)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, topN);
}

/**
 * Kardiyovasküler eşik kontrolü — ≥ 8 ise uzman yönlendirmesi tetiklenir.
 * @param {ScoreDimensions} scores
 * @returns {boolean}
 */
export function requiresExpertReferral(scores: ScoreDimensions): boolean {
  return scores.kardiyovaskuler >= 8;
}
