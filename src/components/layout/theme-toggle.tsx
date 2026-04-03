'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore, useCallback } from 'react';
import { Sun, Moon, Eye, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ThemeMode = 'light' | 'dark' | 'eye-comfort';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    (onStoreChange) => { onStoreChange(); return () => {}; },
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <Monitor className="size-4 text-muted-foreground" />
      </Button>
    );
  }

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'eye-comfort'];
    const current = (theme === 'eye-comfort' ? 'eye-comfort' : theme || 'light') as ThemeMode;
    const next = order[(order.indexOf(current) + 1) % order.length];
    applyTheme(next);
  };

  const applyTheme = (mode: ThemeMode) => {
    const html = document.documentElement;

    // Remove all theme classes
    html.classList.remove('dark', 'eye-comfort');

    if (mode === 'dark') {
      html.classList.add('dark');
      setTheme('dark');
    } else if (mode === 'eye-comfort') {
      html.classList.add('eye-comfort');
      setTheme('eye-comfort');
    } else {
      setTheme('light');
    }
  };

  const currentMode = theme === 'eye-comfort' ? 'eye-comfort' : theme === 'dark' ? 'dark' : 'light';

  const iconMap: Record<ThemeMode, typeof Sun> = {
    light: Sun,
    dark: Moon,
    'eye-comfort': Eye,
  };

  const labelMap: Record<ThemeMode, string> = {
    light: 'Light',
    dark: 'Dark',
    'eye-comfort': 'Eye Comfort',
  };

  const colorMap: Record<ThemeMode, string> = {
    light: 'text-brand-deep',
    dark: 'text-brand-teal',
    'eye-comfort': 'text-amber-500',
  };

  const Icon = iconMap[currentMode];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 relative group">
          <Icon className={`size-4 ${colorMap[currentMode]} transition-all duration-200 group-hover:scale-110`} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {([
          { mode: 'light' as ThemeMode, icon: Sun, desc: 'Clean & bright', color: 'text-brand-deep' },
          { mode: 'dark' as ThemeMode, icon: Moon, desc: 'Navy dark mode', color: 'text-brand-teal' },
          { mode: 'eye-comfort' as ThemeMode, icon: Eye, desc: 'Warm, low blue-light', color: 'text-amber-500' },
        ]).map(({ mode, icon: ItemIcon, desc, color }) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => applyTheme(mode)}
            className={`flex items-center gap-3 cursor-pointer ${currentMode === mode ? 'bg-accent' : ''}`}
          >
            <div className={`flex items-center justify-center size-8 rounded-lg ${currentMode === mode ? 'bg-primary/10' : ''}`}>
              <ItemIcon className={`size-4 ${color}`} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{labelMap[mode]}</div>
              <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
            {currentMode === mode && (
              <div className="size-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
