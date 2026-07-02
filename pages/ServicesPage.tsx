import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, Layers, Briefcase } from 'lucide-react';
import { ServiceRecord } from '../types';
import { formatCurrency, getTodayLocal } from '../utils';

interface ServicesPageProps {
  services: ServiceRecord[];
  onAddService: (service: ServiceRecord) => void;
  onUpdateService: (service: ServiceRecord) => void;
  onDeleteService: (id: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  onAddService,
  onUpdateService,
  onDeleteService
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getTodayLocal());

  const openNewModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setQuantity('1');
    setValue('');
    setDate(getTodayLocal());
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceRecord) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setQuantity(service.quantity.toString());
    setValue(service.value.toString());
    setDate(service.date);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const record: ServiceRecord = {
      id: editingService ? editingService.id : Math.random().toString(36).substr(2, 9),
      name,
      description,
      quantity: parseInt(quantity) || 1,
      value: parseFloat(value) || 0,
      date,
      createdAt: editingService ? editingService.createdAt : Date.now()
    };

    if (editingService) {
      onUpdateService(record);
    } else {
      onAddService(record);
    }
    
    setIsModalOpen(false);
  };

  const filteredServices = useMemo(() => {
    let result = [...services];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(lower) || 
        s.description.toLowerCase().includes(lower)
      );
    }
    // Sort by most recent date
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [services, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços Realizados</h1>
          <p className="text-gray-500">Registre e acompanhe os serviços executados no dia a dia.</p>
        </div>
        
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-plena-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {/* Stats/Summary could go here later */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar serviço..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Serviço</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Descrição</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Qtd</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Valor Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Nenhum serviço registrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(service.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {service.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-medium text-gray-700">
                      {service.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                      {formatCurrency(service.value)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(service)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Tem certeza que deseja excluir este registro de serviço?')) {
                              onDeleteService(service.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Impressão PB, Encadernação..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-plena-orange rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md shadow-orange-200"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
