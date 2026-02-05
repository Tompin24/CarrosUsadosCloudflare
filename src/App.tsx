import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CarsPage from "./pages/CarsPage";
import CarDetailPage from "./pages/CarDetailPage";
import EditCarPage from "./pages/EditCarPage";
import AuthPage from "./pages/AuthPage";
import NewCarPage from "./pages/NewCarPage";
import MyListingsPage from "./pages/MyListingsPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/carros" element={<CarsPage />} />
            <Route path="/carros/novo" element={<NewCarPage />} />
            <Route path="/carros/:brand" element={<CarsPage />} />
            <Route path="/carros/:brand/:model" element={<CarsPage />} />
            <Route path="/carros/anuncio/:slug" element={<CarDetailPage />} />
            <Route path="/carros/anuncio/:slug/editar" element={<EditCarPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
