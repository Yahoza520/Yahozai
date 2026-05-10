import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import type { Answers, Question, AnswerValue, ProgramDuration } from '../shared/types';
import { QUESTIONS } from '../modules/clinical-dashboard/question-bank';
import { validateSingleAnswer } from '../modules/data-validation';
import { logAction } from '../modules/audit-logger';
import { ProgressBar } from '../shared/components/ProgressBar';
import { QuestionCard } from '../shared/components/QuestionCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Wizard'>;

const TOTAL_STEPS = 5;

const STEP_QUESTION_IDS: Record<number, string[]> = {
  1: ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07'],
  2: ['S01', 'S02', 'S03', 'S04', 'S05', 'S06'],
  3: ['E01', 'E02', 'E03'],
  4: ['L01', 'L02', 'L03', 'L04'],
  5: ['B01', 'B02', 'B03', 'B04', 'B05'],
};

const STEP_LABELS: Record<number, string> = {
  1: 'Profil',
  2: 'Semptomlar',
  3: 'Enerji & Ruh Hali',
  4: 'Yaşam Tarzı',
  5: 'Biyorezonans',
};

/**
 * Ana wizard konteyneri. Adım adım soru akışını ve dinamik dallanmayı yönetir.
 */
export default function WizardScreen({ navigation, route }: Props) {
  const userId = route.params?.userId ?? 'anonymous';

  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [activeQuestionIds, setActiveQuestionIds] = useState<string[]>(
    STEP_QUESTION_IDS[1],
  );

  const currentStepIds = activeQuestionIds.filter((id) =>
    STEP_QUESTION_IDS[currentStep]?.includes(id),
  );
  const currentQuestionId = currentStepIds[currentQuestionIndex];
  const currentQuestion: Question | undefined = QUESTIONS.find(
    (q) => q.id === currentQuestionId,
  );

  const isLastQuestionInStep = currentQuestionIndex >= currentStepIds.length - 1;
  const isLastStep = currentStep === TOTAL_STEPS;

  /**
   * Cevaba göre dinamik soru listesini günceller (dallanma mantığı).
   */
  const applyBranching = useCallback(
    (question: Question, value: AnswerValue) => {
      const additions: string[] = [];

      for (const branch of question.branches) {
        if (branch.addQuestion) {
          const isMultiContains =
            Array.isArray(value) &&
            branch.contains &&
            value.includes(branch.contains);
          const isSingleMatch = value === branch.contains;
          if (isMultiContains || isSingleMatch) {
            additions.push(branch.addQuestion);
          }
        }
      }

      if (additions.length > 0) {
        setActiveQuestionIds((prev) => {
          const combined = [...prev];
          for (const id of additions) {
            if (!combined.includes(id)) combined.push(id);
          }
          return combined;
        });
      }
    },
    [],
  );

  const handleAnswer = useCallback(
    (value: AnswerValue) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      applyBranching(currentQuestion, value);
    },
    [currentQuestion, applyBranching],
  );

  const handleNext = useCallback(async () => {
    if (!isLastQuestionInStep) {
      setCurrentQuestionIndex((i) => i + 1);
      return;
    }

    if (!isLastStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCurrentQuestionIndex(0);
      setActiveQuestionIds((prev) => [
        ...prev,
        ...STEP_QUESTION_IDS[nextStep].filter((id) => !prev.includes(id)),
      ]);
      return;
    }

    // Wizard tamamlandı
    await logAction(userId, 'VERI_DEGISTIRME', 'WizardScreen', 'SUCCESS');
    const programDuration: ProgramDuration =
      (answers['B05'] as ProgramDuration) ?? 'medium';

    navigation.replace('Analysis', { answers, userId, programDuration });
  }, [
    isLastQuestionInStep,
    isLastStep,
    currentStep,
    userId,
    answers,
    navigation,
  ]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
      return;
    }
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevIds = activeQuestionIds.filter((id) =>
        STEP_QUESTION_IDS[prevStep]?.includes(id),
      );
      setCurrentQuestionIndex(Math.max(prevIds.length - 1, 0));
    }
  }, [currentQuestionIndex, currentStep, activeQuestionIds]);

  const canProceed =
    !currentQuestion?.required ||
    answers[currentQuestion.id] != null;

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.stepLabel}>
          {STEP_LABELS[currentStep]} ({currentStep}/{TOTAL_STEPS})
        </Text>
      </View>

      <ProgressBar current={currentStep} total={TOTAL_STEPS} />

      <ScrollView contentContainerStyle={styles.content}>
        <QuestionCard
          question={currentQuestion}
          value={answers[currentQuestion.id] ?? null}
          onChange={handleAnswer}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextText}>
            {isLastStep && isLastQuestionInStep ? 'Tamamla' : 'İleri'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 20, color: '#4A90D9' },
  stepLabel: { flex: 1, textAlign: 'center', fontSize: 14, color: '#64748B', fontWeight: '600' },
  content: { padding: 20, flexGrow: 1 },
  footer: { padding: 20 },
  nextBtn: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#CBD5E1' },
  nextText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
