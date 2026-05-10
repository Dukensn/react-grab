import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';

interface Props {
  pourcent: number; // 0-100
  label?: string;
}

export function ProgressBar({ pourcent, label }: Props) {
  const pct = Math.min(100, Math.max(0, pourcent));

  const couleurBarre =
    pct >= 80
      ? Colors.success
      : pct >= 50
        ? Colors.accent
        : Colors.statusEnCours;

  return (
    <View style={styles.container}>
      <View style={styles.entete}>
        <Text style={styles.label}>{label ?? 'Progression globale'}</Text>
        <Text style={[styles.pourcent, { color: couleurBarre }]}>{pct}%</Text>
      </View>
      <View
        style={styles.piste}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: pct }}
      >
        <View
          style={[styles.remplissage, { width: `${pct}%`, backgroundColor: couleurBarre }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  pourcent: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  piste: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  remplissage: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
