with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "if (selectedBrand === 'scanline' && !prodBrand.includes('scanline')) return false;",
    "if (selectedBrand === 'scanline' && !(prodBrand.includes('scanline') || prod.id.startsWith('scanline') || prod.id.startsWith('eq-scanline'))) return false;"
)
content = content.replace(
    "if (selectedBrand === 'shining' && !prodBrand.includes('shining')) return false;",
    "if (selectedBrand === 'shining' && !(prodBrand.includes('shining') || prod.id.startsWith('shining') || prod.id.startsWith('freescan') || prod.id.startsWith('eq-shining') || prod.id.startsWith('eq-freescan'))) return false;"
)
content = content.replace(
    "if (selectedBrand === 'hexagon' && !prodBrand.includes('hexagon') && !prodBrand.includes('leica') && !prodBrand.includes('coord3')) return false;",
    "if (selectedBrand === 'hexagon' && !(prodBrand.includes('hexagon') || prodBrand.includes('leica') || prod.id.startsWith('hexagon') || prod.id.startsWith('primescan') || prod.id.startsWith('stereoscan') || prod.id.startsWith('smartscan') || prod.id.startsWith('eq-hexagon'))) return false;"
)

with open('src/pages/HardwarePage.tsx', 'w') as f:
    f.write(content)

