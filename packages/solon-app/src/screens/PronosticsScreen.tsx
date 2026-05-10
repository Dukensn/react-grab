import React, { useCallback, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AngleMortCard, PronosticSujetCard } from '../components/PronosticCard';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import pronosticsData from '../data/pronostics.json';
import type { AngleMort, PronosticSujet, PronosticsData } from '../types';

type OngletActif = 'frequents' | 'angles_morts';

const data = pronosticsData as PronosticsData;

const sujetsFrequents = [...data.themes].sort(
  (a, b) => b.frequence_pct - a.frequence_pct,
);

const RISQUE_ORDRE: Record<string, number> = {
  très_élevé: 0,
  élevé: 1,
  modéré: 2,
  faible: 3,
};

const anglesMorts = [...data.angles_morts].sort(
  (a, b) =>
    (RISQUE_ORDRE[a.risque_surprise] ?? 99) -
    (RISQUE_ORDRE[b.risque_surprise] ?? 99),
);

// ─── Écran Détail Sujet Fréquent ──────────────────────────────────────────────

function DetailSujet({
  sujet,
  onRetour,
}: {
  sujet: PronosticSujet;
  onRetour: () => void;
}) {
  return (
    <ScrollView
      style={styles.detailContainer}
      contentContainerStyle={styles.detailContenu}
    >
      <TouchableOpacity
        onPress={onRetour}
        style={styles.retour}
        accessibilityRole="button"
        accessibilityLabel="Retour"
      >
        <Text style={styles.retourTexte}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.detailMatiere}>{sujet.matiere}</Text>
      <Text style={styles.detailNom}>{sujet.nom}</Text>

      <View style={styles.detailFrequence}>
        <Text style={styles.detailFrequenceNombre}>{sujet.frequence_pct}%</Text>
        <Text style={styles.detailFrequenceLabel}>de chance de tomber</Text>
      </View>

      <Text style={styles.sectionTitre}>📋 Formats fréquents</Text>
      {sujet.formats_frequents.map((f, i) => (
        <Text key={i} style={styles.listItem}>
          • {f}
        </Text>
      ))}

      <Text style={styles.sectionTitre}>🎯 Sous-thèmes clés</Text>
      {sujet.sous_themes_cles.map((s, i) => (
        <Text key={i} style={styles.listItem}>
          • {s}
        </Text>
      ))}

      <View style={styles.conseilContainer}>
        <Text style={styles.conseilLabel}>💬 Conseil de Maître Solon</Text>
        <Text style={styles.conseilTexte}>{sujet.conseil_solon}</Text>
      </View>
    </ScrollView>
  );
}

// ─── Écran Détail Angle Mort ──────────────────────────────────────────────────

function DetailAngle({
  sujet,
  onRetour,
}: {
  sujet: AngleMort;
  onRetour: () => void;
}) {
  return (
    <ScrollView
      style={styles.detailContainer}
      contentContainerStyle={styles.detailContenu}
    >
      <TouchableOpacity
        onPress={onRetour}
        style={styles.retour}
        accessibilityRole="button"
        accessibilityLabel="Retour"
      >
        <Text style={styles.retourTexte}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.detailMatiere}>{sujet.matiere}</Text>
      <Text style={styles.detailNom}>{sujet.nom}</Text>

      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Dernière apparition</Text>
          <Text style={styles.metaValeur}>{sujet.derniere_apparition}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Risque surprise</Text>
          <Text style={[styles.metaValeur, { color: Colors.error }]}>
            {sujet.risque_surprise}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitre}>📊 Pourquoi c'est risqué</Text>
      <Text style={styles.justification}>{sujet.justification}</Text>

      <View style={styles.conseilContainer}>
        <Text style={styles.conseilLabel}>💬 Conseil de Maître Solon</Text>
        <Text style={styles.conseilTexte}>{sujet.conseil_solon}</Text>
      </View>
    </ScrollView>
  );
}

// ─── Écran Principal Pronostics ───────────────────────────────────────────────

export function PronosticsScreen() {
  const [onglet, setOnglet] = useState<OngletActif>('frequents');
  const [detailSujet, setDetailSujet] = useState<PronosticSujet | null>(null);
  const [detailAngle, setDetailAngle] = useState<AngleMort | null>(null);

  const handlePressSujet = useCallback((s: PronosticSujet) => {
    setDetailSujet(s);
  }, []);

  const handlePressAngle = useCallback((a: AngleMort) => {
    setDetailAngle(a);
  }, []);

  // Affichage du détail en overlay
  if (detailSujet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DetailSujet sujet={detailSujet} onRetour={() => setDetailSujet(null)} />
      </SafeAreaView>
    );
  }

  if (detailAngle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DetailAngle sujet={detailAngle} onRetour={() => setDetailAngle(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* En-tête */}
      <View style={styles.entete}>
        <Text style={styles.titreEcran}>Pronostics Bac NS4</Text>
        <Text style={styles.sousTitre}>
          Analyse basée sur les 30 dernières années d'examens
        </Text>

        {/* Onglets */}
        <View style={styles.onglets}>
          <TouchableOpacity
            style={[styles.onglet, onglet === 'frequents' && styles.ongletActif]}
            onPress={() => setOnglet('frequents')}
            accessibilityRole="tab"
            accessibilityState={{ selected: onglet === 'frequents' }}
          >
            <Text
              style={[
                styles.ongletTexte,
                onglet === 'frequents' && styles.ongletTexteActif,
              ]}
            >
              Sujets fréquents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.onglet, onglet === 'angles_morts' && styles.ongletActif]}
            onPress={() => setOnglet('angles_morts')}
            accessibilityRole="tab"
            accessibilityState={{ selected: onglet === 'angles_morts' }}
          >
            <Text
              style={[
                styles.ongletTexte,
                onglet === 'angles_morts' && styles.ongletTexteActif,
              ]}
            >
              Angles morts ⚠️
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu */}
      {onglet === 'frequents' ? (
        <FlatList
          data={sujetsFrequents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PronosticSujetCard sujet={item} onPress={handlePressSujet} />
          )}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Text style={styles.videTexte}>Aucun pronostic disponible.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={anglesMorts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AngleMortCard sujet={item} onPress={handlePressAngle} />
          )}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Text style={styles.videTexte}>Aucun angle mort répertorié.</Text>
            </View>
          }
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
  entete: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  onglets: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  onglet: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ongletActif: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ongletTexte: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  ongletTexteActif: {
    color: Colors.textOnPrimary,
  },
  liste: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  vide: {
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  videTexte: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  // Styles détail
  detailContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  detailContenu: {
    padding: Spacing.base,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  retour: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  retourTexte: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  detailMatiere: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
  },
  detailNom: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  detailFrequence: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  detailFrequenceNombre: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  detailFrequenceLabel: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  sectionTitre: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  listItem: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    paddingLeft: Spacing.sm,
  },
  conseilContainer: {
    backgroundColor: Colors.accent + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    marginTop: Spacing.sm,
  },
  conseilLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  conseilTexte: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  metaItem: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  metaLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: FontWeight.semibold,
  },
  metaValeur: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  justification: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
