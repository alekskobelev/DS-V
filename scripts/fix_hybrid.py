with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

import re

# We will replace the count and filter logic for tech-laser, tech-optical, and tech-ir

def make_cat(cat_id, label, short_label, icon, filter_logic):
    return f"""    {{
      id: '{cat_id}',
      label: '{label}',
      shortLabel: '{short_label}',
      count: hardwareProducts.filter(p => {filter_logic}).length,
      icon: {icon},
      filter: (p: Product) => {filter_logic},
    }},"""

# Let's extract the full text check logic
# We can just inline it: 
# (p.name + ' ' + (p.shortDescription || '')).toLowerCase().includes(...)

laser_logic = "p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1') || p.name.toLowerCase().includes('combo') || (p.features && p.features.join(' ').toLowerCase().includes('лазер')))"

ir_logic = "p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('ir') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('vcsel') || p.name.toLowerCase().includes('combo') || p.name.toLowerCase().includes('einscan h') || (p.features && p.features.join(' ').toLowerCase().includes('инфракрас')))"

optical_logic = "p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('оптическ') || p.name.toLowerCase().includes('структурированн') || p.name.toLowerCase().includes('einscan') || p.name.toLowerCase().includes('transcan') || p.name.toLowerCase().includes('optimscan') || p.name.toLowerCase().includes('primescan') || p.name.toLowerCase().includes('smartscan') || p.name.toLowerCase().includes('stereoscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('scanline') || (p.features && (p.features.join(' ').toLowerCase().includes('свет') || p.features.join(' ').toLowerCase().includes('led'))))"

c_laser = make_cat('tech-laser', 'Лазерные 3D-сканеры (в т.ч. гибридные)', '🔴 Лазерные сканеры', 'Zap', laser_logic)
c_optical = make_cat('tech-optical', 'Оптические 3D-сканеры (LED / Структурированный свет)', '🔵 Оптические сканеры', 'Scan', optical_logic)
c_ir = make_cat('tech-ir', 'Инфракрасные сканеры (IR / VCSEL)', '🟢 Инфракрасные (IR)', 'Target', ir_logic)

# Use regex to replace the old categories
content = re.sub(r"\{\s*id:\s*'tech-laser'.*?\},", c_laser, content, flags=re.DOTALL)
content = re.sub(r"\{\s*id:\s*'tech-optical'.*?\},", c_optical, content, flags=re.DOTALL)
content = re.sub(r"\{\s*id:\s*'tech-ir'.*?\},", c_ir, content, flags=re.DOTALL)

with open('src/pages/HardwarePage.tsx', 'w') as f:
    f.write(content)

