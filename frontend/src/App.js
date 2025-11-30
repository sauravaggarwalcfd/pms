import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import Suppliers from './components/Suppliers';
import Inventory from './components/Inventory';
import PurchaseRequisitions from './components/PurchaseRequisitions';
import PurchaseOrders from './components/PurchaseOrders';
import GoodsReceipts from './components/GoodsReceipts';
import Invoices from './components/Invoices';
import { Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/suppliers"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <Suppliers />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/inventory"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <Inventory />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/purchase-requisitions"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <PurchaseRequisitions user={user} />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/purchase-orders"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <PurchaseOrders user={user} />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/goods-receipts"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <GoodsReceipts />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/invoices"
            element={
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout}>
                  <Invoices />
                </DashboardLayout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
