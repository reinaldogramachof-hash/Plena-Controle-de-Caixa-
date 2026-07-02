import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  Settings, 
  Menu, 
  X,
  Wallet,
  Users,
  Briefcase
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navSections = [
    {
      title: 'Principal',
      items: [
        { icon: PieChart, label: 'Dashboard', path: '/' },
        { icon: ArrowRightLeft, label: 'Transações', path: '/transactions' },
      ]
    },
    {
      title: 'Operacional',
      items: [
        { icon: Users, label: 'Clientes', path: '/clients' },
        { icon: Briefcase, label: 'Serviços', path: '/services' },
      ]
    },
    {
      title: 'Visão Geral',
      items: [
        { icon: LayoutDashboard, label: 'Relatórios', path: '/reports' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { icon: Settings, label: 'Configurações', path: '/settings' },
      ]
    }
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

      {/* Desktop Spacer */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'}`} />

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-gradient-to-b from-gray-900 via-gray-900 to-black 
          text-white transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex-none h-16 flex items-center px-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="bg-gradient-to-br from-plena-orange to-orange-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-orange-900/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">PLENA</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Controle v2.0</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h2 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h2>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
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
            </div>
          ))}
        </nav>
        
        <div className="flex-none p-6 border-t border-white/5 bg-black/20">
           <p className="text-xs text-gray-500 text-center leading-relaxed whitespace-nowrap">
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
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
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