import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Filiere, Lecon, StatutSujet, Sujet } from '../types';
import sujetsData from '../data/sujets.json';
import leconsData from '../data/lecons.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Utilisateur {
  id: string;
  nom: string;
  filiere: Filiere;
}

interface AppState {
  utilisateur: Utilisateur | null;
  sujets: Sujet[];
  lecons: Lecon[];
  leconsTelechargees: Set<string>; // IDs des leçons locales
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_UTILISATEUR'; payload: Utilisateur }
  | { type: 'SET_SUJETS'; payload: Sujet[] }
  | { type: 'UPDATE_STATUT_SUJET'; payload: { id: string; statut: StatutSujet } }
  | { type: 'SET_LECONS'; payload: Lecon[] }
  | { type: 'MARQUER_LECON_TELECHARGEE'; payload: { id: string; chemin: string } }
  | { type: 'SET_LOADING'; payload: boolean };

interface AppContextValue extends AppState {
  changerFiliere: (filiere: Filiere) => void;
  mettreAJourStatutSujet: (id: string, statut: StatutSujet) => void;
  marquerLeconTelechargee: (id: string, chemin: string) => void;
  progressionGlobale: number; // 0-100
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_UTILISATEUR':
      return { ...state, utilisateur: action.payload };

    case 'SET_SUJETS':
      return { ...state, sujets: action.payload };

    case 'UPDATE_STATUT_SUJET':
      return {
        ...state,
        sujets: state.sujets.map((s) =>
          s.id === action.payload.id
            ? { ...s, statut: action.payload.statut }
            : s,
        ),
      };

    case 'SET_LECONS':
      return { ...state, lecons: action.payload };

    case 'MARQUER_LECON_TELECHARGEE': {
      const lecons = state.lecons.map((l) =>
        l.id === action.payload.id
          ? { ...l, chemin_local: action.payload.chemin }
          : l,
      );
      const leconsTelechargees = new Set(state.leconsTelechargees);
      leconsTelechargees.add(action.payload.id);
      return { ...state, lecons, leconsTelechargees };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

const UTILISATEUR_PAR_DEFAUT: Utilisateur = {
  id: 'user-001',
  nom: 'Élève',
  filiere: 'SVT',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    utilisateur: UTILISATEUR_PAR_DEFAUT,
    sujets: [],
    lecons: leconsData as Lecon[],
    leconsTelechargees: new Set<string>(),
    isLoading: true,
  });

  // Chargement initial depuis AsyncStorage
  useEffect(() => {
    async function chargerDonnees() {
      try {
        const userId = state.utilisateur?.id ?? UTILISATEUR_PAR_DEFAUT.id;

        // Profil utilisateur
        const userJson = await AsyncStorage.getItem('utilisateur');
        const utilisateur: Utilisateur = userJson
          ? JSON.parse(userJson)
          : UTILISATEUR_PAR_DEFAUT;

        dispatch({ type: 'SET_UTILISATEUR', payload: utilisateur });

        // Sujets avec statuts persistés
        const sujetsBase =
          (sujetsData as Record<string, Sujet[]>)[utilisateur.filiere] ?? [];
        const statutsJson = await AsyncStorage.getItem(`sujets_${userId}`);
        const statuts: Record<string, StatutSujet> = statutsJson
          ? JSON.parse(statutsJson)
          : {};

        const sujetsAvecStatuts = sujetsBase.map((s) => ({
          ...s,
          statut: statuts[s.id] ?? s.statut,
        }));

        dispatch({ type: 'SET_SUJETS', payload: sujetsAvecStatuts });

        // Leçons téléchargées
        const leconsJson = await AsyncStorage.getItem(`lecons_${userId}`);
        if (leconsJson) {
          const leconsLocales: Record<string, string> = JSON.parse(leconsJson);
          const leconsMAJ = (leconsData as Lecon[]).map((l) =>
            leconsLocales[l.id]
              ? { ...l, chemin_local: leconsLocales[l.id] }
              : l,
          );
          dispatch({ type: 'SET_LECONS', payload: leconsMAJ });
        }
      } catch (e) {
        // En cas d'erreur, on charge quand même les données par défaut
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changerFiliere = useCallback(
    async (filiere: Filiere) => {
      if (!state.utilisateur) return;
      const utilisateur = { ...state.utilisateur, filiere };
      dispatch({ type: 'SET_UTILISATEUR', payload: utilisateur });
      await AsyncStorage.setItem('utilisateur', JSON.stringify(utilisateur));

      const sujetsBase = (sujetsData as Record<string, Sujet[]>)[filiere] ?? [];
      dispatch({ type: 'SET_SUJETS', payload: sujetsBase });
    },
    [state.utilisateur],
  );

  const mettreAJourStatutSujet = useCallback(
    async (id: string, statut: StatutSujet) => {
      dispatch({ type: 'UPDATE_STATUT_SUJET', payload: { id, statut } });

      const userId = state.utilisateur?.id ?? UTILISATEUR_PAR_DEFAUT.id;
      const key = `sujets_${userId}`;
      const json = await AsyncStorage.getItem(key);
      const statuts: Record<string, StatutSujet> = json ? JSON.parse(json) : {};
      statuts[id] = statut;
      await AsyncStorage.setItem(key, JSON.stringify(statuts));
    },
    [state.utilisateur],
  );

  const marquerLeconTelechargee = useCallback(
    async (id: string, chemin: string) => {
      dispatch({ type: 'MARQUER_LECON_TELECHARGEE', payload: { id, chemin } });

      const userId = state.utilisateur?.id ?? UTILISATEUR_PAR_DEFAUT.id;
      const key = `lecons_${userId}`;
      const json = await AsyncStorage.getItem(key);
      const locales: Record<string, string> = json ? JSON.parse(json) : {};
      locales[id] = chemin;
      await AsyncStorage.setItem(key, JSON.stringify(locales));
    },
    [state.utilisateur],
  );

  // Calcul de la progression globale
  const progressionGlobale =
    state.sujets.length === 0
      ? 0
      : Math.round(
          (state.sujets.filter((s) => s.statut === 'valide').length /
            state.sujets.length) *
            100,
        );

  return (
    <AppContext.Provider
      value={{
        ...state,
        changerFiliere,
        mettreAJourStatutSujet,
        marquerLeconTelechargee,
        progressionGlobale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext doit être utilisé dans un AppProvider');
  }
  return ctx;
}
