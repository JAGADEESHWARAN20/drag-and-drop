// components/ui/CustomToastProvider.tsx
'use client';

import React, { useState, useEffect } from 'react';
import * as ReactToast from '@radix-ui/react-toast';
import { ToastClose } from '@/components/ui/toast'; // You might not need this here anymore
import { cn } from '@/lib/utils';

interface CustomToastProviderProps {
     position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom';
     customPositionClass?: string; // Add a class for more specific custom positioning
     children: React.ReactNode;
}

const CustomToastProvider = ({ position, customPositionClass, children }: CustomToastProviderProps) => {
     const [viewport, setViewport] = useState<HTMLElement | null>(null); // Use HTMLElement

     useEffect(() => {
          setViewport(document.getElementById('custom-toast-viewport'));
     }, []);

     let className = 'fixed z-[100] gap-2';

     switch (position) {
          case 'top-left':
               className += ' top-2 left-2';
               break;
          case 'top-center':
               className += ' top-2 left-1/2 -translate-x-1/2';
               break;
          case 'top-right':
               className += ' top-2 right-2';
               break;
          case 'bottom-left':
               className += ' bottom-2 left-2';
               break;
          case 'bottom-center':
               className += ' bottom-2 left-1/2 -translate-x-1/2';
               break;
          case 'bottom-right':
               className += ' bottom-2 right-2';
               break;
          case 'custom':
               className = customPositionClass || '';
               break;
     }

     return (
          <>
               {children}
               <ReactToast.Provider swipeDirection="left">
                    <ReactToast.Viewport
                         id="custom-toast-viewport"
                         className={cn(className, 'pointer-events-none')}
                    />
               </ReactToast.Provider>
          </>
     );
};

export { CustomToastProvider };