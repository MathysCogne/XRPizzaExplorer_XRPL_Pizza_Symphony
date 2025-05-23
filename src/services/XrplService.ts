import { Client, Transaction as XrplTransaction, TransactionMetadata } from 'xrpl';

// In a real-world scenario, this would connect to the actual XRP Ledger
// For the hackathon demo, we'll simulate transaction data

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  type: string;
  account: string;
  destination?: string;
  fee: number;
  ledgerIndex: number;
  rawTransaction?: XrplTransaction;
}

class XrplService {
  private callbacks: Array<(tx: Transaction) => void> = [];
  private client: Client;
  private isConnected: boolean = false;
  private txCount: number = 0;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  
  constructor() {
    // Essayer différents serveurs XRPL avec fallback
    const servers = [
      'wss://xrplcluster.com/',
      'wss://s1.ripple.com/',
      'wss://s2.ripple.com/',
      'wss://xrpl.ws/'
    ];
    
    const serverUrl = import.meta.env.VITE_XRPL_SERVER || servers[0];
    console.log('🌐 Using XRPL server:', serverUrl);
    
    this.client = new Client(serverUrl);
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.client.on('connected', () => {
      console.log('✅ Connected to XRPL network');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.subscribeToAllTransactions();
    });
    
    this.client.on('disconnected', (code) => {
      console.log('❌ Disconnected from XRPL network:', code);
      this.isConnected = false;
      this.handleReconnection();
    });
    
    this.client.on('error', (error) => {
      console.error('XRPL Client Error:', error);
    });
    
    this.client.on('transaction', (data) => {
      console.log('📦 Raw transaction received:', data);
      this.handleTransaction(data);
    });
    
    this.client.on('ledgerClosed', (ledger) => {
      console.log(`📋 Ledger #${ledger.ledger_index} closed with ${ledger.txn_count} transactions`);
      
      // Si aucune transaction individuelle n'est reçue via le stream, 
      // récupérer quelques transactions du ledger fermé
      if (ledger.txn_count > 0) {
        this.fetchLedgerTransactions(ledger.ledger_index);
      }
    });
  }
  
  private async subscribeToAllTransactions(): Promise<void> {
    try {
      console.log('🔔 Attempting to subscribe to ALL XRPL transactions...');
      
      // S'abonner au stream global de toutes les transactions
      const subscribeResponse = await this.client.request({
        command: 'subscribe',
        streams: ['transactions']
      });
      
      console.log('✅ Successfully subscribed to all XRPL transactions:', subscribeResponse);
      
      // Également s'abonner aux événements de ledger pour le debugging
      await this.client.request({
        command: 'subscribe',
        streams: ['ledger']
      });
      
      console.log('✅ Also subscribed to ledger events');
      
      // Vérifier le statut de l'abonnement
      const serverInfo = await this.client.request({
        command: 'server_info'
      });
      
      console.log('🌐 Server info:', {
        build_version: serverInfo.result?.info?.build_version,
        ledger: serverInfo.result?.info?.validated_ledger?.seq,
        load: serverInfo.result?.info?.load_factor
      });
      
    } catch (error) {
      console.error('❌ Failed to subscribe to transactions:', error);
      
      // Fallback: essayer une approche différente
      console.log('🔄 Trying alternative subscription method...');
      try {
        await this.client.request({
          command: 'subscribe',
          streams: ['transactions', 'ledger'],
          rt_accounts: [] // Spécifier explicitement un array vide pour toutes les transactions
        });
        console.log('✅ Alternative subscription successful');
      } catch (fallbackError) {
        console.error('❌ Alternative subscription also failed:', fallbackError);
      }
    }
  }
  
  private async fetchLedgerTransactions(ledgerIndex: number): Promise<void> {
    try {
      console.log(`🔍 Fetching transactions from ledger #${ledgerIndex}`);
      
      const response = await this.client.request({
        command: 'ledger',
        ledger_index: ledgerIndex,
        transactions: true,
        expand: true
      });
      
      if (response.result?.ledger?.transactions) {
        const transactions = response.result.ledger.transactions;
        console.log(`📦 Found ${transactions.length} transactions in ledger #${ledgerIndex}`);
        
        // Traiter les premières transactions (limite pour éviter le spam)
        const transactionsToProcess = transactions.slice(0, 3);
        
        transactionsToProcess.forEach((tx: any, index: number) => {
          setTimeout(() => {
            this.handleTransaction({
              transaction: tx,
              meta: tx.metaData,
              validated: true,
              ledger_index: ledgerIndex
            });
          }, index * 200); // Délai entre les transactions pour l'effet visuel
        });
      } else {
        console.log(`📋 No transactions found in ledger #${ledgerIndex}`);
      }
    } catch (error) {
      console.error('Failed to fetch ledger transactions:', error);
    }
  }
  
  private handleTransaction(data: any): void {
    try {
      // La vraie transaction est dans tx_json pour les streams XRPL
      const tx = data.tx_json || data.transaction;
      const meta = data.meta || data.metadata;
      
      console.log('🔄 Processing transaction:', {
        validated: data.validated,
        txType: tx?.TransactionType,
        account: tx?.Account?.substring(0, 8) + '...',
        sendMax: tx?.SendMax,
        hash: data.hash || tx?.hash || tx?.Hash
      });
      
      if (!tx) {
        console.warn('⚠️ No transaction data found');
        return;
      }
      
      // Extract transaction information
      const transaction: Transaction = {
        id: data.hash || tx.hash || tx.Hash || this.generateRandomId(),
        timestamp: this.rippleTimeToUnixTime(tx.date || Math.floor(Date.now() / 1000)),
        amount: this.extractAmount(tx),
        type: tx.TransactionType || 'Unknown',
        account: tx.Account || 'Unknown',
        destination: tx.Destination,
        fee: parseInt(tx.Fee || '12'),
        ledgerIndex: data.ledger_index || tx.ledger_index || 0,
        rawTransaction: tx
      };
      
      console.log('✅ Successfully processed transaction:', {
        id: transaction.id.substring(0, 8) + '...',
        type: transaction.type,
        amount: transaction.amount,
        ledger: transaction.ledgerIndex,
        account: transaction.account.substring(0, 8) + '...'
      });
      
      this.txCount++;
      this.notifyListeners(transaction);
      
    } catch (error) {
      console.error('❌ Error processing transaction:', error);
    }
  }
  
  private extractAmount(tx: any): number {
    try {
      // Pour les Payments, vérifier SendMax (montant à envoyer) ou Amount
      if (tx.SendMax) {
        if (typeof tx.SendMax === 'string') {
          // XRP amount in drops
          const drops = parseInt(tx.SendMax);
          return drops / 1000000;
        } else if (typeof tx.SendMax === 'object') {
          // IOU amount
          return parseFloat(tx.SendMax.value || '0');
        }
      }
      
      if (tx.Amount) {
        if (typeof tx.Amount === 'string') {
          // XRP amount in drops (1 XRP = 1,000,000 drops)
          const drops = parseInt(tx.Amount);
          return drops / 1000000;
        } else if (typeof tx.Amount === 'object') {
          // IOU amount
          return parseFloat(tx.Amount.value || '0');
        }
      }
      
      // Pour d'autres types de transactions, utiliser les frais
      const fee = parseInt(tx.Fee || '12');
      return fee / 1000000;
    } catch {
      return 0.000012; // Frais par défaut XRPL
    }
  }
  
  private rippleTimeToUnixTime(rippleTime: number): number {
    // Ripple epoch starts January 1, 2000 (00:00 UTC)
    const RIPPLE_EPOCH_OFFSET = 946684800;
    return (rippleTime + RIPPLE_EPOCH_OFFSET) * 1000;
  }
  
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Attempting to reconnect in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Please check your connection.');
    }
  }
  
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to XRPL');
      return;
    }
    
    try {
      console.log('🔌 Connecting to XRPL network...');
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to XRPL:', error);
      this.handleReconnection();
    }
  }
  
  public async disconnect(): Promise<void> {
    if (this.client.isConnected()) {
      try {
        // Unsubscribe from all streams
        await this.client.request({
          command: 'unsubscribe',
          streams: ['transactions', 'ledger']
        });
        
        await this.client.disconnect();
        console.log('📴 Disconnected from XRPL network');
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    }
    
    this.isConnected = false;
  }
  
  // Méthode pour tester manuellement avec des transactions
  public async testWithManualFetch(): Promise<void> {
    try {
      console.log('🧪 Testing with manual ledger fetch...');
      
      // Récupérer le dernier ledger
      const ledgerResponse = await this.client.request({
        command: 'ledger_current'
      });
      
      const currentLedger = ledgerResponse.result.ledger_current_index;
      console.log(`📋 Current ledger: #${currentLedger}`);
      
      // Récupérer quelques ledgers récents
      for (let i = 0; i < 3; i++) {
        const ledgerIndex = currentLedger - i - 1; // -1 car le ledger courant n'est pas encore fermé
        await this.fetchLedgerTransactions(ledgerIndex);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Délai entre les requêtes
      }
      
    } catch (error) {
      console.error('Manual test failed:', error);
    }
  }
  
  public subscribe(callback: (tx: Transaction) => void): void {
    this.callbacks.push(callback);
  }
  
  public unsubscribe(callback: (tx: Transaction) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
  
  private notifyListeners(tx: Transaction): void {
    this.callbacks.forEach(callback => {
      try {
        callback(tx);
      } catch (error) {
        console.error('Error in transaction callback:', error);
      }
    });
  }
  
  public getTxCount(): number {
    return this.txCount;
  }
  
  public resetTxCount(): void {
    this.txCount = 0;
  }
  
  public isClientConnected(): boolean {
    return this.isConnected && this.client.isConnected();
  }
  
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Singleton instance
export const xrplService = new XrplService();
