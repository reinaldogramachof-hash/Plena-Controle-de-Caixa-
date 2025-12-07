import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types';
import { generateId } from '../utils';
import { Button } from './ui/Button';

interface Props {
  categories: Category[];
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
  initialData?: Transaction | null;
}

export const TransactionForm: React.FC<Props> = ({ categories, onSave, onClose, initialData }) => {
  // Use local date for initial value instead of UTC (toISOString)
  const getTodayLocal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [date, setDate] = useState(initialData?.date || getTodayLocal());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'cash');
  const [tags, setTags] = useState(initialData?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId) return;

    const newTransaction: Transaction = {
      id: initialData?.id || generateId(), // Keep ID if editing, generate new if creating
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      date,
      paymentMethod,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: initialData?.createdAt || Date.now() // Keep creation date if editing
    };

    onSave(newTransaction);
    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === type);
  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex space-x-4 mb-4">
            <label className={`flex-1 cursor-pointer rounded-lg p-3 text-center border-2 transition-all ${type === 'income' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 text-gray-500'}`}>
              <input type="radio" className="hidden" checked={type === 'income'} onChange={() => setType('income')} />
              Entrada
            </label>
            <label className={`flex-1 cursor-pointer rounded-lg p-3 text-center border-2 transition-all ${type === 'expense' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-200 text-gray-500'}`}>
              <input type="radio" className="hidden" checked={type === 'expense'} onChange={() => setType('expense')} />
              Saída
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input 
                type="date"
                required
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input 
              type="text"
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
              placeholder="Ex: Pagamento Cliente X"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none bg-white text-black"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Selecione</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none bg-white text-black"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="cash">Dinheiro</option>
                <option value="card">Cartão</option>
                <option value="pix">Pix</option>
                <option value="transfer">Transferência</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
             <input 
                type="text"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                placeholder="Ex: mensal, urgente"
                value={tags}
                onChange={e => setTags(e.target.value)}
             />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1">
                {isEditing ? 'Salvar Alterações' : 'Salvar'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};