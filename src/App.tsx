import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
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
import MicrocoursePlayerPage from "./pages/MicrocoursePlayerPage";
import CurriculumPage from "./pages/CurriculumPage";
import PremiumPage from "./pages/PremiumPage";
import ProfessionExamPage from "./pages/ProfessionExamPage";
import ImportQuestoesPage from "./pages/ImportQuestoesPage";
import NotFound from "./pages/NotFound";
import { AdminGuard } from "./components/AdminGuard";
import { FeatureGuard } from "./components/FeatureGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrandingProvider>
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
              {/* Protected Admin Routes */}
              <Route element={<AdminGuard />}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/importar-questoes" element={<ImportQuestoesPage />} />
              </Route>
  
              <Route path="/meu-progresso" element={<FeatureGuard feature="progress"><ProgressPage /></FeatureGuard>} />
              <Route path="/conquistas" element={<FeatureGuard feature="achievements"><ConquistasPage /></FeatureGuard>} />
              <Route path="/guia-carreira" element={<FeatureGuard feature="career_guide"><GuiaCarreiraPage /></FeatureGuard>} />
              <Route path="/guia-carreira/:guideId" element={<FeatureGuard feature="career_guide"><GuiaCarreiraDetailPage /></FeatureGuard>} />
              <Route path="/microcursos" element={<FeatureGuard feature="microcourses"><MicrocoursesPage /></FeatureGuard>} />
              <Route path="/microcursos/:courseId" element={<FeatureGuard feature="microcourses"><MicrocoursePlayerPage /></FeatureGuard>} />
              <Route path="/curriculo" element={<FeatureGuard feature="curriculum"><CurriculumPage /></FeatureGuard>} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/simulado-profissao/:professionId" element={<ProfessionExamPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BrandingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
