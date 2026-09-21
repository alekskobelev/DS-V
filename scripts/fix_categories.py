with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

import re

# We want to replace everything from `const CATEGORIES = useMemo(() => [`
# to `], [hardwareProducts]);`

new_categories = """const CATEGORIES = useMemo(() => [
    {
      id: 'all',
      label: 'Всё оборудование',
      shortLabel: 'Всё',
      count: hardwareProducts.length,
      icon: Box,
      filter: () => true,
    },
    // --- ПО ТЕХНОЛОГИИ ---
    {
      id: 'tech-laser',
      label: '🔴 Лазерные 3D-сканеры (высокая точность и стабильность)',
      shortLabel: 'Лазерные сканеры',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1'))).length,
      icon: Zap,
      filter: (p: Product) => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1')),
    },
    {
      id: 'tech-optical',
      label: '🔵 Оптические 3D-сканеры (Структурированный свет)',
      shortLabel: 'Оптические сканеры',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category.includes('scanner') && !(p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1') || p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'))).length,
      icon: Scan,
      filter: (p: Product) => p.type === 'hardware' && p.category.includes('scanner') && !(p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1') || p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir')),
    },
    {
      id: 'tech-ir',
      label: '🟢 Инфракрасные сканеры (IR / VCSEL)',
      shortLabel: 'Инфракрасные (IR)',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'))).length,
      icon: Target,
      filter: (p: Product) => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir')),
    },
    {
      id: 'tech-cmm',
      label: '🔵 Стационарные координатно-измерительные машины',
      shortLabel: 'Стационарные КИМ',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm')).length,
      icon: Cpu,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm'),
    },
    {
      id: 'tech-mobile',
      label: '🟢 Мобильные КИМ (Измерительные руки)',
      shortLabel: 'Мобильные КИМ',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm')).length,
      icon: Compass,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm'),
    },
    {
      id: 'tech-trackers',
      label: '🔵 Лазерные трекеры (до 160 метров)',
      shortLabel: 'Лазерные трекеры',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category === 'trackers').length,
      icon: Target,
      filter: (p: Product) => p.type === 'hardware' && p.category === 'trackers',
    },
    // --- ПО БРЕНДАМ ---
    {
      id: 'brand-scanline',
      label: 'Оборудование ScanLine (Россия)',
      shortLabel: 'Бренд ScanLine',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline'))).length,
      icon: Box,
      filter: (p: Product) => p.type === 'hardware' && (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline')),
    },
    {
      id: 'brand-shining',
      label: 'Оборудование Shining 3D (Китай)',
      shortLabel: 'Бренд Shining 3D',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan'))).length,
      icon: Sparkles,
      filter: (p: Product) => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan')),
    },
    {
      id: 'brand-hexagon',
      label: 'Оборудование Hexagon / Leica',
      shortLabel: 'Бренд Hexagon / Leica',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon'))).length,
      icon: Target,
      filter: (p: Product) => p.type === 'hardware' && (p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon')),
    },
  ], [hardwareProducts]);"""

pattern = r"const CATEGORIES = useMemo\(\(\) => \[.*?\]\, \[hardwareProducts\]\);"
content = re.sub(pattern, new_categories, content, flags=re.DOTALL)

with open('src/pages/HardwarePage.tsx', 'w') as f:
    f.write(content)

