import { useCallback, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import type { Alarme } from '../types';

// Configuration du comportement des notifications en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  // Demande de permission au montage
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const planifierAlarme = useCallback(async (alarme: Alarme): Promise<void> => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        throw new Error(
          'Permission refusée pour les notifications. Activez-les dans les réglages.',
        );
      }
    }

    const triggerDate = new Date(alarme.date_heure);

    await Notifications.scheduleNotificationAsync({
      identifier: alarme.id,
      content: {
        title: `📚 SolonApp — ${alarme.sujet_titre}`,
        body:
          alarme.message ??
          `C'est l'heure de réviser : ${alarme.sujet_titre}`,
        data: { alarme_id: alarme.id, sujet_id: alarme.sujet_id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }, []);

  const annulerAlarme = useCallback(async (alarmeId: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(alarmeId);
  }, []);

  const listerAlarmes =
    useCallback(async (): Promise<Notifications.NotificationRequest[]> => {
      return Notifications.getAllScheduledNotificationsAsync();
    }, []);

  return { planifierAlarme, annulerAlarme, listerAlarmes };
}
