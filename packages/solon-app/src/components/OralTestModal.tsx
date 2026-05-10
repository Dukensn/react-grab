import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import { DUREE_MAX_ORAL_SEC } from '../constants/dates';
import { useGemini } from '../hooks/useGemini';
import type { EvaluationOrale, Sujet } from '../types';

interface Props {
  visible: boolean;
  sujet: Sujet | null;
  onClose: () => void;
  onValide: (sujet: Sujet) => void;
}

type EtapeModal = 'enregistrement' | 'traitement' | 'resultat' | 'erreur';

export function OralTestModal({ visible, sujet, onClose, onValide }: Props) {
  const { audio: evaluerAudio } = useGemini();
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [etape, setEtape] = useState<EtapeModal>('enregistrement');
  const [isRecording, setIsRecording] = useState(false);
  const [dureeSecondes, setDureeSecondes] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationOrale | null>(null);
  const [messageErreur, setMessageErreur] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Réinitialisation à chaque ouverture
  useEffect(() => {
    if (visible) {
      setEtape('enregistrement');
      setIsRecording(false);
      setDureeSecondes(0);
      setEvaluation(null);
    }
  }, [visible]);

  // Nettoyage si durée max atteinte
  useEffect(() => {
    if (dureeSecondes >= DUREE_MAX_ORAL_SEC && isRecording) {
      arreterEtSoumettre();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dureeSecondes, isRecording]);

  const demarrerEnregistrement = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission refusée',
          'SolonApp a besoin du micro pour le test oral.',
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        // m4a 16kHz mono — optimisé pour la data mobile
        {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 32000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.LOW,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 32000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {},
        },
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setDureeSecondes(0);

      intervalRef.current = setInterval(() => {
        setDureeSecondes((d) => d + 1);
      }, 1000);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement.');
    }
  }, []);

  const arreterEtSoumettre = useCallback(async () => {
    if (!recordingRef.current || !sujet) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRecording(false);
    setEtape('traitement');

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('URI enregistrement invalide');

      const evalResult = await evaluerAudio(uri, sujet.titre);
      setEvaluation(evalResult);
      setEtape('resultat');

      // Nettoyage du fichier temporaire
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Erreur lors de l\'évaluation.';
      setMessageErreur(msg);
      setEtape('erreur');
    }
  }, [sujet, evaluerAudio]);

  const handleFermer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    recordingRef.current = null;
    onClose();
  }, [onClose]);

  const handleValider = useCallback(() => {
    if (sujet && evaluation?.validation) {
      onValide(sujet);
    }
    handleFermer();
  }, [sujet, evaluation, onValide, handleFermer]);

  const formatDuree = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!sujet) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleFermer}
    >
      <View style={styles.overlay}>
        <View style={styles.feuille}>
          {/* En-tête */}
          <View style={styles.entete}>
            <Text style={styles.titre}>Test Oral — Maître Solon</Text>
            <TouchableOpacity
              onPress={handleFermer}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <Text style={styles.fermer}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.corps} showsVerticalScrollIndicator={false}>
            {/* Étape enregistrement */}
            {etape === 'enregistrement' && (
              <View style={styles.centré}>
                <Text style={styles.consigne}>
                  Explique à voix haute :
                </Text>
                <Text style={styles.sujetTitre}>{sujet.titre}</Text>

                <Text style={styles.dureeRestante}>
                  Max : 3 minutes
                </Text>

                {isRecording && (
                  <View style={styles.enregistrementInfo}>
                    <View style={styles.pulsePoint} />
                    <Text style={styles.chrono}>
                      {formatDuree(dureeSecondes)} / {formatDuree(DUREE_MAX_ORAL_SEC)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.boutonMicro,
                    isRecording && styles.boutonMicroActif,
                  ]}
                  onPress={isRecording ? arreterEtSoumettre : demarrerEnregistrement}
                  accessibilityRole="button"
                  accessibilityLabel={isRecording ? 'Arrêter et soumettre' : 'Démarrer l\'enregistrement'}
                >
                  <Text style={styles.boutonMicroIcone}>
                    {isRecording ? '⏹' : '🎤'}
                  </Text>
                  <Text style={styles.boutonMicroTexte}>
                    {isRecording ? 'Soumettre' : 'Parler'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Étape traitement */}
            {etape === 'traitement' && (
              <View style={styles.centré}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.traitementTexte}>
                  Maître Solon écoute et évalue...
                </Text>
                <Text style={styles.traitementSous}>
                  Quelques secondes, patience.
                </Text>
              </View>
            )}

            {/* Étape résultat */}
            {etape === 'resultat' && evaluation && (
              <View style={styles.resultat}>
                {/* Note */}
                <View
                  style={[
                    styles.noteContainer,
                    {
                      backgroundColor: evaluation.validation
                        ? '#ECFDF5'
                        : '#FEF2F2',
                      borderColor: evaluation.validation
                        ? Colors.success
                        : Colors.error,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.note,
                      {
                        color: evaluation.validation
                          ? Colors.success
                          : Colors.error,
                      },
                    ]}
                  >
                    {evaluation.note}/20
                  </Text>
                  <Text
                    style={[
                      styles.validationLabel,
                      {
                        color: evaluation.validation
                          ? Colors.success
                          : Colors.error,
                      },
                    ]}
                  >
                    {evaluation.validation ? '✓ Validé !' : '✗ À retravailler'}
                  </Text>
                </View>

                {/* Feedback */}
                <Text style={styles.feedbackLabel}>Commentaire de Maître Solon :</Text>
                <Text style={styles.feedback}>{evaluation.feedback}</Text>

                {/* Points forts */}
                {evaluation.points_forts.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>✅ Points forts</Text>
                    {evaluation.points_forts.map((p, i) => (
                      <Text key={i} style={styles.point}>
                        • {p}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Points à revoir */}
                {evaluation.points_a_revoir.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: Colors.warning }]}>
                      ⚠️ À revoir
                    </Text>
                    {evaluation.points_a_revoir.map((p, i) => (
                      <Text key={i} style={[styles.point, { color: Colors.textSecondary }]}>
                        • {p}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsResultat}>
                  {evaluation.validation && (
                    <TouchableOpacity
                      style={styles.boutonValider}
                      onPress={handleValider}
                      accessibilityRole="button"
                    >
                      <Text style={styles.boutonValiderTexte}>
                        Marquer comme validé
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.boutonReessayer}
                    onPress={() => {
                      setEtape('enregistrement');
                      setDureeSecondes(0);
                    }}
                    accessibilityRole="button"
                  >
                    <Text style={styles.boutonReessayerTexte}>
                      Réessayer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Étape erreur */}
            {etape === 'erreur' && (
              <View style={styles.centré}>
                <Text style={styles.erreurIcone}>⚠️</Text>
                <Text style={styles.erreurTitre}>Oups !</Text>
                <Text style={styles.erreurMessage}>{messageErreur}</Text>
                <TouchableOpacity
                  style={styles.boutonReessayer}
                  onPress={() => setEtape('enregistrement')}
                  accessibilityRole="button"
                >
                  <Text style={styles.boutonReessayerTexte}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  feuille: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '90%',
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titre: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  fermer: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    padding: Spacing.xs,
  },
  corps: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  centré: {
    alignItems: 'center',
    gap: Spacing.base,
  },
  consigne: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sujetTitre: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  dureeRestante: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  enregistrementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pulsePoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  chrono: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.error,
    fontVariant: ['tabular-nums'],
  },
  boutonMicro: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  boutonMicroActif: {
    backgroundColor: Colors.error,
  },
  boutonMicroIcone: {
    fontSize: 32,
  },
  boutonMicroTexte: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  traitementTexte: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.base,
  },
  traitementSous: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resultat: {
    gap: Spacing.base,
  },
  noteContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  note: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
  },
  validationLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  feedbackLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  feedback: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
  point: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  actionsResultat: {
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  boutonValider: {
    backgroundColor: Colors.success,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  boutonValiderTexte: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
  },
  boutonReessayer: {
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  boutonReessayerTexte: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },
  erreurIcone: {
    fontSize: 48,
  },
  erreurTitre: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  erreurMessage: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
