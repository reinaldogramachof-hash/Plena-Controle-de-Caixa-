import React, { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, Save, RefreshCw, Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { exportData, importData } from '../services/dataService';
import { Category } from '../types';
import { CategoryForm } from '../components/CategoryForm';

interface Props {
  categories: Category[];
  refreshData: () => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export const SettingsPage: React.FC<Props> = ({ categories, refreshData, onAddCategory, onDeleteCategory }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleExport = async () => {
    const dataStr = exportData();
    const fileName = `plena-backup-${new Date().toISOString().split('T')[0]}.json`;

    // Modern File System Access API support
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Backup JSON',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(dataStr);
        await writable.close();
        alert('Backup salvo com sucesso!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('File System Access API failed, falling back to download:', err);
      }
    }

    // Legacy fallback
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = async () => {
    // Modern File System Access API support
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'Backup JSON',
            accept: { 'application/json': ['.json'] },
          }],
          multiple: false,
        });
        const file = await handle.getFile();
        const text = await file.text();
        if (importData(text)) {
          alert('Dados importados com sucesso!');
          refreshData();
        } else {
          alert('Erro ao importar arquivo. Verifique o formato.');
        }
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('File System Access API failed, falling back to input:', err);
      }
    }
    
    // Legacy fallback
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content)) {
        alert('Dados importados com sucesso!');
        refreshData();
      } else {
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>

      {/* Category Management */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-plena-orange" />
            Categorias
          </h3>
          <Button size="sm" onClick={() => setIsCategoryModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nova
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-plena-orange transition-colors">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: cat.color }}></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-500">{cat.type === 'income' ? 'Entrada' : 'Saída'}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if(window.confirm(`Excluir categoria "${cat.name}"?`)) onDeleteCategory(cat.id);
                }}
                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                title="Excluir categoria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Backup Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Save className="w-5 h-5 mr-2 text-plena-orange" />
          Gerenciamento de Dados
        </h3>
        <p className="text-gray-600 mb-6">
          Faça backup das suas transações localmente ou restaure de um arquivo anterior.
          Os dados são salvos apenas no navegador deste dispositivo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-5 h-5 mr-2" />
            Exportar Backup (JSON)
          </Button>
          
          <Button onClick={handleImportClick} variant="secondary" className="flex-1 sm:flex-none">
            <Upload className="w-5 h-5 mr-2" />
            Importar Dados
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,application/json" 
            className="hidden" 
          />
        </div>
      </section>

      {/* Sync Section (Mock) */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 opacity-75">
         <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-blue-500" />
                Sincronização em Nuvem
              </h3>
              <p className="text-sm text-gray-500">
                Conecte-se para salvar seus dados na nuvem e acessar de outros dispositivos.
              </p>
            </div>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded uppercase font-bold">Em Breve</span>
         </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50 rounded-xl border border-red-100 p-6">
        <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Zona de Perigo
        </h3>
        <p className="text-red-600 mb-4 text-sm">
          A limpeza dos dados remove todas as transações e categorias personalizadas do navegador. Esta ação não pode ser desfeita.
        </p>
        <Button 
          variant="danger" 
          onClick={() => {
            if(window.confirm('Tem certeza? Todos os dados serão perdidos para sempre.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          Limpar Tudo (Reset de Fábrica)
        </Button>
      </section>
      
      {isCategoryModalOpen && (
        <CategoryForm 
          onSave={onAddCategory} 
          onClose={() => setIsCategoryModalOpen(false)} 
        />
      )}
    </div>
  );
};