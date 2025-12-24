
export enum DocType {
  INVOICE = 'Facture',
  DELIVERY_SLIP = 'Bon de Livraison'
}

export interface CompanyInfo {
  name: string;
  activity: string;
  address: string;
  phones: string[];
  email?: string;
  ice: string;
  rc: string;
  if: string;
  bankDetails: string;
  logoUrl?: string;
  vatRate: number;
  currency: string;
}

export interface Client {
  id: string;
  name: string;
  ice: string;
  telephone: string;
  adresse: string;
  created_at: string;
  deletedAt?: string | null;
}

export interface Product {
  id: number | string;
  name: string;
  priceHT: number;
  format?: string | null;
  format_label?: string;
  category?: string;
  deletedAt?: string | null;
}

export interface LineItem {
  productId: string | number;
  name: string;
  quantity: number;
  priceHT: number;
}

export interface Document {
  id: string;
  type: DocType;
  number: string;
  date: string;
  clientId: string;
  clientName: string;
  items: LineItem[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  status: 'draft' | 'validated' | 'paid' | 'cancelled';
  deletedAt?: string | null;
}

export interface DashboardStats {
  totalRevenue: number;
  invoiceCount: number;
  deliveryCount: number;
  clientCount: number;
}
