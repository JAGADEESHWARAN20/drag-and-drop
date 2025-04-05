import React from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils"; // Assuming you have a cn (classnames) utility

interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom';
  customPositionClass?: string;
}

export function Toaster({ position = 'top-right', customPositionClass }: ToasterProps) {
  const { toasts } = useToast();

  let viewportClassName = 'fixed z-[100] pointer-events-none';

  switch (position) {
    case 'top-left':
      viewportClassName = cn(viewportClassName, 'top-2 left-2');
      break;
    case 'top-center':
      viewportClassName = cn(viewportClassName, 'top-2 left-1/2 -translate-x-1/2');
      break;
    case 'top-right':
      viewportClassName = cn(viewportClassName, 'top-2 right-2');
      break;
    case 'bottom-left':
      viewportClassName = cn(viewportClassName, 'bottom-2 left-2');
      break;
    case 'bottom-center':
      viewportClassName = cn(viewportClassName, 'bottom-2 left-1/2 -translate-x-1/2');
      break;
    case 'bottom-right':
      viewportClassName = cn(viewportClassName, 'bottom-2 right-2');
      break;
    case 'custom':
      viewportClassName = customPositionClass || viewportClassName;
      break;
    default:
      viewportClassName = cn(viewportClassName, 'top-2 right-2'); // Default to top-right
  }

  return (
    <ToastProvider duration={600}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className={viewportClassName} />
    </ToastProvider>
  );
}