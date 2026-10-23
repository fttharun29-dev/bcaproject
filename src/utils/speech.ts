// Speech Synthesis utility for announcing newly identified objects

class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private lastAnnounced: Set<string> = new Set();
  private lastSpokenTime = 0;
  private isSpeaking = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public announceObjects(classes: string[], enabled: boolean = true) {
    if (!enabled || !this.synth || classes.length === 0) return;

    const now = Date.now();
    // Only speak at most once every 3.5 seconds to prevent spam
    if (now - this.lastSpokenTime < 3500 || this.synth.speaking) {
      return;
    }

    // Find new classes not announced recently
    const newClasses = classes.filter((c) => !this.lastAnnounced.has(c));
    const targetClasses = newClasses.length > 0 ? newClasses : (now - this.lastSpokenTime > 8000 ? classes.slice(0, 3) : []);

    if (targetClasses.length === 0) return;

    // Build natural announcement text
    const uniqueTargets = Array.from(new Set(targetClasses));
    let text = '';
    if (uniqueTargets.length === 1) {
      text = uniqueTargets[0];
    } else if (uniqueTargets.length === 2) {
      text = `${uniqueTargets[0]} and ${uniqueTargets[1]}`;
    } else {
      text = `${uniqueTargets[0]}, ${uniqueTargets[1]}, and ${uniqueTargets.length - 2} more`;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      this.synth.cancel(); // Cancel any lingering utterance
      this.synth.speak(utterance);
      this.lastSpokenTime = now;

      // Update recently announced set
      this.lastAnnounced = new Set(uniqueTargets);
    } catch {
      // Speech synthesis may be blocked by browser policy without user gesture
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechManager = new SpeechManager();
