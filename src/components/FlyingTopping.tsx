
import React from 'react';

interface FlyingToppingProps {
  type: 'pepperoni' | 'basil' | 'pineapple' | 'cheese';
  delay: number;
}

const FlyingTopping: React.FC<FlyingToppingProps> = ({ type, delay }) => {
  const toppingStyles = {
    pepperoni: 'bg-red-500 rounded-full w-8 h-8',
    basil: 'bg-green-500 rounded-md w-6 h-6',
    pineapple: 'bg-yellow-300 rounded-md w-7 h-7',
    cheese: 'bg-yellow-200 rounded-sm w-6 h-6'
  };
  
  const animationStyle = {
    animationDelay: `${delay}s`,
    top: `${10 + Math.random() * 70}%`
  };

  return (
    <div 
      className={`absolute ${toppingStyles[type]} animate-fly-topping pizza-shadow`}
      style={animationStyle}
    />
  );
};

export default FlyingTopping;
