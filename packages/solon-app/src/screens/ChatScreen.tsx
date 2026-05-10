import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatBubble } from '../components/ChatBubble';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import { MAX_HISTORIQUE_CHAT } from '../constants/dates';
import { useGemini } from '../hooks/useGemini';
import { useAppContext } from '../context/AppContext';
import type { ChatMessage } from '../types';

const SYSTEM_PROMPT_TEMPLATE = `Tu es Maître Solon, tuteur IA de SolonApp pour lycéens haïtiens préparant le Bac NS4. Tu adaptes tes explications au programme haïtien. Tu utilises un français standard mais tu acceptes les questions en créole et peux mêler les deux. Tu es exigeant, pédagogue, et tu encourages la réflexion plutôt que de donner les réponses directement. Filière de l'élève : {filiere}.`;

function genId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ChatScreen() {
  const { utilisateur } = useAppContext();
  const { text: geminiText } = useGemini();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [saisie, setSaisie] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCharge, setIsCharge] = useState(true);
  const listRef = useRef<FlatList>(null);

  const storageKey = `chat_history_${utilisateur?.id ?? 'guest'}`;

  // Chargement de l'historique au montage
  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((json) => {
      if (json) {
        try {
          setMessages(JSON.parse(json));
        } catch {
          /* historique corrompu — on repart de zéro */
        }
      }
      setIsCharge(false);
    });
  }, [storageKey]);

  // Sauvegarde de l'historique à chaque changement
  useEffect(() => {
    if (!isCharge) {
      AsyncStorage.setItem(storageKey, JSON.stringify(messages)).catch(() => {});
    }
  }, [messages, isCharge, storageKey]);

  const sauvegarderEtTronquer = useCallback(
    (historique: ChatMessage[]): ChatMessage[] => {
      // Tronquer aux N derniers messages pour éviter de dépasser le contexte
      const tronque = historique.slice(-MAX_HISTORIQUE_CHAT);
      return tronque;
    },
    [],
  );

  const envoyerMessage = useCallback(async () => {
    const contenu = saisie.trim();
    if (!contenu || isTyping) return;

    setSaisie('');

    const msgUser: ChatMessage = {
      id: genId(),
      role: 'user',
      content: contenu,
      timestamp: Date.now(),
    };

    const nouveauxMessages = sauvegarderEtTronquer([...messages, msgUser]);
    setMessages(nouveauxMessages);
    setIsTyping(true);

    // Placeholder pour le message de Solon (streaming)
    const idSolon = genId();
    const msgSolonPartiel: ChatMessage = {
      id: idSolon,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msgSolonPartiel]);

    try {
      const filiere = utilisateur?.filiere ?? 'SVT';
      const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{filiere}', filiere);

      // Historique au format attendu par Gemini (sans le message partiel vide)
      const historiquePourGemini = nouveauxMessages.slice(0, -1); // exclut le msg user courant

      let texteAccumule = '';

      await geminiText(
        `${systemPrompt}\n\nQuestion de l'élève : ${contenu}`,
        historiquePourGemini,
        (chunk) => {
          texteAccumule += chunk;
          // Mise à jour en temps réel du message de Solon
          setMessages((prev) =>
            prev.map((m) =>
              m.id === idSolon ? { ...m, content: texteAccumule } : m,
            ),
          );
        },
        { temperature: 0.7, maxOutputTokens: 1024 },
      );

      // Finalisation
      setMessages((prev) => sauvegarderEtTronquer(prev));
    } catch (e) {
      const errMsg =
        e instanceof Error ? e.message : 'Erreur de connexion à Maître Solon.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === idSolon
            ? {
                ...m,
                content: `⚠️ Désolé, je n'ai pas pu répondre. ${errMsg}`,
              }
            : m,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  }, [saisie, isTyping, messages, geminiText, utilisateur, sauvegarderEtTronquer]);

  const viderHistorique = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.removeItem(storageKey);
  }, [storageKey]);

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (isCharge) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.chargement}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* En-tête */}
        <View style={styles.entete}>
          <View style={styles.enteteGauche}>
            <View style={styles.avatarSolon}>
              <Text style={styles.avatarSolonTexte}>S</Text>
            </View>
            <View>
              <Text style={styles.nomSolon}>Maître Solon</Text>
              <Text style={styles.statutSolon}>
                {isTyping ? 'Solon réfléchit...' : 'En ligne'}
              </Text>
            </View>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={viderHistorique}
              style={styles.boutonEffacer}
              accessibilityRole="button"
              accessibilityLabel="Effacer la conversation"
            >
              <Text style={styles.boutonEffacerTexte}>Effacer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Liste messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.bienvenue}>
              <Text style={styles.bienvenueIcone}>👨‍🏫</Text>
              <Text style={styles.bienvenueTitre}>
                Bonjour, je suis Maître Solon
              </Text>
              <Text style={styles.bienvenueTexte}>
                Pose-moi toutes tes questions sur le programme du Bac NS4.
                Je peux aussi t'aider en créole si tu préfères.
              </Text>
            </View>
          }
        />

        {/* Indicateur typing Solon */}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={styles.typingTexte}>Maître Solon réfléchit...</Text>
          </View>
        )}

        {/* Zone de saisie */}
        <View style={styles.saisieContainer}>
          <TextInput
            style={styles.saisieInput}
            value={saisie}
            onChangeText={setSaisie}
            placeholder="Pose ta question à Maître Solon..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={2000}
            returnKeyType="default"
            accessibilityLabel="Saisir un message"
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[
              styles.boutonEnvoyer,
              (!saisie.trim() || isTyping) && styles.boutonEnvoyerDisabled,
            ]}
            onPress={envoyerMessage}
            disabled={!saisie.trim() || isTyping}
            accessibilityRole="button"
            accessibilityLabel="Envoyer le message"
          >
            <Text style={styles.boutonEnvoyerTexte}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  chargement: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  enteteGauche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarSolon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSolonTexte: {
    color: Colors.textOnAccent,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
  },
  nomSolon: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statutSolon: {
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  boutonEffacer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  boutonEffacerTexte: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  liste: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  bienvenue: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  bienvenueIcone: {
    fontSize: 56,
  },
  bienvenueTitre: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  bienvenueTexte: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  typingTexte: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  saisieContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  saisieInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceAlt,
  },
  boutonEnvoyer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boutonEnvoyerDisabled: {
    opacity: 0.4,
  },
  boutonEnvoyerTexte: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
});
