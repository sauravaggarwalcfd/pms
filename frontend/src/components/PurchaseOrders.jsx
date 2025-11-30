import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Download, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PurchaseOrders = ({ user }) => {
  const [pos, setPOs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_name: '',
    items: [],
    delivery_date: '',
    notes: '',
    created_by: ''
  });
  const [selectedItem, setSelectedItem] = useState({
    item_id: '',
    item_name: '',
    quantity: '',
    unit_price: ''
  });

  useEffect(() => {
    fetchPOs();
    fetchSuppliers();
    fetchItems();
  }, []);

  const fetchPOs = async () => {
    try {
      const response = await axios.get(`${API}/purchase-orders`);
      setPOs(response.data);
    } catch (error) {
      toast.error('Failed to fetch purchase orders');
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

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/items`);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items');
    }
  };

  const handleAddItem = () => {
    if (selectedItem.item_id && selectedItem.quantity && selectedItem.unit_price) {
      const newItem = {
        ...selectedItem,
        quantity: parseInt(selectedItem.quantity),
        unit_price: parseFloat(selectedItem.unit_price),
        total: parseInt(selectedItem.quantity) * parseFloat(selectedItem.unit_price)
      };
      setFormData({
        ...formData,
        items: [...formData.items, newItem]
      });
      setSelectedItem({ item_id: '', item_name: '', quantity: '', unit_price: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    try {
      await axios.post(`${API}/purchase-orders`, {
        ...formData,
        created_by: user?.id || 'system'
      });
      toast.success('Purchase Order created successfully');
      setIsDialogOpen(false);
      resetForm();
      fetchPOs();
    } catch (error) {
      toast.error('Failed to create purchase order');
    }
  };

  const handleApprovePO = async (poId) => {
    try {
      await axios.put(`${API}/purchase-orders/${poId}/approve?approver_id=${user?.id}`);
      toast.success('PO approved successfully');
      fetchPOs();
    } catch (error) {
      toast.error('Failed to approve PO');
    }
  };

  const handleDownloadPDF = async (poId, poNumber) => {
    try {
      const response = await axios.get(`${API}/purchase-orders/${poId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PO_${poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      supplier_name: '',
      items: [],
      delivery_date: '',
      notes: '',
      created_by: ''
    });
  };

  return (
    <div className="space-y-6" data-testid="po-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Purchase Orders
          </h2>
          <p className="text-sm text-slate-500 mt-1">{pos.length} Total Orders</p>
        </div>
        <Button
          data-testid="create-po-button"
          onClick={() => setIsDialogOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create PO
        </Button>
      </div>

      <Card className="border border-slate-200 rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="po-table">
              <thead>
                <tr className="border-b-2 border-emerald-700 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">PO Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Approval</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => (
                  <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="po-row">
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">{po.po_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{po.supplier_name}</td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">${po.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${
                        po.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        po.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        po.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      Level {po.approval_level}/{po.total_amount > 10000 ? '2' : '1'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {po.status !== 'approved' && user?.role === 'approver' && (
                          <Button
                            data-testid="approve-po-button"
                            onClick={() => handleApprovePO(po.id)}
                            size="sm"
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          data-testid="download-pdf-button"
                          onClick={() => handleDownloadPDF(po.id, po.po_number)}
                          size="sm"
                          variant="outline"
                          className="rounded-sm"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No purchase orders found. Create your first PO to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="po-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Create Purchase Order
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="po-form">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Supplier *</label>
              <select
                data-testid="po-supplier-select"
                value={formData.supplier_id}
                onChange={(e) => {
                  const supplier = suppliers.find(s => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    supplier_id: e.target.value,
                    supplier_name: supplier?.name || ''
                  });
                }}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Delivery Date</label>
              <Input
                data-testid="po-delivery-date-input"
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="rounded-sm"
              />
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Add Items</h3>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <select
                  data-testid="po-item-select"
                  value={selectedItem.item_id}
                  onChange={(e) => {
                    const item = items.find(i => i.id === e.target.value);
                    setSelectedItem({
                      ...selectedItem,
                      item_id: e.target.value,
                      item_name: item?.name || '',
                      unit_price: item?.unit_price.toString() || ''
                    });
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <Input
                  data-testid="po-item-quantity-input"
                  type="number"
                  placeholder="Qty"
                  value={selectedItem.quantity}
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantity: e.target.value })}
                  className="rounded-sm"
                />
                <Input
                  data-testid="po-item-price-input"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={selectedItem.unit_price}
                  onChange={(e) => setSelectedItem({ ...selectedItem, unit_price: e.target.value })}
                  className="rounded-sm"
                />
                <Button
                  data-testid="add-item-to-po-button"
                  type="button"
                  onClick={handleAddItem}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
                >
                  Add
                </Button>
              </div>
              
              {formData.items.length > 0 && (
                <div className="mt-4 border border-slate-200 rounded-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">Price</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="px-3 py-2">{item.item_name}</td>
                          <td className="px-3 py-2">{item.quantity}</td>
                          <td className="px-3 py-2 font-mono">${item.unit_price.toFixed(2)}</td>
                          <td className="px-3 py-2 font-mono font-bold">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50">
                        <td colSpan={3} className="px-3 py-2 text-right font-bold">Total:</td>
                        <td className="px-3 py-2 font-mono font-bold">
                          ${formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Notes</label>
              <textarea
                data-testid="po-notes-input"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                data-testid="submit-po-button"
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
              >
                Create PO
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;
