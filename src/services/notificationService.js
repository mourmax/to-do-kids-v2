/**
 * NotificationService.js
 * Utility for handling PWA notifications (permissions, push registration)
 */

export const NotificationService = {
    /**
     * Check if notifications are supported by the browser
     */
    isSupported: () => {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    },

    /**
     * Request permission to show notifications
     * @returns {Promise<string>} 'granted', 'denied', or 'default'
     */
    requestPermission: async () => {
        if (!NotificationService.isSupported()) return 'not_supported';

        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error("[NotificationService] Error requesting permission:", error);
            return 'error';
        }
    },

    /**
     * Get current permission status
     */
    getPermissionStatus: () => {
        if (!NotificationService.isSupported()) return 'not_supported';
        return Notification.permission;
    },

    /**
     * Register for push notifications via Service Worker
     * Note: Requires VAPID public key from a server
     * @param {string} vapidPublicKey 
     */
    subscribeToPush: async (vapidPublicKey) => {
        if (!NotificationService.isSupported()) return null;

        try {
            const registration = await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidPublicKey
            });

            console.log("[NotificationService] Push Subscription successful:", subscription);
            return subscription;
        } catch (error) {
            console.error("[NotificationService] Push Subscription failed:", error);
            return null;
        }
    },

    /**
     * Send a local notification (if app is open)
     * @param {string} title 
     * @param {object} options 
     */
    sendLocalNotification: async (title, options = {}) => {
        if (NotificationService.getPermissionStatus() !== 'granted') return;

        const defaultOptions = {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [100, 50, 100],
            ...options
        };

        // Try using Service Worker (more reliable for PWAs/Android)
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration) {
                    registration.showNotification(title, defaultOptions);
                    return;
                }
            } catch (e) {
                console.warn("[NotificationService] SW showNotification failed, falling back", e);
            }
        }

        // Fallback to standard Notification API
        try {
            new Notification(title, defaultOptions);
        } catch (e) {
            console.error("[NotificationService] Notification API failed", e);
        }
    },

    /**
     * Schedule a local notification (Simulation for browser-only mode)
     * Real background scheduling requires a server or PeriodicSync
     */
    scheduleLocalReminder: (title, timeStr, missionId) => {
        if (NotificationService.getPermissionStatus() !== 'granted') return;

        // Parse HH:mm
        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time is in the past today, schedule for tomorrow
        if (scheduledTime < now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();
        console.log(`[NotificationService] Scheduling reminder for ${missionId} at ${timeStr} (in ${Math.round(delay / 1000 / 60)} mins)`);

        setTimeout(() => {
            NotificationService.sendLocalNotification(title, {
                body: "C'est l'heure de ta mission ! ✨",
                tag: `mission-${missionId}`
            });
        }, delay);
    }
};
