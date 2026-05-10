// ─── Filières ────────────────────────────────────────────────────────────────

export type Filiere = 'SVT' | 'LLA' | 'SMP' | 'SES';

// ─── Sujets ──────────────────────────────────────────────────────────────────

export type StatutSujet = 'a_faire' | 'en_cours' | 'valide';

export interface Sujet {
  id: string;
  matiere: string;
  titre: string;
  chapitre: string;
  duree_estimee_min: number;
  statut: StatutSujet;
}

// ─── Leçons Audio ────────────────────────────────────────────────────────────

export interface Lecon {
  id: string;
  titre: string;
  matiere: string;
  duree_sec: number;
  url_distante: string;
  chemin_local: string | null;
  taille_mo: number;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

// ─── Pronostics ───────────────────────────────────────────────────────────────

export type Tendance = 'en_hausse' | 'stable' | 'baisse';
export type NiveauRisque = 'très_élevé' | 'élevé' | 'modéré' | 'faible';

export interface PronosticSujet {
  id: string;
  nom: string;
  matiere: string;
  frequence_pct: number;
  tendance: Tendance;
  formats_frequents: string[];
  conseil_solon: string;
  sous_themes_cles: string[];
}

export interface AngleMort {
  id: string;
  nom: string;
  matiere: string;
  derniere_apparition: number; // année
  risque_surprise: NiveauRisque;
  justification: string;
  conseil_solon: string;
}

export interface PronosticsData {
  themes: PronosticSujet[];
  angles_morts: AngleMort[];
}

// ─── Test Oral ─────────────────────────────────────────────────────────────────

export interface EvaluationOrale {
  note: number;
  validation: boolean;
  feedback: string;
  points_forts: string[];
  points_a_revoir: string[];
}

// ─── Alarme ───────────────────────────────────────────────────────────────────

export interface Alarme {
  id: string;
  sujet_id: string;
  sujet_titre: string;
  date_heure: number; // timestamp
  message?: string;
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

export interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiTextOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootTabParamList = {
  Accueil: undefined;
  Podcast: undefined;
  Chat: undefined;
  Pronostics: undefined;
};

export type AccueilStackParamList = {
  AccueilMain: undefined;
  SujetDetail: { sujet: Sujet };
};

export type PodcastStackParamList = {
  PodcastMain: undefined;
};

export type PronosticsStackParamList = {
  PronosticsMain: undefined;
  PronosticDetail: { sujet: PronosticSujet };
  AngleMortDetail: { sujet: AngleMort };
};
