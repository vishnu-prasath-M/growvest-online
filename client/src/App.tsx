import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InvestPage from "./pages/InvestPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import { useAuth } from "./context/AuthContext";


import FloatingContactButton from "./components/FloatingContactButton";


const queryClient = new QueryClient();

const App = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Root route: Redirect to dashboard if logged in, else landing page (Index) */}
            <Route 
              path="/" 
              element={token ? (user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />) : <Index />} 
            />

            {/* Public routes with redirect if already logged in */}
            <Route 
              path="/login" 
              element={token ? <Navigate to="/" replace /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={token ? <Navigate to="/" replace /> : <Register />} 
            />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invest" 
              element={
                <ProtectedRoute>
                  <InvestPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/about" 
              element={
                <ProtectedRoute>
                  <AboutPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingContactButton />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
