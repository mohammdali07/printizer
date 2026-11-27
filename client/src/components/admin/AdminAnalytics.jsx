import React, { useState } from 'react';
import { Download, IndianRupee, TrendingUp, ShoppingBag, Calculator } from 'lucide-react';
import { exportRowsToCsv, exportRowsToExcel, formatCurrency } from '../../utils/adminApi';

export default function AdminAnalytics({ orders = [] }) {
  const [period, setPeriod] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const now = new Date();
  const validOrders = orders.filter((o) => {
    if (o.orderStatus === 'Cancelled') return false;
    const t = new Date(o.createdAt).getTime();
    if (startDate && t < new Date(startDate).getTime()) return false;
    if (endDate && t > new Date(endDate).getTime() + 86400000) return false;
    if (!startDate && !endDate) {
      if (period === 'daily') return (now.getTime() - t) <= 86400000;
      if (period === 'weekly') return (now.getTime() - t) <= 7 * 86400000;
      if (period === 'monthly') return (now.getTime() - t) <= 30 * 86400000;
      if (period === 'yearly') return (now.getTime() - t) <= 365 * 86400000;
    }
    return true;
  });

  const totalOrders = validOrders.length;
  const totalRevenue = validOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const totalSupplierCost = validOrders.reduce((s, o) => s + (Number(o.supplierCost) || 0), 0);
  const grossProfit = totalRevenue - totalSupplierCost;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const productMap = new Map();
  const customerMap = new Map();
  for (const o of validOrders) {
    const rev = Number(o.totalAmount) || 0;
    const cost = Number(o.supplierCost) || 0;

    const pk = o.productName || 'Custom Print';
    const pr = productMap.get(pk) || { product: pk, orders: 0, qty: 0, revenue: 0, supplierCost: 0, profit: 0 };
    pr.orders += 1;
    pr.qty += Number(o.quantity) || 0;
    pr.revenue += rev;
    pr.supplierCost += cost;
    pr.profit += (rev - cost);
    productMap.set(pk, pr);

    const ck = o.customerName || o.phone || 'Customer';
    const cu = customerMap.get(ck) || { customer: ck, phone: o.phone || '', orders: 0, spending: 0 };
    cu.orders += 1;
    cu.spending += rev;
    customerMap.set(ck, cu);
  }

  const productRows = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
  const customerRows = Array.from(customerMap.values()).sort((a, b) => b.spending - a.spending);

  const exportSummaryRows = () =>
    productRows.map((p) => ({
      Product: p.product,
      Orders: p.orders,
      Quantity: p.qty,
      'Revenue (₹)': p.revenue,
      'Supplier Cost (₹)': p.supplierCost,
      'Gross Profit (₹)': p.profit
    }));

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setPeriod(p); setStartDate(''); setEndDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                period === p && !startDate && !endDate
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1 text-xs" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1 text-xs" />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportRowsToCsv(exportSummaryRows(), 'PRINTIZER_Sales_Report.csv')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => exportRowsToExcel(exportSummaryRows(), 'Sales Report', 'PRINTIZER_Sales_Report.xlsx')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Real KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" /> Total Orders</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Revenue</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> Supplier Costs</span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{formatCurrency(totalSupplierCost)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Gross Profit</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(grossProfit)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500">Avg Order Value</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(avgOrderValue)}</p>
        </div>
      </div>

      {/* Product & Customer Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Product Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                  <th className="py-2">Product</th>
                  <th className="py-2">Orders</th>
                  <th className="py-2">Revenue</th>
                  <th className="py-2">Cost</th>
                  <th className="py-2">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productRows.length === 0 ? (
                  <tr><td colSpan="5" className="py-6 text-center text-slate-400">No sales in selected period.</td></tr>
                ) : productRows.map((r) => (
                  <tr key={r.product}>
                    <td className="py-2 font-bold text-slate-800">{r.product}</td>
                    <td className="py-2">{r.orders}</td>
                    <td className="py-2 font-semibold">{formatCurrency(r.revenue)}</td>
                    <td className="py-2 text-rose-600">{formatCurrency(r.supplierCost)}</td>
                    <td className="py-2 font-bold text-emerald-600">{formatCurrency(r.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Customer Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                  <th className="py-2">Customer</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Orders</th>
                  <th className="py-2">Total Spending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerRows.length === 0 ? (
                  <tr><td colSpan="4" className="py-6 text-center text-slate-400">No customer orders in selected period.</td></tr>
                ) : customerRows.map((c) => (
                  <tr key={c.customer}>
                    <td className="py-2 font-bold text-slate-800">{c.customer}</td>
                    <td className="py-2 text-slate-500">{c.phone || '—'}</td>
                    <td className="py-2">{c.orders}</td>
                    <td className="py-2 font-bold text-slate-900">{formatCurrency(c.spending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
