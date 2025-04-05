import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CustomToastProvider } from "@/components/ui/CustomToastProvider"; // Import your custom provider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CustomToastProvider position="bottom-left" customPositionClass="fixed top-1/4 right-1/4 z-50"> {/* Configure your desired position */}
        {/* You might not need Sonner if you're only using Shadcn UI's useToast */}
        {/* <Sonner /> */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CustomToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;