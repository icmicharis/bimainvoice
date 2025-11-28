import { useState, useEffect, useRef } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/use-settings';
import { AppSettings, Currency } from '@/types/invoice';
import { currencySymbols } from '@/lib/currency';

export function SettingsPage() {
  const { settings, saveSettings, isLoading } = useSettings();
  const [formData, setFormData] = useState<AppSettings | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      saveSettings(formData);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && formData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    if (formData) {
      setFormData({ ...formData, logoUrl: undefined });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading || !formData) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure your invoice preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Branding</h3>
          <div className="space-y-4">
            <div>
              <Label>Company Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.logoUrl ? (
                  <div className="relative">
                    <img
                      src={formData.logoUrl}
                      alt="Company Logo"
                      className="h-20 w-20 object-contain rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">BG</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: Square image, PNG or JPG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Invoice Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>VAT Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.vatRate}
                onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Default Currency</Label>
              <Select
                value={formData.defaultCurrency}
                onValueChange={(v) => setFormData({ ...formData, defaultCurrency: v as Currency })}
              >
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
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              />
            </div>
            <div>
              <Label>City/Postal Code</Label>
              <Input
                value={formData.companyCity}
                onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={formData.companyCountry}
                onChange={(e) => setFormData({ ...formData, companyCountry: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>
            <div>
              <Label>Bank Account</Label>
              <Input
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              />
            </div>
            <div>
              <Label>M-Pesa Paybill</Label>
              <Input
                value={formData.mpesaPaybill}
                onChange={(e) => setFormData({ ...formData, mpesaPaybill: e.target.value })}
              />
            </div>
            <div>
              <Label>M-Pesa Account</Label>
              <Input
                value={formData.mpesaAccount}
                onChange={(e) => setFormData({ ...formData, mpesaAccount: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Invoice Notes</h3>
          <Textarea
            value={formData.invoiceNotes}
            onChange={(e) => setFormData({ ...formData, invoiceNotes: e.target.value })}
            placeholder="Default notes to appear on invoices"
            rows={4}
          />
        </Card>

        <Button type="submit" className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}
