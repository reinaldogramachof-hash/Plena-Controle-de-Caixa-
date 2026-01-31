import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ClientsPage } from './pages/ClientsPage';
import { TransactionForm } from './components/TransactionForm';
import { DailyClosingModal } from './components/DailyClosingModal';
import { AIAssistant } from './components/AIAssistant';
import { Button } from './components/ui/Button';
import { Plus, CheckCircle } from 'lucide-react';
import { 
  getTransactions, saveTransactions, 
  getCategories, saveCategories,
  getClients, saveClients 
} from './services/dataService';
import { Transaction, Category, Client } from './types';

/**
 * Plena Cash Control
 * Version: 2026.1.1 (Clients Module Added)
 * Status: Audited
 */

function App() {
  // Initialize state lazily
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [clients, setClients] = useState<Client[]>(() => getClients());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Manual refresh function for Settings import or Merge
  const refreshData = () => {
    setTransactions(getTransactions());
    setCategories(getCategories());
    setClients(getClients());
  };

  // Persist transactions
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Persist clients
  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  // --- Transaction Handlers ---
  const handleAddTransaction = (transaction: Transaction) => {
    const updated = [...transactions, transaction];
    setTransactions(updated);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    const updated = transactions.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
    );
    setTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const password = window.prompt("Para excluir, digite a senha de administrador:");
    
    if (password === "plena123") {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
    } else if (password !== null) {
      alert("Senha incorreta. Ação cancelada.");
    }
  };

  // --- Category Handlers ---
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

  // --- Client Handlers ---
  const handleAddClient = (client: Client) => {
    const updated = [...clients, client];
    setClients(updated);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    const updated = clients.map(c => 
      c.id === updatedClient.id ? updatedClient : c
    );
    setClients(updated);
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
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
                onUpdate={handleUpdateTransaction}
              />
            } 
          />
          <Route 
            path="/clients" 
            element={
              <ClientsPage 
                clients={clients} 
                onAddClient={handleAddClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
              />
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ReportsPage 
                transactions={transactions} 
                categories={categories}
                onTransactionsUpdate={refreshData}
              />
            } 
          />
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

        <AIAssistant transactions={transactions} categories={categories} />

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