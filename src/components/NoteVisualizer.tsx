
import React, { useEffect, useState } from 'react';

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

  // Subscribe to notes from the audio engine
  useEffect(() => {
    if (!isPlaying) {
      setActiveNotes([]);
      return;
    }
    
    // Event listener for note played
    const handleNotePlayed = (event: CustomEvent) => {
      const { id, frequency } = event.detail;
      setActiveNotes(prev => [...prev.slice(-15), { id, frequency, timestamp: Date.now() }]);
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
  
  return (
    <div className="w-full max-w-md bg-white/70 rounded-2xl p-4 shadow-lg mb-4">
      <h3 className="text-xl font-bold mb-2">Notes Symphony</h3>
      
      <div className="flex items-end h-24 gap-1 overflow-hidden bg-black/10 rounded-lg p-2">
        {activeNotes.map((note) => {
          const height = Math.min(100, (note.frequency / 500) * 100);
          return (
            <div 
              key={note.id} 
              className="animate-pulse bg-pizza-pink w-3 rounded-t-md"
              style={{ 
                height: `${height}%`,
                animation: 'pulse 0.5s ease-out'
              }}
            />
          );
        })}
        {isPlaying && activeNotes.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Waiting for transactions to generate notes...
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteVisualizer;
