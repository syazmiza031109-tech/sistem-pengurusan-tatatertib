'use client';

import { useEffect } from 'react';

export default function InspectionProtector() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Disable right-click context menu (Inspect Element)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable DevTools and Source keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        // F12 key
        e.key === 'F12' ||
        // Ctrl + Shift + I (Inspect)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
        // Ctrl + Shift + J (Console)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') ||
        // Ctrl + Shift + C (Inspect Element selector)
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') ||
        // Ctrl + U (View Source)
        (e.ctrlKey && e.key.toLowerCase() === 'u') ||
        // Ctrl + S (Save Page)
        (e.ctrlKey && e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
