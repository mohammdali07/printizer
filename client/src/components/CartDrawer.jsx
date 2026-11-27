import React, { useState, useMemo } from 'react';
import {
  ShoppingCart, X, Trash2, Plus, Minus, ArrowRight,
  MessageCircle, CheckCircle2, Package, Edit, ShieldCheck
} from 'lucide-react';
import ProductImage from './ProductImage';
import { ORDERS_STORAGE_KEY, readLocalJson, writeLocalJson } from '../utils/adminApi';

export default function CartDrawer({
  isOpen,
  onClose,
  orderItems = [],
  onOrderItemsChange,
  onNavigate
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [placedOrderRef, setPlacedOrderRef] = useState('');

  const totals = useMemo(() => {
    let pricedTotal = 0;
    let pricedCount = 0;
    let quoteOnlyCount = 0;
    orderItems.forEach((item) => {
      if (item.hasPrice && Number(item.totalAmount) > 0) {
        pricedTotal += Number(item.totalAmount) || 0;
        pricedCount += 1;
      } else {
        quoteOnlyCount += 1;
      }
    });
    return { pricedTotal, pricedCount, quoteOnlyCount };
  }, [orderItems]);

  if (!isOpen) return null;

  const handleUpdateQty = (lineId, deltaDir) => {
    const next = orderItems.map((item) => {
      if (item.lineId !== lineId) return item;
      const step = Math.max(1, Number(item.packSize) || Number(item.minQuantity) || 100);
      const currentQty = Number(item.quantity) || step;
      const nextQty = Math.max(step, currentQty + deltaDir * step);
      const unitPrice = Number(item.unitPrice) || 0;
      const nextTotal = item.hasPrice && unitPrice > 0
        ? Math.round(unitPrice * nextQty)
        : item.totalAmount;
      return {
        ...item,
        quantity: nextQty,
        totalAmount: nextTotal
      };
    });
    onOrderItemsChange(next);
  };

  const handleRemove = (lineId) => {
    onOrderItemsChange(orderItems.filter((item) => item.lineId !== lineId));
  };

  const handleClearCart = () => {
    onOrderItemsChange([]);
    setShowCheckout(false);
    setPlacedOrderRef('');
  };

  const buildWhatsAppUrl = (refNo = null) => {
    const lines = [
      'Hello PRINTIZER,',
      refNo ? `I have placed Order *${refNo}* with the following items:` : 'I would like to place an order for the following items from my cart:',
      ''
    ];
    orderItems.forEach((item, idx) => {
      lines.push(`${idx + 1}. *${item.productName}*`);
      lines.push(`   Qty: ${Number(item.quantity).toLocaleString('en-IN')} ${item.unitName || 'Units'}`);
      if (Array.isArray(item.specs) && item.specs.length > 0) {
        lines.push(`   Specs: ${item.specs.map((s) => `${s.label}: ${s.value}`).join(', ')}`);
      }
      lines.push(`   Amount: ${item.hasPrice ? `₹ ${Number(item.totalAmount).toLocaleString('en-IN')}` : 'Request a Quote'}`);
    });
    lines.push('');
    lines.push(`*Total Estimate:* ${totals.pricedCount > 0 ? `₹ ${totals.pricedTotal.toLocaleString('en-IN')}` : 'Custom Quote'}`);
    if (customerName) lines.push(`Name: ${customerName}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (address) lines.push(`Delivery: ${address}`);
    return `https://wa.me/917574927200?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setCheckoutError('Please enter your name and WhatsApp / phone number.');
      return;
    }
    setCheckoutError('');
    setSubmitting(true);
    const refNo = `PRZ-ORD-${Date.now().toString().slice(-6)}`;
    try {
      const localOrders = readLocalJson(ORDERS_STORAGE_KEY, []);
      const createdList = [];
      for (const item of orderItems) {
        const materialSpec = item.specs?.find((s) => /material|paper|stock/i.test(s.label))?.value || '';
        const sizeSpec = item.specs?.find((s) => /size|dimension/i.test(s.label))?.value || '';
        const payload = {
          orderId: `${refNo}`,
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          productName: item.productName,
          selectedMaterial: materialSpec,
          selectedSize: sizeSpec,
          quantity: Number(item.quantity) || 100,
          sellingPrice: Number(item.unitPrice) || 0,
          totalAmount: Number(item.totalAmount) || 0,
          paymentStatus: 'Pending',
          orderStatus: 'Pending',
          notes: address ? `Delivery: ${address}` : ''
        };
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              createdList.push(json.data);
              continue;
            }
          }
        } catch {}
        createdList.push({
          ...payload,
          id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          orderDate: new Date().toISOString()
        });
      }
      writeLocalJson(ORDERS_STORAGE_KEY, [...createdList, ...localOrders]);
      setPlacedOrderRef(refNo);
    } catch (err) {
      setCheckoutError(err.message || 'Could not place order. Please try WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-50 h-[100dvh] shadow-2xl flex flex-col z-10 text-left">
        {/* Header */}
        <div className="bg-brand-navy text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">
                My Cart ({orderItems.length})
              </h2>
              <p className="text-[11px] text-slate-300">PRINTIZER Order Bag</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {orderItems.length > 0 && !placedOrderRef && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-[11px] font-semibold text-rose-300 hover:text-white px-2 py-1 rounded transition cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              aria-label="Close Cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {placedOrderRef ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center space-y-4 shadow-xs my-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  Order Ref: {placedOrderRef}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-600">
                  Thank you, {customerName}. Our print specialist will reach out with your soft proof shortly.
                </p>
              </div>
              <a
                href={buildWhatsAppUrl(placedOrderRef)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Confirmation on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  onOrderItemsChange([]);
                  setPlacedOrderRef('');
                  setShowCheckout(false);
                  onClose();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Done &amp; Continue Shopping
              </button>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Your cart is empty!</h3>
                <p className="text-xs text-slate-500">
                  Add visiting cards, brochures, stickers, or custom packaging boxes to get instant estimates and checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('configure');
                }}
                className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-red text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Browse &amp; Configure Products</span>
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              {orderItems.map((item) => (
                <div
                  key={item.lineId}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <ProductImage src={item.image} alt={item.productName} placeholderLabel={item.productName} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-crimson block">
                        {item.categoryName || 'Printing'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                        {item.productName}
                      </h4>
                      {Array.isArray(item.specs) && item.specs.length > 0 && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.specs.slice(0, 3).map((s) => `${s.value}`).join(' • ')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.lineId)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                      title="Remove from cart"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stepper + Price Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.lineId, -1)}
                        className="w-7 h-7 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 px-2 min-w-[70px] text-center">
                        {Number(item.quantity).toLocaleString('en-IN')} {item.unitName || 'pcs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.lineId, 1)}
                        className="w-7 h-7 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      {item.hasPrice ? (
                        <span className="text-sm font-black text-slate-900">
                          ₹ {Number(item.totalAmount).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Custom Quote
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Flipkart-Style Price Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                  Price Details
                </h3>
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Price ({orderItems.length} {orderItems.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-bold">
                    {totals.pricedCount > 0 ? `₹ ${totals.pricedTotal.toLocaleString('en-IN')}` : 'Quote Pending'}
                  </span>
                </div>
                {totals.quoteOnlyCount > 0 && (
                  <div className="flex justify-between text-xs text-amber-700">
                    <span>Custom Quote Items</span>
                    <span className="font-semibold">{totals.quoteOnlyCount} item(s)</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-700">
                  <span>Soft Proof Verification</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-100 pt-2.5">
                  <span>Estimated Total</span>
                  <span>
                    {totals.pricedCount > 0 ? `₹ ${totals.pricedTotal.toLocaleString('en-IN')}` : 'Request a Quote'}
                  </span>
                </div>
              </div>

              {/* Inline Checkout Form */}
              {showCheckout && (
                <form onSubmit={handleCheckoutSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Delivery &amp; Contact Details
                  </h3>
                  {checkoutError && (
                    <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg">
                      {checkoutError}
                    </p>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp / Mobile Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                  <textarea
                    rows="2"
                    placeholder="Delivery Address / City / Notes (Optional)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#fb641b] hover:bg-[#e8580e] text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Sticky Footer Actions */}
        {orderItems.length > 0 && !placedOrderRef && (
          <div className="bg-white border-t border-slate-200 p-4 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe &amp; Secure B2B Order</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('configure');
                }}
                className="font-bold text-brand-crimson hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3 h-3" />
                <span>Customize in Order Builder</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </a>

              {!showCheckout ? (
                <button
                  type="button"
                  onClick={() => setShowCheckout(true)}
                  className="bg-[#fb641b] hover:bg-[#e8580e] text-white font-extrabold py-3 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition cursor-pointer"
                >
                  <span>Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-3 rounded-xl text-xs cursor-pointer"
                >
                  Back to Cart
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
