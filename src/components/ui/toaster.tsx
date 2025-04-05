import React, { useState, useEffect } from 'react';
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

export function Toaster({ position: defaultPosition = 'top-right', customPositionClass: defaultCustomPositionClass }: ToasterProps) {
  const { toasts } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportClassName, setViewportClassName] = useState('fixed z-[100] pointer-events-none');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let className = 'fixed z-[100] pointer-events-none';
    let currentPosition = defaultPosition;
    let currentCustomPositionClass = defaultCustomPositionClass;

    if (isMobile) {
      currentPosition = 'custom';
      currentCustomPositionClass = 'fixed left-1/2 -translate-x-1/2 bottom-8 md:bottom-24 z-[101]'; // Adjust bottom value as needed
    }

    switch (currentPosition) {
      case 'top-left':
        className = cn(className, 'top-2 left-2');
        break;
      case 'top-center':
        className = cn(className, 'top-2 left-1/2 -translate-x-1/2');
        break;
      case 'top-right':
        className = cn(className, 'top-2 right-2');
        break;
      case 'bottom-left':
        className = cn(className, 'bottom-2 left-2');
        break;
      case 'bottom-center':
        className = cn(className, 'bottom-2 left-1/2 -translate-x-1/2');
        break;
      case 'bottom-right':
        className = cn(className, 'bottom-2 right-2');
        break;
      case 'custom':
        className = currentCustomPositionClass || className;
        break;
      default:
        className = cn(className, 'top-2 right-2'); // Default to top-right
    }

    setViewportClassName(className);
  }, [isMobile, defaultPosition, defaultCustomPositionClass]);

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