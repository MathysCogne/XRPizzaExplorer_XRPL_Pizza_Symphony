import React, { useState } from 'react';
import { Transaction } from '@/services/XrplService';
import { Clock, FileText, Music, ExternalLink, Blocks, Search, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TransactionDetailsProps {
  transactions: Transaction[];
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transactions }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // Group transactions by ledger index (real XRPL data)
  const ledgerGroups = transactions.reduce<Record<number, Transaction[]>>((acc, tx) => {
    const ledgerIndex = tx.ledgerIndex || 0;
    if (!acc[ledgerIndex]) {
      acc[ledgerIndex] = [];
    }
    acc[ledgerIndex].push(tx);
    return acc;
  }, {});
  
  const formatAddress = (address: string, length: number = 8) => {
    if (!address) return 'N/A';
    return `${address.substring(0, length)}...${address.substring(address.length - 4)}`;
  };
  
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Payment': return 'bg-green-100 text-green-800';
      case 'OfferCreate': return 'bg-blue-100 text-blue-800';
      case 'OfferCancel': return 'bg-red-100 text-red-800';
      case 'TrustSet': return 'bg-purple-100 text-purple-800';
      case 'AccountSet': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-md bg-white/70 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Blocks className="text-pizza-pink" size={20} />
          <h3 className="text-xl font-bold">XRPL Live Stream</h3>
        </div>
        <span className="text-sm bg-pizza-pink text-white px-2 py-1 rounded-full">
          Last {transactions.length} TX
        </span>
      </div>
      
      <ScrollArea className="h-[550px] rounded-md border p-2">
        {Object.keys(ledgerGroups).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(ledgerGroups)
              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort by ledger index descending
              .map(([ledgerIndex, txs]) => (
              <div key={ledgerIndex} className="bg-white/50 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Blocks size={18} className="text-pizza-green" />
                    <span>Ledger #{ledgerIndex}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {txs.length} transactions
                  </span>
                </div>
                
                <div className="space-y-2">
                  {txs.map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-3 bg-white/70 rounded-lg shadow-sm hover:bg-pizza-lavender/20 transition-colors cursor-pointer border border-gray-100"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${getTransactionTypeColor(tx.type)}`}>
                            {tx.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-600">
                          {formatAddress(tx.account, 8)}
                        </span>
                        {tx.destination && (
                          <>
                            <ArrowRight size={10} className="text-gray-400" />
                            <span className="text-xs font-mono text-gray-600">
                              {formatAddress(tx.destination, 8)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {tx.amount > 0 ? `${tx.amount.toFixed(4)} XRP` : `Fee: ${(tx.fee/1000000).toFixed(4)} XRP`}
                        </span>
                        <div className="flex items-center gap-1 text-pizza-green">
                          <Music size={12} />
                          <span className="text-xs">♪</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Blocks className="mb-4 opacity-50" size={48} />
            <p className="text-lg text-center font-semibold mb-2">No transactions yet</p>
            <p className="text-sm text-center opacity-70 mb-4">Waiting for XRPL mainnet stream...</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening for live transactions</span>
            </div>
          </div>
        )}
      </ScrollArea>
      
      {/* Real XRPL Explorer Link */}
      <div className="mt-3 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => window.open('https://livenet.xrpl.org/', '_blank')}
        >
          <ExternalLink size={14} className="mr-1" />
          Open XRPL Explorer
        </Button>
      </div>
      
      {/* Transaction Detail Modal */}
      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge className={getTransactionTypeColor(selectedTx.type)}>
                  {selectedTx.type}
                </Badge>
                Transaction Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs break-all">{selectedTx.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Ledger Index</span>
                    <span className="font-bold">#{selectedTx.ledgerIndex}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Timestamp</span>
                    <span>{new Date(selectedTx.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Account</span>
                    <span className="font-mono text-xs break-all">{selectedTx.account}</span>
                  </div>
                  
                  {selectedTx.destination && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Destination</span>
                      <span className="font-mono text-xs break-all">{selectedTx.destination}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Amount</span>
                    <span className="font-bold">
                      {selectedTx.amount > 0 ? `${selectedTx.amount.toFixed(6)} XRP` : 'No transfer'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Fee</span>
                    <span>{(selectedTx.fee / 1000000).toFixed(6)} XRP</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <span className="text-green-500 font-medium">✓ Validated</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
                  <Music size={16} />
                  Music Generation Data
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Frequency</TableCell>
                      <TableCell>{((selectedTx.amount || selectedTx.fee/1000000) % 500 + 200).toFixed(2)} Hz</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Transaction Type Note</TableCell>
                      <TableCell>
                        {selectedTx.type === 'Payment' ? 'Major scale' : 
                         selectedTx.type === 'OfferCreate' ? 'Minor scale' :
                         selectedTx.type === 'OfferCancel' ? 'Diminished' : 'Pentatonic'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ledger Harmonic</TableCell>
                      <TableCell>L{selectedTx.ledgerIndex % 12} ({['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][selectedTx.ledgerIndex % 12]})</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Duration</TableCell>
                      <TableCell>{((selectedTx.amount || 1) % 2 + 0.5).toFixed(2)}s</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTx(null)}>Close</Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => window.open(`https://livenet.xrpl.org/transactions/${selectedTx.id}`, '_blank')}
                >
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

