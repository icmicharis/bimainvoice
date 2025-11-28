 import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice, AppSettings } from '@/types/invoice';
import { formatCurrency, numberToWords } from './currency';

export async function generateInvoicePDF(invoice: Invoice, settings: AppSettings): Promise<void> {
  const element = document.getElementById('invoice-preview');
  if (!element) {
    throw new Error('Invoice preview element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Scale the image to fill the page width (flush left & right)
  const ratio = pdfWidth / imgWidth;
  const imgWidthScaled = pdfWidth;
  const imgHeightScaled = imgHeight * ratio;

  const imgX = 0; // left edge
  const imgY = 0; // top edge

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidthScaled, imgHeightScaled);
  pdf.save(`${invoice.invoiceNumber}.pdf`);
}
