import { PizzaType } from '@/components/PizzaTypeSelector';
import { Transaction } from './XrplService';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentPizzaType: PizzaType = 'pepperoni';
  private bpm: number = 80;
  private scheduledNotes: number[] = [];
  private activeNotes: Map<string, { oscillator: OscillatorNode; gain: GainNode }> = new Map();
  
  // Scales musicales pour chaque type de pizza
  private pizzaTypeSettings = {
    pepperoni: {
      baseFrequency: 110, // A2 (plus grave)
      waveform: 'sawtooth' as OscillatorType,
      scale: [0, 2, 4, 5, 7, 9, 11], // Major scale (C major)
      chords: [[0, 4, 7], [2, 5, 9], [4, 7, 11]], // I, ii, iii chords
      style: 'techno'
    },
    margherita: {
      baseFrequency: 98, // G2 (plus grave)
      waveform: 'sine' as OscillatorType,
      scale: [0, 2, 3, 5, 7, 8, 10], // Natural minor scale
      chords: [[0, 3, 7], [3, 7, 10], [5, 8, 12]], // i, III, v chords
      style: 'jazz'
    },
    hawaiian: {
      baseFrequency: 87.3, // F2 (plus grave)
      waveform: 'triangle' as OscillatorType,
      scale: [0, 2, 4, 7, 9], // Pentatonic major
      chords: [[0, 4, 7], [2, 7, 9], [4, 9, 12]], // Reggae vibes
      style: 'reggae'
    },
    cheese: {
      baseFrequency: 73.4, // D2 (plus grave)
      waveform: 'sine' as OscillatorType,
      scale: [0, 2, 4, 6, 9, 11], // Lydian mode (dreamy)
      chords: [[0, 4, 6, 11], [2, 6, 9], [4, 9, 11]], // Vaporwave chords
      style: 'ambient'
    }
  };
  
  private droneOscillator: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  
  constructor() {
    // Initialize audio context on user interaction
  }
  
  private initializeAudio() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
      
      console.log('🎵 Audio context initialized');
    } catch (error) {
      console.error('Web Audio API is not supported in this browser', error);
    }
  }
  
  public start(): void {
    this.initializeAudio();
    if (!this.audioContext || this.isPlaying) return;
    
    this.isPlaying = true;
    this.startBackgroundDrone();
    console.log('🎶 Audio engine started with background drone');
  }
  
  public stop(): void {
    if (!this.audioContext || !this.isPlaying) return;
    
    // Stop background drone
    this.stopBackgroundDrone();
    
    // Stop all active notes
    this.activeNotes.forEach(({ oscillator, gain }) => {
      gain.gain.setValueAtTime(gain.gain.value, this.audioContext!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.1);
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
      }, 100);
    });
    
    this.activeNotes.clear();
    
    // Clear scheduled timeouts
    this.scheduledNotes.forEach(id => clearTimeout(id));
    this.scheduledNotes = [];
    
    this.isPlaying = false;
    console.log('🔇 Audio engine stopped');
  }
  
  private startBackgroundDrone(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const settings = this.pizzaTypeSettings[this.currentPizzaType];
    
    // Créer un drone de fond sur la fondamentale
    this.droneOscillator = this.audioContext.createOscillator();
    this.droneGain = this.audioContext.createGain();
    
    this.droneOscillator.type = 'sine';
    this.droneOscillator.frequency.value = settings.baseFrequency;
    
    this.droneGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.droneGain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 2); // Fade in sur 2 secondes
    
    this.droneOscillator.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    
    this.droneOscillator.start();
  }
  
  private stopBackgroundDrone(): void {
    if (this.droneOscillator && this.droneGain && this.audioContext) {
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, this.audioContext.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
      
      setTimeout(() => {
        if (this.droneOscillator) {
          this.droneOscillator.stop();
          this.droneOscillator.disconnect();
          this.droneOscillator = null;
        }
        if (this.droneGain) {
          this.droneGain.disconnect();
          this.droneGain = null;
        }
      }, 1000);
    }
  }
  
  // Génère de la musique basée sur une vraie transaction XRPL
  public playTransactionMusic(transaction: Transaction): void {
    if (!this.audioContext || !this.isPlaying || !this.masterGain) return;
    
    console.log('🎵 Playing music for transaction:', transaction.type, transaction.amount);
    
    const settings = this.pizzaTypeSettings[this.currentPizzaType];
    
    // 1. Générer la note principale basée sur le hash de la transaction
    const hashNote = this.hashToNote(transaction.id, settings);
    
    // 2. Générer des harmonies basées sur le montant
    const harmonies = this.amountToHarmonies(transaction.amount, settings);
    
    // 3. Durée basée sur le type de transaction et les frais (plus longue)
    const duration = this.calculateNoteDuration(transaction);
    
    // 4. Jouer la mélodie avec échos pour combler les silences
    this.playMelody(hashNote, harmonies, duration, transaction);
  }
  
  private hashToNote(hash: string, settings: any): number {
    // Utiliser les caractères hexadécimaux du hash pour générer une note
    const hex = hash.replace(/[^0-9A-Fa-f]/g, '');
    let noteValue = 0;
    
    // Sommer les valeurs hex pour obtenir un index de note
    for (let i = 0; i < Math.min(hex.length, 8); i++) {
      noteValue += parseInt(hex[i], 16);
    }
    
    const scaleIndex = noteValue % settings.scale.length;
    // Réduire l'octave shift pour des notes plus graves et mieux réparties
    const octaveShift = Math.floor(noteValue / settings.scale.length) % 2; // 0-1 octaves seulement
    
    return settings.scale[scaleIndex] + (octaveShift * 12);
  }
  
  private amountToHarmonies(amount: number, settings: any): number[] {
    // Générer des harmonies basées sur le montant de la transaction
    const harmonies: number[] = [];
    
    if (amount > 0) {
      // Utiliser les décimales pour déterminer les harmonies
      const amountStr = amount.toString();
      const decimals = amountStr.split('.')[1] || '0';
      
      // Chaque chiffre des décimales génère une harmonie
      for (let i = 0; i < Math.min(decimals.length, 2); i++) { // Réduire à 2 harmonies max
        const digit = parseInt(decimals[i]);
        const chordIndex = digit % settings.chords.length;
        harmonies.push(...settings.chords[chordIndex]);
      }
    } else {
      // Pour les transactions sans montant, utiliser un accord de base
      harmonies.push(...settings.chords[0]);
    }
    
    return [...new Set(harmonies)]; // Supprimer les doublons
  }
  
  private calculateNoteDuration(transaction: Transaction): number {
    // Durée basée sur le type de transaction (plus longue pour combler les 4 secondes)
    const baseDuration = {
      'Payment': 3.5,        // Presque 4 secondes
      'OfferCreate': 4.0,    // 4 secondes complètes
      'OfferCancel': 2.0,    // Plus court mais décent
      'TrustSet': 4.5,       // Encore plus long
      'AccountSet': 3.0,     // Solide 3 secondes
    }[transaction.type] || 3.0;
    
    // Ajuster légèrement selon les frais (moins d'impact)
    const feeMultiplier = Math.log10(Math.max(transaction.fee, 1)) / 20 + 1; // Impact réduit
    
    return Math.min(baseDuration * feeMultiplier, 6.0); // Max 6 secondes
  }
  
  private playMelody(mainNote: number, harmonies: number[], duration: number, transaction: Transaction): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const settings = this.pizzaTypeSettings[this.currentPizzaType];
    const now = this.audioContext.currentTime;
    
    // 1. Jouer la note principale avec réverbération
    this.playNote(mainNote, settings, now, duration, 0.3, `main-${transaction.id}`);
    
    // 2. Ajouter des échos de la note principale
    this.playNote(mainNote, settings, now + 0.5, duration * 0.8, 0.15, `echo1-${transaction.id}`);
    this.playNote(mainNote, settings, now + 1.0, duration * 0.6, 0.08, `echo2-${transaction.id}`);
    
    // 3. Jouer les harmonies avec un délai
    harmonies.forEach((harmonyNote, index) => {
      const delay = index * 0.2; // Décalage de 200ms entre les harmonies
      const harmonyVolume = 0.15 / (index + 1); // Volume décroissant
      
      setTimeout(() => {
        this.playNote(harmonyNote, settings, now + delay, duration * 0.8, harmonyVolume, `harmony-${transaction.id}-${index}`);
      }, delay * 1000);
    });
    
    // 4. Ajouter des percussions pour certains types
    if (['Payment', 'OfferCreate'].includes(transaction.type)) {
      this.playPercussion(transaction, duration);
    }
    
    // 5. Dispatch event pour la visualisation
    const noteEvent = new CustomEvent('notePlayed', { 
      detail: { 
        id: transaction.id,
        frequency: this.noteToFrequency(mainNote, settings.baseFrequency),
        timestamp: Date.now(),
        transaction: transaction
      }
    });
    window.dispatchEvent(noteEvent);
  }
  
  private playNote(note: number, settings: any, startTime: number, duration: number, volume: number, id: string): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const frequency = this.noteToFrequency(note, settings.baseFrequency);
    
    // Créer l'oscillateur
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = settings.waveform;
    oscillator.frequency.value = frequency;
    
    // Envelope ADSR
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.2); // Decay
    gainNode.gain.setValueAtTime(volume * 0.7, startTime + duration - 0.1); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release
    
    // Connecter
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Démarrer et arrêter
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    // Nettoyer après
    setTimeout(() => {
      oscillator.disconnect();
      gainNode.disconnect();
      this.activeNotes.delete(id);
    }, (duration + 0.1) * 1000);
    
    this.activeNotes.set(id, { oscillator, gain: gainNode });
  }
  
  private playPercussion(transaction: Transaction, duration: number): void {
    if (!this.audioContext || !this.masterGain) return;
    
    // Créer un son de percussion avec du bruit blanc
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Générer du bruit basé sur le hash de la transaction
    const seed = this.hashToSeed(transaction.id);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (this.seededRandom(seed + i) - 0.5) * 2;
    }
    
    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();
    
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 100 + (transaction.fee / 100); // Fréquence basée sur les frais
    
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start();
  }
  
  private noteToFrequency(note: number, baseFreq: number): number {
    return baseFreq * Math.pow(2, note / 12);
  }
  
  private hashToSeed(hash: string): number {
    let seed = 0;
    for (let i = 0; i < hash.length; i++) {
      seed = ((seed << 5) - seed + hash.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(seed);
  }
  
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  
  public changePizzaType(type: PizzaType): void {
    this.currentPizzaType = type;
    console.log(`🍕 Changed pizza style to ${type} - ${this.pizzaTypeSettings[type].style}`);
    
    // Redémarrer le drone avec la nouvelle fréquence de base
    if (this.isPlaying) {
      this.stopBackgroundDrone();
      setTimeout(() => {
        this.startBackgroundDrone();
      }, 100);
    }
  }
  
  public updateBPM(txCount: number): number {
    // Map transaction count to BPM (60-140)
    const minBPM = 60;
    const maxBPM = 140;
    
    // Plus de transactions = tempo plus rapide
    const cappedTxCount = Math.min(txCount, 50);
    this.bpm = minBPM + (cappedTxCount / 50) * (maxBPM - minBPM);
    
    return Math.round(this.bpm);
  }
  
  public getBPM(): number {
    return Math.round(this.bpm);
  }
  
  public getMasterVolume(): number {
    return this.masterGain?.gain.value || 0;
  }
  
  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.audioContext!.currentTime);
    }
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
