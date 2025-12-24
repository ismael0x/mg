
import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  ShieldOff, 
  Loader2, 
  RefreshCcw, 
  Plus, 
  X, 
  Save, 
  Tag, 
  Banknote,
  AlertCircle,
  Edit3,
  Trash2,
  Layers
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/helpers';
import { apiRequest } from '../services/api';

interface ProductsProps {
  products: Product[];
  refreshProducts: () => Promise<void>;
  apiError?: boolean;
  handleGlobalError?: (error: any) => void;
  triggerNotification?: (type: 'error' | 'warning' | 'success', message: string, description: string) => void;
}

const Products: React.FC<ProductsProps> = ({ 
  products, 
  refreshProducts, 
  apiError, 
  handleGlobalError,
  triggerNotification 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<number | string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [priceHT, setPriceHT] = useState<string>('');
  const [format, setFormat] = useState<string>(''); // Stocke "A4", "A3" ou "" (pour null)
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsLoading(true);
    await refreshProducts();
    setIsLoading(false);
  };

  const openAddModal = () => {
    setModalMode('add');
    setName('');
    setPriceHT('');
    setFormat('');
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setName(product.name || '');
    setPriceHT(product.priceHT?.toString() || '');
    setFormat(product.format || '');
    setEditingId(product.id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError('Le nom du produit est requis.');
    if (!priceHT || isNaN(Number(priceHT))) return setFormError('Le prix doit être un nombre valide.');

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        nom: name.trim(),
        prix_ht: Number(priceHT),
        format: format === '' ? null : format
      };

      let endpoint = 'add_produit.php';
      if (modalMode === 'edit') {
        endpoint = 'update_produit.php';
        payload.id = editingId;
      }

      await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setIsModalOpen(false);
      if (triggerNotification) {
        triggerNotification(
          'success', 
          modalMode === 'edit' ? 'Produit mis à jour' : 'Produit ajouté', 
          `L'article "${name}" a été enregistré avec succès.`
        );
      }
      await refreshProducts();
    } catch (error: any) {
      if (handleGlobalError) handleGlobalError(error);
      else setFormError(error.message || 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Voulez-vous vraiment supprimer le produit "${product.name}" ?`)) return;

    try {
      await apiRequest('delete_produit.php', {
        method: 'POST',
        body: JSON.stringify({ id: product.id })
      });
      
      if (triggerNotification) {
        triggerNotification('success', 'Produit supprimé', 'Le catalogue a été mis à jour.');
      }
      await refreshProducts();
    } catch (error: any) {
      if (error.status === 409) {
        if (triggerNotification) {
          triggerNotification('error', 'Suppression impossible', 'Ce produit est utilisé dans une facture ou un BL existant.');
        }
      } else if (handleGlobalError) {
        handleGlobalError(error);
      }
    }
  };

  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;
    const term = searchTerm.toLowerCase();
    const nameStr = (p.name || '').toLowerCase();
    const formatStr = (p.format || 'inconnu').toLowerCase();
    return nameStr.includes(term) || formatStr.includes(term);
  });

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldOff size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès refusé</h2>
        <p className="text-slate-500 max-w-md">La clé d'authentification API est invalide. Impossible de charger le catalogue produits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalogue Produits</h1>
          <p className="text-slate-500 font-medium">Gérez vos stocks de papier et matériels.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <RefreshCcw size={18} className="mr-2" />}
            Actualiser
          </button>
          <button 
            onClick={openAddModal}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={20} className="mr-2" />
            Nouveau Produit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Chercher une ramette, un format..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {filteredProducts.length} ARTICLES DISPONIBLES
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-4">Produit</th>
                <th className="px-8 py-4">Format</th>
                <th className="px-8 py-4 text-right">Prix HT (DH)</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      product.format === 'A4' ? 'bg-blue-100 text-blue-700' :
                      product.format === 'A3' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {product.format_label || (product.format ? product.format : 'INCONNU')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="font-black text-slate-900 text-lg">
                      {formatCurrency(product.priceHT || 0)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Modifier"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Package size={56} className="mb-4 opacity-10" />
                      <p className="font-bold text-lg">Aucun article trouvé</p>
                      <p className="text-sm font-medium">Modifiez votre recherche ou ajoutez un nouveau produit.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Produit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                  <Package size={28} className={modalMode === 'edit' ? 'scale-110' : ''} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {modalMode === 'edit' ? 'Éditer Produit' : 'Nouveau Produit'}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Base de données Maghreb Global</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-in shake duration-300">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-bold">{formError}</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Désignation de l'article *</label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      required
                      type="text" 
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold placeholder:text-slate-300 disabled:opacity-50"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: RAMETTE PAPIER TARGET"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Prix HT (DH) *</label>
                    <div className="relative group">
                      <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        disabled={isSubmitting}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-black placeholder:text-slate-300 disabled:opacity-50"
                        value={priceHT}
                        onChange={(e) => setPriceHT(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Format</label>
                    <div className="relative group">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <select 
                        disabled={isSubmitting}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold appearance-none disabled:opacity-50"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                      >
                        <option value="">Aucun</option>
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center space-x-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[1.8] px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>{modalMode === 'edit' ? 'MODIFIER' : 'AJOUTER'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
