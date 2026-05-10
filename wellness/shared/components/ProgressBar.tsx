import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * Wizard adım ilerleme çubuğu.
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = Math.min(current / total, 1);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#4A90D9', borderRadius: 2 },
});
