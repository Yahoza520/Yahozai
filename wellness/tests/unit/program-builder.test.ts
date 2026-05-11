import { buildProgram } from '../../shared/utils/program-builder';
import { FREQUENCY_PROTOCOLS } from '../../modules/clinical-dashboard/frequency-catalog';
import type { ScoreDimensions } from '../../shared/types';

const BASE_SCORES: ScoreDimensions = {
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

const TWO_PROTOCOLS = FREQUENCY_PROTOCOLS.slice(0, 2);

describe('buildProgram', () => {
  it('userId alanını program'a doğru aktarır', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], TWO_PROTOCOLS, 'short');
    expect(program.userId).toBe('usr_test');
  });

  it('programDuration alanını doğru ayarlar', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], TWO_PROTOCOLS, 'medium');
    expect(program.programDuration).toBe('medium');
  });

  it('generatedAt geçerli ISO 8601 tarih içerir', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], TWO_PROTOCOLS, 'short');
    expect(new Date(program.generatedAt).toISOString()).toBe(program.generatedAt);
  });

  it('weeklyPlan 7 gün içerir', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], TWO_PROTOCOLS, 'short');
    expect(Object.keys(program.weeklyPlan)).toHaveLength(7);
  });

  it('short duration günde en fazla 2 seans içerir', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], TWO_PROTOCOLS, 'short');
    Object.values(program.weeklyPlan).forEach((sessions) => {
      expect(sessions.length).toBeLessThanOrEqual(2);
    });
  });

  it('full duration günde 4 seans içerebilir', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], TWO_PROTOCOLS, 'full');
    const maxSessions = Math.max(...Object.values(program.weeklyPlan).map((s) => s.length));
    expect(maxSessions).toBeGreaterThanOrEqual(2);
  });

  it('protokol yokken weeklyPlan boş dizilerle dolar', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], [], 'short');
    Object.values(program.weeklyPlan).forEach((sessions) => {
      expect(sessions).toHaveLength(0);
    });
  });

  it('notes dizisi en az bir eleman içerir', () => {
    const program = buildProgram('usr_test', BASE_SCORES, [], TWO_PROTOCOLS, 'short');
    expect(program.notes.length).toBeGreaterThan(0);
  });

  it('kardiyovasküler >= 5 ise doktor önerisi notta geçer', () => {
    const scores: ScoreDimensions = { ...BASE_SCORES, kardiyovaskuler: 6 };
    const program = buildProgram('usr_test', scores, [], TWO_PROTOCOLS, 'short');
    const hasNote = program.notes.some((n) => n.includes('kardiyovasküler'));
    expect(hasNote).toBe(true);
  });

  it('dominantDimensions program'a aktarılır', () => {
    const program = buildProgram('usr_test', BASE_SCORES, ['enerji', 'immun'], TWO_PROTOCOLS, 'short');
    expect(program.dominantDimensions).toEqual(['enerji', 'immun']);
  });
});
