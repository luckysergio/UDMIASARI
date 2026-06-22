import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard";
import Users from "./pages/dashboard/Users";
import Categories from "./pages/master/Categories";
import Jenis from "./pages/master/Jenis";
import Products from "./pages/products/Products";
import Inventory from "./pages/inventory/Inventory";
import ProductMovements from "./pages/movements/ProductMovements";
import Payments from "./pages/payments/Payments";
import TransactionsActive from "./pages/transactions/TransactionsActive";
import TransactionsHistory from "./pages/transactions/TransactionsHistory";
import RetursActive from "./pages/retur/RetursActive";
import RetursHistory from "./pages/retur/RetursHistory";
// Customer Pages
import CustomerTransactions from "./pages/customer/CustomerTransactions";
import CustomerReturs from "./pages/customer/CustomerReturs";
import Profile from "./pages/profile/profile";
import CustomerProfile from "./pages/customer/CustomerProfile";
import TransactionsReport from "./pages/transactions/TransactionsReport";
import ReturReport from "./pages/retur/ReturReport";

function App() {
  return (
    <Router>
      <ModalProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes - Landing Page di root */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Auth Routes - Forgot Password & Reset Password */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Customer Routes - Hanya untuk role customer */}
            <Route
              path="/customer/transactions"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/returs"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerReturs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Semua role bisa akses */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />

            {/* Inventory - Admin dan Kepala Produksi bisa akses */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            {/* Transactions - Admin dan Kepala Produksi bisa akses */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <TransactionsActive />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions/history"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <TransactionsHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions/report"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <TransactionsReport />
                </ProtectedRoute>
              }
            />

            {/* Returs - Admin dan Kepala Produksi bisa akses */}
            <Route
              path="/returs"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <RetursActive />
                </ProtectedRoute>
              }
            />

            <Route
              path="/returs/history"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <RetursHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/returs/report"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <ReturReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["admin", "kepala_produksi"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Payments - Hanya Admin */}
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Payments />
                </ProtectedRoute>
              }
            />

            {/* User Management - Hanya untuk role admin */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* Master Data - Hanya untuk role admin */}
            <Route
              path="/master/categories"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/jenis"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Jenis />
                </ProtectedRoute>
              }
            />

            {/* Product Movement - Hanya untuk role admin */}
            <Route
              path="/inventory/movements"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ProductMovements />
                </ProtectedRoute>
              }
            />

            {/* Redirect - 404 ke landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ModalProvider>
    </Router>
  );
}

export default App;