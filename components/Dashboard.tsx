
import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Truck,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { Document, DashboardStats, DocType } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  stats: DashboardStats;
  documents: Document[];
}

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={14} className="mr-1" />
          {trend}%
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, documents }) => {
  // Mock data for the chart based on current documents
  const chartData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Fév', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Avr', revenue: stats.totalRevenue || 0 },
  ];

  const recentDocs = documents.slice(-5).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500">Bienvenue sur votre espace de gestion Maghreb Global.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/new-invoice" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <FileText size={18} className="mr-2" />
            Nouvelle Facture
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Chiffre d'Affaires" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={TrendingUp} 
          color="bg-blue-600"
          trend={12.5}
        />
        <StatCard 
          title="Clients Actifs" 
          value={stats.clientCount} 
          icon={Users} 
          color="bg-purple-600"
        />
        <StatCard 
          title="Factures Émises" 
          value={stats.invoiceCount} 
          icon={FileText} 
          color="bg-amber-500"
        />
        <StatCard 
          title="Bons de Livraison" 
          value={stats.deliveryCount} 
          icon={Truck} 
          color="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Performance Commerciale</h3>
            <select className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>6 derniers mois</option>
              <option>Année en cours</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Chiffre d\'affaires']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Activités Récentes</h3>
            <Link to="/history" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Tout voir</Link>
          </div>
          <div className="space-y-4">
            {recentDocs.length > 0 ? recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${doc.type === DocType.INVOICE ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {doc.type === DocType.INVOICE ? <FileText size={18} /> : <Truck size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">{doc.number}</p>
                    <p className="text-xs text-slate-500 mt-1">{doc.clientName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(doc.totalTTC)}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileText size={32} className="mb-2 opacity-20" />
                <p className="text-sm">Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
