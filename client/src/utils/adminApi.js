import * as XLSX from 'xlsx';

export const ORDERS_STORAGE_KEY = 'prz_custom_orders';
export const PROMOS_STORAGE_KEY = 'prz_custom_promotions';
export const SETTINGS_STORAGE_KEY = 'prz_custom_settings';

export async function adminFetch(url, options = {}, token = '') {
  const authToken = token || localStorage.getItem('prz_admin_token') || '';
  const headers = {
    ...(options.headers || {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
  };
  return fetch(url, { ...options, headers });
}

export function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function exportRowsToExcel(rows, sheetName, filename) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function exportRowsToCsv(rows, filename) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
