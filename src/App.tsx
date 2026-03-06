import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import SimuladosPage from "./pages/SimuladosPage";
import ExamPage from "./pages/ExamPage";
import ANACExamPage from "./pages/ANACExamPage";
import ResultPage from "./pages/ResultPage";
import AdminPage from "./pages/AdminPage";
import ProgressPage from "./pages/ProgressPage";
import ConquistasPage from "./pages/ConquistasPage";
import GuiaCarreiraPage from "./pages/GuiaCarreiraPage";
import GuiaCarreiraDetailPage from "./pages/GuiaCarreiraDetailPage";
import MicrocoursesPage from "./pages/MicrocoursesPage";
import CurriculumPage from "./pages/CurriculumPage";
import PremiumPage from "./pages/PremiumPage";
import ProfessionExamPage from "./pages/ProfessionExamPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/simulados" element={<SimuladosPage />} />
            <Route path="/simulados/:category" element={<SimuladosPage />} />
            <Route path="/simulado-anac" element={<ANACExamPage />} />
            <Route path="/simulado/:examId" element={<ExamPage />} />
            <Route path="/resultado/:resultId" element={<ResultPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/meu-progresso" element={<ProgressPage />} />
            <Route path="/conquistas" element={<ConquistasPage />} />
            <Route path="/guia-carreira" element={<GuiaCarreiraPage />} />
            <Route path="/guia-carreira/:guideId" element={<GuiaCarreiraDetailPage />} />
            <Route path="/microcursos" element={<MicrocoursesPage />} />
            <Route path="/curriculo" element={<CurriculumPage />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/simulado-profissao/:professionId" element={<ProfessionExamPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
