
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ChevronLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Building,
  Hash,
  Phone,
  MapPin
} from 'lucide-react';
import { apiRequest } from '../services/api';

interface AddClientFormProps {
  refreshClients: () => Promise<void>;
  handleGlobalError: (error: any) => void;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ refreshClients, handleGlobalError }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    ice: '',
    telephone: '',
    adresse: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await apiRequest('add_client.php', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setSuccess(true);
      await refreshClients();
      setTimeout(() => {
        navigate('/clients');
      }, 1500);
      
    } catch (err: any) {
      if (err.status) {
        handleGlobalError(err);
      }
      setError(err.message || "Une erreur est survenue lors de l'enregistrement du client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/clients')} 
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nouveau Client</h1>
            <p className="text-sm text-slate-500 font-medium">Enregistrement d'un nouveau partenaire commercial.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Fiche Client</h2>
              <p className="text-sm text-slate-500">Saisissez les informations légales et de contact.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-[1.25rem] flex items-center space-x-3 text-red-600 animate-in shake duration-300">
              <AlertCircle size={24} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[1.25rem] flex items-center space-x-3 text-emerald-600 animate-in zoom-in duration-300">
              <CheckCircle2 size={24} className="shrink-0" />
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Client ajouté avec succès ! Redirection en cours...</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nom / Raison Sociale *</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  required
                  type="text" 
                  disabled={isSubmitting || success}
                  className="w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold placeholder:text-slate-300 disabled:opacity-50"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Entreprise Maghreb Global"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">ICE (15 chiffres) *</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    required
                    type="text" 
                    disabled={isSubmitting || success}
                    className="w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono font-bold text-sm disabled:opacity-50"
                    value={formData.ice}
                    onChange={(e) => setFormData({...formData, ice: e.target.value})}
                    placeholder="00XXXXXXXXXXXXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Téléphone Direct *</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    required
                    type="tel" 
                    disabled={isSubmitting || success}
                    className="w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold disabled:opacity-50"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    placeholder="06XXXXXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Adresse du Siège</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <textarea 
                  rows={4}
                  disabled={isSubmitting || success}
                  className="w-full pl-12 pr-4 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none font-bold text-sm disabled:opacity-50 placeholder:text-slate-300"
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  placeholder="Saisissez l'adresse complète du client..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center space-x-4">
            <button 
              type="button" 
              onClick={() => navigate('/clients')}
              disabled={isSubmitting || success}
              className="flex-1 px-8 py-4.5 bg-slate-100 text-slate-600 font-bold rounded-[1.25rem] hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || success}
              className="flex-[2] px-8 py-4.5 bg-blue-600 text-white font-black rounded-[1.25rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save size={22} />
                  <span>VALIDER LA FICHE CLIENT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientForm;
