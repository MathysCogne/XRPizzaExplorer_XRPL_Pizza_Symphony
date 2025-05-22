
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Award, PartyPopper } from 'lucide-react';

interface TransactionCounterProps {
  txCount: number;
  bpm: number;
}

const TransactionCounter: React.FC<TransactionCounterProps> = ({ txCount, bpm }) => {
  // Calculate level based on transaction count (1 level per 10 transactions)
  const level = Math.floor(txCount / 10) + 1;
  
  // Calculate progress to next level
  const levelProgress = ((txCount % 10) / 10) * 100;
  
  // Calculate points (each transaction gives 5 points)
  const points = txCount * 5;
  
  // Define achievements
  const achievements = [
    { icon: <Star className="text-yellow-400" />, name: "First Beat", description: "Process your first transaction", unlocked: txCount >= 1 },
    { icon: <Award className="text-blue-400" />, name: "Pizza Rookie", description: "Reach 10 transactions", unlocked: txCount >= 10 },
    { icon: <Trophy className="text-amber-500" />, name: "Rhythm Master", description: "Reach 25 transactions", unlocked: txCount >= 25 },
    { icon: <PartyPopper className="text-pizza-pink" />, name: "Beat Maestro", description: "Reach 50 transactions", unlocked: txCount >= 50 },
  ];
  
  return (
    <div className="w-full max-w-md bg-white/70 rounded-2xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-bold">XRPL Transactions</h3>
          <p className="text-gray-600 text-sm">Live from the mempool pizzeria</p>
        </div>
        <div className="text-4xl font-bold text-pizza-pink">{txCount}</div>
      </div>
      
      {/* Level and Points Display */}
      <div className="bg-pizza-lavender/30 rounded-lg p-2 mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            <Trophy size={16} className="text-amber-500" />
            <span className="font-bold">Level {level}</span>
          </div>
          <span className="text-sm font-bold">{points} pts</span>
        </div>
        <Progress value={levelProgress} max={100} className="h-2" />
        <p className="text-xs text-center mt-1">
          {10 - (txCount % 10)} more tx to level {level + 1}
        </p>
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
      
      {/* Achievements Section */}
      <div className="mt-4 border-t border-gray-200 pt-2">
        <h4 className="font-bold text-sm mb-2">Achievements</h4>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map((achievement, index) => (
            <div 
              key={`achievement-${index}`} 
              className={`rounded-lg p-2 flex items-center gap-2 text-xs transition-all ${achievement.unlocked ? 'bg-pizza-yellow/30' : 'bg-gray-100 opacity-60'}`}
            >
              <div className={`${achievement.unlocked ? 'scale-110' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <div>
                <div className="font-bold">{achievement.name}</div>
                <div className="text-gray-600 text-xs">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-4 text-sm italic">
        Slices = blocks = bops
      </div>
    </div>
  );
};

export default TransactionCounter;
