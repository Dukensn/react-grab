import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import { useNotifications } from '../hooks/useNotifications';
import type { Alarme, Sujet } from '../types';

interface Props {
  visible: boolean;
  sujets: Sujet[];
  onClose: () => void;
}

export function AlarmModal({ visible, sujets, onClose }: Props) {
  const { planifierAlarme } = useNotifications();

  const [sujetSelectionne, setSujetSelectionne] = useState<Sujet | null>(
    sujets[0] ?? null,
  );
  const [message, setMessage] = useState('');
  const [heure, setHeure] = useState('08:00');
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetEtat = useCallback(() => {
    setSujetSelectionne(sujets[0] ?? null);
    setMessage('');
    setHeure('08:00');
  }, [sujets]);

  const handleFermer = useCallback(() => {
    resetEtat();
    onClose();
  }, [resetEtat, onClose]);

  const handleCreer = useCallback(async () => {
    if (!sujetSelectionne) {
      Alert.alert('Erreur', 'Choisissez un sujet.');
      return;
    }

    const [annee, mois, jour] = dateStr.split('-').map(Number);
    const [hh, mm] = heure.split(':').map(Number);
    const dateHeure = new Date(annee, mois - 1, jour, hh, mm).getTime();

    if (dateHeure <= Date.now()) {
      Alert.alert('Date invalide', 'Choisissez une date dans le futur.');
      return;
    }

    const alarme: Alarme = {
      id: `alarme-${Date.now()}`,
      sujet_id: sujetSelectionne.id,
      sujet_titre: sujetSelectionne.titre,
      date_heure: dateHeure,
      message: message.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      await planifierAlarme(alarme);
      Alert.alert(
        '✅ Alarme créée',
        `Rappel planifié pour ${sujetSelectionne.titre}`,
      );
      handleFermer();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue.';
      Alert.alert('Erreur', msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [sujetSelectionne, dateStr, heure, message, planifierAlarme, handleFermer]);

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
            <Text style={styles.titre}>⏰ Nouvelle alarme</Text>
            <TouchableOpacity onPress={handleFermer} accessibilityRole="button" accessibilityLabel="Fermer">
              <Text style={styles.fermer}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.corps} showsVerticalScrollIndicator={false}>
            {/* Sélection sujet */}
            <Text style={styles.label}>Sujet concerné</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sujetsListe}
            >
              {sujets.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.sujetChip,
                    sujetSelectionne?.id === s.id && styles.sujetChipActif,
                  ]}
                  onPress={() => setSujetSelectionne(s)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sujetSelectionne?.id === s.id }}
                >
                  <Text
                    style={[
                      styles.sujetChipTexte,
                      sujetSelectionne?.id === s.id && styles.sujetChipTexteActif,
                    ]}
                    numberOfLines={2}
                  >
                    {s.titre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date */}
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="2026-07-01"
              placeholderTextColor={Colors.textMuted}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
              accessibilityLabel="Date de l'alarme"
            />

            {/* Heure */}
            <Text style={styles.label}>Heure (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={heure}
              onChangeText={setHeure}
              placeholder="08:00"
              placeholderTextColor={Colors.textMuted}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
              accessibilityLabel="Heure de l'alarme"
            />

            {/* Message optionnel */}
            <Text style={styles.label}>Message (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={message}
              onChangeText={setMessage}
              placeholder="Ex: Réviser les schémas du chapitre 2"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              accessibilityLabel="Message optionnel"
            />

            {/* Bouton créer */}
            <TouchableOpacity
              style={[styles.boutonCreer, isSubmitting && styles.boutonDisabled]}
              onPress={handleCreer}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.boutonCreerTexte}>
                {isSubmitting ? 'Planification...' : 'Créer l\'alarme'}
              </Text>
            </TouchableOpacity>
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
    maxHeight: '80%',
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
    padding: Spacing.base,
    gap: Spacing.xs,
    paddingBottom: Spacing.xxxl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sujetsListe: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sujetChip: {
    maxWidth: 180,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  sujetChipActif: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  sujetChipTexte: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sujetChipTexteActif: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceAlt,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  boutonCreer: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  boutonDisabled: {
    opacity: 0.6,
  },
  boutonCreerTexte: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
  },
});
