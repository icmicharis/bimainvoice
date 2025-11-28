import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { useInvoices } from '@/hooks/use-invoices';
import { useSettings } from '@/hooks/use-settings';
import { Invoice } from '@/types/invoice';
import { generateInvoicePDF } from '@/lib/pdf-export';
import { toast } from 'sonner';

export function InvoicesPage() {
  const { invoices, nextInvoiceNumber, saveInvoice, deleteInvoice } = useInvoices();
  const { settings } = useSettings();
  const [showForm, setShowForm] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const handleSave = (invoice: Invoice) => {
    saveInvoice(invoice);
    setShowForm(false);
  };

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
  };

  const handleDownload = async (invoice: Invoice) => {
    if (!settings) {
      toast.error('Settings not loaded');
      return;
    }

    try {
      setPreviewInvoice(invoice);
      setTimeout(async () => {
        await generateInvoicePDF(invoice, settings);
        setPreviewInvoice(null);
      }, 500);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleExportFromPreview = async () => {
    if (!previewInvoice || !settings) return;
    
    try {
      await generateInvoicePDF(previewInvoice, settings);
      saveInvoice(previewInvoice);
      setPreviewInvoice(null);
      setShowForm(false);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Invoices</h2>
          <p className="text-muted-foreground mt-1">Manage and create invoices</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <InvoiceList
        invoices={invoices}
        onDelete={deleteInvoice}
        onDownload={handleDownload}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoiceNumber={nextInvoiceNumber}
            onSave={handleSave}
            onPreview={handlePreview}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {previewInvoice && settings && (
            <>
              <InvoicePreview invoice={previewInvoice} settings={settings} />
              <div className="flex gap-3 pt-4 border-t no-print">
                <Button onClick={handleExportFromPreview} className="flex-1">
                  Download PDF & Save
                </Button>
                <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
