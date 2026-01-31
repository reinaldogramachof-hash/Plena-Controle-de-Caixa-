export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'pix' | 'other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  tags: string[];
  date: string; // ISO String
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface ClientTask {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string; // CPF or CNPJ
  address: string;
  notes: string; // The Post-it content
  tasks: ClientTask[];
  createdAt: number;
}

export interface FilterState {
  period: 'today' | 'week' | 'month' | 'all';
  type: 'all' | TransactionType;
}

export interface DashboardStats {
  balance: number;
  income: number;
  expense: number;
}