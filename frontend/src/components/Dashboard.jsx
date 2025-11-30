import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, Users, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-dashboard">
        <div className="text-lg font-bold text-slate-600 uppercase tracking-wider">Loading Dashboard...</div>
      </div>
    );
  }

  const kpiData = [
    {
      title: 'Total Suppliers',
      value: stats?.total_suppliers || 0,
      icon: Users,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      testId: 'kpi-suppliers'
    },
    {
      title: 'Inventory Items',
      value: stats?.total_items || 0,
      icon: Package,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      testId: 'kpi-inventory'
    },
    {
      title: 'Purchase Orders',
      value: stats?.total_pos || 0,
      icon: FileText,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      testId: 'kpi-pos'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pending_approvals || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      testId: 'kpi-pending'
    },
    {
      title: 'Low Stock Items',
      value: stats?.low_stock_count || 0,
      icon: AlertTriangle,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      testId: 'kpi-low-stock'
    },
    {
      title: 'Recent Activity',
      value: stats?.recent_activity || 0,
      icon: CheckCircle2,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      testId: 'kpi-activity'
    }
  ];

  return (
    <div className="space-y-6" data-testid="dashboard">
      {/* Hero Section */}
      <div
        className="relative h-48 rounded-sm overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1747085040719-55282cc206b9?crop=entropy&cs=srgb&fm=jpg&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative h-full flex flex-col justify-center px-8">
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Control Room
          </h1>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-300">
            Purchase Management System Overview
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="border border-slate-200 rounded-sm shadow-sm" data-testid={kpi.testId}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      {kpi.title}
                    </p>
                    <p className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-sm ${kpi.bgColor}`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200 rounded-sm shadow-sm" data-testid="status-chart">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold uppercase tracking-wide text-slate-700">
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full border-8 border-emerald-700 flex items-center justify-center mb-4">
                  <span className="text-3xl font-black text-emerald-700">98%</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
                  System Operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-sm" data-testid="quick-actions">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold uppercase tracking-wide text-slate-700">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-emerald-800 transition-colors">
                Create Purchase Order
              </button>
              <button className="w-full px-4 py-3 bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-slate-800 transition-colors">
                Add New Supplier
              </button>
              <button className="w-full px-4 py-3 bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-slate-800 transition-colors">
                Manage Inventory
              </button>
              <button className="w-full px-4 py-3 bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-slate-800 transition-colors">
                View Reports
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="border border-slate-200 rounded-sm shadow-sm" data-testid="activity-feed">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold uppercase tracking-wide text-slate-700">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 rounded-full bg-emerald-700" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Purchase Order #{1000 + i} Created</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">{i} hours ago</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-sm">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
