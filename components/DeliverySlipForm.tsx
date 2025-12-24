
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronLeft,
  Calendar,
  User,
  Truck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Package
} from 'lucide-react';
import { 
  Client, 
  Product, 
  CompanyInfo, 
  LineItem, 
  Document, 
  DocType 
} from '../types';
import { apiRequest } from '../services/api';

interface DeliverySlipFormProps {
  clients: Client[];
  products: Product[];
  company: CompanyInfo;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  handleGlobalError: (error: any) => void;
}

interface SuccessData {
  id: string | number;
  bl_number: string;
}

const DeliverySlipForm: React.FC<DeliverySlipFormProps> = ({ clients, products, company, documents, setDocuments, handleGlobalError }) => {
  const navigate = useNavigate();
  
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const selectedClient = clients.find(c => c.id === clientId);

  const addItem = () => {
    setItems([...items, { productId: '', name: '', quantity: 1, priceHT: 0 }]);
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.productId = product.id;
        item.name = product.name;
        item.priceHT = product.priceHT;
      }
    } else {
      (item as any)[field] = value;
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return setError('Veuillez sélectionner un client.');
    if (items.length === 0) return setError('Ajoutez au moins un article à livrer.');
    if (items.some(it => !it.productId)) return setError('Certaines lignes sont incomplètes.');

    setIsSubmitting(true);
    setError(null);

    const payload = {
      client_id: clientId,
      lignes: items.map(it => ({
        produit_id: it.productId,
        quantite: it.quantity
      }))
    };

    try {
      const data = await apiRequest('add_bl.php', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessData(data);
      
      const newDoc: Document = {
        id: data.id?.toString() || Date.now().toString(),
        type: DocType.DELIVERY_SLIP,
        number: data.bl_number || "BL-TEMP",
        date,
        clientId,
        clientName: selectedClient?.name || 'Inconnu',
        items,
        totalHT: 0,
        totalTVA: 0,
        totalTTC: 0,
        status: 'validated'
      };
      setDocuments(prev => [...prev, newDoc]);
      
    } catch (err: any) {
      if (err.status) handleGlobalError(err);
      setError(err.message || "Erreur lors de la création du bon de livraison.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden text-center p-12 space-y-8">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-50 rotate-3">
            <CheckCircle2 size={56} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-slate-900">Bon de Livraison Validé !</h2>
            <p className="text-slate-500 font-medium px-4">Le document a été généré avec succès dans le système central.</p>
            <div className="inline-block px-6 py-2 bg-slate-100 rounded-2xl">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">RÉFÉRENCE BL</span>
              <span className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">{successData.bl_number}</span>
            </div>
          </div>
          
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`https://gestion.maghrebglobal.com/api/generate_bl_pdf.php?id=${successData.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 active:scale-95"
            >
              <FileDown size={24} />
              <span>TÉLÉCHARGER LE BL</span>
            </a>
            <button 
              onClick={() => navigate('/history')}
              className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Historique
            </button>
          </div>
          <button 
            onClick={() => { setSuccessData(null); setClientId(''); setItems([]); }}
            className="text-sm font-bold text-emerald-600 hover:underline"
          >
            Créer un autre Bon de Livraison
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nouveau Bon de Livraison</h1>
            <p className="text-sm text-slate-500 font-medium">Création d'un document de sortie de stock.</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="px-6 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>VALIDER LE BL</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-in shake duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Client & Date */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Client Destinataire *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold appearance-none"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedClient && (
                <div className="mt-3 p-4 bg-emerald-50/50 rounded-2xl text-xs text-emerald-700 border border-emerald-100">
                  <p className="font-bold">ICE: {selectedClient.ice}</p>
                  {/* Fix: Property 'address' does not exist on type 'Client'. Did you mean 'adresse'? */}
                  <p className="mt-1 opacity-80">{selectedClient.adresse}</p>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Date de Livraison</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="date" 
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="mt-3 flex items-center text-sm font-bold text-slate-400">
                <span>Numéro: </span>
                <span className="ml-2 text-slate-900 font-mono italic">Attribué par le serveur</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Articles à Livrer</h3>
                <p className="text-sm text-slate-500 mt-1">Veuillez indiquer les produits et les quantités exactes.</p>
              </div>
              <button 
                type="button"
                onClick={addItem}
                disabled={isSubmitting}
                className="text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl flex items-center transition-all active:scale-95 disabled:opacity-50"
              >
                <Plus size={18} className="mr-2" /> Ajouter un produit
              </button>
            </div>

            <div className="space-y-4">
              {items.length === 0 && (
                <div className="text-center py-16 border-4 border-dashed border-slate-50 rounded-[2rem] text-slate-300">
                  <Truck size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold">Aucun article dans ce bon de livraison.</p>
                </div>
              )}
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] group relative hover:border-emerald-200 transition-all">
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none"
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="">Choisir un produit...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="w-full sm:w-32">
                    <div className="flex items-center px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500">
                      <input 
                        type="number" 
                        min="1"
                        disabled={isSubmitting}
                        className="w-full bg-transparent text-center font-black focus:outline-none"
                        placeholder="Qté"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={isSubmitting}
                    className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 text-white sticky top-24">
            <h3 className="text-xl font-black mb-6 flex items-center">
              <Truck size={22} className="mr-3" /> Information BL
            </h3>
            
            <div className="space-y-5">
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-70">Total Articles</p>
                <p className="text-4xl font-black tracking-tighter">
                  {items.reduce((sum, it) => sum + (it.quantity || 0), 0)}
                </p>
              </div>
              
              <div className="pt-4">
                <p className="text-xs font-bold leading-relaxed opacity-80 italic">
                  Un Bon de Livraison (BL) atteste de la remise physique des marchandises au client. Il ne comporte pas de montants financiers.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-emerald-600 font-black rounded-2xl hover:bg-emerald-50 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                <span>VALIDER & ENVOYER</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySlipForm;
