export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatEnabled: boolean;
}

export interface Client {
  name: string;
  email: string;
  phone: string;
  address: string;
  vatExempt: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: Client;
  lineItems: LineItem[];
  notes: string;
  currency: Currency;
  vatRate: number;
  subtotal: number;
  totalVat: number;
  grandTotal: number;
  paymentStatus: 'pending' | 'confirmed';
  paymentDate?: string;
}

export type Currency = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'CAD' | 'CHF' | 'CNH' | 'HKD' | 'NZD' | 'KSH' | 'NGN';

export interface AppSettings {
  vatRate: number;
  defaultCurrency: Currency;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyPhone: string;
  companyEmail: string;
  invoiceNotes: string;
  bankName: string;
  bankAccount: string;
  mpesaPaybill: string;
  mpesaAccount: string;
  logoUrl?: string;
}
