import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExamProvider } from "@/contexts/ExamContext";
import Index from "./pages/Index";
import SimuladosPage from "./pages/SimuladosPage";
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";
import ProgressPage from "./pages/ProgressPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ExamProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/simulados" element={<SimuladosPage />} />
            <Route path="/simulados/:category" element={<SimuladosPage />} />
            <Route path="/simulado/:examId" element={<ExamPage />} />
            <Route path="/resultado/:resultId" element={<ResultPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/meu-progresso" element={<ProgressPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ExamProvider>
  </QueryClientProvider>
);

export default App;
