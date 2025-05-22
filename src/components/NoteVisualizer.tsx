
import React, { useEffect, useState } from 'react';
import { ChartContainer } from '@/components/ui/chart';
import { Volume2, Music, ChartBar } from 'lucide-react';

interface Note {
  id: string;
  frequency: number;
  timestamp: number;
}

interface NoteVisualizerProps {
  isPlaying: boolean;
}

const NoteVisualizer: React.FC<NoteVisualizerProps> = ({ isPlaying }) => {
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [lastNoteDetails, setLastNoteDetails] = useState<{
    frequency: number;
    waveform: string;
    time: string;
  } | null>(null);

  // Subscribe to notes from the audio engine
  useEffect(() => {
    if (!isPlaying) {
      setActiveNotes([]);
      return;
    }
    
    // Event listener for note played
    const handleNotePlayed = (event: CustomEvent) => {
      const { id, frequency } = event.detail;
      const newNote = { id, frequency, timestamp: Date.now() };
      setActiveNotes(prev => [...prev.slice(-15), newNote]);
      
      // Set last note details
      setLastNoteDetails({
        frequency,
        // Mock data - in a real app this would come from the audio engine
        waveform: ['Sine', 'Square', 'Sawtooth', 'Triangle'][Math.floor(Math.random() * 4)],
        time: new Date().toLocaleTimeString(),
      });
    };
    
    // Add custom event listener
    window.addEventListener('notePlayed' as any, handleNotePlayed as EventListener);
    
    return () => {
      window.removeEventListener('notePlayed' as any, handleNotePlayed as EventListener);
    };
  }, [isPlaying]);
  
  // Remove old notes after they've been displayed
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveNotes(prev => 
        prev.filter(note => now - note.timestamp < 3000)
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Calculate note name from frequency
  const getNoteNameFromFrequency = (freq: number) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4 = 440;
    const a4Index = 57; // A4 is the 57th key on a standard piano
    
    if (freq <= 0) return 'N/A';
    
    // Calculate how many half-steps away from A4 the frequency is
    const halfStepsFromA4 = Math.round(12 * Math.log2(freq / a4));
    const noteIndex = (a4Index + halfStepsFromA4) % 12;
    const octave = Math.floor((a4Index + halfStepsFromA4) / 12);
    
    return `${noteNames[noteIndex]}${octave}`;
  };
  
  return (
    <div className="w-full max-w-md bg-white/70 rounded-2xl p-4 shadow-lg mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold flex items-center gap-1">
          <Music className="text-pizza-pink" />
          Notes Symphony
        </h3>
        <div className="text-sm bg-pizza-yellow/60 px-2 py-1 rounded-full">
          {isPlaying ? "Music Live" : "Offline"}
        </div>
      </div>
      
      {lastNoteDetails && (
        <div className="bg-black/5 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Last Played Note</span>
            <span className="text-xs text-gray-600">{lastNoteDetails.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="text-pizza-pink" size={16} />
              <span className="font-bold">{getNoteNameFromFrequency(lastNoteDetails.frequency)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs">{lastNoteDetails.frequency.toFixed(1)} Hz</span>
              <span className="text-xs text-gray-600">{lastNoteDetails.waveform}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-end h-24 gap-1 overflow-hidden bg-black/10 rounded-lg p-2">
        {activeNotes.map((note) => {
          const height = Math.min(100, (note.frequency / 500) * 100);
          const hue = (note.frequency % 360);
          return (
            <div 
              key={note.id} 
              className="animate-pulse w-3 rounded-t-md"
              style={{ 
                height: `${height}%`,
                backgroundColor: `hsl(${hue}, 70%, 60%)`,
                animation: 'pulse 0.5s ease-out'
              }}
              title={`${note.frequency.toFixed(1)} Hz - ${getNoteNameFromFrequency(note.frequency)}`}
            />
          );
        })}
        {isPlaying && activeNotes.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Waiting for transactions to generate notes...
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
        <span>Lower Notes</span>
        <span>Higher Notes</span>
      </div>
      
      <div className="mt-2 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1">
          <ChartBar size={14} />
          <span>Each bar represents a note generated from XRPL transaction data</span>
        </div>
      </div>
    </div>
  );
};

export default NoteVisualizer;

