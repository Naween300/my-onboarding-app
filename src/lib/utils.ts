import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Browser Extension Detection and Hydration Safety
export function isBrowserExtensionPresent(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for common browser extension indicators
  const extensionIndicators = [
    'bis_skin_checked',
    'data-adblock',
    'data-extension'
  ];
  
  return extensionIndicators.some(indicator => 
    document.querySelector(`[${indicator}]`) !== null
  );
}

// Hydration Safety HOC
export function withHydrationSafety<T extends object>(
  Component: React.ComponentType<T>
) {
  return function HydrationSafeComponent(props: T) {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
      setIsHydrated(true);
    }, []);

    if (!isHydrated) {
      return React.createElement('div', null, 'Loading...');
    }

    return React.createElement(Component, props);
  };
} 