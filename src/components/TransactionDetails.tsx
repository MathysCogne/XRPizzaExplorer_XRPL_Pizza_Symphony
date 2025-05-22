
import React, { useState } from 'react';
import { Transaction } from '@/services/XrplService';
import { Clock, FileText, Music, ExternalLink, Blocks, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TransactionDetailsProps {
  transactions: Transaction[];
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transactions }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // Group transactions by "block" (in a real app this would be actual ledger indexes)
  const blockGroups = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    // Create a simple block identifier based on timestamp (in real XRPL these would be ledger indexes)
    const blockId = Math.floor(tx.timestamp / 10000).toString();
    if (!acc[blockId]) {
      acc[blockId] = [];
    }
    acc[blockId].push(tx);
    return acc;
  }, {});
  
  return (
    <div className="w-full max-w-md bg-white/70 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Blocks className="text-pizza-pink" size={20} />
          <h3 className="text-xl font-bold">XRPL Explorer</h3>
        </div>
        <span className="text-sm bg-pizza-pink text-white px-2 py-1 rounded-full">
          Last {transactions.length} Transactions
        </span>
      </div>
      
      <ScrollArea className="h-48 rounded-md border p-2">
        {Object.keys(blockGroups).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(blockGroups).map(([blockId, txs]) => (
              <div key={blockId} className="bg-white/50 rounded-lg p-2 shadow-sm">
                <div className="flex items-center justify-between mb-2 border-b pb-1">
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Blocks size={16} className="text-pizza-green" />
                    <span>Block {blockId}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {txs.length} transactions
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  {txs.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-2 bg-white/70 rounded-lg shadow-sm hover:bg-pizza-lavender/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <FileText size={14} className="text-pizza-pink" />
                          <span className="font-mono text-xs truncate max-w-[160px]">{tx.id}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {tx.amount.toFixed(2)} XRP
                        </span>
                        <div className="flex items-center gap-1 text-pizza-green">
                          <Music size={12} />
                          <span className="text-xs">Generated note</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
      
      {/* Search Explorer Button */}
      <div className="mt-3 text-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Search size={14} className="mr-1" />
              XRPL Explorer Search
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>XRPL Explorer</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground mb-3">
              Enter a transaction ID or address to explore the XRPL (demo only)
            </div>
            <div className="flex items-center mb-4">
              <input 
                type="text" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                placeholder="Transaction hash or address..."
              />
              <Button className="ml-2" size="sm">
                <Search size={14} className="mr-1" /> Search
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center text-sm text-muted-foreground">
              This is a simulator. In a real application, this would connect to XRPL's actual data.
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Transaction Detail Modal */}
      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs">{selectedTx.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Time</span>
                    <span>{new Date(selectedTx.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Amount</span>
                    <span className="font-bold">{selectedTx.amount.toFixed(2)} XRP</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">From</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">r{selectedTx.id.substring(0, 20)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">To</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">r{selectedTx.id.substring(5, 25)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <span className="text-green-500 font-medium">Validated</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-2">Music Generation Data</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Note Frequency</TableCell>
                      <TableCell>{(selectedTx.amount % 500 + 100).toFixed(2)} Hz</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Waveform Type</TableCell>
                      <TableCell>{['Sine', 'Square', 'Sawtooth', 'Triangle'][Math.floor(selectedTx.amount % 4)]}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Duration</TableCell>
                      <TableCell>{(selectedTx.amount % 500 / 1000 + 0.1).toFixed(2)}s</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>Close</Button>
                <Button variant="outline" className="flex items-center gap-1">
                  <ExternalLink size={14} />
                  View on XRPL Explorer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransactionDetails;

