import json
import re

with open('src/data/mockData.ts', 'r') as f:
    content = f.read()

# We just want a quick look at the scanner products to write robust filtering conditions in Header.tsx
# Let's just find the names of scanners
lines = content.split('\n')
in_product = False
prod = {}
prods = []
for line in lines:
    if 'id:' in line:
        prod = {'id': line.split("'")[1]}
    if 'name:' in line and 'prod' in locals():
        match = re.search(r"name:\s*'([^']+)'", line)
        if match:
            prod['name'] = match.group(1)
    if 'category:' in line and 'prod' in locals():
        match = re.search(r"category:\s*'([^']+)'", line)
        if match:
            prod['category'] = match.group(1)
    if 'type:' in line and 'prod' in locals():
        match = re.search(r"type:\s*'([^']+)'", line)
        if match:
            prod['type'] = match.group(1)
            if prod.get('type') == 'hardware':
                prods.append(prod)

for p in prods:
    cat = p.get('category', '')
    if cat in ['scanner', 'scanners']:
        name_lower = p['name'].lower()
        if 'laser' in name_lower or 'лазерн' in name_lower or 'freescan' in name_lower or 'easyscan' in name_lower:
            tech = 'Лазерный'
        elif 'оптическ' in name_lower or 'структурир' in name_lower or 'primescan' in name_lower or 'stereoscan' in name_lower or 'smartscan' in name_lower or 'staticscan' in name_lower or 'robotscan' in name_lower or 'transcan' in name_lower or 'optimscan' in name_lower or 'einscan' in name_lower:
            tech = 'Оптический'
        elif 'einstar' in name_lower or 'инфракрасн' in name_lower or 'vcsel' in name_lower:
            tech = 'Инфракрасный'
        else:
            tech = 'Другой'
        
        print(f"[{tech}] {p['name']}")
