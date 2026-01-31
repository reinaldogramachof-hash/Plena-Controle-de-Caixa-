import { Category, Transaction, Client } from '../types';

const TRANS_KEY = 'plena_transactions';
const CAT_KEY = 'plena_categories';
const CLIENTS_KEY = 'plena_clients';

const defaultCategories: Category[] = [
  // Entradas (Receitas)
  { id: '1', name: 'Impressão e Xerox', type: 'income', color: '#4CAF50' }, // Verde
  { id: '2', name: 'Personalizados', type: 'income', color: '#8BC34A' }, // Verde Lima
  { id: '3', name: 'Papelaria e Vendas', type: 'income', color: '#009688' }, // Verde Azulado
  { id: '4', name: 'Serviços Digitais', type: 'income', color: '#03A9F4' }, // Azul Claro (Scan, Email, Design)
  { id: '5', name: 'Assistência Técnica', type: 'income', color: '#3F51B5' }, // Índigo
  
  // Saídas (Despesas)
  { id: '6', name: 'Insumos (Tinta/Papel)', type: 'expense', color: '#F44336' }, // Vermelho
  { id: '7', name: 'Matéria-Prima', type: 'expense', color: '#E91E63' }, // Rosa (Para personalizados)
  { id: '8', name: 'Reposição Loja', type: 'expense', color: '#FF5722' }, // Laranja Escuro
  { id: '9', name: 'Custos Fixos (Luz/Net)', type: 'expense', color: '#FF9800' }, // Laranja
  { id: '10', name: 'Manutenção Máquinas', type: 'expense', color: '#795548' }, // Marrom
];

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(TRANS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(TRANS_KEY, JSON.stringify(transactions));
};

export const getCategories = (): Category[] => {
  const data = localStorage.getItem(CAT_KEY);
  return data ? JSON.parse(data) : defaultCategories;
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(CAT_KEY, JSON.stringify(categories));
};

export const getClients = (): Client[] => {
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveClients = (clients: Client[]) => {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export const exportData = () => {
  const data = {
    transactions: getTransactions(),
    categories: getCategories(),
    clients: getClients(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.transactions && Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    if (data.categories && Array.isArray(data.categories)) {
      saveCategories(data.categories);
    }
    if (data.clients && Array.isArray(data.clients)) {
      saveClients(data.clients);
    }
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

// Merges new data with existing data, avoiding duplicates based on ID
export const mergeData = (jsonString: string): { success: boolean; count: number } => {
  try {
    const newData = JSON.parse(jsonString);
    let addedCount = 0;

    // Merge Transactions
    if (newData.transactions && Array.isArray(newData.transactions)) {
        const currentTransactions = getTransactions();
        const currentIds = new Set(currentTransactions.map(t => t.id));
        const mergedTransactions = [...currentTransactions];

        newData.transactions.forEach((t: Transaction) => {
        if (!currentIds.has(t.id)) {
            mergedTransactions.push(t);
            currentIds.add(t.id);
            addedCount++;
        }
        });
        saveTransactions(mergedTransactions);
    }
    
    // Merge Categories
    if (newData.categories && Array.isArray(newData.categories)) {
      const currentCats = getCategories();
      const currentCatIds = new Set(currentCats.map(c => c.id));
      const mergedCats = [...currentCats];
      
      newData.categories.forEach((c: Category) => {
        if (!currentCatIds.has(c.id)) {
          mergedCats.push(c);
          currentCatIds.add(c.id);
        }
      });
      saveCategories(mergedCats);
    }

    // Merge Clients
    if (newData.clients && Array.isArray(newData.clients)) {
        const currentClients = getClients();
        const currentClientIds = new Set(currentClients.map(c => c.id));
        const mergedClients = [...currentClients];
        
        newData.clients.forEach((c: Client) => {
          if (!currentClientIds.has(c.id)) {
            mergedClients.push(c);
            currentClientIds.add(c.id);
          }
        });
        saveClients(mergedClients);
      }

    return { success: true, count: addedCount };
  } catch (e) {
    console.error("Merge failed", e);
    return { success: false, count: 0 };
  }
};