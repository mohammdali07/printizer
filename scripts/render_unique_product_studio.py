import os
import json
import math
from pathlib import Path
from PIL import Image, ImageOps
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_PRODS = os.path.join(BASE_DIR, 'client', 'public', 'images', 'products')
os.makedirs(PUBLIC_PRODS, exist_ok=True)

# Varied realistic photographic studio tabletop backdrops + directional window lighting
BACKDROPS = {
    'travertine': 'background: radial-gradient(circle at 22% 18%, #f8f6f2 0%, #ebe6de 55%, #dcd5ca 100%);',
    'oak': 'background: radial-gradient(circle at 30% 20%, #ebd9c0 0%, #d8be98 55%, #c5a47a 100%);',
    'concrete': 'background: radial-gradient(circle at 75% 20%, #f1f5f9 0%, #e2e8f0 55%, #cbd5e1 100%);',
    'white_studio': 'background: radial-gradient(circle at 50% 30%, #ffffff 0%, #f8fafc 60%, #e9edf3 100%);',
    'dark_slate': 'background: radial-gradient(circle at 30% 25%, #334155 0%, #1e293b 55%, #0f172a 100%);',
    'linen': 'background: radial-gradient(circle at 25% 20%, #f7f4ef 0%, #eae3d7 60%, #dad0c0 100%);',
    'warm_ivory': 'background: radial-gradient(circle at 65% 25%, #fffdf9 0%, #f5efe6 60%, #e7ddd0 100%);',
}

COMMON_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 1200px;
  height: 900px;
  overflow: hidden;
  font-family: 'Segoe UI', 'Inter', Arial, sans-serif;
  position: relative;
}
.studio-scene {
  width: 1200px;
  height: 900px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1600px;
}
/* Natural diagonal studio window shadow & softbox highlight */
.window-light {
  position: absolute;
  inset: 0;
  background: linear-gradient(125deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.0) 48%, rgba(15,23,42,0.12) 100%);
  pointer-events: none;
  z-index: 2;
}
.film-grain {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 50;
}
/* Realistic desk accent pen */
.studio-pen {
  position: absolute;
  width: 22px;
  height: 330px;
  border-radius: 12px;
  background: linear-gradient(90deg, #1e293b 0%, #475569 35%, #0f172a 85%);
  box-shadow: 12px 18px 24px rgba(15,23,42,0.28);
  z-index: 12;
}
.studio-pen::before {
  content: '';
  position: absolute;
  bottom: -24px;
  left: 4px;
  width: 14px;
  height: 26px;
  background: linear-gradient(90deg, #cbd5e1, #94a3b8);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.studio-pen::after {
  content: '';
  position: absolute;
  top: 26px;
  right: -4px;
  width: 5px;
  height: 85px;
  background: linear-gradient(180deg, #facc15, #b45309);
  border-radius: 4px;
}
"""

def wrap_html(backdrop_key, inner_html, extra_css=''):
    bg = BACKDROPS.get(backdrop_key, BACKDROPS['concrete'])
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
{COMMON_CSS}
.studio-scene {{ {bg} }}
{extra_css}
</style>
</head>
<body>
  <div class="studio-scene">
    <div class="window-light"></div>
    {inner_html}
    <div class="film-grain"></div>
  </div>
</body>
</html>"""

def render_book_pad(spec):
    """Commercial print books: Quotation, Invoice, Delivery Challan, PO Book, Payment Voucher, Rest Bill Book"""
    title = spec['title']
    subtitle = spec.get('subtitle', 'COMMERCIAL TAX & BILLING REGISTER')
    spine_color = spec.get('spine', '#0f172a')
    accent = spec.get('accent', '#e11d48')
    dup_color = spec.get('dup', '#fef08a')
    cols = spec.get('cols', ['SR.', 'PARTICULARS / DESCRIPTION', 'QTY', 'RATE', 'AMOUNT (₹)'])
    meta_rows = spec.get('meta', [('Book No.', '018'), ('Date', '25 / 11 / 2026')])
    bg = spec.get('bg', 'concrete')
    serial = spec.get('serial', '0412')
    side_spine = spec.get('side_spine', False)
    show_totals = spec.get('totals', 'Total (₹):')

    rows_html = ''.join(
        f'<tr><td class="c1">{i}</td><td></td><td></td><td></td><td></td></tr>'
        for i in range(1, 9)
    )
    th_html = ''.join(f'<th>{c}</th>' for c in cols)
    meta_html = ''.join(
        f'<div><span class="ml">{k}:</span> <span class="mv">{v}</span></div>'
        for k, v in meta_rows
    )
    spine_css = (
        f'top:0; bottom:0; left:0; width:44px; background: linear-gradient(90deg, {spine_color}, #334155 45%, {spine_color});'
        if side_spine else
        f'top:0; left:0; right:0; height:44px; background: linear-gradient(180deg, {spine_color}, #334155 45%, {spine_color});'
    )
    perf_css = (
        'top:0; bottom:0; left:54px; width:2px; border-left: 2.5px dashed #94a3b8;'
        if side_spine else
        'left:0; right:0; top:56px; height:2px; border-top: 2.5px dashed #94a3b8;'
    )
    pad_inset = 'padding: 28px 34px 28px 74px;' if side_spine else 'padding: 72px 34px 26px 34px;'
    rot = 'rotateX(22deg) rotateZ(-9deg)' if not side_spine else 'rotateX(20deg) rotateZ(-6deg)'

    inner = f"""
    <div style="position:relative; transform: {rot}; transform-style: preserve-3d;">
      <!-- Yellow/Pink Carbonless Duplicate Copy peeking beneath -->
      <div style="position:absolute; top:22px; left:-24px; width:560px; height:640px; background:{dup_color}; border-radius:4px;
        box-shadow: 24px 36px 55px rgba(15,23,42,0.34), 4px 6px 0 #cbd5e1, 8px 11px 0 #94a3b8;
        border: 1px solid rgba(0,0,0,0.08);">
        <div style="position:absolute; bottom:18px; left:24px; font-size:12px; font-weight:700; color:#64748b; letter-spacing:1px;">
          DUPLICATE / OFFICE COPY (NCR)
        </div>
      </div>

      <!-- Main Book Stack (multi-sheet thickness edge) -->
      <div style="position:relative; width:560px; height:640px; background: linear-gradient(160deg, #ffffff 0%, #f8fafc 100%);
        border-radius:4px; {pad_inset}
        box-shadow: 1px 2px 0 #e2e8f0, 3px 4px 0 #cbd5e1, 5px 7px 0 #e2e8f0, 7px 9px 0 #cbd5e1, 10px 13px 0 #94a3b8, 22px 34px 48px rgba(15,23,42,0.30);
        border: 1px solid #cbd5e1;">
        <!-- Cloth Binding Spine + Staples -->
        <div style="position:absolute; {spine_css} box-shadow: 0 3px 6px rgba(0,0,0,0.22);"></div>
        <div style="position:absolute; {perf_css}"></div>

        <!-- Printed Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid {accent}; padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <div style="font-size:10px; font-weight:800; letter-spacing:2px; color:{accent}; text-transform:uppercase;">PRINTIZER COMMERCIAL SERIES</div>
            <div style="font-size:26px; font-weight:900; color:#0f172a; letter-spacing:0.6px; margin-top:2px;">{title}</div>
            <div style="font-size:10px; color:#64748b; font-weight:600;">{subtitle}</div>
          </div>
          <div style="text-align:right;">
            <div style="border: 1.5px solid #dc2626; color:#dc2626; font-family:monospace; font-size:18px; font-weight:800; padding:3px 10px; border-radius:4px; background:#fff5f5;">
              No. {serial}
            </div>
          </div>
        </div>

        <!-- Party / Metadata Lines -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; margin-bottom:14px; color:#334155;">
          {meta_html}
        </div>

        <!-- Grid Table -->
        <table class="form-tbl">
          <thead><tr>{th_html}</tr></thead>
          <tbody>{rows_html}</tbody>
        </table>

        <!-- Footer Signatory & Totals -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:16px; padding-top:10px; border-top:1.5px solid #cbd5e1;">
          <div style="font-size:11px; color:#475569; font-weight:600;">
            <div>E. &amp; O.E. • Original Customer Copy</div>
            <div style="margin-top:24px; border-top:1px solid #94a3b8; width:160px; padding-top:3px;">Authorised Signatory</div>
          </div>
          <div style="border:1.5px solid #0f172a; border-radius:4px; padding:6px 14px; min-width:170px; background:#f8fafc;">
            <div style="font-size:11px; font-weight:800; color:#0f172a;">{show_totals}</div>
            <div style="font-size:16px; font-weight:900; color:{accent}; text-align:right; margin-top:2px;">₹ _________</div>
          </div>
        </div>
      </div>
    </div>
    <div class="studio-pen" style="right:112px; bottom:180px; transform: rotate(17deg);"></div>
    """
    extra_css = f"""
    .ml {{ font-weight:700; color:#475569; }}
    .mv {{ border-bottom: 1px dotted #94a3b8; padding: 0 8px; color:#0f172a; font-weight:600; }}
    .form-tbl {{ width:100%; border-collapse:collapse; font-size:11px; }}
    .form-tbl th {{ background:{spine_color}; color:#fff; padding:6px 6px; text-align:left; font-size:10px; letter-spacing:0.5px; border:1px solid {spine_color}; }}
    .form-tbl td {{ border:1px solid #cbd5e1; height:30px; padding:4px 6px; }}
    .form-tbl td.c1 {{ width:36px; text-align:center; color:#64748b; font-weight:700; }}
    """
    return wrap_html(bg, inner, extra_css)

def render_envelope(spec):
    """Distinct physical Envelopes: 7x4, 9.5x4.25, 11x5, Window Cover, Alabaster vs SSP vs Excel Bond"""
    w = spec['w']
    h = spec['h']
    paper_bg = spec.get('paper', '#ffffff')
    flap_bg = spec.get('flap', '#f8fafc')
    border_col = spec.get('accent', '#1e3a8a')
    is_window = spec.get('window', False)
    size_label = spec.get('size_label', '9.5" × 4.25"')
    stock_label = spec.get('stock', '100 GSM Alabaster')
    bg = spec.get('bg', 'travertine')
    flap_top = spec.get('flap_top', True)

    window_html = """
      <div style="position:absolute; left:52px; bottom:46px; width:240px; height:96px; border-radius:6px;
        background: linear-gradient(135deg, rgba(226,232,240,0.55) 0%, rgba(255,255,255,0.85) 55%, rgba(203,213,225,0.6) 100%);
        border:1.5px solid #cbd5e1; box-shadow: inset 0 2px 6px rgba(15,23,42,0.12); padding:14px 16px; overflow:hidden;">
        <div style="font-size:11px; font-weight:800; color:#1e293b; letter-spacing:0.3px;">TO: ASTERISK ENTERPRISES PVT. LTD.</div>
        <div style="font-size:10px; color:#475569; line-height:1.45; margin-top:3px;">402 Commerce Plaza, Ring Road<br/>Surat – 395002, Gujarat, India</div>
        <div style="position:absolute; inset:0; background:linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 65%);"></div>
      </div>
    """ if is_window else f"""
      <div style="position:absolute; right:48px; bottom:38px; text-align:right;">
        <div style="font-size:9px; font-weight:800; color:{border_col}; letter-spacing:1.4px;">OFFICIAL CORRESPONDENCE</div>
        <div style="font-size:11px; font-weight:700; color:#475569; margin-top:2px;">{stock_label} • {size_label}</div>
      </div>
    """

    flap_html = f"""
      <div style="position:absolute; top:0; left:0; right:0; height:128px;
        background:{flap_bg}; clip-path: polygon(0 0, 100% 0, 50% 100%);
        filter: drop-shadow(0 4px 6px rgba(15,23,42,0.12)); border-top: 1px solid #e2e8f0;"></div>
      <div style="position:absolute; top:0; left:0; right:0; height:128px;
        border-bottom: 1.5px solid rgba(148,163,184,0.35); clip-path: polygon(0 0, 100% 0, 50% 100%);"></div>
    """ if flap_top else ""

    inner = f"""
    <div style="position:relative; transform: rotateX(22deg) rotateZ(-8deg); transform-style: preserve-3d;">
      <!-- Lower fanned stack envelopes -->
      <div style="position:absolute; top:38px; left:-32px; width:{w}px; height:{h}px; background:{flap_bg}; border:1px solid #cbd5e1; border-radius:4px;
        transform: rotate(-4deg); box-shadow: 18px 28px 42px rgba(15,23,42,0.22);"></div>
      <div style="position:absolute; top:18px; left:-16px; width:{w}px; height:{h}px; background:{paper_bg}; border:1px solid #cbd5e1; border-radius:4px;
        transform: rotate(-2deg); box-shadow: 16px 24px 36px rgba(15,23,42,0.18);"></div>

      <!-- Top hero envelope -->
      <div style="position:relative; width:{w}px; height:{h}px; background:{paper_bg}; border-radius:4px; border:1px solid #cbd5e1;
        box-shadow: 0 3px 0 #e2e8f0, 0 6px 0 #cbd5e1, 0 9px 0 #94a3b8, 22px 34px 46px rgba(15,23,42,0.28); overflow:hidden;">
        <div style="position:absolute; top:0; left:0; right:0; height:6px; background:{border_col};"></div>
        {flap_html}
        <div style="position:absolute; top:26px; left:34px; display:flex; align-items:center; gap:10px;">
          <div style="width:26px; height:26px; border-radius:6px; background:{border_col}; color:#fff; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center;">P</div>
          <div>
            <div style="font-size:12px; font-weight:900; color:#0f172a; letter-spacing:0.6px;">PRINTIZER CORPORATE</div>
            <div style="font-size:9px; color:#64748b; font-weight:600;">COMMERCIAL ENVELOPE SUITE</div>
          </div>
        </div>
        {window_html}
      </div>
    </div>
    """
    return wrap_html(bg, inner)

def render_letterhead_sheet(spec):
    """Crisp A4 / 210x285mm Letterhead & Art Paper ream stacks with distinct paper grain & gloss"""
    title = spec['brand']
    accent = spec.get('accent', '#0f172a')
    highlight = spec.get('highlight', '#e11d48')
    paper_bg = spec.get('paper', '#ffffff')
    gloss = spec.get('gloss', False)
    thickness = spec.get('thickness', 10)
    bg = spec.get('bg', 'oak')
    spec_tag = spec.get('spec_tag', '100 GSM EXECUTIVE STOCK • A4 (210 × 297 MM)')
    mode = spec.get('mode', 'letterhead') # 'letterhead' or 'artpaper'

    stack_shadow = ', '.join([f'{i*1.2}px {i*1.5}px 0 #cbd5e1' for i in range(1, thickness)])
    sheen_html = """
      <div style="position:absolute; inset:0; background: linear-gradient(125deg, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0.0) 65%); pointer-events:none;"></div>
    """ if gloss else ""

    if mode == 'artpaper':
        body_content = f"""
        <div style="height:240px; border-radius:8px; background: linear-gradient(135deg, {accent}, {highlight}); padding:24px; color:#fff; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="font-size:10px; font-weight:800; letter-spacing:2px; opacity:0.85;">COMMERCIAL OFFSET COLOR PRINT</div>
          <div>
            <div style="font-size:32px; font-weight:900; line-height:1.05;">{title}</div>
            <div style="font-size:12px; opacity:0.9; margin-top:6px;">High-Definition 4-Color CMYK Sheet Printing</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:18px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px;">
            <div style="font-size:10px; font-weight:800; color:{highlight};">PAPER GRADE</div>
            <div style="font-size:14px; font-weight:800; color:#0f172a; margin-top:4px;">{spec_tag}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px;">
            <div style="font-size:10px; font-weight:800; color:{highlight};">SURFACE FINISH</div>
            <div style="font-size:14px; font-weight:800; color:#0f172a; margin-top:4px;">{'Calibrated Gloss / Coated' if gloss else 'Velvet Matte Stock'}</div>
          </div>
        </div>
        <div style="margin-top:18px; display:flex; gap:6px;">
          <div style="flex:1; height:10px; background:#06b6d4; border-radius:3px;"></div>
          <div style="flex:1; height:10px; background:#ec4899; border-radius:3px;"></div>
          <div style="flex:1; height:10px; background:#eab308; border-radius:3px;"></div>
          <div style="flex:1; height:10px; background:#0f172a; border-radius:3px;"></div>
        </div>
        """
    else:
        body_content = f"""
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid {accent}; padding-bottom:14px;">
          <div>
            <div style="font-size:24px; font-weight:900; color:{accent}; letter-spacing:0.6px;">{title}</div>
            <div style="font-size:10px; font-weight:700; color:{highlight}; letter-spacing:1.5px; margin-top:2px;">CORPORATE STATIONERY DIVISION</div>
          </div>
          <div style="text-align:right; font-size:10px; color:#64748b; line-height:1.45;">
            <div>www.printizer.in</div>
            <div>Surat • Gujarat • India</div>
          </div>
        </div>
        <div style="margin-top:28px; space-y:10px;">
          <div style="font-size:11px; font-weight:700; color:#64748b; margin-bottom:14px;">Date: 25 November 2026 &nbsp;|&nbsp; Ref: PRZ/CORP/2026</div>
          <div style="height:10px; width:45%; background:#cbd5e1; border-radius:3px; margin-bottom:14px;"></div>
          <div style="height:7px; width:95%; background:#e2e8f0; border-radius:3px; margin-bottom:9px;"></div>
          <div style="height:7px; width:92%; background:#e2e8f0; border-radius:3px; margin-bottom:9px;"></div>
          <div style="height:7px; width:88%; background:#e2e8f0; border-radius:3px; margin-bottom:9px;"></div>
          <div style="height:7px; width:76%; background:#e2e8f0; border-radius:3px; margin-bottom:22px;"></div>
          <div style="height:7px; width:94%; background:#e2e8f0; border-radius:3px; margin-bottom:9px;"></div>
          <div style="height:7px; width:89%; background:#e2e8f0; border-radius:3px; margin-bottom:9px;"></div>
          <div style="height:7px; width:64%; background:#e2e8f0; border-radius:3px; margin-bottom:34px;"></div>
          <div style="width:120px; height:2px; background:{accent}; margin-bottom:6px;"></div>
          <div style="font-size:11px; font-weight:800; color:#334155;">Director of Operations</div>
        </div>
        <div style="position:absolute; bottom:24px; left:36px; right:36px; border-top:1px solid #cbd5e1; padding-top:8px; display:flex; justify-content:space-between; font-size:9px; color:#64748b; font-weight:700;">
          <span>{spec_tag}</span>
          <span>CMYK CALIBRATED PRINT</span>
        </div>
        """

    inner = f"""
    <div style="position:relative; transform: rotateX(24deg) rotateZ(-10deg); transform-style: preserve-3d;">
      <div style="position:relative; width:480px; height:640px; background:{paper_bg}; border-radius:3px; padding:36px;
        border: 1px solid #cbd5e1; overflow:hidden;
        box-shadow: {stack_shadow}, 24px 36px 52px rgba(15,23,42,0.28);">
        {body_content}
        {sheen_html}
      </div>
    </div>
    """
    return wrap_html(bg, inner)

def render_visiting_card(spec):
    """3D thick layered card stack + 2 fanned cards on real studio surfaces with GSM edge thickness & Foil/UV finishes"""
    card_bg = spec.get('card_bg', '#0f172a')
    text_col = spec.get('text', '#ffffff')
    accent = spec.get('accent', '#e11d48')
    back_bg = spec.get('back_bg', '#ffffff')
    back_text = spec.get('back_text', '#0f172a')
    rounded = spec.get('rounded', '10px')
    uv = spec.get('uv', False)
    foil = spec.get('foil', False) # 'gold' | 'silver' | False
    layers = spec.get('layers', 10)
    edge_col = spec.get('edge', '#e2e8f0')
    bg = spec.get('bg', 'concrete')
    label = spec.get('label', '350 GSM EXECUTIVE')

    stack_shadow = ', '.join([f'0 {i*2.2}px 0 {edge_col}' for i in range(1, layers)])
    foil_style = (
        'background: linear-gradient(120deg, #facc15, #fef08a, #ca8a04); -webkit-background-clip: text; color: transparent;'
        if foil == 'gold' else
        ('background: linear-gradient(120deg, #e2e8f0, #ffffff, #94a3b8); -webkit-background-clip: text; color: transparent;' if foil == 'silver' else f'color:{accent};')
    )
    uv_sheen = """
      <div style="position:absolute; inset:0; background: linear-gradient(118deg, rgba(255,255,255,0) 28%, rgba(255,255,255,0.28) 46%, rgba(255,255,255,0.05) 58%, rgba(255,255,255,0) 75%); pointer-events:none;"></div>
    """ if uv else ""

    inner = f"""
    <div style="position:relative; width:900px; height:640px; display:flex; align-items:center; justify-content:center; transform: rotateX(22deg) rotateZ(-7deg);">
      <!-- Bottom Stack Card Deck (Back Face Up) -->
      <div style="position:absolute; left:90px; top:90px; width:410px; height:245px; border-radius:{rounded};
        background:{back_bg}; border:1px solid rgba(15,23,42,0.12);
        box-shadow: {stack_shadow}, 18px 34px 48px rgba(15,23,42,0.34);
        display:flex; flex-direction:column; justify-content:center; align-items:center; overflow:hidden;">
        <div style="width:46px; height:46px; border-radius:10px; background:{accent}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:24px; margin-bottom:10px;">P</div>
        <div style="font-size:13px; font-weight:800; letter-spacing:2px; color:{back_text};">PRINTIZER.IN</div>
        {uv_sheen}
      </div>

      <!-- Fanned Middle Card -->
      <div style="position:absolute; right:95px; top:145px; width:410px; height:245px; border-radius:{rounded};
        background:{card_bg}; transform: rotate(11deg); opacity:0.95; border:1px solid rgba(255,255,255,0.12);
        box-shadow: 12px 24px 36px rgba(15,23,42,0.28); padding:28px; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden;">
        <div style="font-size:11px; font-weight:800; letter-spacing:2px; {foil_style}">PRINTIZER DESIGN STUDIO</div>
        <div style="font-size:11px; color:{text_col}; opacity:0.75;">{label}</div>
      </div>

      <!-- Top Hero Card Deck -->
      <div style="position:absolute; right:125px; bottom:95px; width:420px; height:250px; border-radius:{rounded};
        background:{card_bg}; border:1px solid rgba(255,255,255,0.14);
        box-shadow: {stack_shadow}, 24px 38px 52px rgba(15,23,42,0.38);
        padding:30px; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:24px; font-weight:900; letter-spacing:0.6px; {foil_style}">printizer</div>
            <div style="font-size:9px; font-weight:700; letter-spacing:2px; color:{text_col}; opacity:0.75; margin-top:2px;">COMMERCIAL PRINT PARTNER</div>
          </div>
          <div style="font-size:9px; font-weight:800; padding:4px 8px; border-radius:6px; border:1px solid {accent}; color:{text_col}; opacity:0.9;">{label}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:2px solid {accent}; padding-top:12px;">
          <div>
            <div style="font-size:13px; font-weight:800; color:{text_col};">Aarav Mehta</div>
            <div style="font-size:10px; color:{text_col}; opacity:0.7;">Creative Production Head</div>
          </div>
          <div style="text-align:right; font-size:10px; color:{text_col}; opacity:0.8; line-height:1.4;">
            <div>printizer.in</div>
            <div>+91 98983 51920</div>
          </div>
        </div>
        {uv_sheen}
      </div>
    </div>
    """
    return wrap_html(bg, inner)

def render_sticker(spec):
    """Stickers & Labels WITHOUT floating fingers: Die-cut peel, translucent clear vinyl, waterproof droplets, silver metallic, warning, QR, barcode"""
    kind = spec['kind']
    bg = spec.get('bg', 'concrete')
    title = spec.get('title', 'CUSTOM STICKER')
    accent = spec.get('accent', '#e11d48')
    shape_css = spec.get('shape_css', 'border-radius: 20px;')

    if kind == 'transparent':
        inner = """
        <div style="position:relative; transform: rotateX(20deg) rotateZ(-6deg);">
          <!-- Striped wood/dark contrast card underneath to clearly prove Transparency -->
          <div style="width:640px; height:420px; background: repeating-linear-gradient(45deg, #1e293b 0px, #1e293b 24px, #334155 24px, #334155 48px);
            border-radius:16px; box-shadow: 24px 36px 48px rgba(15,23,42,0.34); position:relative; display:flex; align-items:center; justify-content:center;">
            <!-- Frosted Clear Vinyl Sticker Sheet overlapping -->
            <div style="width:430px; height:290px; border-radius:20px; background: rgba(255,255,255,0.28); backdrop-filter: blur(2px);
              border: 2px solid rgba(255,255,255,0.75); box-shadow: 0 18px 34px rgba(0,0,0,0.35), inset 0 0 24px rgba(255,255,255,0.35);
              display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; transform: translate(50px, -25px);">
              <div style="width:74px; height:74px; border-radius:50%; border:3px solid #fff; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:900;">P</div>
              <div style="font-size:24px; font-weight:900; letter-spacing:2px; margin-top:12px;">CLEAR VINYL</div>
              <div style="font-size:12px; letter-spacing:1px; opacity:0.9; margin-top:4px;">TRANSPARENT ADHESIVE FILM</div>
            </div>
          </div>
        </div>
        """
    elif kind == 'waterproof':
        drops = ''.join([
            f'<div style="position:absolute; left:{x}px; top:{y}px; width:{sz}px; height:{sz}px; border-radius:50%; '
            f'background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(14,165,233,0.45) 70%, rgba(2,132,199,0.7)); '
            f'box-shadow: 2px 4px 8px rgba(15,23,42,0.35);"></div>'
            for x, y, sz in [(75,65,26),(120,180,18),(320,80,32),(355,210,22),(220,255,28),(180,45,16)]
        ])
        inner = f"""
        <div style="position:relative; transform: rotateX(22deg) rotateZ(-7deg);">
          <div style="width:520px; height:370px; background:#fff; border-radius:10px; border:1px solid #cbd5e1;
            box-shadow: 18px 30px 44px rgba(15,23,42,0.28); display:flex; align-items:center; justify-content:center; position:relative;">
            <div style="width:410px; height:290px; border-radius:22px; background: linear-gradient(135deg, #0284c7, #0f172a);
              border:5px solid #ffffff; box-shadow: 0 12px 24px rgba(2,132,199,0.35);
              display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; position:relative; overflow:hidden;">
              <div style="font-size:12px; font-weight:800; letter-spacing:3px; color:#7dd3fc;">100% WEATHERPROOF</div>
              <div style="font-size:34px; font-weight:900; margin-top:6px;">{title}</div>
              <div style="font-size:13px; color:#e0f2fe; margin-top:4px;">Tear-Resistant PVC &amp; UV Coating</div>
              {drops}
            </div>
          </div>
        </div>
        """
    elif kind == 'barcode':
        bars = ''.join([
            f'<div style="width:{w}px; height:110px; background:#0f172a;"></div>'
            for w in [6,3,9,3,6,12,3,6,3,9,6,3,12,3,6,9,3,6,3,9,6,12,3,6]
        ])
        inner = f"""
        <div style="position:relative; display:flex; align-items:center; gap:28px; transform: rotateX(18deg) rotateZ(-6deg);">
          <!-- Roll Core + Unrolled Strip -->
          <div style="width:290px; height:290px; border-radius:50%; background: radial-gradient(circle, #94a3b8 0%, #94a3b8 28%, #f8fafc 29%, #e2e8f0 94%, #cbd5e1 100%);
            box-shadow: 24px 32px 44px rgba(15,23,42,0.30); border: 1px solid #cbd5e1; display:flex; align-items:center; justify-content:center;">
            <div style="width:92px; height:92px; border-radius:50%; background:#78350f; box-shadow: inset 0 8px 18px rgba(0,0,0,0.5);"></div>
          </div>
          <div style="width:420px; background:#f8fafc; padding:22px; border-radius:10px; border:1px solid #cbd5e1;
            box-shadow: 18px 28px 40px rgba(15,23,42,0.25); display:flex; flex-direction:column; gap:14px;">
            <div style="background:#fff; border:1.5px solid #e2e8f0; border-radius:8px; padding:18px 22px; text-align:center;">
              <div style="font-size:11px; font-weight:800; color:#475569; letter-spacing:1.5px; margin-bottom:8px;">INVENTORY SKU • PRINTIZER</div>
              <div style="display:flex; justify-content:center; gap:4px;">{bars}</div>
              <div style="font-family:monospace; font-size:17px; font-weight:800; color:#0f172a; letter-spacing:4px; margin-top:8px;">8 901234 567892</div>
            </div>
          </div>
        </div>
        """
    elif kind == 'qr':
        # Crisp synthetic QR matrix pattern
        cells = []
        for r in range(11):
            for c in range(11):
                in_tl = r < 4 and c < 4
                in_tr = r < 4 and c > 6
                in_bl = r > 6 and c < 4
                dark = in_tl or in_tr or in_bl or ((r * 7 + c * 13) % 3 == 0)
                if (in_tl and (r in (1,2) and c in (1,2)) and not (r==1 and c==1)): dark = False
                cells.append(f'<div style="background:{"#0f172a" if dark else "#ffffff"};"></div>')
        grid_html = ''.join(cells)
        inner = f"""
        <div style="position:relative; transform: rotateX(22deg) rotateZ(-8deg); display:flex; gap:28px;">
          <div style="width:430px; height:430px; background:#fff; border-radius:16px; border:1px solid #cbd5e1;
            box-shadow: 0 4px 0 #cbd5e1, 0 8px 0 #94a3b8, 24px 36px 48px rgba(15,23,42,0.30);
            padding:34px; display:flex; flex-direction:column; align-items:center; justify-content:space-between;">
            <div style="font-size:15px; font-weight:900; color:#0f172a; letter-spacing:2px;">SCAN FOR DIGITAL MENU &amp; PAY</div>
            <div style="width:230px; height:230px; display:grid; grid-template-columns:repeat(11,1fr); gap:2px; border:8px solid #0f172a; padding:6px; border-radius:8px; background:#fff;">
              {grid_html}
            </div>
            <div style="background:{accent}; color:#fff; font-size:12px; font-weight:800; padding:6px 18px; border-radius:999px; letter-spacing:1px;">
              WATERPROOF QR LABEL • PRINTIZER
            </div>
          </div>
        </div>
        """
    elif kind == 'warning':
        inner = f"""
        <div style="position:relative; transform: rotateX(20deg) rotateZ(-6deg);">
          <div style="width:620px; height:420px; background:#f8fafc; border-radius:10px; border:1px solid #cbd5e1; padding:26px;
            box-shadow: 0 5px 0 #cbd5e1, 24px 34px 48px rgba(15,23,42,0.30); display:flex; flex-direction:column; gap:20px;">
            <div style="flex:1; background:#facc15; border:6px solid #0f172a; border-radius:12px; padding:22px;
              display:flex; align-items:center; gap:22px; box-shadow: inset 0 0 0 4px #facc15;">
              <div style="width:92px; height:84px; background:#0f172a; clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
                display:flex; align-items:flex-end; justify-content:center; padding-bottom:10px; color:#facc15; font-size:48px; font-weight:900; shrink:0;">!</div>
              <div>
                <div style="font-size:32px; font-weight:900; color:#0f172a; letter-spacing:1px;">CAUTION / WARNING</div>
                <div style="font-size:15px; font-weight:800; color:#1e293b; margin-top:4px;">INDUSTRIAL SAFETY &amp; FRAGILE HANDLING LABEL</div>
              </div>
            </div>
            <div style="height:105px; background:#dc2626; border:4px solid #0f172a; border-radius:10px; display:flex; align-items:center; justify-content:space-between; padding:0 28px; color:#fff;">
              <span style="font-size:24px; font-weight:900; letter-spacing:1px;">HANDLE WITH CARE</span>
              <span style="font-size:13px; font-weight:700; background:#fff; color:#dc2626; padding:4px 12px; border-radius:6px;">PERMANENT ADHESIVE</span>
            </div>
          </div>
        </div>
        """
    else:
        # Die-cut square / round / silver-metallic / parcel / food label on release backing
        metallic = spec.get('metallic', False)
        sticker_bg = (
            'linear-gradient(135deg, #e2e8f0 0%, #ffffff 32%, #94a3b8 55%, #f8fafc 80%, #64748b 100%)'
            if metallic else
            f'linear-gradient(135deg, {accent}, #0f172a)'
        )
        txt_col = '#0f172a' if metallic else '#ffffff'
        inner = f"""
        <div style="position:relative; transform: rotateX(22deg) rotateZ(-8deg);">
          <!-- White Release Liner Backing Sheet -->
          <div style="width:520px; height:400px; background:#ffffff; border-radius:8px; border:1px solid #cbd5e1;
            box-shadow: 0 4px 0 #e2e8f0, 0 8px 0 #cbd5e1, 24px 36px 48px rgba(15,23,42,0.28);
            display:flex; align-items:center; justify-content:center; position:relative;">
            <div style="position:absolute; inset:14px; border:1px dashed #e2e8f0; border-radius:6px;"></div>
            <!-- Sticker Disc / Square with subtle curled peel corner shadow -->
            <div style="width:320px; height:320px; {shape_css} background:{sticker_bg};
              border: 4px solid #ffffff; box-shadow: 6px 14px 24px rgba(15,23,42,0.28);
              display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24px; color:{txt_col}; position:relative; overflow:hidden;">
              <div style="font-size:11px; font-weight:800; letter-spacing:2px; opacity:0.85;">{spec.get('eyebrow','DIE-CUT ADHESIVE')}</div>
              <div style="font-size:28px; font-weight:900; line-height:1.15; margin-top:8px;">{title}</div>
              <div style="font-size:12px; font-weight:700; opacity:0.8; margin-top:8px;">{spec.get('sub','Precision Kiss-Cut Print')}</div>
              <div style="position:absolute; top:0; right:0; width:64px; height:64px; background: linear-gradient(225deg, #ffffff 48%, rgba(15,23,42,0.18) 52%, transparent 60%); border-bottom-left-radius:16px;"></div>
            </div>
          </div>
        </div>
        """
    return wrap_html(bg, inner)

def render_packaging(spec):
    """3D Folding Packaging Boxes, Cake Box with Window, Food Takeaway Box, Hang Tags, Product Sleeve"""
    kind = spec['kind']
    bg = spec.get('bg', 'warm_ivory')
    title = spec['title']
    accent = spec.get('accent', '#0f172a')

    if kind == 'cake_box':
        inner = """
        <div style="position:relative; width:700px; height:520px; display:flex; align-items:center; justify-content:center;">
          <!-- 3D Perspective Isometric Cake Box -->
          <div style="position:relative; width:460px; height:320px; transform: rotateX(16deg) rotateY(-24deg); transform-style: preserve-3d;">
            <!-- Right 3D Box Side Depth -->
            <div style="position:absolute; top:-20px; right:-96px; width:100px; height:320px; background:linear-gradient(180deg,#e2e8f0,#cbd5e1);
              transform: skewY(-22deg); border:1.5px solid #94a3b8; border-radius:0 8px 8px 0;
              display:flex; align-items:center; justify-content:center; color:#64748b; font-size:11px; font-weight:800; writing-mode:vertical-rl;">
              BAKERY • FRESH DAILY
            </div>
            <!-- Top Lid Flap & Handle -->
            <div style="position:absolute; top:-76px; left:24px; width:460px; height:76px; background:linear-gradient(180deg,#ffffff,#f1f5f9);
              transform: skewX(-42deg); border:1.5px solid #cbd5e1; border-radius:8px 8px 0 0;"></div>
            <div style="position:absolute; top:-112px; left:195px; width:140px; height:48px; border:8px solid #e11d48; border-bottom:none; border-radius:22px 22px 0 0; z-index:20;"></div>
            <!-- Front Box Face + Clear Display Window -->
            <div style="position:relative; width:460px; height:320px; background: linear-gradient(160deg, #ffffff 0%, #f8fafc 100%);
              border: 2px solid #cbd5e1; border-radius:8px;
              box-shadow: 28px 44px 58px rgba(15,23,42,0.30);
              padding:26px; display:flex; flex-direction:column; justify-content:space-between;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:14px; font-weight:900; color:#e11d48; letter-spacing:2px;">ARTISAN PATISSERIE</span>
                <span style="font-size:10px; font-weight:700; color:#64748b;">350 GSM FOOD-GRADE SBS</span>
              </div>
              <div style="height:190px; border-radius:12px; background: linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%);
                border:2px solid #fda4af; box-shadow: inset 0 8px 20px rgba(0,0,0,0.08);
                display:flex; flex-direction:column; align-items:center; justify-content:flex-end; padding-bottom:22px; position:relative; overflow:hidden;">
                <!-- Layered Sponge Cake inside window -->
                <div style="width:220px; height:24px; border-radius:8px; background:#fef3c7; border-bottom:4px solid #f59e0b;"></div>
                <div style="width:210px; height:64px; background:linear-gradient(180deg,#f472b6 0%, #fbcfe8 40%, #fde68a 42%, #f59e0b 100%); border-radius:12px 12px 2px 2px; box-shadow:0 8px 14px rgba(0,0,0,0.12);"></div>
                <div style="position:absolute; inset:0; background: linear-gradient(125deg, rgba(255,255,255,0.55) 0%, transparent 45%);"></div>
              </div>
            </div>
          </div>
        </div>
        """
    elif kind == 'food_pkg':
        inner = """
        <div style="position:relative; display:flex; align-items:flex-end; gap:36px; transform: rotateX(16deg) rotateY(-14deg);">
          <!-- Kraft Clamshell Meal Box -->
          <div style="width:320px; height:240px; background: linear-gradient(160deg, #d6b88d, #b8915d);
            border:2px solid #9a7445; border-radius:12px;
            box-shadow: 24px -14px 0 #a37b4b, 24px 36px 46px rgba(15,23,42,0.30);
            padding:24px; display:flex; flex-direction:column; justify-content:space-between; color:#3f2710;">
            <div style="font-size:10px; font-weight:900; letter-spacing:2px;">ECO-KRAFT FOOD GRADE</div>
            <div style="font-size:28px; font-weight:900; line-height:1.1;">FRESH BITES<br/>TAKEAWAY</div>
            <div style="font-size:11px; font-weight:700; border-top:1px solid rgba(63,39,16,0.3); padding-top:8px;">Greaseproof Coated Carton</div>
          </div>
          <!-- Tall Fries / Snack Pouch -->
          <div style="width:210px; height:320px; background: linear-gradient(160deg, #ffffff, #f1f5f9);
            border:2px solid #cbd5e1; border-radius:8px;
            box-shadow: 18px -10px 0 #cbd5e1, 20px 32px 42px rgba(15,23,42,0.26);
            padding:22px; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="height:10px; background:#e11d48; border-radius:4px;"></div>
            <div>
              <div style="font-size:22px; font-weight:900; color:#0f172a;">CRISPY &amp; HOT</div>
              <div style="font-size:11px; color:#64748b; margin-top:4px;">Custom Printed Food Sleeve</div>
            </div>
            <div style="font-size:10px; font-weight:800; color:#e11d48;">PRINTIZER PACKAGING</div>
          </div>
        </div>
        """
    elif kind == 'hang_tag':
        inner = """
        <div style="position:relative; display:flex; gap:36px; align-items:center; transform: rotateX(18deg) rotateZ(-6deg);">
          <!-- Matte Black Hang Tag with Kraft String -->
          <div style="width:220px; height:400px; background: linear-gradient(155deg, #1e293b, #0f172a);
            border-radius:16px 16px 10px 10px; padding:24px; color:#fff;
            box-shadow: 0 5px 0 #334155, 18px 30px 40px rgba(15,23,42,0.36);
            display:flex; flex-direction:column; align-items:center; justify-content:space-between; position:relative;">
            <div style="width:22px; height:22px; border-radius:50%; background:#f8fafc; border:4px solid #eab308; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);"></div>
            <div style="text-align:center;">
              <div style="font-size:22px; font-weight:900; letter-spacing:2px; color:#facc15;">VELOUR</div>
              <div style="font-size:10px; letter-spacing:2px; opacity:0.75; margin-top:4px;">APPAREL STUDIO</div>
            </div>
            <div style="width:100%; border-top:1px solid #334155; padding-top:10px; text-align:center; font-size:11px; font-weight:700;">400 GSM MATTE</div>
          </div>
          <!-- Kraft Hang Tag -->
          <div style="width:220px; height:380px; background: linear-gradient(155deg, #d6b88d, #b8915d);
            border-radius:16px 16px 10px 10px; padding:24px; color:#3f2710; transform: rotate(8deg);
            box-shadow: 0 5px 0 #9a7445, 18px 30px 40px rgba(15,23,42,0.28);
            display:flex; flex-direction:column; align-items:center; justify-content:space-between;">
            <div style="width:22px; height:22px; border-radius:50%; background:#f8fafc; border:4px solid #78350f;"></div>
            <div style="text-align:center;">
              <div style="font-size:20px; font-weight:900; letter-spacing:1.5px;">CRAFTED</div>
              <div style="font-size:10px; font-weight:700; margin-top:4px;">COTTON &amp; LINEN</div>
            </div>
            <div style="font-size:11px; font-weight:800;">SIZE: M &nbsp;|&nbsp; ₹ 1,499</div>
          </div>
        </div>
        """
    elif kind == 'sleeve':
        inner = """
        <div style="position:relative; transform: rotateX(18deg) rotateY(-16deg);">
          <div style="width:520px; height:360px; background: linear-gradient(160deg, #f8fafc, #e2e8f0);
            border:2px solid #cbd5e1; border-radius:10px;
            box-shadow: 30px -16px 0 #cbd5e1, 24px 36px 48px rgba(15,23,42,0.28);
            display:flex; align-items:center; justify-content:center; position:relative;">
            <!-- Snug Printed Belly Band Sleeve -->
            <div style="width:230px; height:376px; background: linear-gradient(160deg, #0f172a, #1e293b);
              border-left: 3px solid #e11d48; border-right: 3px solid #e11d48;
              box-shadow: 0 14px 28px rgba(15,23,42,0.32); padding:28px; display:flex; flex-direction:column; justify-content:space-between; color:#fff; text-align:center;">
              <div style="font-size:10px; font-weight:800; letter-spacing:2px; color:#fda4af;">CUSTOM BELLY BAND</div>
              <div>
                <div style="font-size:26px; font-weight:900; letter-spacing:1px;">PRODUCT SLEEVE</div>
                <div style="font-size:11px; color:#cbd5e1; margin-top:8px;">300 GSM Coated Sleeve Wrap</div>
              </div>
              <div style="font-size:10px; font-weight:700; border-top:1px solid #334155; padding-top:8px;">PRINTIZER PACKAGING</div>
            </div>
          </div>
        </div>
        """
    else:
        # 320 gsm Ultima + UV Lamination OR Drip-off UV folding cartons
        dripoff = spec.get('dripoff', False)
        sheen = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 8px)' if dripoff else 'linear-gradient(125deg, rgba(255,255,255,0.0) 25%, rgba(255,255,255,0.42) 48%, rgba(255,255,255,0.0) 70%)'
        inner = f"""
        <div style="position:relative; display:flex; align-items:flex-end; gap:30px; transform: rotateX(16deg) rotateY(-18deg);">
          <div style="width:280px; height:400px; background: linear-gradient(155deg, {accent}, #0f172a); border-radius:8px;
            box-shadow: 28px -16px 0 #1e293b, 26px 38px 50px rgba(15,23,42,0.36); padding:28px; color:#fff;
            display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
            <div style="position:absolute; inset:0; background:{sheen}; pointer-events:none;"></div>
            <div style="font-size:10px; font-weight:800; letter-spacing:2px; color:#facc15;">320 GSM ULTIMA BOARD</div>
            <div>
              <div style="font-size:28px; font-weight:900; line-height:1.1;">{title}</div>
              <div style="font-size:12px; color:#e2e8f0; margin-top:8px;">{'Raised Drip-Off UV Texture' if dripoff else 'High-Gloss UV Lamination'}</div>
            </div>
            <div style="font-size:10px; font-weight:800; border-top:1px solid rgba(255,255,255,0.2); padding-top:10px;">AUTO-LOCK FOLDING CARTON</div>
          </div>
          <div style="width:200px; height:270px; background:#ffffff; border:2px solid #cbd5e1; border-radius:8px;
            box-shadow: 22px -12px 0 #e2e8f0, 20px 30px 40px rgba(15,23,42,0.24); padding:20px; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; position:relative;">
            <div style="position:absolute; inset:0; background:{sheen}; pointer-events:none;"></div>
            <div style="font-size:10px; font-weight:800; color:{accent};">COMPANION PACK</div>
            <div style="font-size:18px; font-weight:900; color:#0f172a;">Custom Die-Cut</div>
          </div>
        </div>
        """
    return wrap_html(bg, inner)

def render_photo_gift(spec):
    """Photo Printing, Passport Photos, Photo Frame, Canvas Print, Photo Mug, Personalized Gifts, PVC Cards"""
    kind = spec['kind']
    bg = spec.get('bg', 'oak')
    if kind == 'mug':
        inner = """
        <div style="position:relative; width:490px; height:420px; display:flex; align-items:center; justify-content:center;">
          <!-- Porcelain Handle visibly protruding from right side -->
          <div style="position:relative; width:430px; height:380px; display:flex; align-items:center;">
            <div style="position:absolute; right:8px; top:85px; width:135px; height:210px; border:30px solid #f1f5f9;
              border-radius:0 85px 85px 0; box-shadow: 16px 24px 36px rgba(15,23,42,0.28), inset -4px 0 8px rgba(0,0,0,0.08);"></div>
            <!-- Cylindrical Ceramic Mug Body -->
            <div style="position:relative; width:335px; height:380px; border-radius:18px 18px 34px 34px;
              background: linear-gradient(90deg, #cbd5e1 0%, #ffffff 30%, #f8fafc 74%, #cbd5e1 100%);
              box-shadow: 22px 34px 48px rgba(15,23,42,0.34), inset 0 14px 20px rgba(255,255,255,0.95);
              display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; overflow:hidden; z-index:5;">
              <!-- Rim ellipse -->
              <div style="position:absolute; top:-14px; left:0; right:0; height:34px; border-radius:50%; background:linear-gradient(180deg,#cbd5e1,#f8fafc); border:3px solid #fff;"></div>
              <!-- Wrapped Printed Photo Panel -->
              <div style="width:268px; height:228px; border-radius:12px; background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #ec4899 100%);
                padding:18px; color:#fff; display:flex; flex-direction:column; justify-content:space-between; box-shadow: inset 20px 0 26px rgba(0,0,0,0.22), inset -20px 0 26px rgba(0,0,0,0.22);">
                <div style="font-size:10px; font-weight:800; letter-spacing:2px;">350 ML CERAMIC SUBLIMATION</div>
                <div style="font-size:26px; font-weight:900; line-height:1.1;">CUSTOM PHOTO MUG</div>
                <div style="font-size:11px; opacity:0.9;">Full-Wrap Vibrant HD Glaze</div>
              </div>
            </div>
          </div>
        </div>
        """
    elif kind == 'frame':
        inner = """
        <div style="position:relative; transform: rotateX(10deg) rotateY(-12deg);">
          <!-- Solid Oak Wood Frame -->
          <div style="width:460px; height:580px; background: linear-gradient(145deg, #78350f, #451a03); padding:32px; border-radius:6px;
            box-shadow: 20px -10px 0 #290e02, 28px 36px 52px rgba(15,23,42,0.38);">
            <!-- Bevel Matboard -->
            <div style="width:100%; height:100%; background:#f8fafc; padding:34px; box-shadow: inset 0 4px 12px rgba(0,0,0,0.28);">
              <!-- Landscape Photo Print -->
              <div style="width:100%; height:100%; background: linear-gradient(180deg, #38bdf8 0%, #bae6fd 50%, #0284c7 51%, #0f172a 100%);
                box-shadow: inset 0 0 18px rgba(0,0,0,0.25); position:relative; overflow:hidden; display:flex; align-items:flex-end; padding:18px;">
                <div style="position:absolute; top:60px; right:55px; width:70px; height:70px; border-radius:50%; background:radial-gradient(circle, #fef08a, #f59e0b);"></div>
                <div style="color:#fff; font-size:12px; font-weight:800; letter-spacing:1.5px;">ARCHIVAL FRAMED PRINT</div>
              </div>
            </div>
          </div>
        </div>
        """
    elif kind == 'canvas':
        inner = """
        <div style="position:relative; transform: rotateX(14deg) rotateY(-20deg);">
          <!-- Gallery-Wrapped Stretched Canvas with visible 3D thick wrapped edge -->
          <div style="width:540px; height:400px; background: linear-gradient(135deg, #1e293b 0%, #3b82f6 45%, #f59e0b 100%);
            box-shadow: 38px -18px 0 #1e3a8a, 38px -18px 10px rgba(0,0,0,0.2), 28px 40px 56px rgba(15,23,42,0.36);
            position:relative; overflow:hidden; padding:34px; display:flex; flex-direction:column; justify-content:flex-end; color:#fff;">
            <!-- Subtle canvas weave overlay -->
            <div style="position:absolute; inset:0; opacity:0.15; background-image: repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 5px);"></div>
            <div style="font-size:11px; font-weight:800; letter-spacing:2px; opacity:0.9;">1.5" GALLERY WOOD STRETCHER BAR</div>
            <div style="font-size:32px; font-weight:900; margin-top:4px;">FINE ART CANVAS</div>
          </div>
        </div>
        """
    elif kind == 'passport':
        cards = ''.join([
            '<div style="background: linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%); border:1px solid #cbd5e1; border-radius:4px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; padding-top:12px; overflow:hidden;">'
            '<div style="width:44px; height:44px; border-radius:50%; background:#334155; margin-bottom:6px;"></div>'
            '<div style="width:86px; height:46px; border-radius:40px 40px 0 0; background:#1e293b;"></div>'
            '</div>'
            for _ in range(8)
        ])
        inner = f"""
        <div style="position:relative; transform: rotateX(22deg) rotateZ(-8deg);">
          <div style="width:620px; height:420px; background:#ffffff; padding:26px; border-radius:4px; border:1px solid #cbd5e1;
            box-shadow: 0 4px 0 #e2e8f0, 22px 34px 48px rgba(15,23,42,0.28); display:grid; grid-template-columns:repeat(4,1fr); gap:14px;">
            {cards}
          </div>
          <div style="position:absolute; bottom:-36px; left:24px; background:#0f172a; color:#fff; font-size:11px; font-weight:800; padding:6px 14px; border-radius:6px;">
            35 × 45 MM • GLOSSY &amp; MATTE STUDIO PRINTS
          </div>
        </div>
        """
    elif kind == 'photo_prints':
        inner = """
        <div style="position:relative; width:760px; height:520px; transform: rotateX(18deg) rotateZ(-5deg);">
          <div style="position:absolute; left:40px; top:30px; width:420px; height:300px; background:#fff; padding:16px; border:1px solid #cbd5e1; transform: rotate(-10deg); box-shadow: 16px 24px 36px rgba(15,23,42,0.22);">
            <div style="width:100%; height:100%; background:linear-gradient(135deg, #f97316, #fbbf24);"></div>
          </div>
          <div style="position:absolute; right:40px; top:60px; width:430px; height:310px; background:#fff; padding:16px; border:1px solid #cbd5e1; transform: rotate(8deg); box-shadow: 18px 26px 40px rgba(15,23,42,0.24);">
            <div style="width:100%; height:100%; background:linear-gradient(135deg, #06b6d4, #0f172a);"></div>
          </div>
          <div style="position:absolute; left:170px; bottom:30px; width:440px; height:320px; background:#fff; padding:18px; border:1px solid #cbd5e1; box-shadow: 22px 34px 48px rgba(15,23,42,0.32);">
            <div style="width:100%; height:100%; background:linear-gradient(135deg, #10b981, #047857 50%, #064e3b 100%); display:flex; align-items:flex-end; padding:18px; color:#fff;">
              <div>
                <div style="font-size:10px; font-weight:800; letter-spacing:2px;">ULTRA HD SILVER HALIDE</div>
                <div style="font-size:22px; font-weight:900;">4×6 • 5×7 • 8×12 PRINTS</div>
              </div>
            </div>
          </div>
        </div>
        """
    elif kind == 'gifts':
        inner = """
        <div style="position:relative; display:flex; gap:26px; align-items:center; transform: rotateX(18deg) rotateZ(-6deg);">
          <div style="width:460px; height:340px; background:#0f172a; border-radius:14px; padding:26px;
            box-shadow: 0 12px 0 #1e293b, 26px 38px 50px rgba(15,23,42,0.36); color:#fff; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:11px; font-weight:800; letter-spacing:2px; color:#facc15;">CORPORATE GIFTING HAMPER</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">
              <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:16px; text-align:center;">
                <div style="font-size:13px; font-weight:800;">Engraved Diary</div>
                <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Gold Foil Monogram</div>
              </div>
              <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:16px; text-align:center;">
                <div style="font-size:13px; font-weight:800;">Metal Pen &amp; Keytag</div>
                <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Laser Custom Branded</div>
              </div>
            </div>
            <div style="font-size:10px; color:#cbd5e1;">Bespoke Foam Insert Presentation Box</div>
          </div>
        </div>
        """
    else: # pvc card printing / employee id badge
        is_emp = spec.get('emp', False)
        inner = f"""
        <div style="position:relative; width:720px; height:480px; display:flex; align-items:center; justify-content:center; transform: rotateX(20deg) rotateZ(-8deg);">
          <div style="position:absolute; left:90px; top:80px; width:410px; height:260px; border-radius:16px; background:#0f172a;
            box-shadow: 0 5px 0 #334155, 18px 30px 44px rgba(15,23,42,0.32); padding:28px; color:#fff; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="width:52px; height:38px; border-radius:6px; background:linear-gradient(135deg,#facc15,#ca8a04);"></div>
            <div style="font-size:16px; font-weight:800; letter-spacing:2px;">{'RFID STAFF SMART BADGE' if is_emp else 'CR80 PVC SMART CARD'}</div>
          </div>
          <div style="position:absolute; right:70px; bottom:70px; width:410px; height:260px; border-radius:16px; background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            border:1px solid #cbd5e1; box-shadow: 0 5px 0 #cbd5e1, 24px 36px 50px rgba(15,23,42,0.30); padding:24px; display:flex; align-items:center; gap:20px;">
            <div style="width:110px; height:135px; border-radius:10px; background:linear-gradient(180deg,#cbd5e1,#64748b); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900;">PHOTO</div>
            <div style="flex:1;">
              <div style="font-size:10px; font-weight:900; color:#e11d48; letter-spacing:1.5px;">{'EMPLOYEE ACCESS PASS' if is_emp else '800 MICRON PVC CARD'}</div>
              <div style="font-size:20px; font-weight:900; color:#0f172a; margin-top:4px;">PRIYA SHARMA</div>
              <div style="font-size:11px; color:#475569; margin-top:2px;">Senior Operations Lead</div>
              <div style="margin-top:18px; height:24px; background:repeating-linear-gradient(90deg, #0f172a 0 4px, transparent 4px 7px);"></div>
            </div>
          </div>
        </div>
        """
    return wrap_html(bg, inner)

def render_invitation(spec):
    """Wedding & Greeting Suites: Birthday, Anniversary, Save The Date, Thank You, Greeting, Religious Invite"""
    title = spec['title']
    subtitle = spec['subtitle']
    card_bg = spec.get('card_bg', '#fffdf9')
    border = spec.get('border', '#d97706')
    text_col = spec.get('text', '#451a03')
    env_bg = spec.get('env_bg', '#9f1239')
    bg = spec.get('bg', 'linen')

    inner = f"""
    <div style="position:relative; width:820px; height:600px; display:flex; align-items:center; justify-content:center; transform: rotateX(20deg) rotateZ(-7deg);">
      <!-- Coordinating Envelope Behind -->
      <div style="position:absolute; left:65px; bottom:55px; width:480px; height:330px; background:{env_bg}; border-radius:6px;
        transform: rotate(-7deg); box-shadow: 22px 32px 46px rgba(15,23,42,0.32);">
        <div style="position:absolute; right:36px; top:32px; width:46px; height:46px; border-radius:50%; background:radial-gradient(circle, #fde047, #b45309); box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>
      </div>

      <!-- Heavy Cotton Cardstock Invite -->
      <div style="position:relative; left:70px; width:420px; height:560px; background:{card_bg}; border-radius:4px; padding:26px;
        box-shadow: 0 4px 0 #e2e8f0, 0 8px 0 #cbd5e1, 24px 36px 52px rgba(15,23,42,0.30);">
        <div style="width:100%; height:100%; border: 3px double {border}; padding:28px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center;">
          <div style="font-size:11px; font-weight:800; letter-spacing:3px; color:{border}; text-transform:uppercase;">{spec.get('eyebrow', 'BESPOKE INVITATION')}</div>
          <div>
            <div style="width:64px; height:64px; border-radius:50%; border:2px solid {border}; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:24px; color:{border};">✦</div>
            <div style="font-family:Georgia, serif; font-size:36px; font-weight:700; color:{text_col}; line-height:1.15;">{title}</div>
            <div style="width:80px; height:2px; background:{border}; margin:16px auto;"></div>
            <div style="font-size:14px; color:{text_col}; opacity:0.85; line-height:1.5;">{subtitle}</div>
          </div>
          <div style="font-size:11px; font-weight:700; letter-spacing:1.5px; color:{border};">SATURDAY • 28 NOVEMBER • 7:00 PM</div>
        </div>
      </div>
    </div>
    """
    return wrap_html(bg, inner)

def render_hospitality(spec):
    """Hospitality items: Food Menu, Takeaway Menu, Table Tent, Hotel Key Card, Room Service Card"""
    kind = spec['kind']
    bg = spec.get('bg', 'oak')
    if kind == 'table_tent':
        inner = """
        <div style="position:relative; transform: rotateX(12deg) rotateY(-16deg);">
          <!-- Wooden Base Holder -->
          <div style="width:360px; height:490px; background:#ffffff; border:2px solid #e2e8f0; border-radius:10px;
            box-shadow: 24px 36px 52px rgba(15,23,42,0.30); padding:32px; display:flex; flex-direction:column; justify-content:space-between; text-align:center;">
            <div style="font-size:11px; font-weight:800; letter-spacing:2px; color:#e11d48;">TABLE TOP DISPLAY</div>
            <div>
              <div style="font-size:32px; font-weight:900; color:#0f172a; line-height:1.15;">CHEF'S<br/>WEEKEND<br/>SPECIALS</div>
              <div style="width:60px; height:3px; background:#e11d48; margin:16px auto;"></div>
              <div style="font-size:13px; color:#475569;">350 GSM Matte Laminated Tent Card</div>
            </div>
            <div style="background:#0f172a; color:#fff; padding:10px; border-radius:8px; font-size:12px; font-weight:800;">SCAN QR TO ORDER</div>
          </div>
          <div style="width:400px; height:56px; background:linear-gradient(180deg, #78350f, #451a03); border-radius:8px; margin:-18px 0 0 -20px; box-shadow: 18px 24px 34px rgba(15,23,42,0.36);"></div>
        </div>
        """
    elif kind == 'hotel_key':
        inner = """
        <div style="position:relative; width:780px; height:520px; display:flex; align-items:center; justify-content:center; transform: rotateX(22deg) rotateZ(-8deg);">
          <!-- Folded Keycard Sleeve -->
          <div style="width:360px; height:460px; background:linear-gradient(155deg,#0f172a,#1e293b); border-radius:12px;
            box-shadow: 24px 36px 52px rgba(15,23,42,0.38); padding:32px; color:#fff; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:11px; font-weight:800; letter-spacing:2.5px; color:#facc15;">GRAND HORIZON SUITES</div>
            <div>
              <div style="font-size:28px; font-weight:900;">WELCOME</div>
              <div style="font-size:12px; color:#cbd5e1; margin-top:6px;">Room No: ______ &nbsp;|&nbsp; Wi-Fi: Guest5G</div>
            </div>
            <div style="height:120px; border-top:2px dashed #475569;"></div>
          </div>
          <!-- RFID Key Card sticking out -->
          <div style="position:relative; left:-110px; top:-20px; width:380px; height:240px; border-radius:14px;
            background: linear-gradient(135deg, #facc15, #ca8a04); padding:26px; color:#0f172a;
            box-shadow: 16px 24px 36px rgba(0,0,0,0.35); display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:11px; font-weight:900; letter-spacing:2px;">RFID CONTACTLESS KEY</div>
            <div style="font-size:24px; font-weight:900;">SUITE ACCESS</div>
          </div>
        </div>
        """
    elif kind == 'door_hanger':
        inner = """
        <div style="position:relative; transform: rotateX(16deg) rotateZ(-6deg);">
          <div style="width:300px; height:640px; background: linear-gradient(160deg, #1e293b, #0f172a); border-radius:150px 150px 16px 16px;
            box-shadow: 0 6px 0 #334155, 24px 36px 52px rgba(15,23,42,0.38); padding:36px; color:#fff;
            display:flex; flex-direction:column; align-items:center; justify-content:space-between; text-align:center;">
            <div style="width:120px; height:120px; border-radius:50%; background:#f1f5f9; border:4px solid #facc15; margin-top:16px; box-shadow: inset 0 6px 12px rgba(0,0,0,0.2);"></div>
            <div>
              <div style="font-size:12px; font-weight:800; letter-spacing:2.5px; color:#facc15;">HOSPITALITY HANGER</div>
              <div style="font-size:32px; font-weight:900; line-height:1.15; margin-top:10px;">ROOM<br/>SERVICE<br/>MENU</div>
              <div style="font-size:12px; color:#cbd5e1; margin-top:12px;">350 GSM Die-Cut Waterproof PVC</div>
            </div>
            <div style="width:100%; border-top:1px solid #334155; padding-top:14px; font-size:12px; font-weight:800;">DIAL EXT. 100 TO ORDER</div>
          </div>
        </div>
        """
    else: # food_menu or takeaway_menu (tri-fold)
        tri = spec.get('trifold', False)
        cols = 3 if tri else 2
        panels = ''.join([
            f'<div style="flex:1; background:{"#ffffff" if i%2==0 else "#f8fafc"}; border:1px solid #cbd5e1; padding:24px; '
            f'box-shadow: inset 0 0 18px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">'
            f'<div style="font-size:18px; font-weight:900; color:#e11d48; border-bottom:2px solid #0f172a; padding-bottom:8px;">'
            f'{["STARTERS & SOUPS","SIGNATURE MAINS","BEVERAGES & SIDES"][i]}</div>'
            f'<div style="space-y:10px; font-size:11px; color:#334155;">'
            + ''.join([f'<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dotted #cbd5e1;"><b>Signature Dish {j}</b><span>₹{180+j*40}</span></div>' for j in range(1,7)])
            + f'</div><div style="font-size:10px; font-weight:700; color:#64748b;">PRINTIZER LAMINATED MENU</div></div>'
            for i in range(cols)
        ])
        inner = f"""
        <div style="position:relative; width:880px; height:540px; display:flex; transform: rotateX(18deg) rotateZ(-5deg);
          box-shadow: 24px 36px 52px rgba(15,23,42,0.32);">
          {panels}
        </div>
        """
    return wrap_html(bg, inner)

def render_notebook_diary(spec):
    """Notebooks, Diaries, Exercise Books, Project Reports, Thesis, Prospectus, School Calendar, Marksheet, Question Paper, Admission Form"""
    kind = spec['kind']
    bg = spec.get('bg', 'concrete')
    title = spec['title']
    accent = spec.get('accent', '#1e3a8a')

    if kind == 'spiral':
        rings = ''.join(['<div style="width:36px; height:12px; border-radius:6px; background:linear-gradient(180deg,#f8fafc,#64748b); box-shadow: 0 3px 5px rgba(0,0,0,0.4);"></div>' for _ in range(16)])
        frosted = spec.get('frosted', False)
        cover_bg = 'linear-gradient(145deg, rgba(255,255,255,0.75), rgba(226,232,240,0.85))' if frosted else f'linear-gradient(150deg, {accent}, #0f172a)'
        txt = '#0f172a' if frosted else '#ffffff'
        inner = f"""
        <div style="position:relative; transform: rotateX(22deg) rotateZ(-8deg);">
          <div style="width:460px; height:610px; background:{cover_bg}; border-radius:6px 14px 14px 6px; padding:42px 38px 38px 66px; color:{txt};
            border:1px solid #cbd5e1; box-shadow: 4px 5px 0 #e2e8f0, 8px 10px 0 #cbd5e1, 24px 36px 50px rgba(15,23,42,0.30);
            display:flex; flex-direction:column; justify-content:space-between; position:relative;">
            <div style="position:absolute; left:-16px; top:22px; bottom:22px; display:flex; flex-direction:column; justify-content:space-between;">{rings}</div>
            <div style="font-size:11px; font-weight:800; letter-spacing:2px; opacity:0.8;">{spec.get('eyebrow','WIRE-O SPIRAL BOUND')}</div>
            <div>
              <div style="font-size:36px; font-weight:900; line-height:1.1;">{title}</div>
              <div style="width:70px; height:4px; background:#e11d48; margin-top:16px;"></div>
              <div style="font-size:13px; opacity:0.85; margin-top:12px;">{spec.get('sub','80 GSM High-Brightness Ruled Paper')}</div>
            </div>
            <div style="font-size:11px; font-weight:700; opacity:0.75;">PRINTIZER PUBLICATIONS</div>
          </div>
        </div>
        """
    elif kind == 'hardbound':
        strap = spec.get('strap', False)
        ribbon = '<div style="position:absolute; right:48px; top:0; bottom:0; width:18px; background:linear-gradient(90deg,#1e293b,#020617); box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>' if strap else ''
        inner = f"""
        <div style="position:relative; transform: rotateX(20deg) rotateZ(-8deg);">
          <div style="width:450px; height:620px; background:linear-gradient(155deg, {accent}, #0f172a); border-radius:6px 18px 18px 6px; padding:52px 46px; color:#facc15;
            box-shadow: -12px 0 0 #020617, 6px 8px 0 #f8fafc, 12px 14px 0 #cbd5e1, 26px 38px 54px rgba(15,23,42,0.38);
            display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
            {ribbon}
            <div style="font-size:11px; font-weight:800; letter-spacing:3px;">{spec.get('eyebrow','GOLD FOIL HARDBOUND')}</div>
            <div style="border-top:2px solid #facc15; border-bottom:2px solid #facc15; padding:26px 0;">
              <div style="font-family:Georgia, serif; font-size:38px; font-weight:700; color:#fef08a; line-height:1.15;">{title}</div>
              <div style="font-size:13px; color:#e2e8f0; margin-top:10px;">{spec.get('sub','Section-Sewn Archival Edition')}</div>
            </div>
            <div style="font-size:11px; color:#cbd5e1; letter-spacing:1.5px;">2026 EXECUTIVE EDITION</div>
          </div>
        </div>
        """
    elif kind == 'clipboard':
        inner = """
        <div style="position:relative; transform: rotateX(20deg) rotateZ(-6deg);">
          <div style="width:490px; height:650px; background:linear-gradient(160deg,#78350f,#451a03); border-radius:18px; padding:48px 30px 30px;
            box-shadow: 0 8px 0 #290e02, 24px 36px 50px rgba(15,23,42,0.38); position:relative;">
            <!-- Metallic Clipboard Clip -->
            <div style="position:absolute; top:8px; left:155px; width:180px; height:48px; background:linear-gradient(180deg,#f8fafc,#94a3b8); border-radius:8px; border:2px solid #475569; box-shadow: 0 6px 12px rgba(0,0,0,0.4);"></div>
            <div style="width:100%; height:100%; background:#fff; border-radius:4px; padding:34px 28px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
              <div style="font-size:18px; font-weight:900; color:#0f172a; border-bottom:2px solid #0f172a; padding-bottom:8px;">EXAMINATION BOARD PAD</div>
              <div style="margin-top:20px; display:flex; flex-direction:column; gap:22px;">
                """ + ''.join(['<div style="height:2px; background:#cbd5e1;"></div>' for _ in range(13)]) + """
              </div>
            </div>
          </div>
        </div>
        """
    else: # marksheet / question-paper / admission-form / exercise-book
        rows = ''.join([
            f'<tr><td>0{i}</td><td>{"Subject Paper " + str(i)}</td><td>100</td><td>{86+i}</td><td>A+</td></tr>'
            for i in range(1, 6)
        ])
        inner = f"""
        <div style="position:relative; transform: rotateX(22deg) rotateZ(-7deg);">
          <div style="width:500px; height:650px; background:#fffdf9; border:8px double {accent}; padding:32px;
            box-shadow: 4px 6px 0 #cbd5e1, 24px 36px 50px rgba(15,23,42,0.28); display:flex; flex-direction:column; justify-content:space-between;">
            <div style="text-align:center; border-bottom:2px solid {accent}; padding-bottom:12px;">
              <div style="font-size:10px; font-weight:800; letter-spacing:2px; color:{accent};">{spec.get('eyebrow','INSTITUTIONAL ACADEMIC PRINT')}</div>
              <div style="font-size:26px; font-weight:900; color:#0f172a; margin-top:4px;">{title}</div>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:12px; margin:16px 0;">
              <thead><tr style="background:{accent}; color:#fff;"><th style="padding:7px;">Code</th><th>Subject / Field</th><th>Max</th><th>Obt</th><th>Grade</th></tr></thead>
              <tbody>{rows}</tbody>
            </table>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#475569; font-weight:700; border-top:1px solid #cbd5e1; padding-top:12px;">
              <span>{spec.get('sub','Watermark Security Paper')}</span>
              <span>Controller of Examinations</span>
            </div>
          </div>
        </div>
        """
    return wrap_html(bg, inner)

def render_marketing(spec):
    """Brochure (tri-fold), Poster (large sheet), Catalogue (multi-page spread), Leaflet (Z-fold), Danglers (hanging die-cut), Sunboard (5mm panel)"""
    kind = spec['kind']
    bg = spec.get('bg', 'concrete')
    if kind == 'tri_fold':
        inner = f"""
        <div style="position:relative; width:860px; height:520px; display:flex; transform: rotateX(18deg) rotateZ(-6deg);">
          <div style="flex:1; background:#0f172a; color:#fff; padding:28px; transform: skewY(-4deg); box-shadow: 12px 24px 36px rgba(15,23,42,0.32); display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:10px; font-weight:800; letter-spacing:2px; color:#fda4af;">PANEL 01 • COVER</div>
            <div style="font-size:28px; font-weight:900; line-height:1.1;">CORPORATE<br/>SOLUTIONS<br/>2026</div>
            <div style="font-size:11px; color:#cbd5e1;">170 GSM Matte Coated</div>
          </div>
          <div style="flex:1; background:#ffffff; color:#0f172a; padding:28px; transform: skewY(4deg); border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1; box-shadow: 12px 24px 36px rgba(15,23,42,0.22); display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:10px; font-weight:800; color:#e11d48;">PANEL 02 • OVERVIEW</div>
            <div style="height:170px; border-radius:8px; background:linear-gradient(135deg,#e11d48,#f43f5e);"></div>
            <div style="font-size:12px; color:#475569; font-weight:600;">{spec.get('sub','Precision Creased Tri-Fold Brochure')}</div>
          </div>
          <div style="flex:1; background:#f8fafc; color:#0f172a; padding:28px; transform: skewY(-4deg); border:1px solid #cbd5e1; box-shadow: 18px 28px 42px rgba(15,23,42,0.26); display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:10px; font-weight:800; color:#0f172a;">PANEL 03 • CONTACT</div>
            <div style="font-size:20px; font-weight:900;">{spec['title']}</div>
            <div style="font-size:11px; color:#64748b;">printizer.in • PAN India</div>
          </div>
        </div>
        """
    elif kind == 'sunboard':
        inner = """
        <div style="position:relative; transform: rotateX(12deg) rotateY(-20deg);">
          <!-- Thick 5mm white PVC foam sunboard panel -->
          <div style="width:620px; height:460px; background:#0f172a; border-radius:6px; border:3px solid #ffffff;
            box-shadow: 18px -8px 0 #f8fafc, 18px -8px 0 2px #cbd5e1, 26px 38px 54px rgba(15,23,42,0.36);
            padding:42px; color:#fff; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="font-size:11px; font-weight:800; letter-spacing:2.5px; color:#facc15;">5 MM RIGID PVC FOAM BOARD</div>
            <div>
              <div style="font-size:44px; font-weight:900; line-height:1.05;">SUNBOARD<br/>SIGNAGE</div>
              <div style="font-size:15px; color:#cbd5e1; margin-top:12px;">Matte UV Vinyl Mounted • Waterproof Rigid Display</div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:800; border-top:1px solid #334155; padding-top:14px;">
              <span>CLEAN MACHINE CUT EDGES</span>
              <span style="color:#e11d48;">PRINTIZER DISPLAYS</span>
            </div>
          </div>
        </div>
        """
    elif kind == 'danglers':
        inner = """
        <div style="position:relative; display:flex; gap:52px; align-items:flex-start;">
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="width:2px; height:140px; background:#64748b;"></div>
            <div style="width:270px; height:270px; border-radius:50%; background:linear-gradient(135deg,#e11d48,#be123c); border:6px solid #fff;
              box-shadow: 0 22px 40px rgba(15,23,42,0.32); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; text-align:center; padding:24px;">
              <div style="font-size:12px; font-weight:800; letter-spacing:2px;">SPECIAL OFFER</div>
              <div style="font-size:40px; font-weight:900; margin:6px 0;">30% OFF</div>
              <div style="font-size:11px; opacity:0.9;">350 GSM Die-Cut POS Dangler</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; margin-top:40px;">
            <div style="width:2px; height:110px; background:#64748b;"></div>
            <div style="width:240px; height:300px; border-radius:16px; background:linear-gradient(135deg,#0f172a,#1e3a8a); border:6px solid #fff;
              box-shadow: 0 22px 40px rgba(15,23,42,0.32); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; text-align:center; padding:20px;">
              <div style="font-size:11px; font-weight:800; color:#facc15; letter-spacing:2px;">NEW ARRIVAL</div>
              <div style="font-size:28px; font-weight:900; margin-top:8px;">CEILING<br/>DANGLER</div>
            </div>
          </div>
        </div>
        """
    elif kind == 'poster':
        inner = """
        <div style="position:relative; transform: rotateX(14deg) rotateZ(-5deg);">
          <div style="width:480px; height:640px; background:linear-gradient(160deg,#ffffff,#f1f5f9); padding:18px;
            box-shadow: 22px 34px 50px rgba(15,23,42,0.34); border:1px solid #cbd5e1;">
            <div style="width:100%; height:100%; background:linear-gradient(145deg,#0f172a 0%, #1e3a8a 60%, #e11d48 100%);
              padding:38px; color:#fff; display:flex; flex-direction:column; justify-content:space-between;">
              <div style="font-size:11px; font-weight:800; letter-spacing:3px; color:#fda4af;">A3 / 12×18 / A2 LARGE PRINT</div>
              <div>
                <div style="font-size:52px; font-weight:900; line-height:0.98;">DESIGN.<br/>PRINT.<br/>INSPIRE.</div>
                <div style="font-size:14px; color:#e2e8f0; margin-top:16px;">170 GSM Glossy Wall Poster Printing</div>
              </div>
              <div style="font-size:11px; font-weight:700; border-top:1px solid rgba(255,255,255,0.25); padding-top:12px;">300 DPI CMYK STUDIO OUTPUT</div>
            </div>
          </div>
        </div>
        """
    else: # catalogue
        inner = """
        <div style="position:relative; transform: rotateX(22deg) rotateZ(-6deg);">
          <div style="width:760px; height:490px; background:#fff; border-radius:6px; border:1px solid #cbd5e1;
            box-shadow: 0 8px 0 #cbd5e1, 24px 36px 52px rgba(15,23,42,0.32); display:grid; grid-template-columns:1fr 1fr; overflow:hidden;">
            <div style="background:#0f172a; color:#fff; padding:34px; display:flex; flex-direction:column; justify-content:space-between;">
              <div style="font-size:10px; font-weight:800; letter-spacing:2px; color:#facc15;">2026 PRODUCT LOOKBOOK</div>
              <div style="font-size:32px; font-weight:900; line-height:1.1;">COMMERCIAL<br/>CATALOGUE<br/>PRINTING</div>
              <div style="font-size:11px; color:#cbd5e1;">Perfect Bound • Smyth Sewn</div>
            </div>
            <div style="padding:28px; display:grid; grid-template-columns:1fr 1fr; gap:14px; background:#f8fafc;">
              <div style="background:#e2e8f0; border-radius:8px; padding:12px; font-size:11px; font-weight:800; color:#0f172a;">01 STATIONERY</div>
              <div style="background:#ffe4e6; border-radius:8px; padding:12px; font-size:11px; font-weight:800; color:#be123c;">02 PACKAGING</div>
              <div style="background:#dbeafe; border-radius:8px; padding:12px; font-size:11px; font-weight:800; color:#1e40af;">03 MARKETING</div>
              <div style="background:#fef3c7; border-radius:8px; padding:12px; font-size:11px; font-weight:800; color:#92400e;">04 LABELS</div>
            </div>
          </div>
        </div>
        """
    return wrap_html(bg, inner)

# Exact 1-to-1 generator specs for all 109 remaining slugs
SPECS = {
    # 6 remaining Business Stationery books & employee badge
    'quotation-book': lambda: render_book_pad({'title':'QUOTATION', 'subtitle':'ESTIMATE & COMMERCIAL PROPOSAL BOOK', 'spine':'#0f766e', 'accent':'#0d9488', 'dup':'#ccfbf1', 'cols':['SR.','DESCRIPTION OF WORK / ITEM','QTY','UNIT RATE','TOTAL (₹)'], 'meta':[('Quotation No','QT-2026-084'),('Valid Until','15 Days')], 'bg':'concrete', 'serial':'0842'}),
    'invoice-book': lambda: render_book_pad({'title':'TAX INVOICE', 'subtitle':'GST BILLING BOOK • ORIGINAL FOR RECIPIENT', 'spine':'#1e3a8a', 'accent':'#1d4ed8', 'dup':'#fce7f3', 'cols':['HSN','GOODS / SERVICE DESCRIPTION','QTY','GST %','TAXABLE (₹)'], 'meta':[('GSTIN','24AAACP1234F1Z8'),('Invoice Date','25/11/2026')], 'bg':'oak', 'serial':'1104', 'totals':'Grand Total (incl. GST):'}),
    'delivery-challan-book': lambda: render_book_pad({'title':'DELIVERY CHALLAN', 'subtitle':'GOODS DISPATCH & LOGISTICS RECEIPT', 'spine':'#92400e', 'accent':'#d97706', 'dup':'#fef3c7', 'cols':['SR.','DESCRIPTION OF GOODS','PKG','QTY SENT','REMARKS'], 'meta':[('Vehicle No','GJ-05-AB-4421'),('LR / Transport','Direct Dispatch')], 'bg':'travertine', 'serial':'0319', 'totals':'Total Packages:'}),
    'purchase-order-book': lambda: render_book_pad({'title':'PURCHASE ORDER', 'subtitle':'VENDOR PROCUREMENT & SUPPLY ORDER PAD', 'spine':'#312e81', 'accent':'#4f46e5', 'dup':'#e0e7ff', 'cols':['CODE','ITEM SPECIFICATION','UOM','ORDER QTY','EST. VALUE'], 'meta':[('Supplier','Apex Paper Mills'),('Delivery By','30/11/2026')], 'bg':'linen', 'serial':'0573', 'totals':'PO Order Total:'}),
    'payment-voucher': lambda: render_book_pad({'title':'PAYMENT VOUCHER', 'subtitle':'CASH / BANK DISBURSEMENT VOUCHER PAD', 'spine':'#881337', 'accent':'#be123c', 'dup':'#ffe4e6', 'cols':['HEAD','PAID TO / PARTICULARS','MODE','REF NO','DEBIT (₹)'], 'meta':[('Paid To','Vendor Logistics'),('Mode','NEFT / Cash')], 'bg':'concrete', 'serial':'0218', 'side_spine':True}),
    'employee-id-card': lambda: render_photo_gift({'kind':'pvc', 'emp':True, 'bg':'travertine'}),

    # 6 remaining Marketing & Advertising
    'brochure': lambda: render_marketing({'kind':'tri_fold', 'title':'TRI-FOLD BROCHURE', 'sub':'170 GSM Silk Matte • Sharp Creased Folds', 'bg':'concrete'}),
    'poster': lambda: render_marketing({'kind':'poster', 'title':'POSTER', 'bg':'white_studio'}),
    'catalogue': lambda: render_marketing({'kind':'catalogue', 'title':'CATALOGUE', 'bg':'travertine'}),
    'leaflet': lambda: render_marketing({'kind':'tri_fold', 'title':'Z-FOLD LEAFLET', 'sub':'130 GSM Art Paper • Accordion Fold', 'bg':'oak'}),
    'danglers': lambda: render_marketing({'kind':'danglers', 'title':'DANGLERS', 'bg':'white_studio'}),
    'sunboard-printing': lambda: render_marketing({'kind':'sunboard', 'title':'SUNBOARD', 'bg':'concrete'}),

    # 7 remaining Books & Publications
    'notebook': lambda: render_notebook_diary({'kind':'spiral', 'title':'EXECUTIVE NOTEBOOK', 'accent':'#1e293b', 'bg':'oak'}),
    'pub-school-diary': lambda: render_notebook_diary({'kind':'hardbound', 'title':'SCHOOL ALMANAC DIARY', 'eyebrow':'INSTITUTIONAL HARDBOUND', 'sub':'Daily Timetable & Parent-Teacher Log', 'accent':'#1d4ed8', 'bg':'white_studio'}),
    'office-diary': lambda: render_notebook_diary({'kind':'hardbound', 'title':'CORPORATE DIARY', 'eyebrow':'LEATHERETTE YEAR PLANNER', 'sub':'Gold Foil Border & Elastic Band Closure', 'accent':'#7c2d12', 'strap':True, 'bg':'travertine'}),
    'exercise-book': lambda: render_notebook_diary({'kind':'spiral', 'title':'EXERCISE COPYBOOK', 'eyebrow':'CENTER-STAPLED SCHOOL BOOK', 'sub':'High-Opacity 70 GSM Ruled Sheets', 'accent':'#047857', 'bg':'linen'}),
    'e-book-printing': lambda: render_notebook_diary({'kind':'hardbound', 'title':'PRINT-ON-DEMAND BOOK', 'eyebrow':'TRADE PAPERBACK EDITION', 'sub':'80 GSM Cream Maplitho Interior', 'accent':'#334155', 'bg':'concrete'}),
    'project-report': lambda: render_notebook_diary({'kind':'spiral', 'title':'PROJECT REPORT 2026', 'eyebrow':'FROSTED ACETATE COVER', 'sub':'Thermal Spiral Bound Presentation', 'frosted':True, 'bg':'white_studio'}),
    'thesis-printing': lambda: render_notebook_diary({'kind':'hardbound', 'title':'DISSERTATION & THESIS', 'eyebrow':'BUCKRAM GOLD EMBOSSED', 'sub':'Archival Doctoral Binding', 'accent':'#881337', 'bg':'travertine'}),

    # 6 remaining Wedding & Invitations
    'birthday-invitation': lambda: render_invitation({'title':'Birthday Celebration', 'subtitle':'Join us for cake, laughter & evening festivities', 'card_bg':'#fff1f2', 'border':'#e11d48', 'text':'#881337', 'env_bg':'#be123c', 'eyebrow':'BIRTHDAY INVITE SUITE', 'bg':'white_studio'}),
    'anniversary-invitation': lambda: render_invitation({'title':'25th Silver Jubilee', 'subtitle':'Celebrating twenty-five wonderful years together', 'card_bg':'#f8fafc', 'border':'#64748b', 'text':'#0f172a', 'env_bg':'#334155', 'eyebrow':'SILVER FOIL ANNIVERSARY', 'bg':'travertine'}),
    'save-the-date-card': lambda: render_invitation({'title':'Save The Date', 'subtitle':'Rohan & Ananya • Udaipur Destination Suite', 'card_bg':'#f0fdf4', 'border':'#15803d', 'text':'#14532d', 'env_bg':'#166534', 'eyebrow':'BOTANICAL COTTON CARD', 'bg':'linen'}),
    'thank-you-card': lambda: render_invitation({'title':'With Gratitude', 'subtitle':'Thank you for making our celebration unforgettable', 'card_bg':'#fffbeb', 'border':'#b45309', 'text':'#451a03', 'env_bg':'#92400e', 'eyebrow':'350 GSM EMBOSSED CARD', 'bg':'oak'}),
    'greeting-card': lambda: render_invitation({'title':'Warm Wishes', 'subtitle':'Festive Corporate & Family Greetings Collection', 'card_bg':'#eff6ff', 'border':'#1d4ed8', 'text':'#1e3a8a', 'env_bg':'#1e40af', 'eyebrow':'FOLDED GREETING CARD', 'bg':'concrete'}),
    'religious-invitation-card': lambda: render_invitation({'title':'Shubh Nimantran', 'subtitle':'Cordially inviting your family for sacred ceremony', 'card_bg':'#fff7ed', 'border':'#c2410c', 'text':'#7c2d12', 'env_bg':'#9a3412', 'eyebrow':'TRADITIONAL MANDALA SUITE', 'bg':'warm_ivory'}),

    # 7 remaining Packaging Printing
    'cake-box': lambda: render_packaging({'kind':'cake_box', 'title':'CAKE BOX', 'bg':'white_studio'}),
    'food-packaging': lambda: render_packaging({'kind':'food_pkg', 'title':'FOOD PACKAGING', 'bg':'oak'}),
    'pkg-product-label': lambda: render_sticker({'kind':'default', 'title':'PRODUCT LABEL', 'eyebrow':'JAR & BOTTLE ROLL', 'sub':'Oil & Moisture Proof Stock', 'accent':'#047857', 'shape_css':'border-radius:16px;', 'bg':'warm_ivory'}),
    'sticker-label': lambda: render_sticker({'kind':'default', 'title':'KISS-CUT LABEL', 'eyebrow':'EASY-PEEL SHEET', 'sub':'Vivid Full-Color Print', 'accent':'#4f46e5', 'shape_css':'border-radius:28px;', 'bg':'white_studio'}),
    'barcode-label': lambda: render_sticker({'kind':'barcode', 'title':'BARCODE', 'bg':'concrete'}),
    'hang-tag': lambda: render_packaging({'kind':'hang_tag', 'title':'HANG TAG', 'bg':'travertine'}),
    'product-sleeve': lambda: render_packaging({'kind':'sleeve', 'title':'PRODUCT SLEEVE', 'bg':'linen'}),

    # 8 remaining Labels & Stickers
    'round-sticker': lambda: render_sticker({'kind':'default', 'title':'ROUND STICKER', 'eyebrow':'CUSTOM CIRCLE DIE-CUT', 'sub':'Crisp Vinyl & Matte Options', 'accent':'#e11d48', 'shape_css':'border-radius:50%;', 'bg':'concrete'}),
    'square-sticker': lambda: render_sticker({'kind':'default', 'title':'SQUARE STICKER', 'eyebrow':'CLEAN 90° CUT CORNERS', 'sub':'3.5 × 3.5 Inch Sticker', 'accent':'#1e3a8a', 'shape_css':'border-radius:8px;', 'bg':'oak'}),
    'transparent-sticker': lambda: render_sticker({'kind':'transparent', 'title':'CLEAR', 'bg':'linen'}),
    'waterproof-sticker': lambda: render_sticker({'kind':'waterproof', 'title':'WATERPROOF', 'bg':'white_studio'}),
    'logo-sticker': lambda: render_sticker({'kind':'default', 'title':'BRAND LOGO', 'eyebrow':'CONTOUR CUT VINYL', 'sub':'Custom Logo Branding', 'accent':'#0f172a', 'shape_css':'border-radius:42% 58% 70% 30% / 45% 45% 55% 55%;', 'bg':'travertine'}),
    'qr-code-sticker': lambda: render_sticker({'kind':'qr', 'title':'QR STICKER', 'accent':'#0f172a', 'bg':'concrete'}),
    'lbl-product-label': lambda: render_sticker({'kind':'default', 'title':'BRAND LABEL', 'eyebrow':'POUCH & BOX ADHESIVE', 'sub':'Permanent High-Tack Glue', 'accent':'#b45309', 'shape_css':'border-radius:18px;', 'bg':'warm_ivory'}),
    'warning-label': lambda: render_sticker({'kind':'warning', 'title':'WARNING', 'bg':'concrete'}),

    # 7 remaining Photo & Digital Printing
    'photo-printing': lambda: render_photo_gift({'kind':'photo_prints', 'bg':'concrete'}),
    'passport-size-photo': lambda: render_photo_gift({'kind':'passport', 'bg':'white_studio'}),
    'photo-frame': lambda: render_photo_gift({'kind':'frame', 'bg':'linen'}),
    'canvas-printing': lambda: render_photo_gift({'kind':'canvas', 'bg':'concrete'}),
    'customized-photo-mug': lambda: render_photo_gift({'kind':'mug', 'bg':'oak'}),
    'personalized-gifts': lambda: render_photo_gift({'kind':'gifts', 'bg':'travertine'}),
    'pvc-card-printing': lambda: render_photo_gift({'kind':'pvc', 'emp':False, 'bg':'white_studio'}),

    # 8 remaining School & Educational
    'edu-school-diary': lambda: render_notebook_diary({'kind':'hardbound', 'title':'STUDENT DIARY', 'eyebrow':'2026-27 ACADEMIC PLANNER', 'sub':'Custom School Crest & Rules Pages', 'accent':'#0f766e', 'bg':'concrete'}),
    'marksheet': lambda: render_notebook_diary({'kind':'form', 'title':'ACADEMIC MARKSHEET', 'eyebrow':'SECURITY BORDER RESULT CARD', 'sub':'Anti-Copy Micro-Text Stock', 'accent':'#1e3a8a', 'bg':'white_studio'}),
    'question-paper': lambda: render_notebook_diary({'kind':'form', 'title':'QUESTION PAPER', 'eyebrow':'BOARD EXAM PRINTING', 'sub':'Confidential Sealed Pack Printing', 'accent':'#0f172a', 'bg':'linen'}),
    'admission-form': lambda: render_notebook_diary({'kind':'form', 'title':'ADMISSION FORM', 'eyebrow':'INSTITUTIONAL ENROLMENT', 'sub':'2-Page Application & Fee Slip', 'accent':'#be123c', 'bg':'travertine'}),
    'school-prospectus': lambda: render_notebook_diary({'kind':'hardbound', 'title':'SCHOOL PROSPECTUS', 'eyebrow':'GLOSSY BROCHURE BOOKLET', 'sub':'Center-Pinned & Perfect Bound', 'accent':'#0284c7', 'bg':'oak'}),
    'exam-pad': lambda: render_notebook_diary({'kind':'clipboard', 'title':'EXAM PAD', 'bg':'white_studio'}),
    'student-notebook': lambda: render_notebook_diary({'kind':'spiral', 'title':'STUDENT NOTEBOOK', 'eyebrow':'SINGLE & DOUBLE LINE', 'sub':'180 Pages Bright Ruled Book', 'accent':'#4f46e5', 'bg':'concrete'}),
    'school-calendar': lambda: render_notebook_diary({'kind':'form', 'title':'ACADEMIC CALENDAR', 'eyebrow':'ANNUAL EVENTS & HOLIDAYS', 'sub':'Wall & Desk Wiro Calendar', 'accent':'#047857', 'bg':'warm_ivory'}),

    # 8 remaining Restaurant & Hotel
    'food-menu': lambda: render_hospitality({'kind':'menu', 'trifold':False, 'bg':'oak'}),
    'table-tent-card': lambda: render_hospitality({'kind':'table_tent', 'bg':'travertine'}),
    'rest-bill-book': lambda: render_book_pad({'title':'GUEST BILL / KOT', 'subtitle':'RESTAURANT ORDER & TABLE BILLING PAD', 'spine':'#0f172a', 'accent':'#e11d48', 'dup':'#fef08a', 'cols':['ITEM','DISH NAME','PORTION','RATE','AMOUNT'], 'meta':[('Table No','T-08'),('Steward','Vikram')], 'bg':'oak', 'serial':'5512'}),
    'parcel-sticker': lambda: render_sticker({'kind':'default', 'title':'TAMPER SEAL', 'eyebrow':'DELIVERY PARCEL SEAL', 'sub':'Packed Fresh • Safe & Sealed', 'accent':'#059669', 'shape_css':'border-radius:12px;', 'bg':'white_studio'}),
    'rest-food-label': lambda: render_sticker({'kind':'default', 'title':'100% FRESH FOOD', 'eyebrow':'KITCHEN CONTAINER LABEL', 'sub':'Best Before / Prep Timestamp', 'accent':'#d97706', 'shape_css':'border-radius:50%;', 'bg':'oak'}),
    'takeaway-menu': lambda: render_hospitality({'kind':'menu', 'trifold':True, 'bg':'concrete'}),
    'hotel-key-card': lambda: render_hospitality({'kind':'hotel_key', 'bg':'linen'}),
    'room-service-card': lambda: render_hospitality({'kind':'door_hanger', 'bg':'travertine'}),

    # 16 Visiting Card & Premium Card variants
    '250-gsm-art-card': lambda: render_visiting_card({'card_bg':'#ffffff', 'text':'#0f172a', 'accent':'#2563eb', 'back_bg':'#1e3a8a', 'back_text':'#ffffff', 'layers':6, 'label':'250 GSM ART CARD', 'rounded':'4px', 'bg':'concrete'}),
    '250-gsm-art-card-lamination': lambda: render_visiting_card({'card_bg':'#be123c', 'text':'#ffffff', 'accent':'#fde047', 'back_bg':'#ffffff', 'back_text':'#0f172a', 'layers':7, 'uv':True, 'label':'250 GSM + GLOSS LAM', 'rounded':'4px', 'bg':'white_studio'}),
    '350-gsm-matt-card': lambda: render_visiting_card({'card_bg':'#1e293b', 'text':'#ffffff', 'accent':'#38bdf8', 'back_bg':'#f8fafc', 'back_text':'#0f172a', 'layers':9, 'label':'350 GSM MATT CARD', 'rounded':'6px', 'bg':'travertine'}),
    '500-gsm-matt-card-uv': lambda: render_visiting_card({'card_bg':'#0f172a', 'text':'#ffffff', 'accent':'#f43f5e', 'back_bg':'#ffffff', 'back_text':'#0f172a', 'layers':13, 'uv':True, 'label':'500 GSM MATT + UV', 'rounded':'6px', 'bg':'oak'}),
    '400-gsm-round-cut-drip-off-uv': lambda: render_visiting_card({'card_bg':'#0f766e', 'text':'#ffffff', 'accent':'#facc15', 'back_bg':'#115e59', 'back_text':'#ffffff', 'layers':11, 'uv':True, 'rounded':'22px', 'label':'400 GSM ROUND DRIP-OFF', 'bg':'linen'}),
    'drip-off-nt': lambda: render_visiting_card({'card_bg':'#312e81', 'text':'#ffffff', 'accent':'#f472b6', 'back_bg':'#1e1b4b', 'back_text':'#ffffff', 'layers':8, 'uv':True, 'rounded':'14px', 'label':'DRIP-OFF NON-TEARABLE', 'bg':'concrete'}),
    'gold-foil-s-s-350-gsm-matt': lambda: render_visiting_card({'card_bg':'#020617', 'text':'#f8fafc', 'accent':'#facc15', 'back_bg':'#1e293b', 'back_text':'#facc15', 'layers':10, 'foil':'gold', 'label':'350 GSM GOLD FOIL S/S', 'rounded':'6px', 'bg':'dark_slate'}),
    'premium-visiting-card-pre-nt-coating-87x51mm': lambda: render_visiting_card({'card_bg':'#ffffff', 'text':'#0f172a', 'accent':'#059669', 'back_bg':'#064e3b', 'back_text':'#ffffff', 'layers':7, 'uv':True, 'rounded':'12px', 'label':'PRE NT + COATING', 'bg':'white_studio'}),
    'premium-visiting-card-pre-250-gsm-art': lambda: render_visiting_card({'card_bg':'#f8fafc', 'text':'#0f172a', 'accent':'#ea580c', 'back_bg':'#9a3412', 'back_text':'#ffffff', 'layers':6, 'rounded':'4px', 'label':'PRE 250 GSM ART', 'bg':'warm_ivory'}),
    'premium-visiting-card-pre-250-gsm-art-uv-coating': lambda: render_visiting_card({'card_bg':'#1e40af', 'text':'#ffffff', 'accent':'#fde047', 'back_bg':'#eff6ff', 'back_text':'#1e3a8a', 'layers':7, 'uv':True, 'rounded':'6px', 'label':'PRE 250 GSM + UV', 'bg':'concrete'}),
    'premium-visiting-card-pre-350-gsm-matt': lambda: render_visiting_card({'card_bg':'#334155', 'text':'#ffffff', 'accent':'#fb7185', 'back_bg':'#f1f5f9', 'back_text':'#0f172a', 'layers':9, 'rounded':'6px', 'label':'PRE 350 GSM MATT', 'bg':'oak'}),
    'premium-visiting-card-pre-350-gsm-matt-uv': lambda: render_visiting_card({'card_bg':'#18181b', 'text':'#ffffff', 'accent':'#a855f7', 'back_bg':'#faf5ff', 'back_text':'#3b0764', 'layers':10, 'uv':True, 'rounded':'8px', 'label':'PRE 350 GSM + UV', 'bg':'travertine'}),
    'premium-visiting-card-velvet-uv-500-gsm-500-nos': lambda: render_visiting_card({'card_bg':'#4c0519', 'text':'#fff1f2', 'accent':'#fda4af', 'back_bg':'#881337', 'back_text':'#ffffff', 'layers':14, 'uv':True, 'rounded':'10px', 'label':'500 GSM VELVET + UV', 'bg':'linen'}),
    'premium-visiting-card-velvet-s-s-foil-500-gsm-500-nos': lambda: render_visiting_card({'card_bg':'#042f2e', 'text':'#f0fdfa', 'accent':'#facc15', 'back_bg':'#134e4a', 'back_text':'#facc15', 'layers':14, 'foil':'gold', 'rounded':'8px', 'label':'500 GSM VELVET + FOIL', 'bg':'dark_slate'}),
    'premium-visiting-card-matt-500-gsm-s-s-foil-500-nos': lambda: render_visiting_card({'card_bg':'#172554', 'text':'#ffffff', 'accent':'#e2e8f0', 'back_bg':'#0f172a', 'back_text':'#e2e8f0', 'layers':14, 'foil':'silver', 'rounded':'6px', 'label':'500 GSM MATT + SILVER FOIL', 'bg':'concrete'}),
    'premium-visiting-card-matt-800-gsm-uv-500-nos': lambda: render_visiting_card({'card_bg':'#09090b', 'text':'#ffffff', 'accent':'#e11d48', 'back_bg':'#ffffff', 'back_text':'#09090b', 'layers':20, 'edge':'#e11d48', 'uv':True, 'rounded':'6px', 'label':'800 GSM DUPLEX UV', 'bg':'travertine'}),

    # 6 Letterhead GSM & Size variants
    '80-gsm-sunshine-210x285mm': lambda: render_letterhead_sheet({'brand':'SUNSHINE SYSTEMS', 'accent':'#0f172a', 'highlight':'#e11d48', 'paper':'#ffffff', 'thickness':7, 'spec_tag':'80 GSM SUNSHINE • 210 × 285 MM', 'bg':'oak'}),
    '80-gsm-sunshine-210x297mm': lambda: render_letterhead_sheet({'brand':'APEX ARCHITECTS', 'accent':'#1e3a8a', 'highlight':'#0284c7', 'paper':'#f8fafc', 'thickness':7, 'spec_tag':'80 GSM SUNSHINE • A4 (210 × 297 MM)', 'bg':'concrete'}),
    '100-gsm-alabaster-210x297mm': lambda: render_letterhead_sheet({'brand':'KAVERI JEWELLERS', 'accent':'#78350f', 'highlight':'#d97706', 'paper':'#fffdf7', 'thickness':10, 'spec_tag':'100 GSM ALABASTER • A4 (210 × 297 MM)', 'bg':'linen'}),
    '100-gsm-sunshine-210x297mm': lambda: render_letterhead_sheet({'brand':'VORTEX LOGISTICS', 'accent':'#064e3b', 'highlight':'#10b981', 'paper':'#ffffff', 'thickness':10, 'spec_tag':'100 GSM SUNSHINE • A4 (210 × 297 MM)', 'bg':'travertine'}),
    '80-gsm-bond-210x297mm': lambda: render_letterhead_sheet({'brand':'MERIDIAN LEGAL LLP', 'accent':'#18181b', 'highlight':'#be123c', 'paper':'#fdfcf9', 'thickness':8, 'spec_tag':'80 GSM EXECUTIVE BOND • A4', 'bg':'white_studio'}),
    '100-gsm-bond-210x297mm': lambda: render_letterhead_sheet({'brand':'AURELIA CAPITAL', 'accent':'#312e81', 'highlight':'#6366f1', 'paper':'#fefdfb', 'thickness':11, 'spec_tag':'100 GSM EXECUTIVE BOND • A4', 'bg':'oak'}),

    # 8 Envelope / Cover variants
    '7x4-size-100-gsm-alabaster': lambda: render_envelope({'w':490, 'h':280, 'paper':'#fffdf8', 'flap':'#f8f4ea', 'accent':'#78350f', 'size_label':'7" × 4" COMPACT', 'stock':'100 GSM Alabaster', 'bg':'oak'}),
    '7x4-size-100-gsm-ssp': lambda: render_envelope({'w':490, 'h':280, 'paper':'#ffffff', 'flap':'#f1f5f9', 'accent':'#e11d48', 'size_label':'7" × 4" COMPACT', 'stock':'100 GSM Smooth SSP', 'bg':'concrete'}),
    '9-5x4-25-size-100-gsm-alabaster': lambda: render_envelope({'w':620, 'h':278, 'paper':'#fffdf7', 'flap':'#f5efe4', 'accent':'#0f766e', 'size_label':'9.5" × 4.25" DL', 'stock':'100 GSM Alabaster', 'bg':'linen'}),
    '9-5x4-25-size-100-gsm-ssp': lambda: render_envelope({'w':620, 'h':278, 'paper':'#ffffff', 'flap':'#f8fafc', 'accent':'#1d4ed8', 'size_label':'9.5" × 4.25" DL', 'stock':'100 GSM Smooth SSP', 'bg':'travertine'}),
    '9-5x4-25-size-100-gsm-excel-bond': lambda: render_envelope({'w':620, 'h':278, 'paper':'#fefdfb', 'flap':'#f3f0e8', 'accent':'#312e81', 'size_label':'9.5" × 4.25" DL', 'stock':'100 GSM Excel Bond', 'bg':'white_studio'}),
    '11x5-size-100-gsm-ssp': lambda: render_envelope({'w':670, 'h':305, 'paper':'#ffffff', 'flap':'#f1f5f9', 'accent':'#0f172a', 'size_label':'11" × 5" A4-FOLD', 'stock':'100 GSM Smooth SSP', 'bg':'concrete'}),
    '11x5-size-100-gsm-alabaster': lambda: render_envelope({'w':670, 'h':305, 'paper':'#fffdf8', 'flap':'#f6f0e4', 'accent':'#be123c', 'size_label':'11" × 5" A4-FOLD', 'stock':'100 GSM Alabaster', 'bg':'oak'}),
    'window-cover-9-5x4-25-size-100-gsm-alabaster': lambda: render_envelope({'w':630, 'h':285, 'paper':'#ffffff', 'flap':'#f8fafc', 'accent':'#0f172a', 'window':True, 'flap_top':False, 'size_label':'9.5" × 4.25"', 'stock':'100 GSM Alabaster', 'bg':'travertine'}),

    # 8 Art Mix 250/350 & Art Paper 100/130/170 variants
    '250-gsm-art-210x285mm': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'250 GSM ART SHEET', 'accent':'#0f172a', 'highlight':'#3b82f6', 'thickness':13, 'gloss':False, 'spec_tag':'250 GSM ART CARD (210 × 285 MM)', 'bg':'concrete'}),
    '250-gsm-art-lamination-210x285mm': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'250 GSM + LAMINATION', 'accent':'#881337', 'highlight':'#e11d48', 'thickness':14, 'gloss':True, 'spec_tag':'250 GSM + GLOSS LAM (210 × 285 MM)', 'bg':'white_studio'}),
    '250-gsm-art-per-sq-in': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'250 GSM CUSTOM SIZE', 'accent':'#064e3b', 'highlight':'#10b981', 'thickness':13, 'gloss':False, 'spec_tag':'250 GSM ART (PER SQ. INCH)', 'bg':'oak'}),
    '250-gsm-art-lamination-per-sq-in': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'LAMINATED CUSTOM CUT', 'accent':'#1e3a8a', 'highlight':'#06b6d4', 'thickness':14, 'gloss':True, 'spec_tag':'250 GSM + LAMINATION (SQ. IN)', 'bg':'travertine'}),
    '350-gsm-matt-lamination-per-sq-in': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'350 GSM MATT BOARD', 'accent':'#18181b', 'highlight':'#71717a', 'thickness':17, 'gloss':False, 'spec_tag':'350 GSM MATT LAM (PER SQ. IN)', 'bg':'linen'}),
    '100-gsm-art-paper-210x285mm': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'100 GSM ART PAPER', 'accent':'#0284c7', 'highlight':'#38bdf8', 'thickness':7, 'gloss':True, 'spec_tag':'100 GSM GLOSS ART (210 × 285 MM)', 'bg':'white_studio'}),
    '130-gsm-art-paper-210x285mm': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'130 GSM ART PAPER', 'accent':'#7c2d12', 'highlight':'#f97316', 'thickness':9, 'gloss':True, 'spec_tag':'130 GSM GLOSS ART (210 × 285 MM)', 'bg':'concrete'}),
    '170-gsm-art-paper-210x285mm': lambda: render_letterhead_sheet({'mode':'artpaper', 'brand':'170 GSM ART PAPER', 'accent':'#4c1d95', 'highlight':'#8b5cf6', 'thickness':11, 'gloss':True, 'spec_tag':'170 GSM BROCHURE ART (210 × 285 MM)', 'bg':'travertine'}),

    # 6 Sticker variants from printizer-main
    'hm-sticker': lambda: render_sticker({'kind':'default', 'title':'HM STICKER', 'eyebrow':'HIGH-MOLECULAR SYNTHETIC', 'sub':'Tear-Resistant Standard Cut', 'accent':'#0f766e', 'shape_css':'border-radius:20px;', 'bg':'oak'}),
    'hm-sticker-uv-lamination': lambda: render_sticker({'kind':'waterproof', 'title':'HM + UV STICKER', 'bg':'travertine'}),
    'silver-metallic-drip-off-uv': lambda: render_sticker({'kind':'default', 'title':'SILVER METALLIC', 'eyebrow':'BRUSHED FOIL + DRIP-OFF UV', 'sub':'Luxury Metallic Mirror Base', 'metallic':True, 'shape_css':'border-radius:50%;', 'bg':'dark_slate'}),
    'every-sticker': lambda: render_sticker({'kind':'default', 'title':'EVERY STICKER', 'eyebrow':'COMMERCIAL PAPER LABEL', 'sub':'Crisp Offset Print Finish', 'accent':'#2563eb', 'shape_css':'border-radius:14px;', 'bg':'concrete'}),
    'every-sticker-lamination': lambda: render_sticker({'kind':'default', 'title':'EVERY + LAMINATION', 'eyebrow':'GLOSS PROTECTED STICKER', 'sub':'Scuff & Splash Resistant', 'accent':'#9333ea', 'shape_css':'border-radius:26px;', 'bg':'white_studio'}),
    'pvc-sticker-lamination': lambda: render_sticker({'kind':'transparent', 'title':'PVC STICKER', 'bg':'dark_slate'}),

    # 2 Box variants from printizer-main
    '320-gsm-ultima-uv-lamination': lambda: render_packaging({'kind':'ultima', 'title':'320 GSM ULTIMA + UV', 'accent':'#1e3a8a', 'dripoff':False, 'bg':'white_studio'}),
    '320-gsm-ultima-drip-off-uv': lambda: render_packaging({'kind':'ultima', 'title':'320 GSM DRIP-OFF UV', 'accent':'#881337', 'dripoff':True, 'bg':'linen'}),
}

def main():
    print(f"Rendering {len(SPECS)} unique 3D commercial product studio photos...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1200, 'height': 900}, device_scale_factor=1.5)
        tmp_png = os.path.join(BASE_DIR, 'scripts', '_tmp_studio.png')
        count = 0
        for slug, fn in SPECS.items():
            html = fn()
            page.set_content(html, wait_until='load')
            page.screenshot(path=tmp_png)
            im = Image.open(tmp_png).convert('RGB')
            im = ImageOps.fit(im, (1000, 750), method=Image.Resampling.LANCZOS)
            out_webp = os.path.join(PUBLIC_PRODS, f'{slug}.webp')
            im.save(out_webp, 'WEBP', quality=86, method=6)
            count += 1
            if count % 20 == 0 or count == len(SPECS):
                print(f"  Rendered {count}/{len(SPECS)} -> {slug}.webp")
        if os.path.exists(tmp_png):
            os.remove(tmp_png)
        browser.close()
    print("DONE rendering all 109 bespoke studio product photographs!")

if __name__ == '__main__':
    main()
