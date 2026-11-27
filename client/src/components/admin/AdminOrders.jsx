import React, { useState } from 'react';
import {
  Search, Plus, Download, Eye, MessageCircle, Printer, Trash2, X
} from 'lucide-react';
import { exportRowsToCsv, exportRowsToExcel, formatCurrency } from '../../utils/adminApi';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Ready', 'Dispatched', 'Completed', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid', 'Refunded'];

const STATUS_BADGE = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Ready: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
};

export default function AdminOrders({
  orders = [],
  products = [],
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    productName: products[0]?.name || '',
    productSlug: products[0]?.slug || '',
    selectedMaterial: '',
    selectedSize: '',
    quantity: 1000,
    sellingPrice: '',
    supplierCost: '',
    paymentStatus: 'Unpaid',
    orderStatus: 'Pending',
    notes: ''
  });

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (startDate && new Date(o.createdAt).getTime() < new Date(startDate).getTime()) return false;
    if (endDate && new Date(o.createdAt).getTime() > new Date(endDate).getTime() + 86400000) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (o.orderId || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.phone || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q) ||
      (o.productName || '').toLowerCase().includes(q)
    );
  });

  const toExportRows = () =>
    filtered.map((o) => ({
      'Order ID': o.orderId,
      'Customer Name': o.customerName,
      'Phone': o.phone,
      'Email': o.email,
      'Product': o.productName,
      'Material': o.selectedMaterial,
      'Size': o.selectedSize,
      'Quantity': o.quantity,
      'Selling Price (₹)': o.sellingPrice,
      'Supplier Cost (₹)': o.supplierCost || 0,
      'Total Amount (₹)': o.totalAmount,
      'Payment Status': o.paymentStatus,
      'Order Status': o.orderStatus,
      'Order Date': o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : ''
    }));

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const total = Number(form.sellingPrice) || 0;
    await onCreateOrder({
      ...form,
      sellingPrice: total,
      totalAmount: total,
      supplierCost: form.supplierCost !== '' ? Number(form.supplierCost) : 0,
      quantity: Number(form.quantity) || 1
    });
    setShowAddModal(false);
    setForm({
      customerName: '',
      phone: '',
      email: '',
      productName: products[0]?.name || '',
      productSlug: products[0]?.slug || '',
      selectedMaterial: '',
      selectedSize: '',
      quantity: 1000,
      sellingPrice: '',
      supplierCost: '',
      paymentStatus: 'Unpaid',
      orderStatus: 'Pending',
      notes: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search Order ID, customer, phone, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2 text-xs text-slate-700"
            title="From Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2 text-xs text-slate-700"
            title="To Date"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportRowsToCsv(toExportRows(), 'PRINTIZER_Orders.csv')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => exportRowsToExcel(toExportRows(), 'Orders', 'PRINTIZER_Orders.xlsx')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-3.5">Order ID</th>
                <th className="py-3 px-3.5">Customer</th>
                <th className="py-3 px-3.5">Product &amp; Specs</th>
                <th className="py-3 px-3.5">Qty</th>
                <th className="py-3 px-3.5">Total</th>
                <th className="py-3 px-3.5">Payment</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-slate-400">
                    No orders match your filters. Click &ldquo;Add Order&rdquo; or wait for customer orders.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const cleanPhone = (o.phone || '').replace(/\D/g, '');
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Hello ${o.customerName}, update on your PRINTIZER order ${o.orderId} (${o.productName}): Status is ${o.orderStatus}.`)}`
                    : null;
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">{o.orderId}</td>
                      <td className="py-3 px-3.5">
                        <p className="font-bold text-slate-900">{o.customerName}</p>
                        <p className="text-[11px] text-slate-500">{o.phone}{o.email ? ` • ${o.email}` : ''}</p>
                      </td>
                      <td className="py-3 px-3.5">
                        <p className="font-semibold text-slate-800">{o.productName}</p>
                        <p className="text-[11px] text-slate-500">{[o.selectedMaterial, o.selectedSize].filter(Boolean).join(' • ') || 'Standard'}</p>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-700">{Number(o.quantity || 0).toLocaleString()}</td>
                      <td className="py-3 px-3.5 font-extrabold text-slate-900 whitespace-nowrap">{formatCurrency(o.totalAmount)}</td>
                      <td className="py-3 px-3.5">
                        <select
                          value={o.paymentStatus || 'Unpaid'}
                          onChange={(e) => onUpdateOrder(o.id, { paymentStatus: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-700"
                        >
                          {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-3.5">
                        <select
                          value={o.orderStatus || 'Pending'}
                          onChange={(e) => onUpdateOrder(o.id, { orderStatus: e.target.value })}
                          className={`border rounded-md px-2 py-1 text-[11px] font-bold ${STATUS_BADGE[o.orderStatus] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : ''}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="View & Print Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Contact on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteOrder(o)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* View / Print Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-crimson uppercase tracking-wider">Order Details</span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedOrder.orderId}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400 block">Customer</span><b>{selectedOrder.customerName}</b></div>
              <div><span className="text-slate-400 block">Phone / Email</span><b>{selectedOrder.phone || '—'}</b></div>
              <div><span className="text-slate-400 block">Product</span><b>{selectedOrder.productName}</b></div>
              <div><span className="text-slate-400 block">Quantity</span><b>{selectedOrder.quantity}</b></div>
              <div><span className="text-slate-400 block">Material</span><b>{selectedOrder.selectedMaterial || 'Standard'}</b></div>
              <div><span className="text-slate-400 block">Size</span><b>{selectedOrder.selectedSize || 'Standard'}</b></div>
              <div><span className="text-slate-400 block">Selling Total</span><b className="text-slate-900">{formatCurrency(selectedOrder.totalAmount)}</b></div>
              <div><span className="text-slate-400 block">Supplier Cost</span><b className="text-slate-700">{formatCurrency(selectedOrder.supplierCost || 0)}</b></div>
              <div><span className="text-slate-400 block">Payment Status</span><b>{selectedOrder.paymentStatus}</b></div>
              <div><span className="text-slate-400 block">Order Status</span><b>{selectedOrder.orderStatus}</b></div>
            </div>
            {selectedOrder.notes && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                <b>Notes:</b> {selectedOrder.notes}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Order</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Record New Order</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input required type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                  <input required type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product *</label>
                  <select
                    value={form.productSlug}
                    onChange={(e) => {
                      const matched = products.find(p => p.slug === e.target.value);
                      setForm({ ...form, productSlug: e.target.value, productName: matched?.name || e.target.value });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Material</label>
                  <input type="text" value={form.selectedMaterial} onChange={e => setForm({ ...form, selectedMaterial: e.target.value })} placeholder="e.g. 350 GSM Matt" className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Size</label>
                  <input type="text" value={form.selectedSize} onChange={e => setForm({ ...form, selectedSize: e.target.value })} placeholder="e.g. Standard 89x51mm" className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input required type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Total (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actual Supplier Cost (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.supplierCost} onChange={e => setForm({ ...form, supplierCost: e.target.value })} placeholder="Used for gross profit" className="w-full border border-slate-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Order Status</label>
                  <select value={form.orderStatus} onChange={e => setForm({ ...form, orderStatus: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2">
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-brand-crimson text-white font-bold">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
