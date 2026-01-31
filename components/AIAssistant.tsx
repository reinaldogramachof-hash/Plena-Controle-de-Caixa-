import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Content } from "@google/genai";
import { Sparkles, Send, X, Bot, Minimize2, Trash2 } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAssistant: React.FC<Props> = ({ transactions, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou seu assistente financeiro inteligente da Plena. Como posso ajudar com os dados de hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Generate Financial Context Summary
  const getFinancialContext = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    // Top Categories
    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
       const catName = categories.find(c => c.id === t.categoryId)?.name || 'Outros';
       catMap[catName] = (catMap[catName] || 0) + t.amount;
    });
    const topCategories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, val]) => `${name} (${formatCurrency(val)})`)
      .join(', ');

    return `
      CONTEXTO DO SISTEMA (PLENA CASH CONTROL):
      - Data atual: ${new Date().toLocaleDateString('pt-BR')}
      - Saldo Atual: ${formatCurrency(balance)}
      - Receita Total: ${formatCurrency(totalIncome)}
      - Despesa Total: ${formatCurrency(totalExpense)}
      - Top 5 Despesas: ${topCategories || 'Sem dados'}
      - Total de Transações: ${transactions.length}
      
      DIRETRIZES:
      1. Você é um assistente financeiro da empresa Plena Informática.
      2. Responda de forma concisa e direta.
      3. Use formatação Markdown (negrito, listas) para facilitar a leitura.
      4. Se o usuário perguntar algo fora do contexto financeiro, redirecione gentilmente.
      5. Analise o saldo: se positivo, seja otimista; se negativo, dê dicas práticas de economia baseadas nas categorias de despesa listadas.
    `;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    // Optimistic UI update
    const newHistory = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      if (!process.env.API_KEY) {
        throw new Error("Chave de API não detectada no ambiente.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelId = 'gemini-3-flash-preview'; 
      
      // Convert UI messages to SDK History format
      // We skip the very first static greeting message to avoid confusion or format issues
      const history: Content[] = newHistory.slice(1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // We remove the last message (the one we just added) from history 
      // because we are about to send it as the 'message' parameter
      const historyForChat = history.slice(0, -1);

      const chat = ai.chats.create({
        model: modelId,
        config: {
          systemInstruction: getFinancialContext(),
        },
        history: historyForChat
      });
      
      const result = await chat.sendMessage({ message: userMsg });
      const text = result.text;

      if (text) {
        setMessages(prev => [...prev, { role: 'model', text }]);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "Desculpe, não consegui processar sua solicitação no momento.";
      
      if (error.message?.includes('API Key')) {
        errorMsg = "Erro de Configuração: API Key não encontrada.";
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: errorMsg
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([{ role: 'model', text: 'Histórico limpo. Como posso ajudar agora?' }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 pointer-events-auto animate-fade-in origin-bottom-right flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">IA Plena Cash</h3>
                <p className="text-[10px] text-blue-100 opacity-80">Gemini 3 Flash</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClearHistory}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                title="Limpar conversa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <input 
                type="text" 
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                placeholder="Pergunte sobre suas finanças..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          pointer-events-auto
          h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white
          ${isOpen ? 'bg-gray-700 rotate-90' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 animate-pulse-slow'}
        `}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
};