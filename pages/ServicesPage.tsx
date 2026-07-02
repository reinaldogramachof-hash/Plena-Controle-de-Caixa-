import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, Briefcase, Minus, Settings2, X } from 'lucide-react';
import { ServiceRecord, ServiceItem } from '../types';
import { getTodayLocal } from '../utils';

interface ServicesPageProps {
  services: ServiceRecord[];
  serviceItems: ServiceItem[];
  onAddService: (service: ServiceRecord) => void;
  onUpdateService: (service: ServiceRecord) => void;
  onDeleteService: (id: string) => void;
  onAddServiceItem: (item: ServiceItem) => void;
  onUpdateServiceItem: (item: ServiceItem) => void;
  onDeleteServiceItem: (id: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  serviceItems,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddServiceItem,
  onUpdateServiceItem,
  onDeleteServiceItem
}) => {
  const [selectedDate, setSelectedDate] = useState(getTodayLocal());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Catalog Modal State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  // Daily Services Logic
  const handleIncrement = (item: ServiceItem) => {
    const existing = services.find(s => s.serviceItemId === item.id && s.date === selectedDate);
    if (existing) {
      onUpdateService({ ...existing, quantity: existing.quantity + 1 });
    } else {
      onAddService({
        id: Math.random().toString(36).substr(2, 9),
        serviceItemId: item.id,
        name: item.name,
        quantity: 1,
        date: selectedDate
      });
    }
  };

  const handleDecrement = (item: ServiceItem) => {
    const existing = services.find(s => s.serviceItemId === item.id && s.date === selectedDate);
    if (existing && existing.quantity > 0) {
      onUpdateService({ ...existing, quantity: existing.quantity - 1 });
    }
  };

  const getQuantityForToday = (itemId: string) => {
    const record = services.find(s => s.serviceItemId === itemId && s.date === selectedDate);
    return record ? record.quantity : 0;
  };

  // Catalog Logic
  const openNewItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemPrice('');
    setIsCatalogModalOpen(true);
  };

  const openEditItemModal = (item: ServiceItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.defaultPrice.toString());
    setIsCatalogModalOpen(true);
  };

  const handleCatalogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ServiceItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      name: itemName,
      defaultPrice: parseFloat(itemPrice) || 0
    };

    if (editingItem) {
      onUpdateServiceItem(item);
    } else {
      onAddServiceItem(item);
    }
    setItemName('');
    setItemPrice('');
    setEditingItem(null);
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return serviceItems;
    return serviceItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [serviceItems, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Serviços</h1>
          <p className="text-gray-500">Registre rapidamente a quantidade de serviços realizados no dia.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none bg-white text-gray-700 shadow-sm"
          />
          <button 
            onClick={() => setIsCatalogModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Settings2 className="w-5 h-5" />
            Catálogo
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar serviço no catálogo..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none bg-gray-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
             <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center">
                <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
                <p>Nenhum serviço encontrado. Adicione novos no Catálogo.</p>
             </div>
          ) : (
            filteredItems.map(item => {
              const qty = getQuantityForToday(item.id);
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button 
                      onClick={() => handleDecrement(item)}
                      disabled={qty === 0}
                      className={`p-1.5 rounded-md transition-colors ${qty > 0 ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-lg text-gray-900 font-mono">
                      {qty}
                    </span>
                    <button 
                      onClick={() => handleIncrement(item)}
                      className="p-1.5 rounded-md text-white bg-plena-orange hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col h-[80vh] animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Catálogo de Serviços</h2>
              <button 
                onClick={() => setIsCatalogModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Form */}
              <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 p-6 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  {editingItem ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <form onSubmit={handleCatalogSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input 
                      type="text"
                      required
                      value={itemName}
                      onChange={e => setItemName(e.target.value)}
                      placeholder="Ex: Impressão PB"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário (Opcional)</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemPrice}
                      onChange={e => setItemPrice(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none bg-white"
                    />
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button 
                      type="submit"
                      className="w-full py-2 text-white bg-gray-900 rounded-lg hover:bg-black transition-colors font-medium shadow-sm"
                    >
                      {editingItem ? 'Atualizar' : 'Adicionar'}
                    </button>
                    {editingItem && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setItemName('');
                          setItemPrice('');
                        }}
                        className="w-full py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List */}
              <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Itens Cadastrados
                </h3>
                <div className="space-y-2">
                  {serviceItems.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Nenhum serviço cadastrado.</p>
                  ) : (
                    serviceItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditItemModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm('Excluir este serviço do catálogo?')) {
                                onDeleteServiceItem(item.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
