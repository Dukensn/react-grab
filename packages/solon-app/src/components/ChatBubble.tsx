import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Colors } from '../constants/colors';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from '../constants/dimensions';
import type { ChatMessage } from '../types';

interface Props {
  message: ChatMessage;
}

function formatHeure(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('fr-HT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.containerUser}>
        <View style={styles.bulleUser}>
          <Text style={styles.texteUser}>{message.content}</Text>
        </View>
        <Text style={styles.horodatage}>{formatHeure(message.timestamp)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.containerSolon}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexte}>S</Text>
      </View>
      <View style={styles.corps}>
        <View style={styles.bulleSolon}>
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        </View>
        <Text style={styles.horodatage}>{formatHeure(message.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerUser: {
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    gap: 4,
  },
  bulleUser: {
    backgroundColor: Colors.bubbleUser,
    borderRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '80%',
  },
  texteUser: {
    color: Colors.bubbleUserText,
    fontSize: FontSize.base,
    lineHeight: 22,
  },
  containerSolon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 20, // compense l'horodatage
  },
  avatarTexte: {
    color: Colors.textOnAccent,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  corps: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  bulleSolon: {
    backgroundColor: Colors.bubbleSolon,
    borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '90%',
    // Ombre légère
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  horodatage: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

// Styles Markdown pour les réponses de Solon
const markdownStyles = {
  body: {
    color: Colors.bubbleSolonText,
    fontSize: FontSize.base,
    lineHeight: 22,
  },
  heading1: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },
  heading2: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },
  strong: {
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  em: {
    fontStyle: 'italic' as const,
    color: Colors.textSecondary,
  },
  bullet_list: {
    marginVertical: Spacing.xs,
  },
  list_item: {
    marginVertical: 2,
  },
  code_inline: {
    backgroundColor: Colors.surfaceAlt,
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: FontSize.sm,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
};
