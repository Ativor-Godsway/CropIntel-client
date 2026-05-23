import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Contexts
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { PageSpinner } from './components/shared/Spinner';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import GoogleCallback from './pages/auth/GoogleCallback';

// Diagnosis pages
import DiagnosisPage from './pages/diagnosis/DiagnosisPage';
import DiagnosisResult from './pages/diagnosis/DiagnosisResult';

// Marketplace pages
import MarketplacePage from './pages/marketplace/MarketplacePage';
import ProductDetail from './pages/marketplace/ProductDetail';
import Cart from './pages/marketplace/Cart';
import Checkout from './pages/marketplace/Checkout';
import CheckoutVerify from './pages/marketplace/CheckoutVerify';
import OrderSuccess from './pages/marketplace/OrderSuccess';

// Seller pages
import SellerDashboard from './pages/seller/SellerDashboard';
import Analytics from './pages/seller/Analytics';
import ManageListings from './pages/seller/ManageListings';
import ListProduct from './pages/seller/ListProduct';
import SellerOrders from './pages/seller/SellerOrders';

// Dashboard
import FarmerDashboard from './pages/dashboard/FarmerDashboard';

// Profile
import ProfilePage from './pages/profile/ProfilePage';

// Landing
import Home from './pages/Home';

// ─── Route guards ─────────────────────────────────────────────────────────────

// Redirects to /login if not authenticated
const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Redirects to /dashboard if already authenticated
const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// Redirects if user doesn't have seller role
const SellerRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.activeRole !== 'seller') {
    return <Navigate to="/dashboard?error=seller_required" replace />;
  }
  return <Outlet />;
};

// ─── Layout wrapper ───────────────────────────────────────────────────────────

const AppLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <Outlet />
    </main>
    <Footer />
  </div>
);


// ─── App ──────────────────────────────────────────────────────────────────────

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Routes>
            {/* Public-only routes (redirect to dashboard if logged in) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/login/phone" element={<VerifyOTP />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Google OAuth callback — handled regardless of auth state */}
            <Route path="/auth/google/callback" element={<GoogleCallback />} />

            {/* App routes with Navbar/Footer */}
            <Route element={<AppLayout />}>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />

              {/* Protected */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<FarmerDashboard />} />
                <Route path="/diagnosis" element={<DiagnosisPage />} />
                <Route path="/diagnosis/result/:id" element={<DiagnosisResult />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/verify" element={<CheckoutVerify />} />
                <Route path="/orders/success" element={<OrderSuccess />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Seller-only routes */}
                <Route element={<SellerRoute />}>
                  <Route path="/seller" element={<SellerDashboard />}>
                    <Route index element={<Analytics />} />
                    <Route path="listings" element={<ManageListings />} />
                    <Route path="list" element={<ListProduct />} />
                    <Route path="edit/:id" element={<ListProduct />} />
                    <Route path="orders" element={<SellerOrders />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
