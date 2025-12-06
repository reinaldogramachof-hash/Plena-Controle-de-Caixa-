import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { generateId } from '../utils';
import { Button } from './ui/Button';

interface Props {
  onSave: (category: Category) => void;
  onClose: () => void;
}

export const CategoryForm: React.FC<Props> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#FF6B00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCategory: Category = {
      id: generateId(),
      name,
      type,
      color
    };

    onSave(newCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Nova Categoria</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Lazer"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
             <div className="flex space-x-2">
                <label className={`flex-1 cursor-pointer rounded-lg p-2 text-center border transition-all ${type === 'income' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" className="hidden" checked={type === 'income'} onChange={() => setType('income')} />
                  Entrada
                </label>
                <label className={`flex-1 cursor-pointer rounded-lg p-2 text-center border transition-all ${type === 'expense' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" className="hidden" checked={type === 'expense'} onChange={() => setType('expense')} />
                  Saída
                </label>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
            <div className="flex items-center space-x-2">
               <div className="relative overflow-hidden w-12 h-12 rounded-lg border border-gray-200 shadow-sm">
                 <input 
                   type="color" 
                   value={color}
                   onChange={e => setColor(e.target.value)}
                   className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                 />
               </div>
               <span className="text-gray-500 text-sm font-mono">{color.toUpperCase()}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full">Criar Categoria</Button>
          </div>
        </form>
      </div>
    </div>
  );
};