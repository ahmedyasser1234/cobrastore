import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ComparePage from './pages/ComparePage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DepartmentsPage from './pages/DepartmentsPage';
import VendorsPagePublic from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import ChatPagePublic from './pages/ChatPagePublic';
import ScrollToTop from './components/utils/ScrollToTop';
import FloatingChatbot from './components/ui/FloatingChatbot';

// Dashboard Imports
import AdminLayout from './components/dashboard/layout/AdminLayout';
import AdminOverview from './pages/dashboard/admin/Overview';
import UsersPage from './pages/dashboard/admin/UsersPage';
import ProductsPage from './pages/dashboard/admin/ProductsPage';
import VendorsPageDashboard from './pages/dashboard/admin/VendorsPage';
import OrdersPage from './pages/dashboard/admin/OrdersPage';
import SharedNotificationsPage from './pages/dashboard/shared/NotificationsPage';
import ChatPage from './pages/dashboard/admin/ChatPage';
import SettingsPage from './pages/dashboard/admin/SettingsPage';
import TaxonomyPage from './pages/dashboard/admin/TaxonomyPage';
import ApprovalPage from './pages/dashboard/admin/ApprovalPage';
import PayoutsPage from './pages/dashboard/admin/PayoutsPage';
import CommissionsPage from './pages/dashboard/admin/CommissionsPage';
import AuditLogsPage from './pages/dashboard/admin/AuditLogsPage';
import CouponsPage from './pages/dashboard/admin/CouponsPage';
import ReviewsPage from './pages/dashboard/admin/ReviewsPage';
import AdsPage from './pages/dashboard/admin/AdsPage';

import VendorLayout from './components/dashboard/layout/VendorLayout';
import VendorOverview from './pages/dashboard/vendor/Overview';
import VendorProductsPage from './pages/dashboard/vendor/ProductsPage';
import VendorOrdersPage from './pages/dashboard/vendor/OrdersPage';
import VendorPayoutsPage from './pages/dashboard/vendor/PayoutsPage';
import VendorSettingsPage from './pages/dashboard/vendor/SettingsPage';
import VendorCouponsPage from './pages/dashboard/vendor/CouponsPage';
import VendorOffersPage from './pages/dashboard/vendor/OffersPage';

import CustomerLayout from './components/dashboard/layout/CustomerLayout';
import CustomerOverview from './pages/dashboard/customer/Overview';
import CustomerOrders from './pages/dashboard/customer/Orders';
import CustomerSettings from './pages/dashboard/customer/Settings';
import CustomerAddresses from './pages/dashboard/customer/Addresses';
import CustomerWishlist from './pages/dashboard/customer/Wishlist';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const PageNotFound = () => <div className="min-h-screen flex items-center justify-center text-text-main font-extrabold text-4xl uppercase tracking-tight">404 - Cobra Access Denied</div>;

const DashboardRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const role = user?.role?.toLowerCase() || 'customer';
  return <Navigate to={`/dashboard/${role}`} replace />;
};

function App() {
  return (
    <div className="min-h-screen bg-background text-text-main transition-colors duration-300">
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'cobra-toast',
          duration: 4000,
          success: {
            iconTheme: {
              primary: '#22D3EE',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <ScrollToTop />
      <Routes>
        {/* Public Store Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/vendors" element={<VendorsPagePublic />} />
        <Route path="/vendors/:slug" element={<VendorDetailPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<SuccessPage />} />
        <Route element={<ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']} loginPath="/login" />}>
          <Route path="/chat" element={<ChatPagePublic />} />
        </Route>
        <Route path="/login" element={<LoginPage type="customer" />} />
        <Route path="/admin/login" element={<LoginPage type="admin" />} />
        <Route path="/vendor/login" element={<LoginPage type="vendor" />} />
        <Route path="/vendor/register" element={<RegisterPage type="vendor" />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Universal Dashboard Redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Integrated Dashboard Routes (Protected) */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'product_manager', 'support']} loginPath="/admin/login" />}>
          <Route path="/dashboard/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="vendors" element={<VendorsPageDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="notifications" element={<SharedNotificationsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            <Route path="taxonomy" element={<TaxonomyPage />} />
            <Route path="approval" element={<ApprovalPage />} />
            <Route path="payouts" element={<PayoutsPage />} />
            <Route path="commissions" element={<CommissionsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />

            <Route path="coupons" element={<CouponsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="ads" element={<AdsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['vendor']} loginPath="/vendor/login" />}>
          <Route path="/dashboard/vendor" element={<VendorLayout />}>
            <Route index element={<VendorOverview />} />
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="notifications" element={<SharedNotificationsPage />} />
            <Route path="payouts" element={<VendorPayoutsPage />} />
            <Route path="coupons" element={<VendorCouponsPage />} />
            <Route path="offers" element={<VendorOffersPage />} />
            <Route path="settings" element={<VendorSettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/dashboard/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerOverview />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="notifications" element={<SharedNotificationsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="settings" element={<CustomerSettings />} />
            <Route path="addresses" element={<CustomerAddresses />} />
            <Route path="wishlist" element={<CustomerWishlist />} />
          </Route>
          <Route path="/orders/:orderId/tracking" element={<OrderTrackingPage />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <FloatingChatbot />
    </div>
  );
}

export default App;
