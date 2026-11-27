import React, { useState } from 'react';
import { Search, MessageCircle, Eye, X } from 'lucide-react';
import { formatCurrency } from '../../utils/adminApi';

export default function AdminCustomers({ customers = [] }) {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          <strong className="text-slate-900">{filtered.length}</strong> customers
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Total Spending</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-400">
                    No customer records found yet.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const cleanPhone = (c.phone || '').replace(/\D/g, '');
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hello ${c.name}, thank you for choosing PRINTIZER!`)}`
                    : null;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-slate-700">{c.phone || '—'}</td>
                      <td className="py-3 px-4 text-slate-600">{c.email || '—'}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{c.totalOrders}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700">{formatCurrency(c.totalSpending)}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="View Order History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="WhatsApp Customer"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500">{selectedCustomer.phone} • {selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
              {(selectedCustomer.orders || []).length === 0 ? (
                <p className="py-6 text-center text-slate-400">Enquiry-only contact (no completed orders yet).</p>
              ) : (
                selectedCustomer.orders.map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{o.orderId} • {o.productName}</p>
                      <p className="text-[11px] text-slate-500">Qty: {o.quantity} • {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900">{formatCurrency(o.totalAmount)}</p>
                      <span className="text-[10px] font-bold text-slate-500">{o.orderStatus}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
