
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-2">
      <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as 'light' | 'dark')}>
        <ToggleGroupItem value="light" aria-label="Light mode" className="px-3 py-2">
          <Sun size={18} className="text-model-gold" />
          <span className="ml-2">Light</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Dark mode" className="px-3 py-2">
          <Moon size={18} className="text-model-gold" />
          <span className="ml-2">Dark</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export const MobileThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="text-model-white hover:bg-model-black/30"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Sun size={20} className="text-model-gold" />
      ) : (
        <Moon size={20} className="text-model-gold" />
      )}
    </Button>
  );
};
