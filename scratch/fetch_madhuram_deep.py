import urllib.request
import re

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=20).read().decode('utf-8', errors='ignore')

html = fetch('https://madhuramprint.com/home')
scripts = re.findall(r'src=["\']([^"\']*\.js)["\']', html)
print('Scripts:', scripts)
for s in scripts:
    if 'main' in s:
        js_url = 'https://madhuramprint.com/' + s.lstrip('/')
        js = fetch(js_url)
        print('Main JS len:', len(js))
        for kw in ['NT CARD', 'VISITING_CARD', 'Gold Foil', 'Spot UV', 'Both Side', '330']:
            m = re.search(re.escape(kw), js)
            print(f'--- {kw} @ {m.start() if m else -1} ---')
            if m:
                print(js[max(0, m.start()-150):m.start()+350])
        chunks = re.findall(r'["\'](\d+\.[a-f0-9]+\.js)["\']', js)
        print('Lazy chunks:', chunks[:30])
