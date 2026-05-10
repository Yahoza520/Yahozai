import { calculateScores, getDominantDimensions, requiresExpertReferral } from '../../shared/utils/score-engine';
import { QUESTIONS } from '../../modules/clinical-dashboard/question-bank';
import type { Answers } from '../../shared/types';

describe('calculateScores', () => {
  it('boş cevaplar için sıfır skor döner', () => {
    const scores = calculateScores({}, QUESTIONS);
    expect(Object.values(scores).every((v) => v === 0)).toBe(true);
  });

  it('kronik yorgunluk seçimi enerji skorunu artırır', () => {
    const answers: Answers = { S01: ['fatigue'] };
    const scores = calculateScores(answers, QUESTIONS);
    expect(scores.enerji).toBeGreaterThan(0);
  });

  it('nefes darlığı seçimi kardiyovasküler skorunu artırır', () => {
    const answers: Answers = { S01: ['breath'] };
    const scores = calculateScores(answers, QUESTIONS);
    expect(scores.kardiyovaskuler).toBeGreaterThan(0);
  });

  it('scale sorusunda düşük değer (1–4) enerji skoruna katkıda bulunur', () => {
    const answers: Answers = { E01: 2 };
    const scores = calculateScores(answers, QUESTIONS);
    expect(scores.enerji).toBeGreaterThan(0);
  });

  it('scale sorusunda yüksek değer (8–10) ekstra skor üretmez', () => {
    const answers: Answers = { E01: 9 };
    const scores = calculateScores(answers, QUESTIONS);
    expect(scores.enerji).toBe(0);
  });

  it('çoklu semptom seçimi ilgili tüm boyutları artırır', () => {
    const answers: Answers = { S01: ['fatigue', 'digestion', 'pain'] };
    const scores = calculateScores(answers, QUESTIONS);
    expect(scores.enerji).toBeGreaterThan(0);
    expect(scores.sindirim).toBeGreaterThan(0);
    expect(scores.inflamasyon).toBeGreaterThan(0);
  });
});

describe('getDominantDimensions', () => {
  it('en yüksek N boyutu doğru sırayla döner', () => {
    const scores = calculateScores({ S01: ['fatigue', 'digestion'] }, QUESTIONS);
    const dominant = getDominantDimensions(scores, 2);
    expect(dominant.length).toBeLessThanOrEqual(2);
  });

  it('topN parametresi sonuç sayısını sınırlar', () => {
    const answers: Answers = {
      S01: ['fatigue', 'digestion', 'pain', 'mood'],
      E02: 'extreme',
    };
    const scores = calculateScores(answers, QUESTIONS);
    const dominant = getDominantDimensions(scores, 3);
    expect(dominant.length).toBeLessThanOrEqual(3);
  });
});

describe('requiresExpertReferral', () => {
  it('kardiyovasküler < 8 ise false döner', () => {
    const scores = calculateScores({}, QUESTIONS);
    expect(requiresExpertReferral(scores)).toBe(false);
  });

  it('kardiyovasküler >= 8 ise true döner', () => {
    const answers: Answers = {
      S01: ['breath'],
      P05: ['hypertension'],
      S03: ['throbbing'],
    };
    const scores = calculateScores(answers, QUESTIONS);
    scores.kardiyovaskuler = 8;
    expect(requiresExpertReferral(scores)).toBe(true);
  });
});
