import re

with open('src/data/mockData.ts', 'r') as f:
    content = f.read()

# find all `name:` and `category:` for hardware by splitting after `// HARDWARE`
hw_part = content.split('// HARDWARE')[1]

# extract all objects
objs = []
current = {}
for line in hw_part.split('\n'):
    if 'id:' in line:
        current = {}
        try:
            current['id'] = line.split("'")[1]
        except: pass
    if 'name:' in line and 'id' in current:
        current['name'] = line.split("'")[1]
    if 'category:' in line and 'id' in current:
        current['category'] = line.split("'")[1]
    if 'brand:' in line and 'id' in current:
        current['brand'] = line.split("'")[1]
    if '},' in line and 'id' in current:
        objs.append(current)
        current = {}

counts = {'laser': 0, 'optical': 0, 'ir': 0, 'cmm': 0, 'arms': 0, 'trackers': 0, 'brand_scanline': 0, 'brand_shining': 0, 'brand_hexagon': 0}

for p in objs:
    cat = p.get('category', '')
    name = p.get('name', '').lower()
    brand_id = p.get('id', '').lower()
    
    # Tech
    if cat in ['scanner', 'scanners']:
        if 'лазер' in name or 'freescan' in name or 'easyscan' in name or 'hx' in name:
            counts['laser'] += 1
        elif 'инфракрасн' in name or 'einstar' in name or 'ir' in name:
            counts['ir'] += 1
        else:
            counts['optical'] += 1
    elif cat in ['cmm', 'stationary_cmm']:
        counts['cmm'] += 1
    elif cat in ['arms', 'mobile_cmm']:
        counts['arms'] += 1
    elif cat == 'trackers':
        counts['trackers'] += 1
        
    # Brands
    if 'scanline' in brand_id:
        counts['brand_scanline'] += 1
    elif 'shining' in brand_id or 'freescan' in brand_id or 'einstar' in brand_id:
        counts['brand_shining'] += 1
    elif 'hexagon' in brand_id or 'primescan' in brand_id or 'stereoscan' in brand_id or 'smartscan' in brand_id:
        counts['brand_hexagon'] += 1

print(counts)
