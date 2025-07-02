import { FC, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent 
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { WebsiteStoreProvider, useWebsiteStore } from '@/store/WebsiteStore';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Configure QueryClient with optimal settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5000,
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Loading component with animation
const LoadingFallback: FC = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback: FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
    <div className="max-w-md w-full space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
      <pre className="text-sm text-destructive p-4 bg-destructive/10 rounded-lg overflow-auto">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

// Main App wrapper component
const AppWrapper: FC = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
        tolerance: 5, // Allow 5px of movement before canceling click events
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    useWebsiteStore.getState().startDragging();
    useWebsiteStore.getState().setDraggingComponent({
      id: active.id as string,
      type: active.data.current?.type,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    useWebsiteStore.getState().stopDragging();
    useWebsiteStore.getState().setDraggingComponent(null);

    if (over && active.id !== over.id) {
      useWebsiteStore.getState().updateComponentParent(
        active.id as string,
        over.id as string
      );
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeComponent = useWebsiteStore.getState().components.find(
      (c) => c.id === active.id
    );
    const overComponent = useWebsiteStore.getState().components.find(
      (c) => c.id === over.id
    );

    if (!activeComponent || !overComponent) return;

    // Prevent dropping on non-container components
    if (!overComponent.allowChildren) return;

    // Update component hierarchy
    useWebsiteStore.getState().updateComponentParent(
      activeComponent.id,
      overComponent.id
    );
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <WebsiteStoreProvider>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                modifiers={[restrictToWindowEdges]}
              >
                <div className="min-h-screen bg-background">
                  <Suspense fallback={<LoadingFallback />}>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </div>
              </DndContext>
            </WebsiteStoreProvider>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Export the main App component
const App: FC = () => <AppWrapper />;

export default App;