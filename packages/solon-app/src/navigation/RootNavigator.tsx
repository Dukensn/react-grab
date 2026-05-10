import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight, Spacing } from '../constants/dimensions';
import { HomeScreen } from '../screens/HomeScreen';
import { PodcastScreen } from '../screens/PodcastScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { PronosticsScreen } from '../screens/PronosticsScreen';
import type { RootTabParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();

// ─── Icônes onglets ────────────────────────────────────────────────────────────

const ICONES: Record<string, { active: string; inactive: string }> = {
  Accueil: { active: '🏠', inactive: '🏠' },
  Podcast: { active: '🎙', inactive: '🎙' },
  Chat: { active: '💬', inactive: '💬' },
  Pronostics: { active: '📊', inactive: '📊' },
};

function TabIcon({
  name,
  focused,
  label,
}: {
  name: string;
  focused: boolean;
  label: string;
}) {
  const icon = ICONES[name] ?? { active: '●', inactive: '○' };
  return (
    <View style={[tabStyles.item, focused && tabStyles.itemActive]}>
      <Text style={tabStyles.icone}>{focused ? icon.active : icon.inactive}</Text>
      <Text
        style={[tabStyles.label, focused && tabStyles.labelActive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.barre,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Accueil" focused={focused} label="Accueil" />
          ),
        }}
      />
      <Tab.Screen
        name="Podcast"
        component={PodcastScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Podcast" focused={focused} label="Podcast" />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Chat" focused={focused} label="Chat" />
          ),
        }}
      />
      <Tab.Screen
        name="Pronostics"
        component={PronosticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Pronostics" focused={focused} label="Pronostics" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  barre: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: Spacing.xs,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 10,
    gap: 2,
    minWidth: 56,
  },
  itemActive: {
    backgroundColor: Colors.primary + '12',
  },
  icone: {
    fontSize: 20,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
