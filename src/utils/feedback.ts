type HapticLevel = 'light' | 'medium' | 'heavy';
type HapticNotification = 'success' | 'warning' | 'error';

interface TelegramHapticFeedback {
  impactOccurred?: (style: HapticLevel) => void;
  notificationOccurred?: (type: HapticNotification) => void;
}

interface TelegramWebApp {
  HapticFeedback?: TelegramHapticFeedback;
}

interface TelegramGlobal {
  WebApp?: TelegramWebApp;
}

let audioCtx: AudioContext | null = null;

function getTelegramHaptics(): TelegramHapticFeedback | undefined {
  const tg = (window as Window & { Telegram?: TelegramGlobal }).Telegram;
  return tg?.WebApp?.HapticFeedback;
}

function getAudioContext(): AudioContext | null {
  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

export function triggerPlacementHaptic(): void {
  try {
    getTelegramHaptics()?.impactOccurred?.('light');
  } catch {
    // ignore
  }

  try {
    navigator.vibrate?.(10);
  } catch {
    // ignore
  }
}

export function triggerLineClearFeedback(linesCleared: number): void {
  const haptics = getTelegramHaptics();
  try {
    if (linesCleared >= 4) {
      haptics?.notificationOccurred?.('success');
      haptics?.impactOccurred?.('heavy');
    } else if (linesCleared >= 2) {
      haptics?.notificationOccurred?.('success');
      haptics?.impactOccurred?.('medium');
    } else {
      haptics?.impactOccurred?.('medium');
    }
  } catch {
    // ignore
  }

  try {
    if (linesCleared >= 4) {
      navigator.vibrate?.([50, 20, 80, 20, 120]);
    } else if (linesCleared >= 2) {
      navigator.vibrate?.([40, 20, 60, 20, 80]);
    } else {
      navigator.vibrate?.([30, 15, 50]);
    }
  } catch {
    // ignore
  }

  playLineClearSound(linesCleared);
}

function playLineClearSound(linesCleared: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }

  const now = ctx.currentTime;
  const tones = Math.max(1, Math.min(4, linesCleared));
  // C major pentatonic: C5, E5, G5, C6
  const freqs = [523.25, 659.26, 783.99, 1046.5];

  for (let i = 0; i < tones; i++) {
    const t = now + i * 0.1;
    const freq = freqs[i];

    // Sine fundamental — smooth marimba body
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.15, t + 0.006);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.36);

    // 4th harmonic — brief "knock" gives marimba attack character
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 4;
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.06, t + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.065);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.08);
  }
}
