// providers/theme.tsx

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: any) {
  return (
    <NextThemesProvider {...props} suppressHydrationWarning>
      {children}
    </NextThemesProvider>
  );
}
