
import React from 'react';
import { cn } from '@/lib/utils';
import Pizza from './Pizza';

export type PizzaType = 'pepperoni' | 'margherita' | 'hawaiian' | 'cheese';

interface PizzaTypeSelectorProps {
  selected: PizzaType;
  onChange: (type: PizzaType) => void;
}

interface PizzaOption {
  type: PizzaType;
  label: string;
  musicStyle: string;
}

const pizzaOptions: PizzaOption[] = [
  { type: 'pepperoni', label: 'Pepperoni', musicStyle: 'Techno' },
  { type: 'margherita', label: 'Margherita', musicStyle: 'Jazz' },
  { type: 'hawaiian', label: 'Hawaiian', musicStyle: 'Reggaeton' },
  { type: 'cheese', label: '4 Cheese', musicStyle: 'Vaporwave' },
];

const PizzaTypeSelector: React.FC<PizzaTypeSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Choose Your Pizza Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pizzaOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => onChange(option.type)}
            className={cn(
              "flex flex-col items-center p-4 rounded-2xl transition-all duration-300 hover:scale-105",
              selected === option.type 
                ? "bg-pizza-pink ring-4 ring-pizza-lavender transform scale-105" 
                : "bg-white/50 hover:bg-white/80"
            )}
          >
            <Pizza type={option.type} size="sm" />
            <span className="mt-2 font-bold">{option.label}</span>
            <span className="text-sm text-gray-600">{option.musicStyle}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PizzaTypeSelector;
