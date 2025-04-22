
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { WebsiteStoreProvider } from "./store/WebsiteStoreProvider";

const queryClient = new QueryClient();

const App = () => {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WebsiteStoreProvider>
          <DndContext sensors={sensors}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DndContext>
        </WebsiteStoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
