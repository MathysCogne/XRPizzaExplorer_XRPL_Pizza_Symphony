
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface TransactionCounterProps {
  txCount: number;
  bpm: number;
}

const TransactionCounter: React.FC<TransactionCounterProps> = ({ txCount, bpm }) => {
  return (
    <div className="w-full max-w-md bg-white/70 rounded-2xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-bold">XRPL Transactions</h3>
          <p className="text-gray-600 text-sm">Live from the mempool pizzeria</p>
        </div>
        <div className="text-4xl font-bold text-pizza-pink">{txCount}</div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span>Beats Per Minute</span>
          <span className="font-bold">{bpm} BPM</span>
        </div>
        <Progress value={bpm} max={180} className="h-4" />
      </div>
      
      <div className="flex items-center justify-center gap-2 my-2">
        {Array(8).fill(0).map((_, i) => (
          <div
            key={`pulse-${i}`}
            className={`w-2 h-8 bg-pizza-pink rounded-full transition-all duration-300 opacity-30 ${i % 4 === 0 ? 'animate-pulse' : ''}`}
            style={{
              animationDelay: `${i * 0.1}s`,
              height: `${Math.max(12, Math.min(32, (bpm / 180) * 32))}px`
            }}
          />
        ))}
      </div>
      
      <div className="text-center mt-4 text-sm italic">
        Slices = blocks = bops
      </div>
    </div>
  );
};

export default TransactionCounter;
