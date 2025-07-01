
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// Define a type for the props that DrawerPrimitive.Root accepts
type DrawerPrimitiveRootProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>;

interface DrawerProps extends DrawerPrimitiveRootProps {
  className?: string;
  children?: React.ReactNode;
}

const Drawer = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Root>,
  DrawerProps
>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Root ref={ref} className={cn(className)} {...props}>
    {children}
  </DrawerPrimitive.Root>
));
Drawer.displayName = DrawerPrimitive.Root.displayName;

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

type DrawerOverlayProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  DrawerOverlayProps & { className?: string }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

type DrawerContentProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps & { className?: string; children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col bg-background p-4 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
));
DrawerContent.displayName = "DrawerContent";

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DrawerHeader = ({
  className,
  ...props
}: DrawerHeaderProps) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DrawerFooter = ({
  className,
  ...props
}: DrawerFooterProps) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

type DrawerTitleProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>;

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  DrawerTitleProps & { className?: string }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

type DrawerDescriptionProps = React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  DrawerDescriptionProps & { className?: string }
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
