import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  CardElevation,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import type { Lecon } from '../types';

interface Props {
  lecon: Lecon;
  isTelechargement: boolean;
  onLire: (lecon: Lecon) => void;
  onTelecharger: (lecon: Lecon) => void;
  isActive?: boolean;
}

function formatDuree(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h}h${min.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function LessonCard({
  lecon,
  isTelechargement,
  onLire,
  onTelecharger,
  isActive = false,
}: Props) {
  const estDisponible = lecon.chemin_local !== null;

  return (
    <TouchableOpacity
      style={[styles.carte, CardElevation.sm, isActive && styles.carteActive]}
      onPress={() => (estDisponible ? onLire(lecon) : onTelecharger(lecon))}
      accessibilityRole="button"
      accessibilityLabel={`${lecon.titre}, ${lecon.matiere}, ${formatDuree(lecon.duree_sec)}, ${estDisponible ? 'disponible hors-ligne' : 'téléchargement requis'}`}
    >
      {/* Icône état */}
      <View
        style={[
          styles.iconeContainer,
          { backgroundColor: estDisponible ? Colors.success + '20' : Colors.surfaceAlt },
        ]}
      >
        <Text style={styles.icone}>{isActive ? '▶' : estDisponible ? '✓' : '⬇'}</Text>
      </View>

      {/* Infos */}
      <View style={styles.infos}>
        <Text style={styles.matiere}>{lecon.matiere}</Text>
        <Text style={styles.titre} numberOfLines={2}>
          {lecon.titre}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaTexte}>⏱ {formatDuree(lecon.duree_sec)}</Text>
          {!estDisponible && (
            <Text style={styles.metaTexte}>• {lecon.taille_mo} Mo</Text>
          )}
          {estDisponible && (
            <Text style={[styles.metaTexte, { color: Colors.success }]}>
              • Hors-ligne
            </Text>
          )}
        </View>
      </View>

      {/* Action */}
      {!estDisponible && (
        <View style={styles.action}>
          {isTelechargement ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <TouchableOpacity
              style={styles.boutonTelecharger}
              onPress={() => onTelecharger(lecon)}
              accessibilityRole="button"
              accessibilityLabel={`Télécharger ${lecon.titre}`}
            >
              <Text style={styles.boutonTelechargerTexte}>↓</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  carteActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  iconeContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icone: {
    fontSize: 18,
  },
  infos: {
    flex: 1,
    gap: 2,
  },
  matiere: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
  },
  titre: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  metaTexte: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  action: {
    flexShrink: 0,
  },
  boutonTelecharger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonTelechargerTexte: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});
