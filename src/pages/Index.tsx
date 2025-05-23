import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Pizza from '@/components/Pizza';
import PizzaTypeSelector, { PizzaType } from '@/components/PizzaTypeSelector';
import TransactionCounter from '@/components/TransactionCounter';
import FlyingTopping from '@/components/FlyingTopping';
import NoteVisualizer from '@/components/NoteVisualizer';
import TransactionDetails from '@/components/TransactionDetails';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { xrplService, Transaction } from '@/services/XrplService';
import { audioEngine } from '@/services/AudioEngine';
import { CirclePlay, CircleStop, Wifi, WifiOff, TestTube, Volume2 } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [pizzaType, setPizzaType] = useState<PizzaType>('pepperoni');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [bpm, setBpm] = useState(80);
  const [volume, setVolume] = useState(30); // Volume par défaut à 30%
  const [toppings, setToppings] = useState<{ type: 'pepperoni' | 'basil' | 'pineapple' | 'cheese', id: string, delay: number }[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Map pizza types to topping types
  const pizzaToToppingMap = {
    pepperoni: 'pepperoni',
    margherita: 'basil',
    hawaiian: 'pineapple',
    cheese: 'cheese'
  } as const;
  
  // Map pizza types to musical styles
  const pizzaStyleMap = {
    pepperoni: { style: 'Techno', description: 'Major scales • Sawtooth waves • Energetic' },
    margherita: { style: 'Jazz', description: 'Minor scales • Sine waves • Smooth' },
    hawaiian: { style: 'Reggae', description: 'Pentatonic • Triangle waves • Laid-back' },
    cheese: { style: 'Ambient', description: 'Lydian mode • Sine waves • Dreamy' }
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    audioEngine.setMasterVolume(vol / 100);
  };
  
  // Handle transaction updates
  const handleTransaction = (tx: Transaction) => {
    console.log('🍕 New transaction:', tx.type, tx.amount, 'XRP');
    
    // 🎵 JOUER LA MUSIQUE BASÉE SUR LA VRAIE TRANSACTION
    audioEngine.playTransactionMusic(tx);
    
    // Update transaction count
    setTxCount(prevCount => {
      const newCount = prevCount + 1;
      
      // Update BPM based on transaction count
      const newBpm = audioEngine.updateBPM(newCount);
      setBpm(newBpm);
      
      // Add a new flying topping with transaction type influence
      const topping = {
        type: pizzaToToppingMap[pizzaType],
        id: tx.id,
        delay: Math.random() * 0.5
      };
      
      setToppings(prev => [...prev.slice(-10), topping]);
      
      // Keep track of transactions for the details panel (last 20)
      setTransactions(prev => [...prev.slice(-19), tx]);
      
      return newCount;
    });
    
    // Show transaction notification with musical info
    const musicalInfo = {
      'Payment': '🎵 Major scale melody',
      'OfferCreate': '🎶 Complex harmonies',
      'OfferCancel': '🔔 Quick percussion',
      'TrustSet': '🎼 Extended melody',
      'AccountSet': '🎹 Soft ambient'
    }[tx.type] || '🎵 Unique sound';
    
    toast({
      title: `${tx.type} Transaction → ${musicalInfo}`,
      description: `${tx.amount > 0 ? tx.amount.toFixed(4) + ' XRP' : 'Fee: ' + (tx.fee/1000000).toFixed(4) + ' XRP'} • Ledger #${tx.ledgerIndex}`,
      duration: 3000,
    });
  };
  
  // Handle manual test
  const handleManualTest = async () => {
    if (!isConnected) {
      toast({
        title: "❌ Not Connected",
        description: "Please connect to XRPL first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "🧪 Testing Manual Fetch",
        description: "Fetching recent transactions...",
      });
      
      await (xrplService as any).testWithManualFetch();
      
      toast({
        title: "✅ Manual Test Complete",
        description: "Check console for details and watch for transactions!",
      });
    } catch (error) {
      console.error('Manual test failed:', error);
      toast({
        title: "❌ Manual Test Failed",
        description: "Check console for error details",
        variant: "destructive",
      });
    }
  };
  
  // Handle start/stop
  const togglePlayback = async () => {
    if (isPlaying) {
      // Stop everything
      audioEngine.stop();
      await xrplService.disconnect();
      setIsPlaying(false);
      setIsConnected(false);
      toast({
        title: "🛑 Pizza Symphony Stopped",
        description: `Streamed ${txCount} XRPL transactions into music!`,
      });
    } else {
      // Start everything
      xrplService.resetTxCount();
      setTxCount(0);
      setBpm(80);
      setTransactions([]);
      audioEngine.start();
      
      try {
        await xrplService.connect();
        setIsPlaying(true);
        setIsConnected(true);
        toast({
          title: "🎵 Connected to XRPL Mainnet!",
          description: "Streaming live transactions into musical notes 🍕🎶",
        });
      } catch (error) {
        console.error('Failed to connect to XRPL:', error);
        audioEngine.stop();
        toast({
          title: "❌ Connection Failed",
          description: "Could not connect to XRPL network. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle pizza type change
  const handlePizzaTypeChange = (type: PizzaType) => {
    setPizzaType(type);
    audioEngine.changePizzaType(type);
    
    toast({
      title: `🍕 Switched to ${type} style`,
      description: "Musical scales and harmonies updated!",
    });
  };
  
  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = xrplService.isClientConnected();
      setIsConnected(connected);
      
      if (isPlaying && !connected) {
        toast({
          title: "⚠️ Connection Lost",
          description: "Attempting to reconnect to XRPL...",
          variant: "destructive",
        });
      }
    };
    
    const intervalId = setInterval(checkConnection, 5000);
    return () => clearInterval(intervalId);
  }, [isPlaying, toast]);
  
  // Subscribe to XRPL transactions
  useEffect(() => {
    xrplService.subscribe(handleTransaction);
    
    return () => {
      xrplService.unsubscribe(handleTransaction);
      audioEngine.stop();
      xrplService.disconnect();
    };
  }, [pizzaType]);
  
  // Clean up flying toppings
  useEffect(() => {
    const interval = setInterval(() => {
      setToppings(prev => {
        if (prev.length > 20) {
          return prev.slice(-20);
        }
        return prev;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const bgColorMap = {
    pepperoni: 'from-pizza-pink to-pizza-yellow',
    margherita: 'from-pizza-green to-pizza-lavender',
    hawaiian: 'from-pizza-yellow to-pizza-pink',
    cheese: 'from-pizza-lavender to-pizza-green',
  };
  
  return (
    <div className={`min-h-screen w-full p-4 overflow-hidden bg-gradient-to-br ${bgColorMap[pizzaType]} transition-colors duration-700`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-5xl md:text-7xl font-bold animate-bounce-slight">XRPL Pizza Symphony 🍕🎶</h1>

          </div>
          <p className="text-xl md:text-2xl">XRPIzza - A blockchain explorer that hits different. Powered by pizza & music for Pizza Bitcoin Day 2025</p>
          <p className="text-sm mt-2 opacity-75">
            {isConnected ? '🟢 Connected to XRPL Mainnet' : '🔴 Disconnected'}
          </p>
        </header>
        
        {/* Main pizza and controls */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <div className="relative mb-8">
            <Pizza 
              type={pizzaType} 
              size="lg" 
              spinning={isPlaying} 
              className="animate-float"
            />
            
            {/* Flying toppings */}
            {isPlaying && toppings.map((topping) => (
              <FlyingTopping 
                key={topping.id} 
                type={topping.type} 
                delay={topping.delay} 
              />
            ))}
          </div>
          
          {/* Control buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button 
              onClick={togglePlayback} 
              variant="default"
              size="lg"
              className="text-xl px-8 py-6 rounded-full bg-white hover:bg-opacity-90 text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-bounce"
            >
              {isPlaying ? (
                <>
                  <CircleStop className="mr-2 h-6 w-6" /> 
                  Stop XRPL Stream
                </>
              ) : (
                <>
                  <CirclePlay className="mr-2 h-6 w-6" /> 
                  Start XRPL Stream
                </>
              )}
            </Button>
            

          </div>
        </div>
        
        {/* Pizza Type Selector */}
        <div className="mb-8">
          <PizzaTypeSelector 
            selected={pizzaType} 
            onChange={handlePizzaTypeChange} 
          />
          
          {/* Musical Style Info */}
          <div className="mt-4 text-center">
            <div className="bg-white/60 rounded-xl p-4 shadow-lg max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                🎵  {pizzaStyleMap[pizzaType].style}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {pizzaStyleMap[pizzaType].description}
              </p>
              
              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-gray-600" />
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12 text-right">{volume}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visualization and Transaction Details */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <div className="flex flex-col w-full md:w-1/2 items-center gap-4">
            <TransactionCounter txCount={txCount} bpm={bpm} />
            <NoteVisualizer isPlaying={isPlaying} />
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <TransactionDetails transactions={transactions} />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-sm font-bold mb-1">Powered by XRPIzza.js</p>
          <div className="text-xs opacity-70 mb-2">
            <p className="mb-1">
              Built by{' '}
              <a 
                href="https://link.mathys-cognefoucault.fr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-100 transition-opacity font-medium"
              >
                Mathys Cogne
              </a>
            </p>
            <p>
              for{' '}
              <a 
                href="https://www.xrpl-commons.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-100 transition-opacity font-medium"
              >
                XRPL Commons Pizza Night
              </a>{' '}
              2025 🍕
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
