import { FileText, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';

interface InvoiceListProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  onDownload: (invoice: Invoice) => void;
}

export function InvoiceList({ invoices, onDelete, onDownload }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
        <p className="text-muted-foreground">Create your first invoice to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                <Badge variant={invoice.paymentStatus === 'confirmed' ? 'default' : 'secondary'}>
                  {invoice.paymentStatus}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>
                  <p><strong>Client:</strong> {invoice.client.name}</p>
                  <p><strong>Date:</strong> {format(new Date(invoice.date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p><strong>Amount:</strong> {formatCurrency(invoice.grandTotal, invoice.currency)}</p>
                  <p><strong>Due:</strong> {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onDownload(invoice)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(invoice.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
