
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Pizza from '@/components/Pizza';
import PizzaTypeSelector, { PizzaType } from '@/components/PizzaTypeSelector';
import TransactionCounter from '@/components/TransactionCounter';
import FlyingTopping from '@/components/FlyingTopping';
import { Button } from '@/components/ui/button';
import { xrplService, Transaction } from '@/services/XrplService';
import { audioEngine } from '@/services/AudioEngine';
import { CirclePlay, CircleStop } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [pizzaType, setPizzaType] = useState<PizzaType>('pepperoni');
  const [isPlaying, setIsPlaying] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [bpm, setBpm] = useState(80);
  const [toppings, setToppings] = useState<{ type: 'pepperoni' | 'basil' | 'pineapple' | 'cheese', id: string, delay: number }[]>([]);
  
  // Map pizza types to topping types
  const pizzaToToppingMap = {
    pepperoni: 'pepperoni',
    margherita: 'basil',
    hawaiian: 'pineapple',
    cheese: 'cheese'
  } as const;
  
  // Handle transaction updates
  const handleTransaction = (tx: Transaction) => {
    // Update transaction count
    setTxCount(prevCount => {
      const newCount = prevCount + 1;
      
      // Update BPM based on transaction count
      const newBpm = audioEngine.updateBPM(newCount);
      setBpm(newBpm);
      
      // Add a new flying topping
      const topping = {
        type: pizzaToToppingMap[pizzaType],
        id: tx.id,
        delay: Math.random() * 0.5
      };
      
      setToppings(prev => [...prev.slice(-10), topping]);
      
      return newCount;
    });
  };
  
  // Handle start/stop
  const togglePlayback = () => {
    if (isPlaying) {
      // Stop everything
      audioEngine.stop();
      xrplService.disconnect();
      setIsPlaying(false);
      toast({
        title: "Pizza Symphony Stopped",
        description: `Baked ${txCount} transactions into music!`,
      });
    } else {
      // Start everything
      xrplService.resetTxCount();
      setTxCount(0);
      setBpm(80);
      audioEngine.start();
      xrplService.connect();
      setIsPlaying(true);
      toast({
        title: "Pizza Symphony Started!",
        description: "Ledger closed, oven open! 🍕",
      });
    }
  };
  
  // Handle pizza type change
  const handlePizzaTypeChange = (type: PizzaType) => {
    setPizzaType(type);
    audioEngine.changePizzaType(type);
    
    toast({
      title: `Switched to ${type} style`,
      description: "New sounds and flavors loading...",
    });
  };
  
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
          <h1 className="text-5xl md:text-7xl font-bold mb-2 animate-bounce-slight">Pizza Day Symphony</h1>
          <p className="text-xl md:text-2xl">1st pizza cost 10k BTC. This one is free.</p>
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
          
          {/* Start/Stop button */}
          <Button 
            onClick={togglePlayback} 
            variant="default"
            size="lg"
            className="text-xl px-8 py-6 rounded-full bg-white hover:bg-opacity-90 text-black font-bold shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-bounce"
          >
            {isPlaying ? (
              <>
                <CircleStop className="mr-2 h-6 w-6" /> 
                Stop the Pizza Music
              </>
            ) : (
              <>
                <CirclePlay className="mr-2 h-6 w-6" /> 
                Start the Pizza Music
              </>
            )}
          </Button>
        </div>
        
        {/* Pizza Type Selector */}
        <div className="mb-8">
          <PizzaTypeSelector 
            selected={pizzaType} 
            onChange={handlePizzaTypeChange} 
          />
        </div>
        
        {/* Transaction counter */}
        <div className="flex justify-center mb-8">
          <TransactionCounter txCount={txCount} bpm={bpm} />
        </div>
        
        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-sm font-bold mb-1">Buy pizza, not top</p>
          <p className="text-xs opacity-70">Baked on-chain for XRPL Coding Night</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
