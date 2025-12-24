
const API_KEY = 'MAGHREB_GLOBAL_2025_SECURE';

export interface ApiError extends Error {
  status?: number;
}

/**
 * Service de communication centralisé avec l'API Maghreb Global.
 * Garantit l'inclusion du header X-API-KEY et la gestion des erreurs.
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://gestion.maghrebglobal.com/api/${endpoint}`;

  // Headers obligatoires selon spécifications
  const headers: Record<string, string> = {
    'X-API-KEY': API_KEY,
    ...((options.headers as Record<string, string>) || {}),
  };

  // Détection automatique du type de contenu pour les envois JSON
  if (options.body && !headers['Content-Type']) {
    if (typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    });

    if (response.status === 403) {
      const err: ApiError = new Error('Accès refusé – Clé API invalide');
      err.status = 403;
      throw err;
    }

    if (!response.ok) {
      const err: ApiError = new Error(`Erreur API (${response.status})`);
      err.status = response.status;
      throw err;
    }

    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch (e) {
      return { message: text };
    }
    
  } catch (error: any) {
    if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
      const err: ApiError = new Error('Échec de la connexion – Vérifiez votre réseau ou CORS');
      err.status = 0;
      throw err;
    }
    throw error;
  }
};

/**
 * Fonction dédiée au téléchargement des PDF avec injection de la clé API.
 * Indispensable car les liens <a> ne supportent pas les headers personnalisés.
 */
export const downloadPdf = async (endpoint: string, filename: string) => {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://gestion.maghrebglobal.com/api/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY
      }
    });

    if (response.status === 403) {
      throw new Error('Accès refusé – Clé API invalide');
    }

    if (!response.ok) throw new Error('Impossible de générer le document PDF');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error: any) {
    console.error('Download error:', error);
    throw error;
  }
};
