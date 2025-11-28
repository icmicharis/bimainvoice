import { Invoice, AppSettings } from '@/types/invoice';
import { formatCurrency, numberToWords } from '@/lib/currency';
import { format } from 'date-fns';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: AppSettings;
}

export function InvoicePreview({ invoice, settings }: InvoicePreviewProps) {
  const calculateLineTotal = (item: typeof invoice.lineItems[0]) => {
    const subtotal = item.quantity * item.unitPrice;
    const afterDiscount = subtotal - (subtotal * item.discount / 100);
    return afterDiscount;
  };

  return (
    <div id="invoice-preview" className="invoice-print py-8 max-w-4xl mx-auto bg-white print:px-0 px-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-black">
        <div className="flex items-start gap-6">
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt="Company Logo" 
              className="h-20 w-20 object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <img 
              src="https://i.imgur.com/zQ9HLuA.png" 
              alt="Bima Graphics" 
              className="h-20 w-auto"
              crossOrigin="anonymous"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-black mb-2">{settings.companyName}</h1>
            <p className="text-xs text-gray-700 leading-relaxed">{settings.companyAddress}</p>
            <p className="text-xs text-gray-700 leading-relaxed">{settings.companyCity}, {settings.companyCountry}</p>
            <p className="text-xs text-gray-700 leading-relaxed">{settings.companyPhone}</p>
            <p className="text-xs text-gray-700 leading-relaxed">{settings.companyEmail}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-black mb-4 tracking-wide">INVOICE</h2>
          <div className="space-y-1">
            <p className="text-xs text-gray-700"><span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-700"><span className="font-semibold">Date:</span> {format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
            <p className="text-xs text-gray-700"><span className="font-semibold">Due Date:</span> {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-10 p-5 border-l-4 border-black bg-gray-50">
        <h3 className="text-xs font-bold text-black uppercase tracking-wide mb-3">Bill To</h3>
        <p className="font-semibold text-base text-black mb-1">{invoice.client.name}</p>
        <p className="text-xs text-gray-700 leading-relaxed">{invoice.client.address}</p>
        <p className="text-xs text-gray-700 leading-relaxed">{invoice.client.email}</p>
        <p className="text-xs text-gray-700 leading-relaxed">{invoice.client.phone}</p>
        {invoice.client.vatExempt && (
          <p className="text-xs text-black font-semibold mt-2 uppercase">VAT Exempt</p>
        )}
      </div>

      {/* Line Items */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-black text-white">
            <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide">Description</th>
            <th className="text-center p-3 text-xs font-semibold uppercase tracking-wide">Qty</th>
            <th className="text-right p-3 text-xs font-semibold uppercase tracking-wide">Unit Price</th>
            <th className="text-right p-3 text-xs font-semibold uppercase tracking-wide">Disc.</th>
            <th className="text-center p-3 text-xs font-semibold uppercase tracking-wide">VAT</th>
            <th className="text-right p-3 text-xs font-semibold uppercase tracking-wide">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item, index) => (
            <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <td className="p-3 text-sm text-gray-900">{item.description}</td>
              <td className="text-center p-3 text-sm text-gray-700">{item.quantity}</td>
              <td className="text-right p-3 text-sm text-gray-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
              <td className="text-right p-3 text-sm text-gray-700">{item.discount}%</td>
              <td className="text-center p-3 text-sm text-gray-700">{item.vatEnabled && !invoice.client.vatExempt ? '✓' : '—'}</td>
              <td className="text-right p-3 text-sm font-semibold text-black">{formatCurrency(calculateLineTotal(item), invoice.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-80 border-t-2 border-black pt-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">VAT ({invoice.vatRate}%):</span>
              <span>{formatCurrency(invoice.totalVat, invoice.currency)}</span>
            </div>
            <div className="h-px bg-gray-300" />
            <div className="flex justify-between text-xl font-bold bg-black text-white p-3">
              <span>TOTAL DUE:</span>
              <span>{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
            </div>
            <p className="text-xs text-gray-600 italic pt-1 text-right">
              {numberToWords(invoice.grandTotal)} Only
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-8 p-5 border border-gray-300">
        <h3 className="text-xs font-bold text-black uppercase tracking-wide mb-4">Payment Information</h3>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-semibold text-black mb-1">Bank Transfer</p>
            <p className="text-xs text-gray-700">{settings.bankName}</p>
            <p className="text-xs text-gray-700">Account: {settings.bankAccount}</p>
          </div>
          <div>
            <p className="font-semibold text-black mb-1">M-Pesa Payment</p>
            <p className="text-xs text-gray-700">Paybill: {settings.mpesaPaybill}</p>
            <p className="text-xs text-gray-700">Account: {settings.mpesaAccount}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6 p-4 bg-gray-50">
          <h3 className="text-xs font-bold text-black uppercase tracking-wide mb-2">Additional Notes</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-300">
        <p className="font-medium">Thank you for your business!</p>
      </div>
    </div>
  );
}
