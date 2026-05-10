import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlarmModal } from '../components/AlarmModal';
import { CountdownBanner } from '../components/CountdownBanner';
import { OralTestModal } from '../components/OralTestModal';
import { ProgressBar } from '../components/ProgressBar';
import { SubjectCard } from '../components/SubjectCard';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  CardElevation,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import { useAppContext } from '../context/AppContext';
import type { Sujet } from '../types';

type FiltreStatut = 'tous' | 'a_faire' | 'en_cours' | 'valide';

const FILTRE_LABELS: Record<FiltreStatut, string> = {
  tous: 'Tous',
  a_faire: 'À faire',
  en_cours: 'En cours',
  valide: 'Validés',
};

function trierSujets(sujets: Sujet[]): Sujet[] {
  const ordre: Record<string, number> = { a_faire: 0, en_cours: 1, valide: 2 };
  return [...sujets].sort((a, b) => ordre[a.statut] - ordre[b.statut]);
}

export function HomeScreen() {
  const { sujets, progressionGlobale, mettreAJourStatutSujet, utilisateur } =
    useAppContext();

  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous');
  const [sujetOral, setSujetOral] = useState<Sujet | null>(null);
  const [showAlarm, setShowAlarm] = useState(false);

  const sujetsFiltres = useMemo(() => {
    const base = filtreStatut === 'tous'
      ? sujets
      : sujets.filter((s) => s.statut === filtreStatut);
    return trierSujets(base);
  }, [sujets, filtreStatut]);

  const handleEtudier = useCallback((sujet: Sujet) => {
    // Passe le statut en "en_cours" si c'est "à faire"
    if (sujet.statut === 'a_faire') {
      mettreAJourStatutSujet(sujet.id, 'en_cours');
    }
    // Navigation vers fiche sujet (placeholder)
  }, [mettreAJourStatutSujet]);

  const handleOuvrirTest = useCallback((sujet: Sujet) => {
    setSujetOral(sujet);
  }, []);

  const handleValide = useCallback(
    (sujet: Sujet) => {
      mettreAJourStatutSujet(sujet.id, 'valide');
    },
    [mettreAJourStatutSujet],
  );

  const renderHeader = useCallback(
    () => (
      <>
        {/* Salutation */}
        <View style={styles.salutation}>
          <Text style={styles.salutationTexte}>
            Bonjour, {utilisateur?.nom ?? 'Élève'} 👋
          </Text>
          <Text style={styles.filiereTexte}>Filière {utilisateur?.filiere}</Text>
        </View>

        <CountdownBanner />
        <ProgressBar pourcent={progressionGlobale} />

        {/* En-tête liste */}
        <View style={styles.listeEntete}>
          <Text style={styles.listeTitle}>Mes sujets</Text>
          <Text style={styles.listeCount}>{sujetsFiltres.length} sujet(s)</Text>
        </View>

        {/* Filtres */}
        <View style={styles.filtresContainer}>
          {(Object.keys(FILTRE_LABELS) as FiltreStatut[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtreChip, filtreStatut === f && styles.filtreChipActif]}
              onPress={() => setFiltreStatut(f)}
              accessibilityRole="button"
              accessibilityState={{ selected: filtreStatut === f }}
            >
              <Text
                style={[
                  styles.filtreChipTexte,
                  filtreStatut === f && styles.filtreChipTexteActif,
                ]}
              >
                {FILTRE_LABELS[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    ),
    [utilisateur, progressionGlobale, sujetsFiltres.length, filtreStatut],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.vide}>
        <Text style={styles.videIcone}>📚</Text>
        <Text style={styles.videTexte}>
          {filtreStatut === 'tous'
            ? 'Aucun sujet pour ta filière.'
            : `Aucun sujet "${FILTRE_LABELS[filtreStatut]}".`}
        </Text>
      </View>
    ),
    [filtreStatut],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={sujetsFiltres}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubjectCard
            sujet={item}
            onEtudier={handleEtudier}
            onValider={handleOuvrirTest}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.liste}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB Alarme */}
      <TouchableOpacity
        style={[styles.fab, CardElevation.md]}
        onPress={() => setShowAlarm(true)}
        accessibilityRole="button"
        accessibilityLabel="Créer une alarme"
      >
        <Text style={styles.fabTexte}>+ Alarme</Text>
      </TouchableOpacity>

      {/* Modal Test Oral */}
      <OralTestModal
        visible={sujetOral !== null}
        sujet={sujetOral}
        onClose={() => setSujetOral(null)}
        onValide={handleValide}
      />

      {/* Modal Alarme */}
      <AlarmModal
        visible={showAlarm}
        sujets={sujets}
        onClose={() => setShowAlarm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  liste: {
    paddingBottom: 100,
  },
  salutation: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    gap: 2,
  },
  salutationTexte: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  filiereTexte: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  listeEntete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  listeTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  listeCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filtresContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  filtreChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtreChipActif: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filtreChipTexte: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  filtreChipTexteActif: {
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
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.base,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xxl,
  },
  fabTexte: {
    color: Colors.textOnAccent,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
  },
});
