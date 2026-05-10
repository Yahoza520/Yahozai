import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import type { Question, AnswerValue } from '../types';

interface QuestionCardProps {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

/**
 * Soru tipine göre uygun girdi bileşenini render eder.
 */
export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{question.question}</Text>
      {question.note && <Text style={styles.note}>{question.note}</Text>}

      {question.type === 'single' && (
        <SingleSelect
          options={question.options ?? []}
          value={value as string | null}
          onChange={onChange}
        />
      )}

      {question.type === 'multi' && (
        <MultiSelect
          options={question.options ?? []}
          value={(value as string[]) ?? []}
          onChange={onChange}
        />
      )}

      {question.type === 'boolean' && (
        <BooleanSelect value={value as boolean | null} onChange={onChange} />
      )}

      {question.type === 'scale' && (
        <ScaleSelect
          min={question.min ?? 1}
          max={question.max ?? 10}
          value={value as number | null}
          onChange={onChange}
        />
      )}

      {question.type === 'text' && (
        <TextInputField
          placeholder={question.placeholder}
          value={value as string | null}
          onChange={onChange}
        />
      )}
    </View>
  );
}

// ─── Alt Bileşenler ───────────────────────────────────────────────────────────

function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string | null;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <View style={styles.optionList}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.option, value === opt.value && styles.optionSelected]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.optionText, value === opt.value && styles.optionTextSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (v: AnswerValue) => void;
}) {
  function toggle(val: string) {
    const current = value ?? [];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    onChange(next);
  }

  return (
    <View style={styles.optionList}>
      {options.map((opt) => {
        const selected = value?.includes(opt.value);
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => toggle(opt.value)}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function BooleanSelect({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <View style={styles.boolRow}>
      {[true, false].map((bool) => (
        <TouchableOpacity
          key={String(bool)}
          style={[styles.boolBtn, value === bool && styles.boolBtnSelected]}
          onPress={() => onChange(bool)}
        >
          <Text style={[styles.boolText, value === bool && styles.boolTextSelected]}>
            {bool ? 'Evet' : 'Hayır'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ScaleSelect({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number | null;
  onChange: (v: AnswerValue) => void;
}) {
  const current = value ?? Math.round((min + max) / 2);
  return (
    <View style={styles.scaleContainer}>
      <Text style={styles.scaleValue}>{current}</Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={current}
        minimumTrackTintColor="#4A90D9"
        maximumTrackTintColor="#E2E8F0"
        thumbTintColor="#4A90D9"
        onValueChange={(v) => onChange(v)}
      />
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>{min}</Text>
        <Text style={styles.scaleLabel}>{max}</Text>
      </View>
    </View>
  );
}

function TextInputField({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value: string | null;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <TextInput
      style={styles.textInput}
      placeholder={placeholder ?? 'Cevabınızı yazın…'}
      placeholderTextColor="#94A3B8"
      value={value ?? ''}
      onChangeText={(t) => onChange(t)}
    />
  );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: 16 },
  questionText: { fontSize: 18, fontWeight: '700', color: '#1E293B', lineHeight: 26 },
  note: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  optionList: { gap: 10 },
  option: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFF',
  },
  optionSelected: { borderColor: '#4A90D9', backgroundColor: '#EFF6FF' },
  optionText: { fontSize: 14, color: '#475569' },
  optionTextSelected: { color: '#1D4ED8', fontWeight: '600' },
  boolRow: { flexDirection: 'row', gap: 12 },
  boolBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  boolBtnSelected: { borderColor: '#4A90D9', backgroundColor: '#EFF6FF' },
  boolText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  boolTextSelected: { color: '#1D4ED8' },
  scaleContainer: { alignItems: 'center', gap: 8 },
  scaleValue: { fontSize: 40, fontWeight: '800', color: '#4A90D9' },
  slider: { width: '100%', height: 40 },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  scaleLabel: { fontSize: 12, color: '#94A3B8' },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFF',
  },
});
