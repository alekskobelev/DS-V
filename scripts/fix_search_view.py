with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="p-2">',
    '<div className="p-2 flex-1 min-h-0 flex flex-col">'
)
content = content.replace(
    '<div className="grid grid-cols-3 gap-2.5 max-h-[440px] overflow-y-auto pr-1">',
    '<div className="grid grid-cols-3 gap-2.5 flex-1 overflow-y-auto pr-1">'
)

# And let's change 160px to 220px to be super safe about not clipping on standard laptop displays.
# The header could be quite tall on small height screens if there's text wrapping.
content = content.replace(
    'max-h-[calc(100vh-160px)]',
    'max-h-[calc(100vh-180px)]'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
