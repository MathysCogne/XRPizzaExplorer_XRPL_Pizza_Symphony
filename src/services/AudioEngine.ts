
import { PizzaType } from '@/components/PizzaTypeSelector';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying: boolean = false;
  private currentPizzaType: PizzaType = 'pepperoni';
  private bpm: number = 80;
  private scheduledNotes: number[] = [];
  
  private pizzaTypeSettings = {
    pepperoni: {
      baseFrequency: 140,
      frequencySpread: 300,
      waveform: 'sawtooth' as OscillatorType,
      notes: [0, 4, 7, 12, 16] // Techno scale
    },
    margherita: {
      baseFrequency: 120,
      frequencySpread: 200,
      waveform: 'sine' as OscillatorType,
      notes: [0, 3, 5, 7, 10] // Jazz scale
    },
    hawaiian: {
      baseFrequency: 160,
      frequencySpread: 250,
      waveform: 'triangle' as OscillatorType,
      notes: [0, 2, 5, 7, 9] // Reggaeton scale
    },
    cheese: {
      baseFrequency: 100,
      frequencySpread: 150,
      waveform: 'sine' as OscillatorType,
      notes: [0, 4, 7, 11, 14] // Vaporwave scale
    }
  };
  
  constructor() {
    // Initialize audio context on user interaction
  }
  
  private initializeAudio() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context initialized');
    } catch (error) {
      console.error('Web Audio API is not supported in this browser', error);
    }
  }
  
  public start(): void {
    this.initializeAudio();
    if (!this.audioContext || this.isPlaying) return;
    
    this.isPlaying = true;
    
    // Create and connect base oscillators
    const settings = this.pizzaTypeSettings[this.currentPizzaType];
    
    // Create 3 oscillators with different frequencies
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const noteIndex = Math.floor(Math.random() * settings.notes.length);
      const semitones = settings.notes[noteIndex];
      const frequency = settings.baseFrequency * Math.pow(2, semitones / 12);
      
      osc.type = settings.waveform;
      osc.frequency.value = frequency + (i * 30);
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.15; // Start quiet
      
      osc.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      osc.start();
      this.oscillators.push(osc);
      this.gainNodes.push(gainNode);
    }
    
    // Start the rhythm loop
    this.scheduleNotes();
  }
  
  public stop(): void {
    if (!this.audioContext || !this.isPlaying) return;
    
    // Stop and disconnect all oscillators
    this.oscillators.forEach((osc, index) => {
      const gainNode = this.gainNodes[index];
      gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.1);
      
      setTimeout(() => {
        osc.stop();
        osc.disconnect();
      }, 100);
    });
    
    // Clear scheduled timeouts
    this.scheduledNotes.forEach(id => clearTimeout(id));
    this.scheduledNotes = [];
    
    this.oscillators = [];
    this.gainNodes = [];
    this.isPlaying = false;
  }
  
  private scheduleNotes(): void {
    if (!this.isPlaying || !this.audioContext) return;
    
    // Calculate time between notes based on BPM
    const noteDuration = 60000 / this.bpm;
    
    const scheduleId = window.setTimeout(() => {
      this.playNote();
      this.scheduleNotes();
    }, noteDuration);
    
    this.scheduledNotes.push(scheduleId);
  }
  
  private playNote(): void {
    if (!this.audioContext || this.gainNodes.length === 0) return;
    
    const now = this.audioContext.currentTime;
    
    // Choose a random oscillator to emphasize
    const randomIndex = Math.floor(Math.random() * this.gainNodes.length);
    
    // Create a short envelope for the note
    const gainNode = this.gainNodes[randomIndex];
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.2);
  }
  
  public changePizzaType(type: PizzaType): void {
    this.currentPizzaType = type;
    
    // If playing, restart with new settings
    if (this.isPlaying) {
      this.stop();
      setTimeout(() => this.start(), 100);
    }
  }
  
  public updateBPM(txCount: number): number {
    // Map transaction count to BPM (80-180)
    const minBPM = 80;
    const maxBPM = 180;
    
    // Simple formula: more transactions = faster tempo
    // We'll cap it at 30 transactions for max BPM
    const cappedTxCount = Math.min(txCount, 30);
    this.bpm = minBPM + (cappedTxCount / 30) * (maxBPM - minBPM);
    
    return Math.round(this.bpm);
  }
  
  public getBPM(): number {
    return Math.round(this.bpm);
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
