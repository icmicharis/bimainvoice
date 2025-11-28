import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Invoice } from '@/types/invoice';
import { getAllInvoices, saveInvoice, deleteInvoice, getNextInvoiceNumber } from '@/lib/db';
import { toast } from 'sonner';

export function useInvoices() {
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: getAllInvoices,
  });

  const nextNumberQuery = useQuery({
    queryKey: ['next-invoice-number'],
    queryFn: getNextInvoiceNumber,
  });

  const saveMutation = useMutation({
    mutationFn: saveInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['next-invoice-number'] });
      toast.success('Invoice saved successfully');
    },
    onError: () => {
      toast.error('Failed to save invoice');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete invoice');
    },
  });

  return {
    invoices: invoicesQuery.data ?? [],
    isLoading: invoicesQuery.isLoading,
    nextInvoiceNumber: nextNumberQuery.data ?? 'INV-0001',
    saveInvoice: saveMutation.mutate,
    deleteInvoice: deleteMutation.mutate,
  };
}
