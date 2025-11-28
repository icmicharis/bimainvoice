import { useState } from 'react';
import { Plus, Trash2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Invoice, LineItem, Client, Currency } from '@/types/invoice';
import { useSettings } from '@/hooks/use-settings';
import { formatCurrency, currencySymbols } from '@/lib/currency';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceFormProps {
  invoiceNumber: string;
  onSave: (invoice: Invoice) => void;
  onPreview: (invoice: Invoice) => void;
}

export function InvoiceForm({ invoiceNumber, onSave, onPreview }: InvoiceFormProps) {
  const { settings } = useSettings();
  
  const [client, setClient] = useState<Client>({
    name: '',
    email: '',
    phone: '',
    address: '',
    vatExempt: false,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, discount: 0, vatEnabled: true },
  ]);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(settings?.invoiceNotes || '');
  const [currency, setCurrency] = useState<Currency>(settings?.defaultCurrency || 'KSH');

  const vatRate = settings?.vatRate || 16;

  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const afterDiscount = subtotal - (subtotal * item.discount / 100);
    return afterDiscount;
  };

  const calculateInvoiceTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
    
    let totalVat = 0;
    if (!client.vatExempt) {
      totalVat = lineItems.reduce((sum, item) => {
        if (item.vatEnabled) {
          const lineTotal = calculateLineTotal(item);
          return sum + (lineTotal * vatRate / 100);
        }
        return sum;
      }, 0);
    }

    const grandTotal = subtotal + totalVat;
    return { subtotal, totalVat, grandTotal };
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: uuidv4(), description: '', quantity: 1, unitPrice: 0, discount: 0, vatEnabled: true }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSubmit = (preview: boolean = false) => {
    const totals = calculateInvoiceTotals();
    const invoice: Invoice = {
      id: uuidv4(),
      invoiceNumber,
      date,
      dueDate,
      client,
      lineItems,
      notes,
      currency,
      vatRate,
      ...totals,
      paymentStatus: 'pending',
    };

    if (preview) {
      onPreview(invoice);
    } else {
      onSave(invoice);
    }
  };

  const totals = calculateInvoiceTotals();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Invoice Number</Label>
            <Input value={invoiceNumber} disabled />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencySymbols).map(([code, symbol]) => (
                  <SelectItem key={code} value={code}>
                    {code} ({symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Client Details</h3>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={client.vatExempt}
              onCheckedChange={(checked) => setClient({ ...client, vatExempt: checked as boolean })}
            />
            <Label>VAT Exempt</Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Client Name</Label>
            <Input
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              placeholder="client@example.com"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={client.phone}
              onChange={(e) => setClient({ ...client, phone: e.target.value })}
              placeholder="+254..."
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
              placeholder="Client address"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Line Items</h3>
          <Button onClick={addLineItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium">Item #{index + 1}</span>
                {lineItems.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                    placeholder="Item description"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => updateLineItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={item.vatEnabled}
                    onCheckedChange={(checked) => updateLineItem(item.id, { vatEnabled: checked as boolean })}
                    disabled={client.vatExempt}
                  />
                  <Label className="text-sm">Apply VAT ({vatRate}%)</Label>
                </div>
                <div className="text-sm font-medium">
                  Total: {formatCurrency(calculateLineTotal(item), currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, thank you message, etc."
          rows={3}
        />
      </Card>

      <Card className="p-6 bg-gradient-card">
        <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span>{formatCurrency(totals.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>VAT ({vatRate}%):</span>
            <span>{formatCurrency(totals.totalVat, currency)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between text-xl font-bold">
            <span>Grand Total:</span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {formatCurrency(totals.grandTotal, currency)}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => handleSubmit(true)} variant="outline" className="flex-1">
          <FileDown className="h-4 w-4 mr-2" />
          Preview & Export PDF
        </Button>
        <Button onClick={() => handleSubmit(false)} className="flex-1">
          Save Invoice
        </Button>
      </div>
    </div>
  );
}
