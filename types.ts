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
  quantity?: number; // Added to track quantity of services (e.g. prints)
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

export interface ServiceItem {
  id: string;
  name: string;
  defaultPrice: number;
}

export interface ServiceRecord {
  id: string;
  serviceItemId: string; // reference to ServiceItem
  name: string; // duplicated for historical if item deleted
  quantity: number;
  date: string; // YYYY-MM-DD
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