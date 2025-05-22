
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  const [isHovered, setIsHovered] = useState(false);
  
  const sizes = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48'
  };

  const generateToppings = (type: string, count: number) => {
    return Array(count).fill('').map((_, i) => {
      const toppingStyle: React.CSSProperties = {
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
        transform: `rotate(${Math.random() * 360}deg)`,
        transformOrigin: 'center',
        transition: 'transform 0.3s ease-out',
        zIndex: 5
      };
      
      if (isHovered) {
        toppingStyle.transform = `rotate(${Math.random() * 360}deg) scale(1.1)`;
      }
      
      switch (type) {
        case 'pepperoni':
          return (
            <motion.div 
              key={`pepperoni-${i}`}
              className="absolute w-4 h-4 bg-red-500 rounded-full shadow-sm"
              style={toppingStyle}
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          );
        case 'margherita':
          return (
            <motion.div 
              key={`basil-${i}`}
              className="absolute w-5 h-5 bg-green-500 rounded-md shadow-sm"
              style={toppingStyle}
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          );
        case 'hawaiian-pineapple':
          return (
            <motion.div 
              key={`pineapple-${i}`}
              className="absolute w-5 h-5 bg-yellow-300 rounded-md shadow-sm"
              style={toppingStyle}
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          );
        case 'hawaiian-ham':
          return (
            <motion.div 
              key={`ham-${i}`}
              className="absolute w-6 h-3 bg-pink-300 rounded-md shadow-sm"
              style={toppingStyle}
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          );
        case 'cheese':
          return (
            <motion.div 
              key={`cheese-${i}`}
              className="absolute w-4 h-4 bg-yellow-200 rounded-md shadow-sm"
              style={toppingStyle}
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          );
        default:
          return null;
      }
    });
  };

  return (
    <motion.div 
      className={cn(
        "relative rounded-full aspect-square pizza-shadow cursor-pointer", 
        sizes[size],
        spinning ? "animate-spin-slow" : "",
        className
      )}
      aria-label={`${type} pizza`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pizza base */}
      <div className="absolute inset-0 rounded-full bg-pizza-yellow overflow-hidden">
        {/* Pizza crust */}
        <motion.div 
          className="absolute inset-0 rounded-full border-8 border-pizza-crust"
          animate={{ scale: isHovered ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        
        {/* Pizza sauce layer */}
        <motion.div 
          className="absolute inset-2 rounded-full bg-pizza-sauce opacity-80"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        
        {/* Cheese layer */}
        <motion.div 
          className="absolute inset-4 rounded-full bg-yellow-100 opacity-90"
          animate={{ 
            scale: isHovered ? 1.03 : 1,
            opacity: isHovered ? 0.95 : 0.9
          }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        
        {/* Toppings */}
        {type === 'pepperoni' && generateToppings('pepperoni', 8)}
        {type === 'margherita' && generateToppings('margherita', 6)}
        {type === 'hawaiian' && (
          <>
            {generateToppings('hawaiian-pineapple', 5)}
            {generateToppings('hawaiian-ham', 5)}
          </>
        )}
        {type === 'cheese' && generateToppings('cheese', 8)}
        
        {/* Steam effect when hovered */}
        {isHovered && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <motion.div 
              className="w-1 h-6 bg-white/30 rounded-full"
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, 0.7, 0], 
                y: [-5, -15]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
            <motion.div 
              className="w-1 h-6 bg-white/30 rounded-full ml-2"
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, 0.7, 0], 
                y: [-5, -15]
              }}
              transition={{ 
                duration: 1.5, 
                delay: 0.3,
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
            <motion.div 
              className="w-1 h-6 bg-white/30 rounded-full ml-1"
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: [0, 0.7, 0], 
                y: [-5, -15]
              }}
              transition={{ 
                duration: 1.5, 
                delay: 0.6,
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Pizza;
