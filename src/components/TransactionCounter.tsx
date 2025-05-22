
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
        <Progress value={bpm} className="h-4" />
      </div>
      
      <div className="text-center mt-4 text-sm italic">
        Slices = blocks = bops
      </div>
    </div>
  );
};

export default TransactionCounter;
