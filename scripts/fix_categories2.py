with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

import re

new_categories = """const CATEGORIES = useMemo(() => [
    {
      id: 'all',
      label: 'Всё оборудование',
      shortLabel: 'Всё',
      count: hardwareProducts.length,
      icon: Box,
      filter: () => true,
    },
    {
      id: 'tech-laser',
      label: 'Лазерные 3D-сканеры',
      shortLabel: '🔴 Лазерные сканеры',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1'))).length,
      icon: Zap,
      filter: (p: Product) => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1')),
    },
    {
      id: 'tech-optical',
      label: 'Оптические 3D-сканеры (Структурированный свет)',
      shortLabel: '🔵 Оптические сканеры',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category.includes('scanner') && !(p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1') || p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'))).length,
      icon: Scan,
      filter: (p: Product) => p.type === 'hardware' && p.category.includes('scanner') && !(p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1') || p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir')),
    },
    {
      id: 'tech-ir',
      label: 'Инфракрасные сканеры (IR / VCSEL)',
      shortLabel: '🟢 Инфракрасные (IR)',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'))).length,
      icon: Target,
      filter: (p: Product) => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir')),
    },
    {
      id: 'tech-cmm',
      label: 'Стационарные координатно-измерительные машины',
      shortLabel: '🔵 Стационарные КИМ',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm')).length,
      icon: Cpu,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm'),
    },
    {
      id: 'tech-mobile',
      label: 'Мобильные КИМ (Измерительные руки)',
      shortLabel: '🟢 Мобильные КИМ',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm')).length,
      icon: Compass,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm'),
    },
    {
      id: 'tech-trackers',
      label: 'Лазерные трекеры (до 160 метров)',
      shortLabel: '🔵 Лазерные трекеры',
      count: hardwareProducts.filter(p => p.type === 'hardware' && p.category === 'trackers').length,
      icon: Target,
      filter: (p: Product) => p.type === 'hardware' && p.category === 'trackers',
    },
  ], [hardwareProducts]);"""

pattern = r"const CATEGORIES = useMemo\(\(\) => \[.*?\]\, \[hardwareProducts\]\);"
content = re.sub(pattern, new_categories, content, flags=re.DOTALL)

with open('src/pages/HardwarePage.tsx', 'w') as f:
    f.write(content)

