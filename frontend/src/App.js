// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import ShopPage from './pages/ShopPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

import { AuthProvider, useAuth } from './state/AuthContext';
import { CartProvider } from './state/CartContext';

import './App.css';

/* ✅ Decides what "/" should show */
function HomeRedirect(){
  const { isAuthed, isAdmin } = useAuth();

  // If admin is logged in, NEVER show shop at "/"
  if (isAuthed && isAdmin) return <Navigate to="/admin" replace />;

  // Otherwise normal shop home
  return <ShopPage />;
}

/* ✅ Decides what "*" should do */
function NotFoundRedirect(){
  const { isAuthed, isAdmin } = useAuth();

  if (isAuthed && isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/" replace />;
}

export default function App(){
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-shell">
            <Navbar />

            <div className="app-main">
              <Routes>
                {/* ✅ FIXED: "/" redirects admin to /admin */}
                <Route path="/" element={<HomeRedirect />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage />} />

                <Route path="/checkout" element={<CheckoutPage />} />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ FIXED: "*" won't send admin to ShopPage */}
                <Route path="*" element={<NotFoundRedirect />} />
              </Routes>
            </div>

            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
