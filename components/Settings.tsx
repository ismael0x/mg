
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Info, Globe, Building2, CreditCard, Percent } from 'lucide-react';
import { CompanyInfo } from '../types';

interface SettingsProps {
  company: CompanyInfo;
  setCompany: React.Dispatch<React.SetStateAction<CompanyInfo>>;
}

const Settings: React.FC<SettingsProps> = ({ company, setCompany }) => {
  const [formData, setFormData] = useState<CompanyInfo>(company);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompany(formData);
    alert('Paramètres enregistrés avec succès !');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-500">Configurez les informations de votre entreprise.</p>
        </div>
        <button 
          onClick={handleSubmit}
          className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
        >
          <Save size={18} className="mr-2" />
          Enregistrer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identité */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Identité de l'Entreprise</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la société</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Activité</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.activity}
                onChange={(e) => setFormData({...formData, activity: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse du Siège</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Coordonnées Légales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Info size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Informations Légales</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ICE</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.ice}
                onChange={(e) => setFormData({...formData, ice: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">RC (N° seulement)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.rc}
                onChange={(e) => setFormData({...formData, rc: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">IF</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.if}
                onChange={(e) => setFormData({...formData, if: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Facturation & Paiement */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CreditCard size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Facturation & Paiement</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Taux TVA (%)</label>
              <div className="relative">
                 <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                  type="number" 
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  value={formData.vatRate}
                  onChange={(e) => setFormData({...formData, vatRate: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Coordonnées Bancaires (RIB)</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                value={formData.bankDetails}
                onChange={(e) => setFormData({...formData, bankDetails: e.target.value})}
                placeholder="Ex: Banque Populaire - RIB: ..."
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
