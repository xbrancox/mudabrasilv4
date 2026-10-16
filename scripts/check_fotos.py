import json

# Check candidatos-2026.json
with open('data/candidatos-2026.json', encoding='utf-8') as f:
    d1 = json.load(f)
cands1 = d1.get('candidatos', [])
pres1 = [c for c in cands1 if c.get('cargo') == 1]
print(f"=== candidatos-2026.json ===")
print(f"Total: {len(cands1)}, Presidentes: {len(pres1)}")
for c in pres1[:15]:
    print(f"  {c['nomeUrna']:30s} | {c['partido']:15s} | foto: '{c.get('foto','')[:60]}'")

# Check candidatos-2026-fotos.json
with open('data/candidatos-2026-fotos.json', encoding='utf-8') as f:
    d2 = json.load(f)
cands2 = d2.get('candidatos', [])
pres2 = [c for c in cands2 if c.get('cargo') == 1]
print(f"\n=== candidatos-2026-fotos.json ===")
print(f"Total: {len(cands2)}, Presidentes: {len(pres2)}")
for c in pres2[:15]:
    print(f"  {c['nomeUrna']:30s} | {c['partido']:15s} | foto: '{c.get('foto','')[:80]}'")

# Check how many have photos
com_foto1 = len([c for c in cands1 if c.get('foto')])
com_foto2 = len([c for c in cands2 if c.get('foto')])
print(f"\n=== Resumo ===")
print(f"candidatos-2026.json com foto: {com_foto1}/{len(cands1)}")
print(f"candidatos-2026-fotos.json com foto: {com_foto2}/{len(cands2)}")

# Check governors in fotos
govs2 = [c for c in cands2 if c.get('cargo') == 3]
print(f"\nGovernadores com foto: {len([c for c in govs2 if c.get('foto')])}/{len(govs2)}")
for c in govs2[:5]:
    print(f"  {c['nomeUrna']:30s} | {c.get('uf','')}: {c['partido']:15s} | foto: '{c.get('foto','')[:80]}'")
