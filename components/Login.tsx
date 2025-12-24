
import React, { useState } from 'react';
import { Lock, User, ChevronRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import bcrypt from 'bcryptjs';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      try {
        const expectedUsername = 'driftoagency';
        const rawHash = '$2a$15$/XR.1p2Bn3fgYYZSaDIFR.nA1yBShi2ZA.03rQn3inc5H1rwH8Rji';
        const expectedHash = rawHash.replace(/^\$2y\$/, '$2a$');

        if (username === expectedUsername) {
          const isPasswordValid = bcrypt.compareSync(password, expectedHash);
          if (isPasswordValid) {
            onLogin();
          } else {
            setError('Identifiants incorrects. Veuillez réessayer.');
          }
        } else {
          setError('Identifiants incorrects. Veuillez réessayer.');
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError('Erreur de serveur d\'authentification.');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Colonne Gauche - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative bg-white z-10">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          {/* Logo Section */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <img 
              src="https://maghrebglobal.com/wp-content/uploads/2025/02/Importation-Distribution-de-Ramettes-Papier-et-Materiel-Bureautique-2048x1170.png" 
              alt="Maghreb Global Logo" 
              className="h-20 w-auto object-contain"
            />
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-6">Connexion</h2>
              <p className="text-slate-500 font-medium mt-2">Gérez votre activité en toute simplicité.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 px-1">Identifiant</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  autoComplete="username"
                  disabled={isLoading}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  placeholder="Votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 px-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-1">
              <label className="relative flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className="w-5 h-5 bg-slate-100 border border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                <CheckCircle2 size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                <span className="ml-3 text-sm font-semibold text-slate-600 group-hover:text-slate-900">Se souvenir de moi</span>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center animate-in shake duration-300">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed group border-none outline-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Chargement...</span>
                </div>
              ) : (
                <>
                  <span className="tracking-wide">ACCÉDER AU DASHBOARD</span>
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-slate-100">
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              © 2025 Maghreb Global • Manager SaaS
            </p>
          </div>
        </div>
      </div>

      {/* Colonne Droite - Visuel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Background Gradients & Accents */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-900/40 to-slate-900"></div>
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white leading-tight">
              Une expérience de gestion <br />
              <span className="text-blue-400">simple et efficace</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-lg mx-auto font-medium">
              Optimisez votre workflow avec notre plateforme SaaS dédiée à l'importation et la distribution.
            </p>
          </div>

          {/* Floating UI Elements Mockup */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] text-left transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-white font-bold mb-1">Facturation Rapide</p>
              <p className="text-slate-400 text-xs">Générez vos PDF en un clic.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] text-left transform rotate-3 hover:rotate-0 transition-transform duration-500 mt-8">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-white font-bold mb-1">Gestion Clients</p>
              <p className="text-slate-400 text-xs">Suivi complet de l'historique.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
