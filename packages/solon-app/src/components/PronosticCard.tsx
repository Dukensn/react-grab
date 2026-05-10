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
import type { AngleMort, NiveauRisque, PronosticSujet, Tendance } from '../types';

// ─── Carte Sujet Fréquent ─────────────────────────────────────────────────────

interface PronosticSujetCardProps {
  sujet: PronosticSujet;
  onPress: (sujet: PronosticSujet) => void;
}

const TENDANCE_CONFIG: Record<Tendance, { label: string; couleur: string; emoji: string }> = {
  en_hausse: { label: 'En hausse', couleur: Colors.tendanceHausse, emoji: '↑' },
  stable: { label: 'Stable', couleur: Colors.tendanceStable, emoji: '→' },
  baisse: { label: 'Baisse', couleur: Colors.tendanceBaisse, emoji: '↓' },
};

export function PronosticSujetCard({ sujet, onPress }: PronosticSujetCardProps) {
  const tendance = TENDANCE_CONFIG[sujet.tendance];

  return (
    <TouchableOpacity
      style={[styles.carte, CardElevation.sm]}
      onPress={() => onPress(sujet)}
      accessibilityRole="button"
      accessibilityLabel={`${sujet.nom}, fréquence ${sujet.frequence_pct}%, tendance ${tendance.label}`}
    >
      {/* Fréquence */}
      <View style={styles.frequenceContainer}>
        <Text style={styles.frequenceNombre}>{sujet.frequence_pct}</Text>
        <Text style={styles.frequencePct}>%</Text>
      </View>

      {/* Infos */}
      <View style={styles.infos}>
        <View style={styles.entete}>
          <Text style={styles.matiere}>{sujet.matiere}</Text>
          <View style={[styles.badgeTendance, { backgroundColor: tendance.couleur + '20' }]}>
            <Text style={[styles.badgeTendanceTexte, { color: tendance.couleur }]}>
              {tendance.emoji} {tendance.label}
            </Text>
          </View>
        </View>
        <Text style={styles.nom} numberOfLines={2}>
          {sujet.nom}
        </Text>
        <Text style={styles.formats} numberOfLines={1}>
          {sujet.formats_frequents.join(' · ')}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Carte Angle Mort ─────────────────────────────────────────────────────────

interface AngleMortCardProps {
  sujet: AngleMort;
  onPress: (sujet: AngleMort) => void;
}

const RISQUE_CONFIG: Record<NiveauRisque, { couleur: string; bg: string }> = {
  très_élevé: { couleur: Colors.risqueTresEleve, bg: '#FEF2F2' },
  élevé: { couleur: Colors.risqueEleve, bg: '#FFFBEB' },
  modéré: { couleur: Colors.risqueModere, bg: '#EFF6FF' },
  faible: { couleur: Colors.risqueFaible, bg: '#ECFDF5' },
};

export function AngleMortCard({ sujet, onPress }: AngleMortCardProps) {
  const risque = RISQUE_CONFIG[sujet.risque_surprise];

  return (
    <TouchableOpacity
      style={[styles.carte, CardElevation.sm, { borderLeftWidth: 4, borderLeftColor: risque.couleur }]}
      onPress={() => onPress(sujet)}
      accessibilityRole="button"
      accessibilityLabel={`${sujet.nom}, risque ${sujet.risque_surprise}, dernière apparition ${sujet.derniere_apparition}`}
    >
      <View style={styles.infos}>
        <View style={styles.entete}>
          <Text style={styles.matiere}>{sujet.matiere}</Text>
          <View style={[styles.badgeTendance, { backgroundColor: risque.bg }]}>
            <Text style={[styles.badgeTendanceTexte, { color: risque.couleur }]}>
              ⚠️ {sujet.risque_surprise}
            </Text>
          </View>
        </View>
        <Text style={styles.nom} numberOfLines={2}>
          {sujet.nom}
        </Text>
        <Text style={styles.formats}>
          Dernière apparition : {sujet.derniere_apparition}
        </Text>
        <Text style={styles.justification} numberOfLines={2}>
          {sujet.justification}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.md,
  },
  frequenceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 0,
    minWidth: 52,
  },
  frequenceNombre: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  frequencePct: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  infos: {
    flex: 1,
    gap: 3,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  matiere: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
  },
  badgeTendance: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeTendanceTexte: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  nom: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  formats: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  justification: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  chevron: {
    fontSize: FontSize.xl,
    color: Colors.textMuted,
    flexShrink: 0,
  },
});
