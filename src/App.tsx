import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import FeaturesPage from "./pages/FeaturesPage";
import FeatureDetailPage from "./pages/FeatureDetailPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const GuidesPage = () => (
  <div className="px-4 pt-6 pb-24 max-w-md mx-auto">
    <h1 className="text-2xl font-extrabold text-foreground">Guides</h1>
    <p className="text-sm text-muted-foreground mt-1">Sales guides coming soon</p>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/features" element={<ProtectedRoute><FeaturesPage /></ProtectedRoute>} />
            <Route path="/feature-detail" element={<ProtectedRoute><FeatureDetailPage /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><GuidesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
