import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Invoice, AppSettings } from '@/types/invoice';

interface BimaDB extends DBSchema {
  invoices: {
    key: string;
    value: Invoice;
    indexes: { 'by-number': string; 'by-date': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

let dbInstance: IDBPDatabase<BimaDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<BimaDB>('bima-invoice-db', 1, {
    upgrade(db) {
      // Create invoices store
      const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id' });
      invoiceStore.createIndex('by-number', 'invoiceNumber');
      invoiceStore.createIndex('by-date', 'date');

      // Create settings store
      db.createObjectStore('settings', { keyPath: 'id' });
    },
  });

  return dbInstance;
}

// Invoice operations
export async function saveInvoice(invoice: Invoice): Promise<void> {
  const db = await getDB();
  await db.put('invoices', invoice);
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  const db = await getDB();
  return db.get('invoices', id);
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const db = await getDB();
  return db.getAll('invoices');
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('invoices', id);
}

export async function getNextInvoiceNumber(): Promise<string> {
  const db = await getDB();
  const invoices = await db.getAll('invoices');
  
  if (invoices.length === 0) {
    return 'INV-0001';
  }

  const numbers = invoices
    .map(inv => parseInt(inv.invoiceNumber.split('-')[1]))
    .filter(num => !isNaN(num));

  const maxNumber = Math.max(...numbers, 0);
  return `INV-${String(maxNumber + 1).padStart(4, '0')}`;
}

// Settings operations
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'app-settings');
  
  if (!settings) {
    const defaultSettings: AppSettings = {
      vatRate: 16,
      defaultCurrency: 'KSH',
      companyName: 'Bima Graphics',
      companyAddress: 'Thika Garissa Highway',
      companyCity: '01000 Thika',
      companyCountry: 'Kenya',
      companyPhone: '+254715909038',
      companyEmail: 'bima.ic.graphics@gmail.com',
      invoiceNotes: 'Thank you for your business!',
      bankName: 'I&M Bank',
      bankAccount: '02408149716150 (James Brend Omondi)',
      mpesaPaybill: '542542',
      mpesaAccount: '12954 or James Brend Omondi',
      logoUrl: undefined,
    };
    await saveSettings(defaultSettings);
    return defaultSettings;
  }
  
  return settings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { ...settings, id: 'app-settings' });
}
