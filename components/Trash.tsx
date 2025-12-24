
import React, { useState } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  XCircle, 
  Users, 
  FileText, 
  Truck, 
  Package,
  AlertTriangle
} from 'lucide-react';
import { Client, Product, Document, DocType } from '../types';
import { formatCurrency } from '../utils/helpers';

interface TrashProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

type TrashTab = 'clients' | 'invoices' | 'delivery' | 'products';

const Trash: React.FC<TrashProps> = ({ 
  clients, setClients, 
  products, setProducts, 
  documents, setDocuments 
}) => {
  const [activeTab, setActiveTab] = useState<TrashTab>('clients');

  const deletedClients = clients.filter(c => c.deletedAt);
  const deletedInvoices = documents.filter(d => d.deletedAt && d.type === DocType.INVOICE);
  const deletedDelivery = documents.filter(d => d.deletedAt && d.type === DocType.DELIVERY_SLIP);
  const deletedProducts = products.filter(p => p.deletedAt);

  const restoreClient = (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, deletedAt: null } : c));
  };

  const hardDeleteClient = (id: string) => {
    if (confirm('Action irréversible : Supprimer définitivement ce client ?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const restoreDoc = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, deletedAt: null } : d));
  };

  const hardDeleteDoc = (id: string) => {
    if (confirm('Action irréversible : Supprimer définitivement ce document ?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  // Fix: Product ID can be string or number in the Product interface
  const restoreProduct = (id: string | number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, deletedAt: null } : p));
  };

  // Fix: Product ID can be string or number in the Product interface
  const hardDeleteProduct = (id: string | number) => {
    if (confirm('Action irréversible : Supprimer définitivement ce produit ?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const TabButton = ({ id, label, icon: Icon, count }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all font-semibold text-sm ${
        activeTab === id 
        ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Trash2 className="mr-3 text-red-500" /> Corbeille
        </h1>
        <p className="text-slate-500 mt-1">Gérez les éléments supprimés. Ils peuvent être restaurés ou supprimés définitivement.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          <TabButton id="clients" label="Clients" icon={Users} count={deletedClients.length} />
          <TabButton id="invoices" label="Factures" icon={FileText} count={deletedInvoices.length} />
          <TabButton id="delivery" label="Bons de Livraison" icon={Truck} count={deletedDelivery.length} />
          <TabButton id="products" label="Produits" icon={Package} count={deletedProducts.length} />
        </div>

        <div className="p-4">
          {activeTab === 'clients' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nom</th>
                    <th className="px-6 py-4">Supprimé le</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deletedClients.map(client => (
                    <tr key={client.id} className="group">
                      <td className="px-6 py-4 font-bold text-slate-900">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {client.deletedAt ? new Date(client.deletedAt).toLocaleString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => restoreClient(client.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Restaurer">
                          <RotateCcw size={18} />
                        </button>
                        <button onClick={() => hardDeleteClient(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer définitivement">
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deletedClients.length === 0 && <EmptyState label="Aucun client dans la corbeille" />}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">N° Facture</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deletedInvoices.map(doc => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 font-bold text-slate-900">{doc.number}</td>
                      <td className="px-6 py-4 text-slate-600">{doc.clientName}</td>
                      <td className="px-6 py-4 font-bold">{formatCurrency(doc.totalTTC)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => restoreDoc(doc.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <RotateCcw size={18} />
                        </button>
                        <button onClick={() => hardDeleteDoc(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deletedInvoices.length === 0 && <EmptyState label="Aucune facture dans la corbeille" />}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">N° BL</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deletedDelivery.map(doc => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 font-bold text-slate-900">{doc.number}</td>
                      <td className="px-6 py-4 text-slate-600">{doc.clientName}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => restoreDoc(doc.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <RotateCcw size={18} />
                        </button>
                        <button onClick={() => hardDeleteDoc(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deletedDelivery.length === 0 && <EmptyState label="Aucun bon de livraison dans la corbeille" />}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Produit</th>
                    <th className="px-6 py-4">Prix HT</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deletedProducts.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                      <td className="px-6 py-4">{formatCurrency(product.priceHT)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => restoreProduct(product.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Restaurer">
                          <RotateCcw size={18} />
                        </button>
                        <button onClick={() => hardDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer définitivement">
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deletedProducts.length === 0 && <EmptyState label="Aucun produit dans la corbeille" />}
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold text-amber-900">Note sur la sécurité</p>
          <p className="text-xs text-amber-700 mt-1">La suppression définitive est irréversible et effacera l'élément de la base de données locale. Seul l'administrateur a accès à ce module.</p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
    <Trash2 size={48} className="text-slate-200" />
    <p className="text-slate-400 font-medium italic">{label}</p>
  </div>
);

export default Trash;
