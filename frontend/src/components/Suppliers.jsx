import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    tax_id: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/suppliers`, formData);
      toast.success('Supplier added successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to add supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      tax_id: ''
    });
  };

  return (
    <div className="space-y-6" data-testid="suppliers-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Suppliers
          </h2>
          <p className="text-sm text-slate-500 mt-1">{suppliers.length} Total Suppliers</p>
        </div>
        <Button
          data-testid="add-supplier-button"
          onClick={() => setIsDialogOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card className="border border-slate-200 rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="suppliers-table">
              <thead>
                <tr className="border-b-2 border-emerald-700 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">City</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="supplier-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{supplier.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{supplier.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{supplier.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{supplier.city || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-sm">
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No suppliers found. Add your first supplier to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="supplier-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Add New Supplier
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="supplier-form">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Supplier Name *</label>
              <Input
                data-testid="supplier-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Email</label>
              <Input
                data-testid="supplier-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Phone</label>
              <Input
                data-testid="supplier-phone-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Address</label>
              <Input
                data-testid="supplier-address-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">City</label>
                <Input
                  data-testid="supplier-city-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Country</label>
                <Input
                  data-testid="supplier-country-input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="rounded-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tax ID</label>
              <Input
                data-testid="supplier-tax-input"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-sm"
              >
                Cancel
              </Button>
              <Button
                data-testid="submit-supplier-button"
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
              >
                Add Supplier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
