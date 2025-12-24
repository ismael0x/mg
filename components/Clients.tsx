
import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, ShieldOff, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Client } from '../types';
import { apiRequest } from '../services/api';

interface ClientsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  refreshClients: () => Promise<void>;
  handleGlobalError: (error: any) => void;
  apiError?: boolean;
  triggerNotification?: (type: 'error' | 'warning' | 'success', message: string, description: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ 
  clients, 
  refreshClients, 
  apiError, 
  handleGlobalError,
  triggerNotification
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = (clients || []).filter(c => {
    if (!c) return false;
    const term = (searchTerm || '').toLowerCase();
    const nameMatch = (c.name || '').toLowerCase().includes(term);
    const iceMatch = (c.ice || '').toLowerCase().includes(term);
    return nameMatch || iceMatch;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le client "${name}" ?`)) {
      try {
        await apiRequest('delete_client.php', {
          method: 'POST',
          body: JSON.stringify({ id })
        });
        
        if (triggerNotification) {
          triggerNotification('success', 'Client supprimé', 'La base de données clients a été mise à jour.');
        }
        await refreshClients();
      } catch (error: any) {
        handleGlobalError(error);
      }
    }
  };

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldOff size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès refusé</h2>
        <p className="text-slate-500 max-w-md">La clé d'authentification est invalide ou manquante. Veuillez contacter l'administrateur système.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Annuaire Clients</h1>
          <p className="text-slate-500 font-medium">Gestion et suivi des partenaires commerciaux de Maghreb Global.</p>
        </div>
        <Link 
          to="/clients/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus size={22} className="mr-2" />
          Nouveau Client
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, ICE..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden lg:flex items-center space-x-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <User size={14} />
            <span>{filteredClients.length} clients répertoriés</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-5">Nom / Société</th>
                <th className="px-8 py-5">ICE</th>
                <th className="px-8 py-5">Téléphone</th>
                <th className="px-8 py-5">Adresse</th>
                <th className="px-8 py-5">Date d'ajout</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-[1rem] flex items-center justify-center font-black text-lg shadow-sm group-hover:rotate-3 transition-transform">
                        {(client.name || '?').charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 truncate max-w-[220px]">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                      {client.ice || '-'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2 text-slate-700 font-bold">
                      <Phone size={14} className="text-blue-500" />
                      <span>{client.telephone || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-start space-x-2 max-w-[200px]">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{client.adresse || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold">
                      <Calendar size={14} className="text-slate-300" />
                      <span>{client.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id, client.name)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <User size={64} className="mb-4 opacity-10" />
                      <p className="font-bold text-xl text-slate-400">Aucun client trouvé</p>
                      <p className="text-sm font-medium mt-1">Essayez d'ajuster votre recherche ou d'ajouter un nouveau client.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
