with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

import re

laser_logic = "p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1') || p.name.toLowerCase().includes('combo') || (p.features && p.features.join(' ').toLowerCase().includes('лазер')))"

ir_logic = "p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('ir') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('vcsel') || p.name.toLowerCase().includes('combo') || p.name.toLowerCase().includes('einscan h') || (p.features && p.features.join(' ').toLowerCase().includes('инфракрас')))"

optical_logic = "p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('оптическ') || p.name.toLowerCase().includes('структурированн') || p.name.toLowerCase().includes('einscan') || p.name.toLowerCase().includes('transcan') || p.name.toLowerCase().includes('optimscan') || p.name.toLowerCase().includes('primescan') || p.name.toLowerCase().includes('smartscan') || p.name.toLowerCase().includes('stereoscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('scanline') || (p.features && (p.features.join(' ').toLowerCase().includes('свет') || p.features.join(' ').toLowerCase().includes('led'))))"

c_laser = f"""{{
                                id: 'tech-laser',
                                title: '🔴 Лазерные 3D-сканеры',
                                count: PRODUCTS_DATA.filter(p => {laser_logic}).length,
                                icon: Zap,
                                badgeColor: 'bg-red-50 text-red-700 border-red-200'
                              }}"""

c_optical = f"""{{
                                id: 'tech-optical',
                                title: '🔵 Оптические 3D-сканеры (LED)',
                                count: PRODUCTS_DATA.filter(p => {optical_logic}).length,
                                icon: Scan,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              }}"""

c_ir = f"""{{
                                id: 'tech-ir',
                                title: '🟢 Инфракрасные сканеры (IR)',
                                count: PRODUCTS_DATA.filter(p => {ir_logic}).length,
                                icon: Target,
                                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }}"""

content = re.sub(r"\{\s*id:\s*'tech-laser'.*?badgeColor: 'bg-red-50 text-red-700 border-red-200'\s*\}", c_laser, content, flags=re.DOTALL)
content = re.sub(r"\{\s*id:\s*'tech-optical'.*?badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'\s*\}", c_optical, content, flags=re.DOTALL)
content = re.sub(r"\{\s*id:\s*'tech-ir'.*?badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'\s*\}", c_ir, content, flags=re.DOTALL)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)

