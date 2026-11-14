/**
 * Synthesizes a clean futuristic chime using Web Audio API.
 * Zero external audio files required.
 */
export function playChimeSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

      gain.gain.setValueAtTime(0.08, startTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + idx * 0.08 + 0.65);
    });
  } catch (err) {
    // AudioContext blocked by browser autoplay policy until user gesture
  }
}
