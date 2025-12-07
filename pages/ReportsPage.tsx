import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Upload, Share2, TrendingUp, TrendingDown, 
  DollarSign, AlertCircle, CalendarDays, Trophy
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils';
import { Button } from '../components/ui/Button';
import { mergeData } from '../services/dataService';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onTransactionsUpdate: () => void;
}

export const ReportsPage: React.FC<Props> = ({ transactions, categories, onTransactionsUpdate }) => {
  // Helper to format date as YYYY-MM-DD using local time
  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Default defaults: First day of current month to Today
  const getStartOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    return toLocalDateString(d);
  };
  const getToday = () => toLocalDateString(new Date());

  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getToday());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter transactions for the selected range
  const reportData = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  // Stats Calculation
  const stats = useMemo(() => {
    const income = reportData.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = reportData.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [reportData]);

  // Top Service Calculation
  const topService = useMemo(() => {
    const serviceMap: Record<string, number> = {};
    
    reportData.filter(t => t.type === 'income').forEach(t => {
      serviceMap[t.categoryId] = (serviceMap[t.categoryId] || 0) + t.amount;
    });

    let topId = '';
    let maxAmount = 0;

    Object.entries(serviceMap).forEach(([id, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topId = id;
      }
    });

    if (!topId) return null;

    const category = categories.find(c => c.id === topId);
    return {
      name: category?.name || 'Desconhecido',
      color: category?.color || '#ccc',
      amount: maxAmount,
      percentage: stats.income > 0 ? (maxAmount / stats.income) * 100 : 0
    };
  }, [reportData, categories, stats.income]);

  // Chart Data (Day by Day for the selected range)
  const chartData = useMemo(() => {
    const data = [];
    const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Create local dates at noon to avoid timezone boundary issues
    const s = new Date(startDate + 'T12:00:00');
    const e = new Date(endDate + 'T12:00:00');
    
    // Safety check
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return [];

    const current = new Date(s);
    while (current <= e) {
        const dateStr = toLocalDateString(current);
        const dayLabel = `${daysMap[current.getDay()]} ${current.getDate()}`;
        
        const entry = {
            name: dayLabel,
            fullDate: dateStr,
            income: 0,
            expense: 0
        };

        // Aggregate data for this day
        reportData.filter(t => t.date === dateStr).forEach(t => {
            if (t.type === 'income') entry.income += t.amount;
            else entry.expense += t.amount;
        });

        data.push(entry);
        
        // Next day
        current.setDate(current.getDate() + 1);
    }
    return data;
  }, [reportData, startDate, endDate]);

  // File Upload Handlers
  const handleFileMerge = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let processed = 0;
    let totalAdded = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const result = mergeData(content);
        if (result.success) totalAdded += result.count;
        
        processed++;
        if (processed === files.length) {
          alert(`Processo concluído! ${totalAdded} novas transações integradas.`);
          onTransactionsUpdate();
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file as Blob);
    });
  };

  const handleWhatsAppShare = () => {
    const sDate = new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const eDate = new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR');

    let message = `*📊 RELATÓRIO DE CAIXA - Plena Informática*\n`;
    message += `📅 Período: ${sDate} a ${eDate}\n\n`;
    
    message += `🟢 *Entradas:* ${formatCurrency(stats.income)}\n`;
    message += `🔴 *Saídas:* ${formatCurrency(stats.expense)}\n`;
    message += `💰 *SALDO:* ${formatCurrency(stats.balance)}\n\n`;

    if (topService) {
      message += `🏆 *Destaque:* ${topService.name} (${formatCurrency(topService.amount)})\n`;
    }
    
    if (chartData.length > 0) {
        const bestDay = chartData.reduce((prev, current) => (prev.income > current.income) ? prev : current);
        if (bestDay.income > 0) {
        message += `📅 *Melhor Dia:* ${bestDay.name} (${formatCurrency(bestDay.income)})\n`;
        }
    }

    message += `\n_Gerado pelo Sistema Web Plena_`;

    const phoneNumber = '5512981488505';
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatório por Período</h2>
          <p className="text-gray-500 text-sm">Selecione as datas para consolidar e analisar.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-3 w-full xl:w-auto">
          
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
            <CalendarDays className="w-4 h-4 text-gray-400 ml-1" />
            <div className="flex items-center gap-2">
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 p-1"
                    title="Data Inicial"
                />
                <span className="text-gray-400 text-xs">até</span>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 p-1"
                    title="Data Final"
                />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 whitespace-nowrap"
            >
              <Upload className="w-4 h-4 mr-2" />
              Consolidar
            </Button>
            <input 
              type="file" 
              multiple 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileMerge}
            />
            
            <Button onClick={handleWhatsAppShare} className="bg-green-600 hover:bg-green-700 text-white border-transparent" title="Enviar Relatório no WhatsApp">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-800 text-sm">Consolidação de Arquivos</h4>
          <p className="text-blue-700 text-xs mt-1">
            Selecione o período desejado no calendário acima. Use o botão <strong>"Consolidar"</strong> para adicionar backups diários de outros dispositivos a este relatório.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
             <span className="text-gray-500 text-sm">Receita do Período</span>
             <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-gray-900">{formatCurrency(stats.income)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
             <span className="text-gray-500 text-sm">Despesa do Período</span>
             <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-gray-900">{formatCurrency(stats.expense)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className={`absolute right-0 top-0 h-full w-1 ${stats.balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="flex items-center justify-between mb-2">
             <span className="text-gray-500 text-sm">Saldo do Período</span>
             <DollarSign className="w-5 h-5 text-plena-orange" />
          </div>
          <p className={`text-2xl font-mono font-bold ${stats.balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatCurrency(stats.balance)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Desempenho Diário</h3>
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    dy={10} 
                    interval="preserveStartEnd"
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{color: '#374151', fontWeight: 'bold'}}
                />
                <Bar dataKey="income" name="Entradas" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Saídas" fill="#F44336" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Calendar className="w-12 h-12 mb-2 opacity-20" />
              <p>Nenhum dado encontrado para este período.</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Service Highlight */}
      {topService && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-50 border border-orange-100">
              <Trophy className="w-8 h-8 text-plena-orange" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Serviço Destaque</h3>
              <p className="text-gray-500 text-sm">O serviço que gerou maior receita neste período.</p>
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white" 
                style={{ backgroundColor: topService.color }} 
              />
              <span className="font-medium text-gray-900 text-lg">{topService.name}</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-gray-900">{formatCurrency(topService.amount)}</p>
              <p className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded-full inline-block border border-gray-100 shadow-sm mt-1">
                {topService.percentage.toFixed(1)}% da receita
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};