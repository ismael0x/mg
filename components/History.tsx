
import React, { useState } from 'react';
import { 
  History, 
  Search, 
  FileText, 
  Truck, 
  Download, 
  Trash2, 
  FileDown,
  Loader2
} from 'lucide-react';
import { Document, DocType, CompanyInfo, Client } from '../types';
import { downloadPdf } from '../services/api';

interface DocumentHistoryProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  company: CompanyInfo;
  clients: Client[];
  handleGlobalError: (error: any) => void;
}

type HistoryTab = 'invoices' | 'delivery';

const DocumentHistory: React.FC<DocumentHistoryProps> = ({ documents, setDocuments, handleGlobalError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<HistoryTab>('invoices');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const invoices = (documents || []).filter(d => d && !d.deletedAt && d.type === DocType.INVOICE);
  const deliverySlips = (documents || []).filter(d => d && !d.deletedAt && d.type === DocType.DELIVERY_SLIP);

  const currentDocs = activeTab === 'invoices' ? invoices : deliverySlips;

  const filteredDocs = currentDocs.filter(doc => {
    if (!doc) return false;
    const term = searchTerm.toLowerCase();
    const docNumber = (doc.number || '').toLowerCase();
    const clientName = (doc.clientName || '').toLowerCase();
    return docNumber.includes(term) || clientName.includes(term);
  }).reverse();

  const handleSoftDelete = (id: string) => {
    if (confirm('Voulez-vous déplacer ce document vers la corbeille ?')) {
      setDocuments(prev => prev.map(d => d && d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d));
    }
  };

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const endpoint = doc.type === DocType.INVOICE 
        ? `generate_facture_pdf.php?id=${doc.id}` 
        : `generate_bl_pdf.php?id=${doc.id}`;
      
      const filename = `${doc.type}-${doc.number || 'doc'}.pdf`;
      await downloadPdf(endpoint, filename);
    } catch (error: any) {
      handleGlobalError(error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historique des Documents</h1>
          <p className="text-slate-500 font-medium">Consultez et téléchargez vos archives officielles.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-slate-100">
          <div className="flex flex-1">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-3 px-8 py-5 font-black text-sm transition-all border-b-2 ${
                activeTab === 'invoices' 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText size={20} />
              <span>FACTURES</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'invoices' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {invoices.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-3 px-8 py-5 font-black text-sm transition-all border-b-2 ${
                activeTab === 'delivery' 
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Truck size={20} />
              <span>BONS DE LIVRAISON</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {deliverySlips.length}
              </span>
            </button>
          </div>
          <div className="p-3 sm:p-2 flex items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="N° ou Client..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-4">Référence</th>
                <th className="px-8 py-4">Client</th>
                <th className="px-8 py-4">Date d'émission</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${activeTab === 'invoices' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                      <span className="font-black text-slate-900 font-mono tracking-tighter text-base">
                        {doc.number || '---'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-700">{doc.clientName || 'Client inconnu'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm text-slate-500 font-medium">
                      {doc.date ? new Date(doc.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                          activeTab === 'invoices' 
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {downloadingId === doc.id ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <FileDown size={16} className="mr-2" />
                        )}
                        PDF
                      </button>
                      <button 
                        onClick={() => handleSoftDelete(doc.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Archiver"
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
                      <History size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">Aucun document trouvé dans cette catégorie.</p>
                      {searchTerm && <p className="text-sm opacity-60">Essayez de modifier votre recherche.</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start space-x-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
          <Download size={24} />
        </div>
        <div>
          <h4 className="font-black text-blue-900 text-sm">Authentification Sécurisée</h4>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed">
            Les documents sont protégés par votre clé API exclusive. Tous les téléchargements sont authentifiés 
            en temps réel pour garantir la conformité de Maghreb Global SARL.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentHistory;
