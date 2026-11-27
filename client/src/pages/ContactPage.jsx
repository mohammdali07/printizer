import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle2, Send, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContactPage({ onRequestQuote }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate contact form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
    }, 600);
  };

  const getWaUrl = () => {
    const text = `Hello PRINTIZER,
I would like to contact your team regarding printing solutions.
Name: ${formData.name || 'Customer'}
Message: ${formData.message || 'Please connect with me.'}
Thank you.`;
    return `https://wa.me/917574927200?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="pb-20 space-y-14">
      {/* Page Header */}
      <div className="bg-brand-navy text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-brand-crimson uppercase tracking-widest">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Contact PRINTIZER
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Everything Your Business Needs to Print. Connect with our dedicated printing specialists via WhatsApp, phone, or email.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Contact Details & WhatsApp Prompt (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Official Business Channels
              </h3>

              <div className="space-y-4 text-sm text-slate-600">
                {/* WhatsApp & Phone */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      WhatsApp / Helpline
                    </h4>
                    <a
                      href="https://wa.me/917574927200"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-slate-900 hover:text-emerald-600 transition block mt-0.5"
                    >
                      +91 75749 27200
                    </a>
                    <span className="text-xs text-emerald-600 font-semibold">● Active for Instant Quotations</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-brand-crimson shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Official Business Email
                    </h4>
                    <a
                      href="mailto:Printizerdesign@gmail.com"
                      className="text-sm font-bold text-slate-900 hover:text-brand-crimson transition block mt-0.5"
                    >
                      Printizerdesign@gmail.com
                    </a>
                    <span className="text-xs text-slate-400">Artwork & formal quotation correspondence</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Consultation Hours
                    </h4>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      Monday &ndash; Saturday: 9:30 AM &ndash; 7:30 PM IST
                    </p>
                    <span className="text-xs text-slate-400">Sunday: Closed (WhatsApp messages queued)</span>
                  </div>
                </div>

                {/* Logistics */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Fulfillment & Registered State
                    </h4>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      Gujarat (State Code: 24) &bull; PAN India Dispatch
                    </p>
                    <span className="text-xs text-slate-400">Courier (₹60/pack), Transport (₹300/parcel) &amp; Office Pickup</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action Button */}
              <div className="pt-2">
                <a
                  href="https://wa.me/917574927200?text=Hello%20PRINTIZER%2C%20I%20would%20like%20to%20connect%20with%20your%20printing%20team."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Chat Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Send Us a Direct Message
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Fill in your enquiry details below and our team will get in touch promptly.
              </p>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Message Delivered</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you, {formData.name}. We have received your message and will respond to {formData.email} within 2 business hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    className="text-xs text-brand-crimson font-bold underline"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Patel"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contact / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 75749 27200"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Requirement Type / Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bulk Boxes, Corporate Cards"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message / Print Specifications
                    </label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Describe your printing requirements, quantities, or specific queries..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:bg-white focus:border-brand-blue focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-crimson hover:bg-brand-red text-white font-extrabold py-3.5 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-brand-crimson/25 transition flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <span>Sending Message...</span>
                      ) : (
                        <>
                          <span>SEND MESSAGE</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
