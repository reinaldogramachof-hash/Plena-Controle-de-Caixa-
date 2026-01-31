import React, { useState } from 'react';
import { Search, Filter, Trash2, Tag, Calendar, ArrowUpCircle, ArrowDownCircle, Edit2 } from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { TransactionForm } from '../components/TransactionForm';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
}

export const TransactionsPage: React.FC<Props> = ({ transactions, categories, onDelete, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    // Sort by Date Descending
    const dateComparison = b.date.localeCompare(a.date);
    if (dateComparison !== 0) return dateComparison;
    // If dates are equal, sort by creation time (most recently added first)
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Histórico de Transações</h2>
        <div className="flex space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <select 
               className="h-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-plena-orange appearance-none pr-8"
               value={filterType}
               onChange={(e) => setFilterType(e.target.value as 'all' | TransactionType)}
             >
               <option value="all">Todos</option>
               <option value="income">Entradas</option>
               <option value="expense">Saídas</option>
             </select>
             <Filter className="absolute right-2 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Categoria</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Método</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Valor</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(t.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{t.description}</div>
                      {t.tags.length > 0 && (
                        <div className="flex items-center mt-1 space-x-1">
                          {t.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {getCategoryName(t.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{t.paymentMethod}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                       <div className={`flex items-center justify-end font-mono font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                         {t.type === 'income' ? <ArrowUpCircle className="w-4 h-4 mr-1"/> : <ArrowDownCircle className="w-4 h-4 mr-1"/>}
                         {t.type === 'expense' ? '-' : '+'} {formatCurrency(t.amount)}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setEditingTransaction(t)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onDelete(t.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {editingTransaction && (
        <TransactionForm
          categories={categories}
          initialData={editingTransaction}
          onSave={(updatedTransaction) => {
            onUpdate(updatedTransaction);
            setEditingTransaction(null);
          }}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};