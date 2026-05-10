import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  CardElevation,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import type { Sujet, StatutSujet } from '../types';

interface Props {
  sujet: Sujet;
  onEtudier: (sujet: Sujet) => void;
  onValider: (sujet: Sujet) => void;
}

const STATUT_CONFIG: Record<
  StatutSujet,
  { label: string; couleur: string; bg: string }
> = {
  a_faire: {
    label: 'À faire',
    couleur: Colors.statusAFaire,
    bg: Colors.surfaceAlt,
  },
  en_cours: {
    label: 'En cours',
    couleur: Colors.statusEnCours,
    bg: '#EFF6FF',
  },
  valide: {
    label: 'Validé ✓',
    couleur: Colors.statusValide,
    bg: '#ECFDF5',
  },
};

function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

export function SubjectCard({ sujet, onEtudier, onValider }: Props) {
  const config = STATUT_CONFIG[sujet.statut];

  return (
    <View
      style={[styles.carte, CardElevation.sm]}
      accessibilityLabel={`Sujet : ${sujet.titre}, statut : ${config.label}`}
    >
      {/* Badge statut */}
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <View style={[styles.badgeDot, { backgroundColor: config.couleur }]} />
        <Text style={[styles.badgeTexte, { color: config.couleur }]}>
          {config.label}
        </Text>
      </View>

      {/* Contenu */}
      <Text style={styles.matiere}>{sujet.matiere}</Text>
      <Text style={styles.titre} numberOfLines={2}>
        {sujet.titre}
      </Text>
      <Text style={styles.chapitre} numberOfLines={1}>
        {sujet.chapitre}
      </Text>

      {/* Pied de carte */}
      <View style={styles.pied}>
        <Text style={styles.duree}>⏱ {formatDuree(sujet.duree_estimee_min)}</Text>

        <View style={styles.boutons}>
          <TouchableOpacity
            style={styles.boutonEtudier}
            onPress={() => onEtudier(sujet)}
            accessibilityRole="button"
            accessibilityLabel={`Étudier ${sujet.titre}`}
          >
            <Text style={styles.boutonEtudierTexte}>Étudier</Text>
          </TouchableOpacity>

          {sujet.statut !== 'valide' && (
            <TouchableOpacity
              style={styles.boutonValider}
              onPress={() => onValider(sujet)}
              accessibilityRole="button"
              accessibilityLabel={`Valider ${sujet.titre}`}
            >
              <Text style={styles.boutonValiderTexte}>Valider</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 5,
    marginBottom: Spacing.xs,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeTexte: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  matiere: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titre: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  chapitre: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  pied: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  duree: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  boutons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  boutonEtudier: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  boutonEtudierTexte: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  boutonValider: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  boutonValiderTexte: {
    color: Colors.textOnAccent,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
