import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  TruckIcon,
  Receipt,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';

const DashboardLayout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Suppliers', path: '/suppliers', icon: Users },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Purchase Requisitions', path: '/purchase-requisitions', icon: FileText },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
    { name: 'Goods Receipts', path: '/goods-receipts', icon: TruckIcon },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
  ];

  return (
    <div className="flex h-screen bg-slate-50" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        data-testid="sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white" style={{ fontFamily: 'Chivo, sans-serif' }}>
              PMS
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-sm bg-emerald-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <Button
              data-testid="logout-button"
              onClick={onLogout}
              variant="outline"
              className="w-full justify-center gap-2 text-xs font-bold uppercase tracking-wider border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white rounded-sm"
            >
              <LogOut size={14} />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30" data-testid="header">
          <div className="h-full flex items-center justify-between px-6">
            <button
              data-testid="mobile-menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-sm hover:bg-slate-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
                {navigation.find(n => n.path === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
