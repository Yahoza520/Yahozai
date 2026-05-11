import { matchProtocols, prioritizeProtocols } from '../../shared/utils/protocol-matcher';
import type { ScoreDimensions, FrequencyProtocol, ScoreDimension } from '../../shared/types';

const ZERO_SCORES: ScoreDimensions = {
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

describe('matchProtocols', () => {
  it('tüm skor sıfırken hiç protokol eşleşmez', () => {
    const result = matchProtocols(ZERO_SCORES);
    expect(result).toHaveLength(0);
  });

  it('yüksek enerji skoru ENERGY_RESTORE protokolünü eşleştirir', () => {
    const scores: ScoreDimensions = { ...ZERO_SCORES, enerji: 5 };
    const result = matchProtocols(scores);
    const ids = result.map((p) => p.protocolId);
    expect(ids).toContain('ENERGY_RESTORE');
  });

  it('yüksek norolojik skor NEURO_BALANCE protokolünü eşleştirir', () => {
    const scores: ScoreDimensions = { ...ZERO_SCORES, norolojik: 5 };
    const result = matchProtocols(scores);
    const ids = result.map((p) => p.protocolId);
    expect(ids).toContain('NEURO_BALANCE');
  });

  it('birden fazla yüksek skor birden fazla protokol döner', () => {
    const scores: ScoreDimensions = { ...ZERO_SCORES, enerji: 5, immun: 5 };
    const result = matchProtocols(scores);
    expect(result.length).toBeGreaterThan(1);
  });

  it('dönen protokollerin hepsinde sessions dizisi var', () => {
    const scores: ScoreDimensions = { ...ZERO_SCORES, enerji: 5 };
    const result = matchProtocols(scores);
    result.forEach((p) => expect(p.sessions.length).toBeGreaterThan(0));
  });
});

describe('prioritizeProtocols', () => {
  const makeProtocol = (id: string, dim: ScoreDimension): FrequencyProtocol => ({
    protocolId: id,
    targetDimension: dim,
    minScore: 3,
    sessions: [],
  });

  it('dominant boyut protokolünü listeye öne alır', () => {
    const protocols = [
      makeProtocol('IMMUN', 'immun'),
      makeProtocol('ENERGY', 'enerji'),
    ];
    const result = prioritizeProtocols(protocols, ['enerji', 'immun']);
    expect(result[0].protocolId).toBe('ENERGY');
  });

  it('dominant olmayan protokoller sona kalır', () => {
    const protocols = [
      makeProtocol('NEURO', 'norolojik'),
      makeProtocol('ENERGY', 'enerji'),
    ];
    const result = prioritizeProtocols(protocols, ['enerji']);
    expect(result[0].protocolId).toBe('ENERGY');
    expect(result[1].protocolId).toBe('NEURO');
  });

  it('boş protokol listesi boş döner', () => {
    expect(prioritizeProtocols([], ['enerji'])).toHaveLength(0);
  });

  it('orijinal diziyi mutate etmez', () => {
    const protocols = [makeProtocol('A', 'enerji'), makeProtocol('B', 'immun')];
    const original = protocols.map((p) => p.protocolId);
    prioritizeProtocols(protocols, ['immun']);
    expect(protocols.map((p) => p.protocolId)).toEqual(original);
  });
});
