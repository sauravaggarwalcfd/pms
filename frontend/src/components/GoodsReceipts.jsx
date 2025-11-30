import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GoodsReceipts = () => {
  const [grs, setGRs] = useState([]);

  useEffect(() => {
    fetchGRs();
  }, []);

  const fetchGRs = async () => {
    try {
      const response = await axios.get(`${API}/goods-receipts`);
      setGRs(response.data);
    } catch (error) {
      toast.error('Failed to fetch goods receipts');
    }
  };

  return (
    <div className="space-y-6" data-testid="gr-page">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
          Goods Receipts
        </h2>
        <p className="text-sm text-slate-500 mt-1">{grs.length} Total Receipts</p>
      </div>

      <Card className="border border-slate-200 rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="gr-table">
              <thead>
                <tr className="border-b-2 border-emerald-700 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">GR Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">PO Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Received By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Received Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {grs.map((gr) => (
                  <tr key={gr.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="gr-row">
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">{gr.gr_number}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">{gr.po_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{gr.received_by}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {new Date(gr.received_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-sm">
                        {gr.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {grs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      No goods receipts found.
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

export default GoodsReceipts;
