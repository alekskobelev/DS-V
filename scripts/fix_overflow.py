with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'max-h-[65vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50',
    'max-h-[65vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 overflow-hidden'
)
content = content.replace(
    'max-h-[65vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50',
    'max-h-[65vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 overflow-hidden'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
