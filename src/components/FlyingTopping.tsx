
import React from 'react';
import { motion } from 'framer-motion';

interface FlyingToppingProps {
  type: 'pepperoni' | 'basil' | 'pineapple' | 'cheese';
  delay: number;
}

const FlyingTopping: React.FC<FlyingToppingProps> = ({ type, delay }) => {
  const toppingStyles = {
    pepperoni: {
      className: 'bg-red-500 rounded-full w-8 h-8',
      emoji: '🍕'
    },
    basil: {
      className: 'bg-green-500 w-6 h-6',
      emoji: '🌿'
    },
    pineapple: {
      className: 'bg-yellow-300 w-7 h-7',
      emoji: '🍍'
    },
    cheese: {
      className: 'bg-yellow-200 rounded-sm w-6 h-6',
      emoji: '🧀'
    }
  };
  
  const randomRotation = Math.random() * 1440 - 720; // -720 to 720 degrees
  const randomY = Math.random() * 100 - 50; // -50 to 50 vertical variation
  
  const animationStyle = {
    animationDelay: `${delay}s`,
    top: `${10 + Math.random() * 70}%`
  };

  return (
    <motion.div 
      className={`absolute ${toppingStyles[type].className} pizza-shadow flex items-center justify-center text-xl font-bold animate-fly-topping`}
      style={animationStyle}
      initial={{ 
        x: -100, 
        y: 0, 
        rotate: 0, 
        opacity: 0 
      }}
      animate={{ 
        x: window.innerWidth + 100, 
        y: randomY, 
        rotate: randomRotation, 
        opacity: [0, 1, 1, 0],
      }}
      transition={{ 
        duration: 3, 
        ease: "linear", 
        delay: delay,
        times: [0, 0.1, 0.9, 1]
      }}
    >
      {toppingStyles[type].emoji}
    </motion.div>
  );
};

export default FlyingTopping;
