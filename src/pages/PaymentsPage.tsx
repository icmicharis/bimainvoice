import { useState } from 'react';
import { Check, X, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInvoices } from '@/hooks/use-invoices';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export function PaymentsPage() {
  const { invoices, saveInvoice } = useInvoices();

  const togglePaymentStatus = (invoice: typeof invoices[0]) => {
    const updated = {
      ...invoice,
      paymentStatus: invoice.paymentStatus === 'confirmed' ? 'pending' : 'confirmed',
      paymentDate: invoice.paymentStatus === 'confirmed' ? undefined : new Date().toISOString(),
    };
    saveInvoice(updated as any);
  };

  const confirmedTotal = invoices
    .filter(inv => inv.paymentStatus === 'confirmed')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const pendingTotal = invoices
    .filter(inv => inv.paymentStatus === 'pending')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const downloadExcel = () => {
    const data = invoices.map(inv => ({
      'Invoice #': inv.invoiceNumber,
      'Client': inv.client.name,
      'Date': format(new Date(inv.date), 'yyyy-MM-dd'),
      'Due Date': format(new Date(inv.dueDate), 'yyyy-MM-dd'),
      'Amount': inv.grandTotal,
      'Currency': inv.currency,
      'Status': inv.paymentStatus,
      'Payment Date': inv.paymentDate ? format(new Date(inv.paymentDate), 'yyyy-MM-dd') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `payment-statement-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Excel file downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Payment Tracking</h2>
          <p className="text-muted-foreground mt-1">Monitor payment status and download statements</p>
        </div>
        <Button onClick={downloadExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Confirmed Payments</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            KSh {confirmedTotal.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">Pending Payments</h3>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            KSh {pendingTotal.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Total Invoices</h3>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {invoices.length}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                  <Badge variant={invoice.paymentStatus === 'confirmed' ? 'default' : 'secondary'}>
                    {invoice.paymentStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-medium">{invoice.client.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">{formatCurrency(invoice.grandTotal, invoice.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                {invoice.paymentDate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Paid on {format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>

              <Button
                variant={invoice.paymentStatus === 'confirmed' ? 'outline' : 'default'}
                onClick={() => togglePaymentStatus(invoice)}
              >
                {invoice.paymentStatus === 'confirmed' ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Mark Pending
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}

        {invoices.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No invoices to track</p>
          </Card>
        )}
      </div>
    </div>
  );
}
