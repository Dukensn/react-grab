import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import {
  DATE_EXAMEN_ETAT,
  SEUIL_URGENCE_HAUTE,
  SEUIL_URGENCE_MOYENNE,
} from '../constants/dates';

function calculerJoursRestants(): number {
  const maintenant = new Date();
  const examen = new Date(DATE_EXAMEN_ETAT);
  const diff = examen.getTime() - maintenant.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function CountdownBanner() {
  const jours = useMemo(calculerJoursRestants, []);

  const couleur =
    jours < SEUIL_URGENCE_HAUTE
      ? Colors.urgenceHaute
      : jours < SEUIL_URGENCE_MOYENNE
        ? Colors.urgenceMoyenne
        : Colors.urgenceNormale;

  const message =
    jours === 0
      ? "C'est aujourd'hui !"
      : jours === 1
        ? 'Demain c'est le grand jour !'
        : `J-${jours} avant l'examen d'État`;

  return (
    <View
      style={[styles.container, { backgroundColor: couleur + '20', borderColor: couleur }]}
      accessibilityRole="text"
      accessibilityLabel={message}
    >
      <View style={[styles.dot, { backgroundColor: couleur }]} />
      <Text style={[styles.texte, { color: couleur }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  texte: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
});
