with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">',
    '<div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 shrink-0">'
)
content = content.replace(
    '<div className="grid grid-cols-2 gap-2.5">',
    '<div className="grid grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-y-auto pr-1">'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
