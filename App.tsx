
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Truck, 
  Users, 
  Package, 
  History, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  Bell,
  Trash2,
  ShieldAlert,
  WifiOff,
  X,
  RefreshCw
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import AddClientForm from './components/AddClientForm';
import Products from './components/Products';
import InvoiceForm from './components/InvoiceForm';
import DeliverySlipForm from './components/DeliverySlipForm';
import DocumentHistory from './components/History';
import Settings from './components/Settings';
import Login from './components/Login';
import Trash from './components/Trash';

import { CompanyInfo, Client, Product, Document, DocType } from './types';
import { DEFAULT_COMPANY, DEFAULT_PRODUCTS } from './constants';
import { apiRequest, ApiError } from './services/api';

interface ApiNotification {
  type: 'error' | 'warning' | 'success';
  message: string;
  description: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<ApiNotification | null>(null);
  
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const triggerNotification = useCallback((type: 'error' | 'warning' | 'success', message: string, description: string) => {
    setNotification({ type, message, description });
    if (type === 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  }, []);

  const handleGlobalError = useCallback((error: ApiError | any) => {
    // Extraction sécurisée du message d'erreur
    const errorMessage = typeof error === 'string' ? error : (error?.message || '');
    const status = error?.status;

    if (status === 403 || errorMessage.includes('Accès refusé')) {
      triggerNotification('error', 'Sécurité', "Accès refusé – Clé API invalide");
    } else if (status === 500) {
      triggerNotification('error', 'Erreur serveur', "Le serveur Maghreb Global rencontre un problème interne.");
    } else if (status === 0 || errorMessage.includes('fetch') || errorMessage.includes('connexion')) {
      triggerNotification('warning', 'Connexion impossible', "Vérifiez votre accès internet ou le pare-feu du serveur.");
    } else {
      triggerNotification('error', 'Erreur système', errorMessage || 'Une erreur inconnue est survenue.');
    }
  }, [triggerNotification]);

  const fetchClients = useCallback(async () => {
    try {
      const data = await apiRequest('clients.php');
      setClients(Array.isArray(data) ? data : []);
    } catch (error: any) {
      handleGlobalError(error);
      const cached = localStorage.getItem('mg_clients_cache');
      if (cached) setClients(JSON.parse(cached));
    }
  }, [handleGlobalError]);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiRequest('produits.php');
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      handleGlobalError(error);
      const cached = localStorage.getItem('mg_products_cache');
      if (cached) setProducts(JSON.parse(cached));
      else setProducts(DEFAULT_PRODUCTS);
    }
  }, [handleGlobalError]);

  useEffect(() => {
    const authStatus = localStorage.getItem('mg_auth');
    const savedDocs = localStorage.getItem('mg_documents');
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchClients();
      fetchProducts();
    }
  }, [fetchClients, fetchProducts]);

  useEffect(() => { localStorage.setItem('mg_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('mg_clients_cache', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('mg_products_cache', JSON.stringify(products)); }, [products]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mg_auth');
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      setIsAuthenticated(true);
      localStorage.setItem('mg_auth', 'true');
      fetchClients();
      fetchProducts();
    }} />;
  }

  const trashCount = 
    (clients || []).filter(c => c && c.deletedAt).length + 
    (products || []).filter(p => p && p.deletedAt).length + 
    (documents || []).filter(d => d && d.deletedAt).length;

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
        {notification && (
          <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-8 duration-300">
            <div className={`p-5 rounded-3xl shadow-2xl border flex items-start space-x-4 max-w-sm ${
              notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-900' : 
              notification.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' : 
              'bg-emerald-50 border-emerald-100 text-emerald-900'
            }`}>
              <div className={`p-2 rounded-xl shrink-0 ${
                notification.type === 'error' ? 'bg-red-100 text-red-600' : 
                notification.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                'bg-emerald-100 text-emerald-600'
              }`}>
                {notification.type === 'error' ? <ShieldAlert size={20} /> : 
                 notification.type === 'warning' ? <WifiOff size={20} /> : <Bell size={20} />}
              </div>
              <div className="flex-1">
                <p className="font-black text-sm uppercase tracking-wider">{notification.message}</p>
                <p className="text-xs font-medium opacity-80 mt-1">{notification.description}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">MG</div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Maghreb Global</h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">SaaS v2.5</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1">
              <NavLinks onItemClick={() => setIsSidebarOpen(false)} trashCount={trashCount} />
            </nav>
            <div className="pt-6 border-t border-slate-100">
              <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm shadow-slate-50">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden">
              <Menu size={24} />
            </button>
            <div className="hidden lg:flex items-center space-x-6">
               <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100">Connecté</span>
               <button onClick={() => { fetchClients(); fetchProducts(); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Synchroniser">
                  <RefreshCw size={18} />
               </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 uppercase">Admin Maghreb</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Global SARL</p>
              </div>
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs">A</div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard stats={calculateStats(documents, clients)} documents={documents.filter(d => !d.deletedAt)} />} />
              <Route path="/clients" element={<Clients clients={clients.filter(c => !c.deletedAt)} setClients={setClients} refreshClients={fetchClients} handleGlobalError={handleGlobalError} />} />
              <Route path="/clients/new" element={<AddClientForm refreshClients={fetchClients} handleGlobalError={handleGlobalError} />} />
              <Route path="/products" element={<Products products={products.filter(p => !p.deletedAt)} refreshProducts={fetchProducts} handleGlobalError={handleGlobalError} triggerNotification={triggerNotification} />} />
              <Route path="/new-invoice" element={<InvoiceForm clients={clients.filter(c => !c.deletedAt)} products={products.filter(p => !p.deletedAt)} company={company} documents={documents} setDocuments={setDocuments} handleGlobalError={handleGlobalError} />} />
              <Route path="/new-delivery" element={<DeliverySlipForm clients={clients.filter(c => !c.deletedAt)} products={products.filter(p => !p.deletedAt)} company={company} documents={documents} setDocuments={setDocuments} handleGlobalError={handleGlobalError} />} />
              <Route path="/history" element={<DocumentHistory documents={documents.filter(d => !d.deletedAt)} setDocuments={setDocuments} company={company} clients={clients} handleGlobalError={handleGlobalError} />} />
              <Route path="/settings" element={<Settings company={company} setCompany={setCompany} />} />
              <Route path="/trash" element={<Trash clients={clients} setClients={setClients} products={products} setProducts={setProducts} documents={documents} setDocuments={setDocuments} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const NavLinks = ({ onItemClick, trashCount }: { onItemClick: () => void, trashCount: number }) => {
  const location = useLocation();
  return (
    <>
      <SidebarItem to="/" icon={LayoutDashboard} label="Tableau de bord" active={location.pathname === '/'} onClick={onItemClick} />
      <SidebarItem to="/new-invoice" icon={FileText} label="Nouvelle Facture" active={location.pathname === '/new-invoice'} onClick={onItemClick} />
      <SidebarItem to="/new-delivery" icon={Truck} label="Nouveau BL" active={location.pathname === '/new-delivery'} onClick={onItemClick} />
      <SidebarItem to="/clients" icon={Users} label="Clients" active={location.pathname.startsWith('/clients')} onClick={onItemClick} />
      <SidebarItem to="/products" icon={Package} label="Produits" active={location.pathname === '/products'} onClick={onItemClick} />
      <SidebarItem to="/history" icon={History} label="Historique" active={location.pathname === '/history'} onClick={onItemClick} />
      <SidebarItem to="/settings" icon={SettingsIcon} label="Paramètres" active={location.pathname === '/settings'} onClick={onItemClick} />
      <SidebarItem to="/trash" icon={Trash2} label="Corbeille" active={location.pathname === '/trash'} onClick={onItemClick} badge={trashCount} />
    </>
  );
};

const SidebarItem = ({ to, icon: Icon, label, active, onClick, badge }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
    {badge > 0 && (
      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
        {badge}
      </span>
    )}
  </Link>
);

const calculateStats = (docs: Document[], clients: Client[]) => {
  const activeDocs = docs.filter(d => !d.deletedAt);
  const activeClients = clients.filter(c => !c.deletedAt);
  const invoices = activeDocs.filter(d => d.type === DocType.INVOICE);
  const deliverySlips = activeDocs.filter(d => d.type === DocType.DELIVERY_SLIP);
  return {
    totalRevenue: invoices.reduce((sum, d) => sum + (d.totalTTC || 0), 0),
    invoiceCount: invoices.length,
    deliveryCount: deliverySlips.length,
    clientCount: activeClients.length
  };
};

export default App;
