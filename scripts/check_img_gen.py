import json
with open('C:/Users/Mo ali khanusiya/.gemini/antigravity/brain/ef3ac2fa-6176-4468-bcec-1c4a12a34ec1/.system_generated/logs/transcript.jsonl', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i < 15:
            d = json.loads(line)
            t = d.get('type')
            print(f"Step {i}: {t} - {d.get('source')}")
            if 'call' in d:
                print("   call:", d['call'].get('name'))
                print("   args:", list(d['call'].get('args', {}).keys()))
