import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  CardElevation,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import type { VitesseLecture } from '../hooks/useAudioPlayer';
import type { Lecon } from '../types';

interface Props {
  lecon: Lecon;
  isPlaying: boolean;
  positionMs: number;
  dureeMs: number;
  vitesse: VitesseLecture;
  onPlayPause: () => void;
  onReculer: () => void;
  onAvancer: () => void;
  onChangerVitesse: (v: VitesseLecture) => void;
  onStop: () => void;
}

const VITESSES: VitesseLecture[] = [0.75, 1, 1.25, 1.5];

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayerBar({
  lecon,
  isPlaying,
  positionMs,
  dureeMs,
  vitesse,
  onPlayPause,
  onReculer,
  onAvancer,
  onChangerVitesse,
  onStop,
}: Props) {
  const progres = dureeMs > 0 ? positionMs / dureeMs : 0;

  const prochaine = (): VitesseLecture => {
    const idx = VITESSES.indexOf(vitesse);
    return VITESSES[(idx + 1) % VITESSES.length];
  };

  return (
    <View style={[styles.container, CardElevation.md]}>
      {/* Info leçon + fermer */}
      <View style={styles.entete}>
        <View style={styles.infoLecon}>
          <Text style={styles.matiere}>{lecon.matiere}</Text>
          <Text style={styles.titre} numberOfLines={1}>
            {lecon.titre}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onStop}
          style={styles.boutonStop}
          accessibilityRole="button"
          accessibilityLabel="Arrêter la lecture"
        >
          <Text style={styles.boutonStopTexte}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressPiste}>
          <View style={[styles.progressRemplissage, { width: `${progres * 100}%` }]} />
        </View>
        <View style={styles.tempsContainer}>
          <Text style={styles.temps}>{formatMs(positionMs)}</Text>
          <Text style={styles.temps}>{formatMs(dureeMs)}</Text>
        </View>
      </View>

      {/* Contrôles */}
      <View style={styles.controles}>
        <TouchableOpacity
          onPress={onReculer}
          style={styles.boutonControl}
          accessibilityRole="button"
          accessibilityLabel="Reculer 15 secondes"
        >
          <Text style={styles.boutonControlTexte}>-15s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          style={styles.boutonPlayPause}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Lecture'}
        >
          <Text style={styles.boutonPlayPauseTexte}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAvancer}
          style={styles.boutonControl}
          accessibilityRole="button"
          accessibilityLabel="Avancer 15 secondes"
        >
          <Text style={styles.boutonControlTexte}>+15s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onChangerVitesse(prochaine())}
          style={styles.boutonVitesse}
          accessibilityRole="button"
          accessibilityLabel={`Vitesse ${vitesse}x, appuyer pour changer`}
        >
          <Text style={styles.boutonVitesseTexte}>{vitesse}x</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
    gap: Spacing.sm,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoLecon: {
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
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  boutonStop: {
    padding: Spacing.xs,
  },
  boutonStopTexte: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.lg,
    opacity: 0.7,
  },
  progressContainer: {
    gap: 4,
  },
  progressPiste: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressRemplissage: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
  tempsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  temps: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    fontVariant: ['tabular-nums'],
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  boutonControl: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  boutonControlTexte: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  boutonPlayPause: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonPlayPauseTexte: {
    fontSize: 20,
  },
  boutonVitesse: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  boutonVitesseTexte: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
