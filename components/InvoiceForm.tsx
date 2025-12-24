
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronLeft,
  Calendar,
  User,
  Calculator,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { 
  Client, 
  Product, 
  CompanyInfo, 
  LineItem, 
  Document, 
  DocType 
} from '../types';
import { formatCurrency } from '../utils/helpers';
import { apiRequest, downloadPdf } from '../services/api';

interface InvoiceFormProps {
  clients: Client[];
  products: Product[];
  company: CompanyInfo;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  handleGlobalError: (error: any) => void;
}

interface SuccessData {
  id: string | number;
  facture_number: string;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ clients, products, company, documents, setDocuments, handleGlobalError }) => {
  const navigate = useNavigate();
  
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const selectedClient = clients.find(c => c.id === clientId);

  const totals = useMemo(() => {
    const totalHT = items.reduce((sum, item) => sum + (item.quantity * item.priceHT), 0);
    const totalTVA = (totalHT * company.vatRate) / 100;
    const totalTTC = totalHT + totalTVA;
    return { totalHT, totalTVA, totalTTC };
  }, [items, company.vatRate]);

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
    if (items.length === 0) return setError('Ajoutez au moins un produit.');
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
      const data = await apiRequest('add_facture.php', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessData(data);
      
      const newDoc: Document = {
        id: data.id?.toString() || Date.now().toString(),
        type: DocType.INVOICE,
        number: data.facture_number || "NO-REF",
        date,
        clientId,
        clientName: selectedClient?.name || 'Inconnu',
        items,
        ...totals,
        status: 'validated'
      };
      setDocuments(prev => [...prev, newDoc]);
      
    } catch (err: any) {
      if (err.status) handleGlobalError(err);
      setError(err.message || "Erreur lors de la création de la facture.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!successData) return;
    setIsDownloading(true);
    try {
      await downloadPdf(`generate_facture_pdf.php?id=${successData.id}`, `Facture-${successData.facture_number}.pdf`);
    } catch (err: any) {
      handleGlobalError(err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in zoom-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden text-center p-12 space-y-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-50">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Facture Créée !</h2>
            <p className="text-slate-500 font-medium">La facture a été enregistrée avec succès sous la référence :</p>
            <p className="text-2xl font-black text-blue-600 font-mono tracking-tighter">{successData.facture_number}</p>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={24} className="animate-spin" /> : <FileDown size={24} />}
              <span>TÉLÉCHARGER LE PDF</span>
            </button>
            <button 
              onClick={() => navigate('/history')}
              className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Retour à l'historique
            </button>
          </div>
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
          <h1 className="text-2xl font-bold text-slate-900">Nouvelle Facture</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>VALIDER & ENREGISTRER</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Client Destinataire *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedClient && (
                <div className="mt-3 p-4 bg-blue-50/50 rounded-2xl text-xs text-blue-700 border border-blue-100">
                  <p className="font-bold">ICE: {selectedClient.ice}</p>
                  {/* Fix: Property 'address' does not exist on type 'Client'. Did you mean 'adresse'? */}
                  <p className="mt-1 opacity-80">{selectedClient.adresse}</p>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Date d'opération</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="date" 
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="mt-3 flex items-center text-sm font-bold text-slate-400">
                <span>Réf: </span>
                <span className="ml-2 text-slate-900 font-mono italic">Sera générée par l'API</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Lignes de Facturation</h3>
                <p className="text-sm text-slate-500 mt-1">Sélectionnez les produits et ajustez les quantités.</p>
              </div>
              <button 
                type="button" 
                onClick={addItem}
                disabled={isSubmitting}
                className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl flex items-center transition-all active:scale-95 disabled:opacity-50"
              >
                <Plus size={18} className="mr-2" /> Ajouter un produit
              </button>
            </div>

            <div className="space-y-4">
              {items.length === 0 && (
                <div className="text-center py-16 border-4 border-dashed border-slate-50 rounded-[2rem] text-slate-300">
                  <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold">Aucune ligne de facture pour le moment.</p>
                </div>
              )}
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] group relative hover:border-blue-200 transition-all">
                  <div className="flex-1 w-full">
                    <select 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="">Choisir un produit...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                    </select>
                  </div>
                  <div className="w-full sm:w-28">
                    <input 
                      type="number" 
                      min="1"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-center font-black focus:ring-2 focus:ring-blue-500"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="hidden sm:block w-32 text-right">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-0.5">Sous-total</p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(item.quantity * item.priceHT)}</p>
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

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100 sticky top-24">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center">
              <Calculator size={22} className="mr-3 text-blue-600" /> Récapitulatif
            </h3>
            
            <div className="space-y-5">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Total HT</span>
                <span className="font-black text-slate-900">{formatCurrency(totals.totalHT)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>TVA ({company.vatRate}%)</span>
                <span className="font-black text-slate-900">{formatCurrency(totals.totalTVA)}</span>
              </div>
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="pt-2">
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Montant Total à régler</p>
                <p className="text-4xl font-black text-blue-600 tracking-tighter">{formatCurrency(totals.totalTTC)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
