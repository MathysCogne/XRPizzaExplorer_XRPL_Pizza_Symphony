
import React from 'react';
import { Transaction } from '@/services/XrplService';
import { Clock, FileText, Music } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionDetailsProps {
  transactions: Transaction[];
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transactions }) => {
  return (
    <div className="w-full max-w-md bg-white/70 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">Block Details</h3>
        <span className="text-sm bg-pizza-pink text-white px-2 py-1 rounded-full">
          Last {transactions.length} Transactions
        </span>
      </div>
      
      <ScrollArea className="h-48 rounded-md border p-2">
        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-pizza-lavender/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <FileText size={16} className="text-pizza-pink" />
                    <span className="font-mono text-xs truncate max-w-[180px]">{tx.id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={14} />
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {tx.amount.toFixed(2)} XRP
                  </span>
                  <div className="flex items-center gap-1 text-pizza-green">
                    <Music size={14} />
                    <span className="text-xs">Generated note</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No transactions yet. Start the Pizza Music!
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default TransactionDetails;
