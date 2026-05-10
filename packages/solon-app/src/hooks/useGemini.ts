import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import type { ChatMessage, EvaluationOrale, GeminiContent, GeminiTextOptions } from '../types';
import { GEMINI_CACHE_TTL_MS, GEMINI_MAX_RETRIES } from '../constants/dates';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash';

// ─── Utilitaires réseau ───────────────────────────────────────────────────────

async function fetchAvecRetry(
  url: string,
  options: RequestInit,
  tentative = 0,
): Promise<Response> {
  try {
    const resp = await fetch(url, options);
    if (!resp.ok && tentative < GEMINI_MAX_RETRIES) {
      const delai = Math.pow(2, tentative) * 1000;
      await new Promise((r) => setTimeout(r, delai));
      return fetchAvecRetry(url, options, tentative + 1);
    }
    return resp;
  } catch (err) {
    if (tentative < GEMINI_MAX_RETRIES) {
      const delai = Math.pow(2, tentative) * 1000;
      await new Promise((r) => setTimeout(r, delai));
      return fetchAvecRetry(url, options, tentative + 1);
    }
    throw err;
  }
}

// ─── Cache AsyncStorage ───────────────────────────────────────────────────────

function cacheKey(input: string): string {
  // Clé simple basée sur un hash léger du prompt
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return `gemini_cache_${hash}`;
}

interface CacheEntry {
  reponse: string;
  timestamp: number;
}

async function lireCache(key: string): Promise<string | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    if (!json) return null;
    const entry: CacheEntry = JSON.parse(json);
    if (Date.now() - entry.timestamp > GEMINI_CACHE_TTL_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return entry.reponse;
  } catch {
    return null;
  }
}

async function ecrireCache(key: string, reponse: string): Promise<void> {
  try {
    const entry: CacheEntry = { reponse, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Échec silencieux — le cache est une optimisation, pas critique
  }
}

// ─── Conversion historique chat → format Gemini ───────────────────────────────

function chatVersGemini(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useGemini() {
  /**
   * Appel texte streamé vers Gemini 2.5 Flash.
   * onChunk reçoit chaque fragment de texte en temps réel.
   */
  const text = useCallback(
    async (
      prompt: string,
      historique: ChatMessage[] = [],
      onChunk?: (chunk: string) => void,
      options: GeminiTextOptions = {},
    ): Promise<string> => {
      const { temperature = 0.7, maxOutputTokens = 1024 } = options;

      // Vérification du cache (seulement pour les requêtes sans historique)
      const key = historique.length === 0 ? cacheKey(prompt) : null;
      if (key) {
        const cached = await lireCache(key);
        if (cached) {
          onChunk?.(cached);
          return cached;
        }
      }

      const contents: GeminiContent[] = [
        ...chatVersGemini(historique),
        { role: 'user', parts: [{ text: prompt }] },
      ];

      const body = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      };

      const url = `${GEMINI_BASE_URL}:${onChunk ? 'streamGenerateContent' : 'generateContent'}?key=${GEMINI_API_KEY}`;

      const resp = await fetchAvecRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini API error ${resp.status}: ${errText}`);
      }

      let texteComplet = '';

      if (onChunk && resp.body) {
        // Lecture du stream SSE
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lignes = buffer.split('\n');
          buffer = lignes.pop() ?? '';

          for (const ligne of lignes) {
            if (!ligne.startsWith('data: ')) continue;
            const data = ligne.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const chunk =
                parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
              if (chunk) {
                texteComplet += chunk;
                onChunk(chunk);
              }
            } catch {
              // Fragment JSON incomplet — ignoré
            }
          }
        }
      } else {
        const data = await resp.json();
        texteComplet =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      }

      if (key && texteComplet) {
        await ecrireCache(key, texteComplet);
      }

      return texteComplet;
    },
    [],
  );

  /**
   * Évaluation d'un enregistrement oral par Gemini 2.5 Flash.
   * Envoie le fichier audio en base64 avec le prompt d'évaluation.
   */
  const audio = useCallback(
    async (
      cheminFichier: string,
      titreSujet: string,
    ): Promise<EvaluationOrale> => {
      // Lecture du fichier audio en base64
      const base64 = await FileSystem.readAsStringAsync(cheminFichier, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Détection du MIME type selon l'extension
      const extension = cheminFichier.split('.').pop()?.toLowerCase() ?? 'm4a';
      const mimeType = extension === 'mp3' ? 'audio/mpeg' : 'audio/mp4';

      const systemPrompt = `Tu es Maître Solon, professeur exigeant mais bienveillant.
L'élève vient de répondre à l'oral sur le sujet : ${titreSujet}.
Évalue sa réponse sur 20 selon : exactitude des notions, clarté de l'expression, structure du raisonnement.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{ "note": int, "validation": bool, "feedback": string, "points_forts": [string], "points_a_revoir": [string] }
Validation = true si note >= 12.`;

      const body = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      };

      const url = `${GEMINI_BASE_URL}:generateContent?key=${GEMINI_API_KEY}`;

      const resp = await fetchAvecRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Gemini audio error ${resp.status}: ${errText}`);
      }

      const data = await resp.json();
      const texte = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

      // Nettoyage des éventuels blocs markdown dans la réponse
      const jsonBrut = texte.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      try {
        return JSON.parse(jsonBrut) as EvaluationOrale;
      } catch {
        throw new Error('Réponse Gemini invalide : impossible de parser le JSON');
      }
    },
    [],
  );

  return { text, audio };
}
