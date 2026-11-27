import urllib.request
import re

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')

html = fetch('https://madhuramprint.com/home')
links = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.S | re.I)

print("=== MADHURAM HOME LINKS ===")
seen = set()
for href, body in links:
    txt = re.sub(r'<[^>]+>', ' ', body)
    txt = ' '.join(txt.split())
    if any(k in href.lower() for k in ['product', 'order', 'add', 'cat', 'visiting', 'letter', 'bill', 'sticker', 'art']):
        key = (txt, href)
        if key not in seen:
            seen.add(key)
            print(f"  {txt[:45]} -> {href}")
