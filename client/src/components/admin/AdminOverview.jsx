import React from 'react';
import {
  ShoppingBag, Clock, CheckCircle2, Package, Users,
  IndianRupee, TrendingUp, ArrowUpRight, MessageSquare
} from 'lucide-react';
import { formatCurrency } from '../../utils/adminApi';

export default function AdminOverview({
  stats = {},
  orders = [],
  enquiries = [],
  analytics = {},
  onSwitchTab
}) {
  const safeStats = stats || {};
  const safeAnalytics = analytics || {};
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];

  const kpis = [
    { label: 'Total Orders', value: safeStats.totalOrders ?? safeOrders.length, icon: ShoppingBag, tone: 'text-slate-900 bg-slate-100' },
    { label: 'Pending Orders', value: safeStats.pendingOrders ?? 0, icon: Clock, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Confirmed Orders', value: safeStats.confirmedOrders ?? 0, icon: CheckCircle2, tone: 'text-blue-700 bg-blue-50' },
    { label: 'Completed Orders', value: safeStats.completedOrders ?? 0, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Total Products', value: safeStats.totalProducts ?? 0, icon: Package, tone: 'text-indigo-700 bg-indigo-50' },
    { label: 'Total Customers', value: safeStats.totalCustomers ?? 0, icon: Users, tone: 'text-purple-700 bg-purple-50' },
    { label: 'Total Revenue', value: formatCurrency(safeStats.totalRevenue ?? 0), icon: IndianRupee, tone: 'text-slate-900 bg-slate-100' },
    { label: 'Estimated Profit', value: formatCurrency(safeStats.estimatedProfit ?? 0), icon: TrendingUp, tone: 'text-emerald-700 bg-emerald-50' }
  ];

  const monthlySales = safeAnalytics.monthlySales || safeAnalytics.monthlySeries || [];
  const maxRev = Math.max(1, ...monthlySales.map(m => Number(m.revenue) || 0));
  const bestProducts = (safeAnalytics.productPerformance || []).slice(0, 5);
  const recentOrders = safeOrders.slice(0, 5);
  const recentEnquiries = safeEnquiries.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">{k.label}</span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block truncate">{k.value}</span>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${k.tone}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Overview Chart + Monthly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales &amp; Profit Overview</h3>
              <p className="text-xs text-slate-500">Calculated from actual recorded orders and supplier costs</p>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('analytics')}
              className="text-xs font-semibold text-slate-700 hover:text-brand-crimson flex items-center gap-1"
            >
              <span>Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {monthlySales.length === 0 ? (
            <div className="h-48 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center text-center p-4">
              <TrendingUp className="w-6 h-6 text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">No recorded orders yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Charts populate automatically as customer or manual orders are recorded.</p>
            </div>
          ) : (
            <div className="h-52 flex items-end gap-3 pt-4 pb-2 px-2 border-b border-slate-100 overflow-x-auto">
              {monthlySales.map((m) => {
                const revH = Math.max(8, Math.round(((Number(m.revenue) || 0) / maxRev) * 140));
                const profH = Math.max(4, Math.round(((Math.max(0, Number(m.profit) || 0)) / maxRev) * 140));
                return (
                  <div key={m.month} className="flex flex-col items-center gap-1.5 min-w-[56px] flex-1">
                    <div className="flex items-end gap-1 h-36">
                      <div
                        className="w-4 bg-slate-900 rounded-t"
                        style={{ height: `${revH}px` }}
                        title={`Revenue: ${formatCurrency(m.revenue)}`}
                      />
                      <div
                        className="w-4 bg-emerald-500 rounded-t"
                        style={{ height: `${profH}px` }}
                        title={`Profit: ${formatCurrency(m.profit)}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-slate-900" /> Revenue</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Gross Profit</span>
          </div>
        </div>

        {/* Best-Selling Products */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Best-Selling Products</h3>
            <button type="button" onClick={() => onSwitchTab('products')} className="text-xs font-semibold text-slate-600 hover:text-brand-crimson">
              Manage
            </button>
          </div>
          {bestProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No product sales recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {bestProducts.map((bp) => (
                <div key={bp.productName} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{bp.productName}</p>
                    <p className="text-[11px] text-slate-500">{bp.orders} orders • {bp.quantity.toLocaleString()} qty</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-slate-900">{formatCurrency(bp.revenue)}</p>
                    <p className="text-[10px] font-semibold text-emerald-600">Profit: {formatCurrency(bp.profit)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders + Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
            <button type="button" onClick={() => onSwitchTab('orders')} className="text-xs font-semibold text-slate-600 hover:text-brand-crimson">
              View All
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <div key={o.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{o.orderId} • {o.customerName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{o.productName} ({o.quantity})</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-slate-900">{formatCurrency(o.totalAmount)}</p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Enquiries</h3>
            <button type="button" onClick={() => onSwitchTab('enquiries')} className="text-xs font-semibold text-slate-600 hover:text-brand-crimson">
              View All
            </button>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No enquiries yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentEnquiries.map((e) => (
                <div key={e.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{e.customerName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{e.productName} • Qty: {e.quantity}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-brand-crimson shrink-0">
                    <MessageSquare className="w-3 h-3" />
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
