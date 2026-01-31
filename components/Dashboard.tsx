import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, categories }) => {
  
  const stats = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.income += curr.amount;
      } else {
        acc.expense += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = stats.income - stats.expense;

  const chartData = useMemo(() => {
    // Key is the full ISO date (YYYY-MM-DD) to ensure uniqueness across years
    const dataMap: Record<string, {name: string, income: number, expense: number, dateKey: string}> = {};
    
    // Sort transactions by date asc for correct chart rendering
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    
    sorted.forEach(t => {
      // Use full date as key to prevent '01/01/2025' merging with '01/01/2026'
      const dateKey = t.date; 

      if (!dataMap[dateKey]) {
        // Create the display label (DD/MM)
        const parts = t.date.split('-');
        let dateLabel = t.date;
        if (parts.length === 3) {
           dateLabel = `${parts[2]}/${parts[1]}`;
        }

        dataMap[dateKey] = { 
            name: dateLabel, // Visual label
            dateKey: dateKey, // Sorting key
            income: 0, 
            expense: 0 
        };
      }
      
      if (t.type === 'income') dataMap[dateKey].income += t.amount;
      else dataMap[dateKey].expense += t.amount;
    });

    // Take last 7 entries (days with activity)
    return Object.values(dataMap).slice(-7);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
       const catName = categories.find(c => c.id === t.categoryId)?.name || 'Desconhecido';
       catMap[catName] = (catMap[catName] || 0) + t.amount;
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions, categories]);

  const COLORS = ['#FF6B00', '#000000', '#4CAF50', '#2196F3', '#9E9E9E'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-plena-orange"></div>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-gray-500 font-medium">Saldo Atual</h3>
             <div className="p-2 bg-orange-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-plena-orange" />
             </div>
          </div>
          <p className={`text-2xl font-mono font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        {/* Income Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-gray-500 font-medium">Receitas</h3>
             <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
             </div>
          </div>
          <p className="text-2xl font-mono font-bold text-gray-900">
            {formatCurrency(stats.income)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-gray-500 font-medium">Despesas</h3>
             <div className="p-2 bg-red-50 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
             </div>
          </div>
          <p className="text-2xl font-mono font-bold text-gray-900">
            {formatCurrency(stats.expense)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Movimentação Recente</h3>
          <div className="h-72 w-full flex-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#000'}}
                    itemStyle={{ color: '#000' }}
                    labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" name="Entrada" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="expense" name="Saída" fill="#F44336" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Calendar className="w-12 h-12 mb-2 opacity-20" />
                <p>Sem movimentações recentes</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Despesas</h3>
          <div className="h-64 w-full flex-1">
             {categoryData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)} 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      itemStyle={{ color: '#000' }}
                    />
                  </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm">Nenhuma despesa registrada</p>
               </div>
             )}
          </div>
          <div className="space-y-2 mt-4">
             {categoryData.map((cat, idx) => (
               <div key={idx} className="flex justify-between items-center text-sm">
                 <div className="flex items-center">
                   <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                   <span className="text-gray-600 truncate max-w-[120px]">{cat.name}</span>
                 </div>
                 <span className="font-medium text-gray-900">{formatCurrency(cat.value)}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};