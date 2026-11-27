import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettings({ settings = {}, onSaveSettings }) {
  const [form, setForm] = useState({
    brandName: settings.brandName || 'PRINTIZER',
    tagline: settings.tagline || 'Everything Your Business Needs to Print.',
    logoUrl: settings.logoUrl || '/images/printizer-logo.png',
    phone: settings.phone || '+91 75749 27200',
    whatsappNumber: settings.whatsappNumber || '917574927200',
    email: settings.email || 'Printizerdesign@gmail.com',
    address: settings.address || 'PRINTIZER Solutions, Corporate Printing Hub, India',
    heroHeadline: settings.heroHeadline || 'Make Every Print Stand Out.',
    heroSubtitle: settings.heroSubtitle || 'Premium business printing, marketing materials and custom packaging — made to represent your brand.',
    footerAbout: settings.footerAbout || 'Commercial & corporate offset/digital printing across India.',
    shippingInfo: settings.shippingInfo || 'PAN India moisture-proof secure delivery within 3–5 business days.',
    gstNumber: settings.gstNumber || '24AAACP1234F1Z8',
    defaultGstPercent: settings.defaultGstPercent ?? 18
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setForm((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...form,
      defaultGstPercent: Number(form.defaultGstPercent) || 18,
      whatsappLink: `https://wa.me/${(form.whatsappNumber || '917574927200').replace(/\D/g, '')}`
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Website &amp; Business Settings</h3>
          <p className="text-[11px] text-slate-500">Manage branding, contact channels, homepage copy, shipping, and GST settings.</p>
        </div>
        <button type="submit" className="bg-brand-crimson hover:bg-brand-red text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Business Name</label>
          <input type="text" value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Tagline</label>
          <input type="text" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Website Logo URL</label>
          <input type="text" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
          <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">WhatsApp Number (digits with country code)</label>
          <input type="text" value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div className="sm:col-span-2">
          <label className="block font-bold text-slate-700 mb-1">Business Address</label>
          <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Homepage Hero Headline</label>
          <input type="text" value={form.heroHeadline} onChange={e => setForm({ ...form, heroHeadline: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Homepage Hero Subtitle</label>
          <input type="text" value={form.heroSubtitle} onChange={e => setForm({ ...form, heroSubtitle: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Footer About Text</label>
          <input type="text" value={form.footerAbout} onChange={e => setForm({ ...form, footerAbout: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Shipping Information</label>
          <input type="text" value={form.shippingInfo} onChange={e => setForm({ ...form, shippingInfo: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
          <input type="text" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Default GST (%)</label>
          <input type="number" min="0" max="28" value={form.defaultGstPercent} onChange={e => setForm({ ...form, defaultGstPercent: e.target.value })} className="w-full border border-slate-300 rounded-lg p-2" />
        </div>
      </div>
    </form>
  );
}
