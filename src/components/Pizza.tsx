
import React from 'react';
import { cn } from '@/lib/utils';

interface PizzaProps {
  type: 'pepperoni' | 'margherita' | 'hawaiian' | 'cheese';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  spinning?: boolean;
}

const Pizza: React.FC<PizzaProps> = ({ 
  type, 
  size = 'md', 
  className,
  spinning = false 
}) => {
  const sizes = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48'
  };

  return (
    <div 
      className={cn(
        "relative rounded-full aspect-square pizza-shadow", 
        sizes[size],
        spinning ? "animate-spin-slow" : "",
        className
      )}
      aria-label={`${type} pizza`}
    >
      {/* Pizza base */}
      <div className="absolute inset-0 rounded-full bg-pizza-yellow">
        {/* Pizza crust */}
        <div className="absolute inset-0 rounded-full border-8 border-pizza-crust"></div>
        
        {/* Pizza sauce layer */}
        <div className="absolute inset-2 rounded-full bg-pizza-sauce opacity-80"></div>
        
        {/* Cheese layer */}
        <div className="absolute inset-4 rounded-full bg-yellow-100 opacity-90"></div>
        
        {/* Toppings */}
        {type === 'pepperoni' && (
          <>
            {Array(8).fill('').map((_, i) => (
              <div 
                key={`pepperoni-${i}`}
                className="absolute w-4 h-4 bg-red-500 rounded-full" 
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
              ></div>
            ))}
          </>
        )}
        
        {type === 'margherita' && (
          <>
            {Array(6).fill('').map((_, i) => (
              <div 
                key={`basil-${i}`}
                className="absolute w-5 h-5 bg-green-500 rounded-md" 
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              ></div>
            ))}
          </>
        )}
        
        {type === 'hawaiian' && (
          <>
            {Array(5).fill('').map((_, i) => (
              <div 
                key={`pineapple-${i}`}
                className="absolute w-5 h-5 bg-yellow-300 rounded-md" 
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              ></div>
            ))}
            {Array(5).fill('').map((_, i) => (
              <div 
                key={`ham-${i}`}
                className="absolute w-6 h-3 bg-pink-300 rounded-md" 
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              ></div>
            ))}
          </>
        )}
        
        {type === 'cheese' && (
          <>
            {Array(8).fill('').map((_, i) => (
              <div 
                key={`cheese-${i}`}
                className="absolute w-4 h-4 bg-yellow-200 rounded-md" 
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              ></div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Pizza;
