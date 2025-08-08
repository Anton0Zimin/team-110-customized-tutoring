'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

const themes = {
  light: 'light',
  dark: 'dark',
  system: 'system',
  forest: 'forest',
  mud: 'mud',
  ocean: 'ocean',
  sunset: 'sunset',
  lavender: 'lavender',
  dyslexia: 'dyslexia',
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props} 
      themes={Object.values(themes)}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
