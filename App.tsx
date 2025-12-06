import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionForm } from './components/TransactionForm';
import { DailyClosingModal } from './components/DailyClosingModal';
import { Button } from './components/ui/Button';
import { Plus, CheckCircle } from 'lucide-react';
import { getTransactions, saveTransactions, getCategories, saveCategories } from './services/dataService';
import { Transaction, Category } from './types';

function App() {
  // Initialize state lazily from localStorage to ensure data is present on first render
  // and to avoid overwriting localStorage with empty arrays on mount
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Manual refresh function for Settings import
  const refreshData = () => {
    setTransactions(getTransactions());
    setCategories(getCategories());
  };

  // Persist when state changes
  // Removed the length check to allow saving empty arrays (when user deletes all items)
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const handleAddTransaction = (transaction: Transaction) => {
    const updated = [...transactions, transaction];
    setTransactions(updated);
    // LocalStorage sync is handled by useEffect
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Excluir esta transação?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
    }
  };

  const handleAddCategory = (category: Category) => {
    const updated = [...categories, category];
    setCategories(updated);
    saveCategories(updated);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveCategories(updated);
  };

  return (
    <Router>
      <Layout>
        <div className="mb-6 flex flex-col sm:flex-row justify-end gap-3">
          <Button 
            onClick={() => setIsClosingModalOpen(true)} 
            variant="secondary"
            className="shadow-sm"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Fechar Caixa
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="shadow-lg shadow-orange-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Transação
          </Button>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard transactions={transactions} categories={categories} />} />
          <Route 
            path="/transactions" 
            element={
              <TransactionsPage 
                transactions={transactions} 
                categories={categories} 
                onDelete={handleDeleteTransaction}
              />
            } 
          />
          <Route path="/reports" element={<Dashboard transactions={transactions} categories={categories} />} />
          <Route 
            path="/settings" 
            element={
              <SettingsPage 
                categories={categories} 
                refreshData={refreshData}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            } 
          />
        </Routes>

        {isModalOpen && (
          <TransactionForm 
            categories={categories} 
            onSave={handleAddTransaction} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}

        {isClosingModalOpen && (
          <DailyClosingModal 
            transactions={transactions}
            onClose={() => setIsClosingModalOpen(false)}
          />
        )}
      </Layout>
    </Router>
  );
}

export default App;