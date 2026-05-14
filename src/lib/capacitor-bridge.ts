/**
 * Capacitor Native Bridge for Invoicaty
 * 
 * This script is injected into the WebView to provide native functionality.
 * It detects if running inside Capacitor and exposes native APIs.
 */

(function () {
  'use strict';

  // Detect if we're running inside Capacitor
  const isNative = typeof window !== 'undefined' && window.Capacitor !== undefined;

  // Expose platform detection globally
  window.__INVOICATY_NATIVE__ = isNative;
  window.__INVOICATY_PLATFORM__ = isNative ? (window.Capacitor.getPlatform() || 'web') : 'web';

  if (!isNative) return;

  console.log('[Invoicaty] Running inside native app:', window.__INVOICATY_PLATFORM__);

  // --- Status Bar ---
  async function setupStatusBar() {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
    } catch (e) {
      console.warn('[Invoicaty] StatusBar plugin not available:', e);
    }
  }

  // --- Splash Screen ---
  async function hideSplash() {
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide({ fadeOutDuration: 500 });
    } catch (e) {
      console.warn('[Invoicaty] SplashScreen plugin not available:', e);
    }
  }

  // --- Push Notifications ---
  async function setupPushNotifications() {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive === 'granted') {
        await PushNotifications.register();
      }

      PushNotifications.addListener('registration', (token) => {
        console.log('[Invoicaty] Push token:', token.value);
        // Send token to server for later use
        fetch('https://invoicaty.com/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value, platform: window.__INVOICATY_PLATFORM__ }),
        }).catch(() => { /* silent fail */ });
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Invoicaty] Push received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[Invoicaty] Push action:', action);
        // Navigate to relevant page based on notification data
        if (action.notification.data?.url) {
          window.location.href = action.notification.data.url;
        }
      });
    } catch (e) {
      console.warn('[Invoicaty] PushNotifications plugin not available:', e);
    }
  }

  // --- Keyboard ---
  async function setupKeyboard() {
    try {
      const { Keyboard } = await import('@capacitor/keyboard');
      Keyboard.addListener('keyboardWillShow', (info) => {
        document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      });
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.setProperty('--keyboard-height', '0px');
      });
    } catch (e) {
      console.warn('[Invoicaty] Keyboard plugin not available:', e);
    }
  }

  // --- Initialize ---
  async function init() {
    setupStatusBar();
    setupKeyboard();
    setupPushNotifications();

    // Hide splash after a short delay to ensure content is loaded
    setTimeout(() => hideSplash(), 1500);
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
