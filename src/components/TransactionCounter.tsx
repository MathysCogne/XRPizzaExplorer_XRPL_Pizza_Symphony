import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface TransactionCounterProps {
  txCount: number;
  bpm: number;
}

const TransactionCounter: React.FC<TransactionCounterProps> = ({ txCount, bpm }) => {
  const [history, setHistory] = useState<{ time: string, count: number }[]>([]);
  const [blockPulse, setBlockPulse] = useState(false);
  
  // Add transaction to history
  useEffect(() => {
    if (txCount > 0) {
      const now = new Date();
      const timeString = `${now.getMinutes()}:${now.getSeconds()}`;
      setHistory(prev => {
        const newHistory = [...prev, { time: timeString, count: txCount }];
        // Keep only the last 10 entries
        return newHistory.slice(-10);
      });
      
      // Simulate block pulse every 10 transactions
      if (txCount % 10 === 0) {
        setBlockPulse(true);
        setTimeout(() => setBlockPulse(false), 1000);
      }
    }
  }, [txCount]);
  
  const chartConfig = {
    txs: {
      label: 'Transactions',
      theme: { light: '#FFAAA7', dark: '#FFAAA7' },
    },
  };

  return (
    <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-bold">XRPL Transactions</h3>
          <p className="text-gray-600 text-sm">Live from the mempool pizzeria</p>
        </div>
        <motion.div 
          className="text-4xl font-bold text-pizza-pink"
          key={txCount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {txCount}
        </motion.div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Beats Per Minute</span>
          <motion.span 
            className="font-bold"
            key={bpm}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {bpm} BPM
          </motion.span>
        </div>
        <Progress value={bpm} className="h-4" />
      </div>
      
      {/* Transaction History Chart */}
      <div className="mb-4 h-32 bg-white/50 rounded-lg p-2">
        <ChartContainer config={chartConfig}>
          <LineChart data={history}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_) => "Transactions"}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="count"
              name="txs"
              strokeWidth={2}
              dot={false}
              style={{ stroke: "var(--color-txs)" }}
            />
          </LineChart>
        </ChartContainer>
      </div>
      
      {/* Block Visualization */}
      <div className="text-center mt-2 p-2 relative">
        <AnimatePresence>
          {blockPulse && (
            <motion.div 
              className="absolute inset-0 bg-pizza-yellow rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
        <div className="flex items-center justify-center gap-1">
          {Array(5).fill(0).map((_, i) => (
            <motion.div 
              key={i} 
              className="h-4 w-4 bg-pizza-pink rounded"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        <div className="text-center mt-2 text-sm italic">
          Slices = blocks = bops
        </div>
      </div>
    </div>
  );
};

export default TransactionCounter;
