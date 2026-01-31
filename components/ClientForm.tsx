import React, { useState } from 'react';
import { X, Save, User, Phone, Mail, FileText, MapPin, StickyNote } from 'lucide-react';
import { Client } from '../types';
import { generateId } from '../utils';
import { Button } from './ui/Button';

interface Props {
  onSave: (client: Client) => void;
  onClose: () => void;
  initialData?: Client | null;
}

export const ClientForm: React.FC<Props> = ({ onSave, onClose, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [document, setDocument] = useState(initialData?.document || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const client: Client = {
      id: initialData?.id || generateId(),
      name,
      phone,
      email,
      document,
      address,
      notes,
      tasks: initialData?.tasks || [], // Initialize empty tasks if new, preserve if editing
      createdAt: initialData?.createdAt || Date.now()
    };

    onSave(client);
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-plena-orange" />
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome do Cliente ou Empresa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                  value={document}
                  onChange={e => setDocument(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="email"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro"
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <StickyNote className="w-4 h-4 mr-1 text-yellow-500" />
                Anotações (Post-it)
              </label>
              <textarea 
                className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none text-gray-800 min-h-[120px] font-mono text-sm shadow-sm"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Escreva informações importantes sobre este cliente aqui..."
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};