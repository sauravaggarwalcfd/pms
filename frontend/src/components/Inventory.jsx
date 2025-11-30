import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unit: 'pcs',
    unit_price: '',
    quantity: '',
    reorder_level: '10',
    supplier_id: ''
  });

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/items`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/items`, {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        quantity: parseInt(formData.quantity),
        reorder_level: parseInt(formData.reorder_level)
      });
      toast.success('Item added successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      unit: 'pcs',
      unit_price: '',
      quantity: '',
      reorder_level: '10',
      supplier_id: ''
    });
  };

  return (
    <div className="space-y-6" data-testid="inventory-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Inventory Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">{items.length} Items in Stock</p>
        </div>
        <Button
          data-testid="add-item-button"
          onClick={() => setIsDialogOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card className="border border-slate-200 rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="inventory-table">
              <thead>
                <tr className="border-b-2 border-emerald-700 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Unit Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Reorder Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLowStock = item.quantity <= item.reorder_level;
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="inventory-row">
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{item.sku}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">${item.unit_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.reorder_level}</td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider rounded-sm">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-sm">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      No inventory items found. Add your first item to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="item-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Add New Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="item-form">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Item Name *</label>
                <Input
                  data-testid="item-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">SKU *</label>
                <Input
                  data-testid="item-sku-input"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Description</label>
              <Input
                data-testid="item-description-input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Category *</label>
                <Input
                  data-testid="item-category-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Unit</label>
                <select
                  data-testid="item-unit-select"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="pcs">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="ltr">Liters</option>
                  <option value="box">Boxes</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Unit Price *</label>
                <Input
                  data-testid="item-price-input"
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Quantity *</label>
                <Input
                  data-testid="item-quantity-input"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Reorder Level</label>
                <Input
                  data-testid="item-reorder-input"
                  type="number"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  className="rounded-sm"
                />
              </div>
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
                data-testid="submit-item-button"
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
              >
                Add Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
