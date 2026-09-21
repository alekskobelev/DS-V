with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="w-64 shrink-0 space-y-4 bg-gray-50/70 p-2 rounded-2xl border border-gray-100 overflow-y-auto">',
    '<div className="w-64 shrink-0 space-y-4 bg-gray-50/70 p-2 rounded-2xl border border-gray-100 overflow-y-auto min-h-0">'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
