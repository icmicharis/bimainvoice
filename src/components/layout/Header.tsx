import { Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/theme-store';
import { useSettings } from '@/hooks/use-settings';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const { settings } = useSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Company Logo"
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">BG</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Bima Graphics
              </h1>
              <p className="text-xs text-muted-foreground">Invoice Generator</p>
            </div>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
