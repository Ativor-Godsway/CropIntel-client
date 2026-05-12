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
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// ─── Home / landing ───────────────────────────────────────────────────────────

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          🌱 AI-powered crop disease diagnosis
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Protect Your Farm<br />
          <span className="text-primary-600">with AI Intelligence</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Upload a photo of your affected crop leaf and get an instant AI diagnosis,
          treatment advice, and access to Ghana's top farming marketplace.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {user ? (
            <>
              <a href="/diagnosis" className="btn-primary px-6 py-3 text-base">
                🔬 Diagnose Crop Now
              </a>
              <a href="/marketplace" className="btn-secondary px-6 py-3 text-base">
                Browse Marketplace
              </a>
            </>
          ) : (
            <>
              <a href="/register" className="btn-primary px-6 py-3 text-base">
                Get Started Free
              </a>
              <a href="/marketplace" className="btn-secondary px-6 py-3 text-base">
                Browse Marketplace
              </a>
            </>
          )}
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: '🔬', title: 'AI Diagnosis', desc: 'Claude AI analyzes your leaf photos to identify diseases with up to 95% confidence.' },
          { icon: '💊', title: 'Treatment Advice', desc: 'Get specific, actionable treatment and prevention recommendations tailored to your crops.' },
          { icon: '🛒', title: 'Shop Treatments', desc: 'Buy recommended fungicides, pesticides and seeds directly from verified Ghanaian sellers.' },
        ].map((f) => (
          <div key={f.title} className="card p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

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
