
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SearchResults from "./pages/SearchResults";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import UserDashboard from "./pages/UserDashboard";
import UserTickets from "./pages/UserTickets";
import Profile from "./pages/Profile";
import BusTracking from "./pages/BusTracking";
import AdminDashboard from "./pages/Dashboard";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminBusmen from "./pages/admin/AdminBusmen";
import BusmanDashboard from "./pages/BusmanDashboard";
import Schedules from "./pages/Schedules";
import RoutesPage from "./pages/Routes";
import Tickets from "./pages/Tickets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireUser>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/tickets" element={
              <ProtectedRoute requireUser>
                <UserTickets />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requireAuth>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/track/:scheduleId" element={<BusTracking />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/schedules" element={
              <ProtectedRoute requireAdmin>
                <AdminSchedules />
              </ProtectedRoute>
            } />
            <Route path="/admin/routes" element={
              <ProtectedRoute requireAdmin>
                <AdminRoutes />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute requireAdmin>
                <AdminTickets />
              </ProtectedRoute>
            } />
            <Route path="/admin/busmen" element={
              <ProtectedRoute requireAdmin>
                <AdminBusmen />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute requireAdmin>
                <Reports />
              </ProtectedRoute>
            } />
            {/* Busman Routes */}
            <Route path="/busman" element={
              <ProtectedRoute requireBusman>
                <Navigate to="/busman/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/busman/dashboard" element={
              <ProtectedRoute requireBusman>
                <BusmanDashboard />
              </ProtectedRoute>
            } />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/purchase" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/auth" replace />} />
            <Route path="/reset-password" element={<Navigate to="/auth" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
