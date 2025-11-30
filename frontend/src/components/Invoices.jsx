import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    }
  };

  return (
    <div className="space-y-6" data-testid="invoices-page">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
          Invoices
        </h2>
        <p className="text-sm text-slate-500 mt-1">{invoices.length} Total Invoices</p>
      </div>

      <Card className="border border-slate-200 rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="invoices-table">
              <thead>
                <tr className="border-b-2 border-emerald-700 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Tax</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="invoice-row">
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{invoice.supplier_name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">${invoice.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">${invoice.tax_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">
                      ${(invoice.total_amount + invoice.tax_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${
                        invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
