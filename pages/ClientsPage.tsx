import React, { useState } from 'react';
import { Search, Folder, Plus, Phone, Mail, MapPin, StickyNote, Edit2, Trash2, X, CheckSquare, Check, Circle, Calendar, Save } from 'lucide-react';
import { Client, ClientTask } from '../types';
import { Button } from '../components/ui/Button';
import { ClientForm } from '../components/ClientForm';
import { generateId } from '../utils';

interface Props {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientsPage: React.FC<Props> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Task State
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  
  // Task Editing State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [editingTaskDate, setEditingTaskDate] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
    setSelectedClient(null); // Close details view if open
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      onDeleteClient(id);
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  // --- Checklist Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedClient) return;

    const newTask: ClientTask = {
      id: generateId(),
      text: newTaskText,
      completed: false,
      dueDate: newTaskDate
    };

    const updatedClient = {
      ...selectedClient,
      tasks: [...(selectedClient.tasks || []), newTask]
    };

    onUpdateClient(updatedClient);
    setSelectedClient(updatedClient);
    setNewTaskText('');
    setNewTaskDate('');
  };

  const handleToggleTask = (taskId: string) => {
    if (!selectedClient) return;

    const updatedTasks = (selectedClient.tasks || []).map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedClient = { ...selectedClient, tasks: updatedTasks };
    onUpdateClient(updatedClient);
    setSelectedClient(updatedClient);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedClient) return;
    if (!window.confirm("Excluir esta tarefa permanentemente?")) return;

    const updatedTasks = (selectedClient.tasks || []).filter(task => task.id !== taskId);
    
    const updatedClient = { ...selectedClient, tasks: updatedTasks };
    onUpdateClient(updatedClient);
    setSelectedClient(updatedClient);
  };

  const startEditingTask = (task: ClientTask) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
    setEditingTaskDate(task.dueDate || '');
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
    setEditingTaskDate('');
  };

  const saveEditingTask = () => {
    if (!selectedClient || !editingTaskId || !editingTaskText.trim()) return;

    const updatedTasks = (selectedClient.tasks || []).map(task => 
      task.id === editingTaskId ? { ...task, text: editingTaskText, dueDate: editingTaskDate } : task
    );

    const updatedClient = { ...selectedClient, tasks: updatedTasks };
    onUpdateClient(updatedClient);
    setSelectedClient(updatedClient);
    cancelEditingTask();
  };

  // --- Progress Calculation ---
  const getProgress = (tasks: ClientTask[] = []) => {
     if (tasks.length === 0) return 0;
     const completed = tasks.filter(t => t.completed).length;
     return Math.round((completed / tasks.length) * 100);
  };

  const formatDateShort = (dateString?: string) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
           <p className="text-gray-500 text-sm">Gerencie seus clientes, anotações e checklists.</p>
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-plena-orange focus:border-transparent outline-none text-black"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { setEditingClient(null); setIsFormOpen(true); }}>
            <Plus className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">Novo Cliente</span>
          </Button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Folder className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum cliente encontrado</h3>
          <p className="text-gray-500 mt-1">Adicione um novo cliente para começar a organizar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClients.map(client => (
            <div 
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-plena-orange transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 rounded-bl-lg backdrop-blur-sm z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditClick(client); }}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDeleteClick(client.id, e)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                   <Folder className="w-10 h-10 text-yellow-500 fill-yellow-100" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-base font-bold text-gray-900 truncate pr-6">{client.name}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                     {client.phone && (
                       <span className="text-xs text-gray-500 flex items-center truncate">
                         <Phone className="w-3 h-3 mr-1" /> {client.phone}
                       </span>
                     )}
                     
                     <div className="flex items-center gap-2 mt-2">
                        {client.notes && (
                           <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center">
                             <StickyNote className="w-3 h-3 mr-1" /> Nota
                           </span>
                        )}
                        {(client.tasks && client.tasks.length > 0) && (
                           <span className={`text-xs px-1.5 py-0.5 rounded flex items-center ${
                             client.tasks.every(t => t.completed) 
                               ? 'bg-green-100 text-green-700' 
                               : 'bg-blue-100 text-blue-700'
                           }`}>
                             <CheckSquare className="w-3 h-3 mr-1" /> 
                             {client.tasks.filter(t => t.completed).length}/{client.tasks.length}
                           </span>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Details Modal (Folder View) */}
      {selectedClient && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Folder Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-start">
               <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-200">
                     <Folder className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                     <p className="text-sm text-gray-500">Cadastrado em {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600 p-1">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Info Column */}
                  <div className="space-y-4">
                     <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Informações de Contato</h3>
                     
                     <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
                        <div className="flex items-center text-gray-700">
                           <Phone className="w-4 h-4 mr-3 text-gray-400" />
                           <span>{selectedClient.phone || <span className="text-gray-400 italic">Sem telefone</span>}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                           <Mail className="w-4 h-4 mr-3 text-gray-400" />
                           <span className="break-all">{selectedClient.email || <span className="text-gray-400 italic">Sem email</span>}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                           <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                           <span>{selectedClient.address || <span className="text-gray-400 italic">Sem endereço</span>}</span>
                        </div>
                        {selectedClient.document && (
                          <div className="flex items-center text-gray-700 pt-2 border-t border-gray-50 mt-2">
                             <span className="text-xs font-bold mr-2 text-gray-500">DOC:</span>
                             <span className="font-mono text-sm">{selectedClient.document}</span>
                          </div>
                        )}
                     </div>

                     <Button 
                       variant="outline" 
                       className="w-full mt-4" 
                       onClick={() => handleEditClick(selectedClient)}
                     >
                       <Edit2 className="w-4 h-4 mr-2" />
                       Editar Informações
                     </Button>
                  </div>

                  {/* Notes & Tasks Column */}
                  <div className="space-y-6">
                     
                     {/* Post-it Note */}
                     <div className="relative">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center">
                           <StickyNote className="w-4 h-4 mr-2 text-yellow-600" />
                           Anotações
                        </h3>
                        
                        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 shadow-sm rounded-r-lg relative">
                           <div className="font-mono text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                              {selectedClient.notes ? selectedClient.notes : (
                                <span className="text-yellow-700/50 italic">Nenhuma anotação...</span>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Checklist */}
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                              <CheckSquare className="w-4 h-4 mr-2 text-blue-600" />
                              Check-list
                           </h3>
                           <span className="text-xs font-medium text-gray-500">
                              {getProgress(selectedClient.tasks)}% Concluído
                           </span>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                           
                           {/* Add Task Input */}
                           <form onSubmit={handleAddTask} className="flex flex-col gap-2 border-b border-gray-100 p-2 bg-gray-50">
                              <div className="flex gap-2">
                                <input 
                                   type="text" 
                                   className="flex-1 bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                   placeholder="Nova tarefa..."
                                   value={newTaskText}
                                   onChange={e => setNewTaskText(e.target.value)}
                                />
                                <button 
                                   type="submit"
                                   disabled={!newTaskText.trim()}
                                   className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                   <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <input 
                                  type="date"
                                  className="bg-transparent text-sm text-gray-600 focus:outline-none"
                                  value={newTaskDate}
                                  onChange={e => setNewTaskDate(e.target.value)}
                                />
                              </div>
                           </form>

                           {/* Task List */}
                           <div className="max-h-[200px] overflow-y-auto">
                              {(!selectedClient.tasks || selectedClient.tasks.length === 0) ? (
                                 <p className="text-center text-gray-400 py-6 text-sm italic">Nenhuma tarefa criada.</p>
                              ) : (
                                 <ul className="divide-y divide-gray-100">
                                    {selectedClient.tasks.map(task => (
                                       <li key={task.id} className="p-3 hover:bg-gray-50 group transition-colors">
                                          
                                          {editingTaskId === task.id ? (
                                            // EDIT MODE
                                            <div className="flex flex-col gap-2 animate-fade-in">
                                               <input 
                                                 type="text" 
                                                 className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200"
                                                 value={editingTaskText}
                                                 onChange={e => setEditingTaskText(e.target.value)}
                                                 autoFocus
                                               />
                                               <div className="flex justify-between items-center">
                                                  <input 
                                                    type="date"
                                                    className="bg-white border border-gray-200 rounded px-2 py-1 text-xs"
                                                    value={editingTaskDate}
                                                    onChange={e => setEditingTaskDate(e.target.value)}
                                                  />
                                                  <div className="flex gap-1">
                                                    <button onClick={saveEditingTask} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Salvar">
                                                      <Save className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={cancelEditingTask} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Cancelar">
                                                      <X className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                               </div>
                                            </div>
                                          ) : (
                                            // VIEW MODE
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center flex-1 min-w-0 select-none">
                                                   <div 
                                                     className={`flex-shrink-0 w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors cursor-pointer ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}
                                                     onClick={() => handleToggleTask(task.id)}
                                                   >
                                                      {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
                                                   </div>
                                                   
                                                   <div className="flex-1 min-w-0" onDoubleClick={() => startEditingTask(task)}>
                                                      <p className={`text-sm truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                         {task.text}
                                                      </p>
                                                      {task.dueDate && (
                                                        <span className={`text-xs flex items-center mt-0.5 ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                                          <Calendar className="w-3 h-3 mr-1" />
                                                          {formatDateShort(task.dueDate)}
                                                        </span>
                                                      )}
                                                   </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button 
                                                     onClick={() => startEditingTask(task)}
                                                     className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50"
                                                     title="Editar (Clique Duplo)"
                                                  >
                                                     <Edit2 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button 
                                                     onClick={() => handleDeleteTask(task.id)}
                                                     className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50"
                                                     title="Excluir"
                                                  >
                                                     <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                            </div>
                                          )}
                                       </li>
                                    ))}
                                 </ul>
                              )}
                           </div>
                           
                           {/* Progress Bar */}
                           {(selectedClient.tasks && selectedClient.tasks.length > 0) && (
                              <div className="h-1.5 bg-gray-100 w-full">
                                 <div 
                                    className="h-full bg-green-500 transition-all duration-500 ease-out" 
                                    style={{ width: `${getProgress(selectedClient.tasks)}%` }}
                                 />
                              </div>
                           )}
                        </div>
                     </div>

                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <ClientForm 
          onSave={(client) => {
            if (editingClient) onUpdateClient(client);
            else onAddClient(client);
            setIsFormOpen(false);
            setEditingClient(null);
          }}
          initialData={editingClient}
          onClose={() => {
            setIsFormOpen(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
};