import type {
  FrequencyProtocol,
  ProgramDuration,
  UserProgram,
  WeeklyPlan,
  ScoreDimensions,
  ScoreDimension,
  WeekDay,
} from '../types';

const WEEK_DAYS: WeekDay[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

const SESSION_LIMITS: Record<ProgramDuration, number> = {
  short: 2,
  medium: 2,
  full: 4,
};

/**
 * Protokol ve seans indeksinden oturum anahtarı üretir.
 * Örnek: "NEURO_BALANCE.morning"
 */
function buildSessionKey(protocol: FrequencyProtocol, sessionIndex: number): string {
  return `${protocol.protocolId}.${protocol.sessions[sessionIndex]?.time ?? sessionIndex}`;
}

/**
 * Haftalık program takvimini oluşturur.
 * Her gün dominant protokollerden seanslar dönüşümlü atanır.
 */
function buildWeeklyPlan(
  protocols: FrequencyProtocol[],
  duration: ProgramDuration,
): WeeklyPlan {
  const limit = SESSION_LIMITS[duration];
  const plan: WeeklyPlan = {};

  WEEK_DAYS.forEach((day, dayIndex) => {
    const sessions: string[] = [];
    const primaryProtocol = protocols[dayIndex % protocols.length];
    const secondaryProtocol = protocols[(dayIndex + 1) % protocols.length];

    if (limit >= 1 && primaryProtocol.sessions[0]) {
      sessions.push(buildSessionKey(primaryProtocol, 0));
    }
    if (limit >= 2 && primaryProtocol.sessions[primaryProtocol.sessions.length - 1]) {
      sessions.push(
        buildSessionKey(primaryProtocol, primaryProtocol.sessions.length - 1),
      );
    }
    if (limit >= 3 && secondaryProtocol.sessions[0]) {
      sessions.push(buildSessionKey(secondaryProtocol, 0));
    }
    if (limit >= 4 && primaryProtocol.sessions[1]) {
      sessions.push(buildSessionKey(primaryProtocol, 1));
    }

    plan[day] = sessions;
  });

  return plan;
}

/**
 * Kardiyovasküler uyarısı varsa nota ekler.
 */
function buildNotes(scores: ScoreDimensions): string[] {
  const notes: string[] = [
    'Kulaklık kullanımı binaural seanslar için zorunludur.',
    'Program 4 hafta sonra yeniden değerlendirilmelidir.',
  ];
  if (scores.kardiyovaskuler >= 5 && scores.kardiyovaskuler < 8) {
    notes.push('Orta düzey kardiyovasküler skor tespit edildi. Doktor kontrolü önerilir.');
  }
  return notes;
}

/**
 * Kullanıcı skorlarından haftalık frekans programı oluşturur.
 * @param {string} userId - Anonim kullanıcı kimliği
 * @param {ScoreDimensions} scores - Hesaplanmış skorlar
 * @param {ScoreDimension[]} dominantDimensions - Öncelikli boyutlar
 * @param {FrequencyProtocol[]} protocols - Eşleşen ve önceliklendirilmiş protokoller
 * @param {ProgramDuration} duration - Kullanıcının seçtiği günlük süre
 * @returns {UserProgram} Kişiselleştirilmiş haftalık program
 */
export function buildProgram(
  userId: string,
  scores: ScoreDimensions,
  dominantDimensions: ScoreDimension[],
  protocols: FrequencyProtocol[],
  duration: ProgramDuration,
): UserProgram {
  const activeProtocols = protocols.length > 0 ? protocols : [];
  const weeklyPlan = activeProtocols.length > 0
    ? buildWeeklyPlan(activeProtocols, duration)
    : Object.fromEntries(WEEK_DAYS.map((d) => [d, []]));

  return {
    userId,
    generatedAt: new Date().toISOString(),
    programDuration: duration,
    dominantDimensions,
    scores,
    weeklyPlan,
    notes: buildNotes(scores),
  };
}
