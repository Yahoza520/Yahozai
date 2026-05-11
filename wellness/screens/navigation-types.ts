import type { Answers, FrequencySession, ProgramDuration, UserProgram } from '../shared/types';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PrivacyConsent: undefined;
  Wizard: { userId: string };
  Analysis: { answers: Answers; userId: string; programDuration: ProgramDuration };
  ExpertReferral: { program: UserProgram; userId: string };
  Result: { program: UserProgram | null; userId: string; error?: string };
  FrequencyProgram: { program: UserProgram; userId: string };
  Player: { session: FrequencySession; userId: string; sessionKey: string };
  Home: { userId: string };
  Profile: undefined;
  Settings: undefined;
};
