import urllib.request
import re

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=20).read().decode('utf-8', errors='ignore')

html = fetch('https://madhuramprint.com/home')
scripts = re.findall(r'src=["\']([^"\']*main[^"\']*\.js)["\']', html)
print('Main scripts:', scripts)
if scripts:
    js_url = 'https://madhuramprint.com/' + scripts[0].lstrip('/')
    js = fetch(js_url)
    print('JS length:', len(js))
    for kw in ['Latter Ped', 'Gold Foil', 'Spot UV', 'Foil', 'Select Printing', '320 gsm Ultima', 'VISITING_CARD', 'ART_PAPER']:
        idx = js.find(kw)
        print(f'=== {kw} (idx={idx}) ===')
        if idx != -1:
            print(js[max(0, idx-120):idx+250])
