// Date de l'examen d'État NS4 — à mettre à jour chaque année scolaire
// Format ISO 8601 : YYYY-MM-DD
export const DATE_EXAMEN_ETAT = '2026-07-15';

// Seuils d'urgence pour le compte à rebours
export const SEUIL_URGENCE_HAUTE = 30;   // jours
export const SEUIL_URGENCE_MOYENNE = 60; // jours

// Durée max du test oral en secondes (3 minutes)
export const DUREE_MAX_ORAL_SEC = 180;

// Nombre de messages conservés dans l'historique chat
export const MAX_HISTORIQUE_CHAT = 50;

// TTL du cache Gemini en millisecondes (24h)
export const GEMINI_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Retries Gemini
export const GEMINI_MAX_RETRIES = 3;

// Note minimale de validation
export const NOTE_VALIDATION_MIN = 12;
