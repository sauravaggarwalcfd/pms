import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PurchaseRequisitions = ({ user }) => {
  const [prs, setPRs] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchPRs();
    fetchItems();
  }, []);

  const fetchPRs = async () => {
    try {
      const response = await axios.get(`${API}/purchase-requisitions`);
      setPRs(response.data);
    } catch (error) {
      toast.error('Failed to fetch purchase requisitions');
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

  const handleApprovePR = async (prId) => {
    try {
      await axios.put(`${API}/purchase-requisitions/${prId}/approve`);
      toast.success('PR approved successfully');
      fetchPRs();
    } catch (error) {
      toast.error('Failed to approve PR');
    }
  };

  return (
    <div className="space-y-6" data-testid="pr-page">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Purchase Requisitions
          </h2>
          <p className="text-sm text-slate-500 mt-1">{prs.length} Total Requisitions</p>
        </div>
      </div>

      <Card className="border border-slate-200 rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="pr-table">
              <thead>
                <tr className="border-b-2 border-emerald-700 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">PR Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Requester</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => (
                  <tr key={pr.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="pr-row">
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">{pr.pr_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{pr.requester_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{pr.department}</td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900">${pr.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${
                        pr.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        pr.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pr.status === 'submitted' && user?.role === 'approver' && (
                        <Button
                          data-testid="approve-pr-button"
                          onClick={() => handleApprovePR(pr.id)}
                          size="sm"
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs tracking-wider rounded-sm"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {prs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No purchase requisitions found.
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

export default PurchaseRequisitions;
