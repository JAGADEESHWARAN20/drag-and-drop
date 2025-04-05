// components/ui/CustomToast.tsx
import React from 'react';
import { CheckCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomToastProps {
     id?: string;
     className?: string;
     title?: React.ReactNode;
     description?: React.ReactNode;
     action?: React.ReactNode;
     close?: React.ReactNode;
     message?: string;
     status?: 'success' | 'error' | 'warning' | 'info';
}

const CustomToast = React.forwardRef<HTMLDivElement, CustomToastProps>(
     ({ id, className, title, description, action, close, message, status, ...props }, ref) => {
          return (
               <div
                    ref={ref}
                    id={id}
                    className={cn(
                         'group relative w-full border border-gray-200 bg-white p-4 shadow-lg transition-all duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100',
                         className
                    )}
                    {...props}
               >
                    <div className="flex items-center justify-between">
                         {title && <h3 className="font-semibold">{title}</h3>}
                         {close}
                    </div>
                    {description && <p className="text-sm opacity-90">{description}</p>}
                    {message && (
                         <div className="mt-2 flex items-center">
                              {status === 'success' && <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />}
                              <p className="text-sm">{message}</p>
                         </div>
                    )}
                    {action}
               </div>
          );
     }
);

CustomToast.displayName = 'CustomToast';

export { CustomToast };