import { useState, useEffect, useCallback } from 'react';

export function useNotification() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res === 'granted';
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }, []);

  // Soft medical chime synthesizer using Web Audio API
  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Gentle two-tone chord
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.4);       // C5
      playTone(659.25, now + 0.15, 0.5); // E5
      playTone(783.99, now + 0.3, 0.7);  // G5
    } catch (err) {
      console.warn('Audio chime playback omitted:', err);
    }
  }, []);

  const sendBrowserNotification = useCallback((title, options = {}) => {
    playChime();

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          ...options
        });
        notif.onclick = () => {
          window.focus();
        };
        return notif;
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }
  }, [playChime]);

  return {
    permission,
    requestPermission,
    sendBrowserNotification,
    playChime
  };
}
