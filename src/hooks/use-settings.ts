import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppSettings } from '@/types/invoice';
import { getSettings, saveSettings } from '@/lib/db';
import { toast } from 'sonner';

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    saveSettings: saveMutation.mutate,
  };
}
