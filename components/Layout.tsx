import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  Settings, 
  Menu, 
  X,
  Wallet
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { icon: PieChart, label: 'Dashboard', path: '/' },
    { icon: ArrowRightLeft, label: 'Transações', path: '/transactions' },
    { icon: LayoutDashboard, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-black text-white transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-plena-orange">
          <Wallet className="w-8 h-8 text-white mr-3" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">PLENA</h1>
            <p className="text-xs text-white/80">Controle de Caixa</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-plena-orange text-white' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'}
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-800">
           <p className="text-xs text-gray-500 text-center">
             Desenvolvido por{' '}
             <a 
               href="https://www.plenainformatica.com.br" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="hover:text-gray-400 transition-colors"
               style={{ textDecoration: 'none', color: 'inherit' }}
             >
               Plena Informática
             </a>{' '}
             2025
           </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
             <div className="h-8 w-8 bg-plena-orange rounded-full flex items-center justify-center text-white font-bold">
                P
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};