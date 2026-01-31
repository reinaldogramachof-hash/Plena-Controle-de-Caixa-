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
import { TrendingUp, TrendingDown, DollarSign, Calendar, Wallet } from 'lucide-react';
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
    const dataMap: Record<string, {name: string, income: number, expense: number, dateKey: string}> = {};
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    
    sorted.forEach(t => {
      const dateKey = t.date; 
      if (!dataMap[dateKey]) {
        const parts = t.date.split('-');
        let dateLabel = t.date;
        if (parts.length === 3) {
           dateLabel = `${parts[2]}/${parts[1]}`;
        }
        dataMap[dateKey] = { name: dateLabel, dateKey: dateKey, income: 0, expense: 0 };
      }
      if (t.type === 'income') dataMap[dateKey].income += t.amount;
      else dataMap[dateKey].expense += t.amount;
    });

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

  const COLORS = ['#FF6B00', '#1F2937', '#10B981', '#3B82F6', '#9CA3AF'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hero Balance Card */}
        <div className="bg-gradient-to-br from-plena-orange to-red-600 rounded-2xl shadow-lg shadow-orange-200 text-white p-6 relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                 <Wallet className="w-6 h-6 text-white" />
               </div>
               <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">Atual</span>
            </div>
            
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Saldo em Caixa</p>
              <h2 className="text-3xl lg:text-4xl font-mono font-bold tracking-tight">
                {formatCurrency(balance)}
              </h2>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
             <div>
               <p className="text-gray-500 text-sm font-medium">Receitas</p>
               <h3 className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-green-600 transition-colors">
                 {formatCurrency(stats.income)}
               </h3>
             </div>
             <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-600" />
             </div>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
             <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between group">
           <div className="flex items-center justify-between mb-4">
             <div>
               <p className="text-gray-500 text-sm font-medium">Despesas</p>
               <h3 className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-red-600 transition-colors">
                 {formatCurrency(stats.expense)}
               </h3>
             </div>
             <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                <TrendingDown className="w-6 h-6 text-red-600" />
             </div>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
             <div className="bg-red-500 h-full rounded-full" style={{ width: `${stats.income > 0 ? Math.min((stats.expense/stats.income)*100, 100) : 0}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Fluxo de Caixa</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">Últimos 7 dias</span>
          </div>
          
          <div className="h-72 w-full flex-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    cursor={{fill: '#F9FAFB'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#1F2937'}}
                    itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" name="Entrada" fill="#10B981" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="expense" name="Saída" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <Calendar className="w-12 h-12 mb-2 opacity-20" />
                <p>Sem dados suficientes para o gráfico</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Despesas</h3>
          <div className="h-64 w-full flex-1 relative">
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
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)} 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                      itemStyle={{ color: '#1F2937' }}
                    />
                  </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm">Nenhuma despesa</p>
               </div>
             )}
             
             {/* Center Text (Optional Polish) */}
             {categoryData.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 font-medium">Total</p>
                  </div>
                </div>
             )}
          </div>
          <div className="space-y-3 mt-6">
             {categoryData.map((cat, idx) => (
               <div key={idx} className="flex justify-between items-center text-sm group cursor-default">
                 <div className="flex items-center">
                   <span className="w-2.5 h-2.5 rounded-full mr-2.5 transition-transform group-hover:scale-125" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                   <span className="text-gray-600 truncate max-w-[120px] group-hover:text-gray-900 transition-colors">{cat.name}</span>
                 </div>
                 <span className="font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded text-xs">{formatCurrency(cat.value)}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};