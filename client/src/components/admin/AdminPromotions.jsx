import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Calendar, Star, Save } from 'lucide-react';

export default function AdminPromotions({
  promotions = {},
  products = [],
  onSavePromotions
}) {
  const [announcement, setAnnouncement] = useState(
    promotions.announcementBar || { enabled: false, text: '', linkText: '', targetPage: 'home' }
  );
  const [campaigns, setCampaigns] = useState(promotions.campaigns || []);
  const [featuredIds, setFeaturedIds] = useState(promotions.featuredProductIds || []);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    subtitle: '',
    badge: 'LIMITED OFFER',
    startDate: '',
    endDate: '',
    enabled: true
  });

  useEffect(() => {
    setAnnouncement(promotions.announcementBar || { enabled: false, text: '', linkText: '', targetPage: 'home' });
    setCampaigns(promotions.campaigns || []);
    setFeaturedIds(promotions.featuredProductIds || []);
  }, [promotions]);

  const handleSaveAll = () => {
    onSavePromotions({
      announcementBar: announcement,
      campaigns,
      featuredProductIds: featuredIds
    });
  };

  const handleAddCampaign = (e) => {
    e.preventDefault();
    if (!newCampaign.title.trim()) return;
    const next = [
      ...campaigns,
      { id: `cmp-${Date.now()}`, ...newCampaign }
    ];
    setCampaigns(next);
    setNewCampaign({ title: '', subtitle: '', badge: 'LIMITED OFFER', startDate: '', endDate: '', enabled: true });
    onSavePromotions({ announcementBar: announcement, campaigns: next, featuredProductIds: featuredIds });
  };

  const toggleFeatured = (slug) => {
    const next = featuredIds.includes(slug)
      ? featuredIds.filter(s => s !== slug)
      : [...featuredIds, slug];
    setFeaturedIds(next);
  };

  return (
    <div className="space-y-6">
      {/* Announcement Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand-crimson" />
            <h3 className="text-sm font-bold text-slate-900">Top Announcement Bar</h3>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(announcement.enabled)}
              onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
              className="rounded text-brand-crimson"
            />
            <span>Show on Website</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Announcement Text</label>
            <input
              type="text"
              value={announcement.text || ''}
              onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
              placeholder="e.g. Bulk Corporate Printing Discounts Available — Instant Quotes via WhatsApp"
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">CTA Link Label</label>
            <input
              type="text"
              value={announcement.linkText || ''}
              onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })}
              placeholder="e.g. Get Quote"
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveAll}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Promotions</span>
          </button>
        </div>
      </div>

      {/* Promotional Banners & Discount Campaigns */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Homepage Banners &amp; Discount Campaigns</h3>

        <form onSubmit={handleAddCampaign} className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <input
            type="text"
            required
            placeholder="Campaign Title *"
            value={newCampaign.title}
            onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
            className="sm:col-span-2 bg-white border border-slate-300 rounded-lg p-2"
          />
          <input
            type="text"
            placeholder="Offer / Subtitle"
            value={newCampaign.subtitle}
            onChange={(e) => setNewCampaign({ ...newCampaign, subtitle: e.target.value })}
            className="sm:col-span-2 bg-white border border-slate-300 rounded-lg p-2"
          />
          <input
            type="date"
            value={newCampaign.startDate}
            onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
            className="bg-white border border-slate-300 rounded-lg p-2"
            title="Start Date"
          />
          <input
            type="date"
            value={newCampaign.endDate}
            onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
            className="bg-white border border-slate-300 rounded-lg p-2"
            title="End Date"
          />
          <div className="sm:col-span-6 flex justify-end">
            <button type="submit" className="bg-brand-crimson text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Campaign</span>
            </button>
          </div>
        </form>

        <div className="divide-y divide-slate-100 text-xs">
          {campaigns.length === 0 ? (
            <p className="py-6 text-center text-slate-400">No active promotional campaigns configured.</p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.enabled !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.enabled !== false ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{c.subtitle}</p>
                  {(c.startDate || c.endDate) && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{c.startDate || 'Now'} → {c.endDate || 'Ongoing'}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = campaigns.map(item => item.id === c.id ? { ...item, enabled: item.enabled === false } : item);
                      setCampaigns(next);
                      onSavePromotions({ announcementBar: announcement, campaigns: next, featuredProductIds: featuredIds });
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {c.enabled !== false ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = campaigns.filter(item => item.id !== c.id);
                      setCampaigns(next);
                      onSavePromotions({ announcementBar: announcement, campaigns: next, featuredProductIds: featuredIds });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Featured Products ({featuredIds.length} selected)</h3>
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            className="bg-slate-900 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg"
          >
            Save Featured
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
          {products.slice(0, 40).map((p) => {
            const active = featuredIds.includes(p.slug);
            return (
              <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border text-[11px] font-semibold cursor-pointer ${active ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleFeatured(p.slug)}
                  className="rounded text-brand-crimson"
                />
                <span className="truncate">{p.name}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
