'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// We omit the generic Type parameter here if it conflicts with types, 
// or simply use the interface if types are installed properly.
// A safe fallback without dist/types:
export function ThemeProvider({ children, ...props }: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
