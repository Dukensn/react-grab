import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { AudioPlayerBar } from '../components/AudioPlayerBar';
import { LessonCard } from '../components/LessonCard';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAppContext } from '../context/AppContext';
import type { Lecon } from '../types';

const TOUTES_MATIERES = 'Tout';

export function PodcastScreen() {
  const { lecons, marquerLeconTelechargee } = useAppContext();
  const player = useAudioPlayer();

  const [matiereFiltre, setMatiereFiltre] = useState<string>(TOUTES_MATIERES);
  const [telechargementsEnCours, setTelechargementsEnCours] = useState<Set<string>>(
    new Set(),
  );

  // Liste dédupliquée des matières
  const matieres = useMemo(() => {
    const unique = [...new Set(lecons.map((l) => l.matiere))];
    return [TOUTES_MATIERES, ...unique];
  }, [lecons]);

  const leconsFiltrees = useMemo(() => {
    if (matiereFiltre === TOUTES_MATIERES) return lecons;
    return lecons.filter((l) => l.matiere === matiereFiltre);
  }, [lecons, matiereFiltre]);

  const handleLire = useCallback(
    (lecon: Lecon) => {
      player.chargerLecon(lecon);
    },
    [player],
  );

  const handleTelecharger = useCallback(
    async (lecon: Lecon) => {
      if (telechargementsEnCours.has(lecon.id)) return;

      // Vérification taille (alerte si > 15 Mo)
      if (lecon.taille_mo > 15) {
        Alert.alert(
          `Téléchargement (${lecon.taille_mo} Mo)`,
          'Ce fichier est volumineux. Préférez le Wi-Fi pour économiser vos données.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Télécharger quand même', onPress: () => lancer(lecon) },
          ],
        );
      } else {
        lancer(lecon);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [telechargementsEnCours],
  );

  const lancer = useCallback(
    async (lecon: Lecon) => {
      setTelechargementsEnCours((prev) => new Set(prev).add(lecon.id));

      try {
        const nomFichier = lecon.id + '.m4a';
        const destination =
          (FileSystem.documentDirectory ?? '') + 'lecons/' + nomFichier;

        // Créer le dossier si nécessaire
        await FileSystem.makeDirectoryAsync(
          (FileSystem.documentDirectory ?? '') + 'lecons',
          { intermediates: true },
        );

        const { uri } = await FileSystem.downloadAsync(
          lecon.url_distante,
          destination,
        );

        await marquerLeconTelechargee(lecon.id, uri);
      } catch (e) {
        Alert.alert(
          'Erreur de téléchargement',
          'Vérifiez votre connexion et réessayez.',
        );
      } finally {
        setTelechargementsEnCours((prev) => {
          const next = new Set(prev);
          next.delete(lecon.id);
          return next;
        });
      }
    },
    [marquerLeconTelechargee],
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.entete}>
        <Text style={styles.titreEcran}>Podcast</Text>
        <Text style={styles.sousTitre}>
          {leconsFiltrees.length} leçon(s) disponible(s)
        </Text>

        {/* Chips filtre matières */}
        <FlatList
          data={matieres}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matieresContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.matiereChip,
                matiereFiltre === item && styles.matiereChipActif,
              ]}
              onPress={() => setMatiereFiltre(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: matiereFiltre === item }}
            >
              <Text
                style={[
                  styles.matiereChipTexte,
                  matiereFiltre === item && styles.matiereChipTexteActif,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    ),
    [leconsFiltrees.length, matieres, matiereFiltre],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.vide}>
        <Text style={styles.videIcone}>🎙</Text>
        <Text style={styles.videTexte}>
          Aucune leçon pour cette matière.
        </Text>
      </View>
    ),
    [],
  );

  const renderErreur = useCallback(() => {
    if (!player.erreur) return null;
    return (
      <View style={styles.erreurBanner}>
        <Text style={styles.erreurTexte}>⚠️ {player.erreur}</Text>
      </View>
    );
  }, [player.erreur]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={leconsFiltrees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonCard
            lecon={item}
            isTelechargement={telechargementsEnCours.has(item.id)}
            onLire={handleLire}
            onTelecharger={handleTelecharger}
            isActive={player.leconActive?.id === item.id}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderErreur}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
      />

      {/* Lecteur sticky en bas */}
      {player.leconActive && (
        <AudioPlayerBar
          lecon={player.leconActive}
          isPlaying={player.isPlaying}
          positionMs={player.positionMs}
          dureeMs={player.dureeMs}
          vitesse={player.vitesse}
          onPlayPause={player.togglePlayPause}
          onReculer={player.reculer15s}
          onAvancer={player.avancer15s}
          onChangerVitesse={player.changerVitesse}
          onStop={player.stop}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  liste: {
    paddingBottom: Spacing.xl,
  },
  entete: {
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  titreEcran: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sousTitre: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  matieresContainer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  matiereChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matiereChipActif: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  matiereChipTexte: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  matiereChipTexteActif: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
  },
  vide: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  videIcone: {
    fontSize: 48,
  },
  videTexte: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  erreurBanner: {
    margin: Spacing.base,
    padding: Spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  erreurTexte: {
    color: Colors.error,
    fontSize: FontSize.sm,
  },
});
