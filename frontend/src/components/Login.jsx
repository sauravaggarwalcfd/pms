import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'purchaser'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await axios.post(`${API}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        toast.success('Login successful!');
        onLogin(response.data.user);
      } else {
        await axios.post(`${API}/auth/register`, formData);
        toast.success('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1720036236697-018370867320?crop=entropy&cs=srgb&fm=jpg&q=85')`
      }}
      data-testid="login-page"
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      
      <Card className="relative z-10 w-full max-w-md mx-4 p-8 bg-white/95 backdrop-blur-md border border-slate-200 rounded-sm shadow-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
            PMS
          </h1>
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Purchase Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Full Name
              </label>
              <Input
                data-testid="name-input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Email
            </label>
            <Input
              data-testid="email-input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full rounded-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Password
            </label>
            <Input
              data-testid="password-input"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full rounded-sm"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Role
              </label>
              <select
                data-testid="role-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="purchaser">Purchaser</option>
                <option value="approver">Approver</option>
                <option value="warehouse">Warehouse</option>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <Button
            data-testid="submit-button"
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider py-3 rounded-sm"
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            data-testid="toggle-mode-button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-medium text-slate-600 hover:text-emerald-700 uppercase tracking-wider"
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Demo: admin@factory.com / password
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
