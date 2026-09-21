with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

new_cat = """    {
      id: 'tech-other',
      label: 'Оснастка, датчики и 3D-печать по металлу (SLM)',
      shortLabel: 'Оснастка и 3D-печать',
      count: hardwareProducts.filter(p => p.type === 'hardware' && (p.category === 'renishaw' || p.category === 'printers')).length,
      icon: Settings2,
      filter: (p: Product) => p.type === 'hardware' && (p.category === 'renishaw' || p.category === 'printers'),
    },
  ], [hardwareProducts]);"""

content = content.replace("], [hardwareProducts]);", new_cat)

with open('src/pages/HardwarePage.tsx', 'w') as f:
    f.write(content)
