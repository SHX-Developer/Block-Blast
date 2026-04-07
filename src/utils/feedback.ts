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
  try {
    getTelegramHaptics()?.notificationOccurred?.('success');
    getTelegramHaptics()?.impactOccurred?.('medium');
  } catch {
    // ignore
  }

  try {
    navigator.vibrate?.([16, 18, 16]);
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
  const freqs = [760, 980, 1240, 1460];

  for (let i = 0; i < tones; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.06;
    const end = start + 0.1;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqs[i], start);
    osc.frequency.exponentialRampToValueAtTime(freqs[i] * 1.08, end);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(end + 0.02);
  }
}
