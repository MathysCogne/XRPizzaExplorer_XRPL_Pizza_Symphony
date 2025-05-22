
// In a real-world scenario, this would connect to the actual XRP Ledger
// For the hackathon demo, we'll simulate transaction data

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
}

class XrplService {
  private callbacks: Array<(tx: Transaction) => void> = [];
  private simulationInterval: number | null = null;
  private txCount: number = 0;
  
  constructor() {}
  
  public connect(): void {
    console.log('Connecting to XRPL network...');
    
    // Simulate connection with random transaction data
    this.simulationInterval = window.setInterval(() => {
      // Randomly decide if we should emit a transaction
      if (Math.random() > 0.3) { // 70% chance of a transaction
        const transaction: Transaction = {
          id: this.generateRandomId(),
          timestamp: Date.now(),
          amount: Math.random() * 1000
        };
        
        this.txCount++;
        this.notifyListeners(transaction);
      }
    }, 600); // Check roughly every 600ms
  }
  
  public disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    console.log('Disconnected from XRPL network');
  }
  
  public subscribe(callback: (tx: Transaction) => void): void {
    this.callbacks.push(callback);
  }
  
  public unsubscribe(callback: (tx: Transaction) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
  
  private notifyListeners(tx: Transaction): void {
    this.callbacks.forEach(callback => callback(tx));
  }
  
  public getTxCount(): number {
    return this.txCount;
  }
  
  public resetTxCount(): void {
    this.txCount = 0;
  }
  
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Singleton instance
export const xrplService = new XrplService();
