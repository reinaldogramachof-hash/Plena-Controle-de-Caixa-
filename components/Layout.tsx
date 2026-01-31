import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  Settings, 
  Menu, 
  X,
  Wallet,
  Users
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
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: LayoutDashboard, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 
          bg-gradient-to-b from-gray-900 via-gray-900 to-black 
          text-white transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="bg-gradient-to-br from-plena-orange to-orange-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-orange-900/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">PLENA</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Controle v2.0</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-plena-orange text-white shadow-lg shadow-orange-900/40 translate-x-1' 
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                `}
              >
                {isActive && (
                   <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30" />
                )}
                <Icon className={`w-5 h-5 mr-3 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-white/5 bg-black/20">
           <p className="text-xs text-gray-500 text-center leading-relaxed">
             Desenvolvido por<br/>
             <a 
               href="https://www.plenainformatica.com.br" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="text-gray-400 hover:text-white transition-colors font-medium"
               style={{ textDecoration: 'none' }}
             >
               Plena Informática
             </a>
           </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
        {/* Glassmorphism Header */}
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 lg:px-8 
                           bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden text-gray-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hoje</p>
               <p className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
             </div>
             <div className="h-9 w-9 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-gray-100 cursor-pointer hover:ring-plena-orange transition-all">
                P
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};