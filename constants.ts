
import { CompanyInfo, Product } from './types';

export const DEFAULT_COMPANY: CompanyInfo = {
  name: "MAGHREB GLOBAL SARL",
  activity: "Importation & Distribution de Ramettes Papier et Matériel Bureautique",
  address: "Imm 30, Appart 5, Jbal Ayachi, Agdal – Rabat",
  phones: ["0667 62 15 15", "0664 52 25 25"],
  email: "contact@maghrebglobal.com",
  ice: "003825071000050",
  rc: "191653",
  if: "68361663",
  bankDetails: "Agence BMCE RABAT MOHAMED VI - N° de compte : 011810000044210000140721",
  vatRate: 20,
  currency: "DH"
};

export const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'TARGET A4 80G', priceHT: 35, format: 'A4', format_label: 'PAPIER A4 80G' },
  { id: '2', name: 'PIONEER A4 80G', priceHT: 35, format: 'A4', format_label: 'PAPIER A4 80G' },
  { id: '3', name: 'MYPRINT A4 80G', priceHT: 32, format: 'A4', format_label: 'PAPIER A4 80G' },
  { id: '4', name: 'TARGET A3 80G', priceHT: 70, format: 'A3', format_label: 'PAPIER A3 80G' },
  { id: '5', name: 'PIONEER A3 80G', priceHT: 70, format: 'A3', format_label: 'PAPIER A3 80G' },
  { id: '6', name: 'MYPRINT A3 80G', priceHT: 65, format: 'A3', format_label: 'PAPIER A3 80G' }
];
