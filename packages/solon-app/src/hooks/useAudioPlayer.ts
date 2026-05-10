import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import type { Lecon } from '../types';

export type VitesseLecture = 0.75 | 1 | 1.25 | 1.5;

interface AudioPlayerState {
  leconActive: Lecon | null;
  isPlaying: boolean;
  positionMs: number;
  dureeMs: number;
  vitesse: VitesseLecture;
  isLoading: boolean;
  erreur: string | null;
}

interface AudioPlayerActions {
  chargerLecon: (lecon: Lecon) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  reculer15s: () => Promise<void>;
  avancer15s: () => Promise<void>;
  changerVitesse: (v: VitesseLecture) => Promise<void>;
  stop: () => Promise<void>;
}

export function useAudioPlayer(): AudioPlayerState & AudioPlayerActions {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [leconActive, setLeconActive] = useState<Lecon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [dureeMs, setDureeMs] = useState(0);
  const [vitesse, setVitesse] = useState<VitesseLecture>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Configuration audio au montage
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);
      setPositionMs(status.positionMillis);
      setDureeMs(status.durationMillis ?? 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPositionMs(0);
      }
    },
    [],
  );

  const chargerLecon = useCallback(
    async (lecon: Lecon) => {
      setErreur(null);
      setIsLoading(true);

      try {
        // Déchargement de l'audio précédent
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        const source = lecon.chemin_local
          ? { uri: lecon.chemin_local }
          : { uri: lecon.url_distante };

        const { sound } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: true, rate: vitesse, volume: 1.0 },
          onPlaybackStatusUpdate,
        );

        soundRef.current = sound;
        setLeconActive(lecon);
        setIsPlaying(true);
        setPositionMs(0);
      } catch (e) {
        setErreur('Impossible de charger cette leçon. Vérifiez votre connexion.');
      } finally {
        setIsLoading(false);
      }
    },
    [vitesse, onPlaybackStatusUpdate],
  );

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying]);

  const reculer15s = useCallback(async () => {
    if (!soundRef.current) return;
    const nouvelle = Math.max(0, positionMs - 15_000);
    await soundRef.current.setPositionAsync(nouvelle);
  }, [positionMs]);

  const avancer15s = useCallback(async () => {
    if (!soundRef.current || !dureeMs) return;
    const nouvelle = Math.min(dureeMs, positionMs + 15_000);
    await soundRef.current.setPositionAsync(nouvelle);
  }, [positionMs, dureeMs]);

  const changerVitesse = useCallback(
    async (v: VitesseLecture) => {
      setVitesse(v);
      if (soundRef.current) {
        await soundRef.current.setRateAsync(v, true);
      }
    },
    [],
  );

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setLeconActive(null);
    setIsPlaying(false);
    setPositionMs(0);
    setDureeMs(0);
  }, []);

  return {
    leconActive,
    isPlaying,
    positionMs,
    dureeMs,
    vitesse,
    isLoading,
    erreur,
    chargerLecon,
    togglePlayPause,
    reculer15s,
    avancer15s,
    changerVitesse,
    stop,
  };
}
