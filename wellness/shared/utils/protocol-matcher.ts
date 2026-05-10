import type { ScoreDimensions, FrequencyProtocol, ScoreDimension } from '../types';
import { FREQUENCY_PROTOCOLS } from '../../modules/clinical-dashboard/frequency-catalog';

/**
 * Kullanıcı skorlarına göre eşleşen protokolleri döner.
 * @param {ScoreDimensions} scores - Hesaplanmış skor boyutları
 * @returns {FrequencyProtocol[]} Eşleşen protokol listesi
 */
export function matchProtocols(scores: ScoreDimensions): FrequencyProtocol[] {
  return FREQUENCY_PROTOCOLS.filter((protocol) => {
    const dimensionScore = scores[protocol.targetDimension as ScoreDimension];
    return dimensionScore >= protocol.minScore;
  });
}

/**
 * Dominant boyutlara göre protokolleri öncelik sırasına dizer.
 * @param {FrequencyProtocol[]} protocols - Eşleşen protokoller
 * @param {ScoreDimension[]} dominantDimensions - Öncelikli boyutlar
 * @returns {FrequencyProtocol[]} Sıralanmış protokoller
 */
export function prioritizeProtocols(
  protocols: FrequencyProtocol[],
  dominantDimensions: ScoreDimension[],
): FrequencyProtocol[] {
  return [...protocols].sort((a, b) => {
    const aIndex = dominantDimensions.indexOf(a.targetDimension as ScoreDimension);
    const bIndex = dominantDimensions.indexOf(b.targetDimension as ScoreDimension);
    const aRank = aIndex === -1 ? 999 : aIndex;
    const bRank = bIndex === -1 ? 999 : bIndex;
    return aRank - bRank;
  });
}
