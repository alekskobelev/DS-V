import re

with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# Fix the main wrapper to be flex col
content = content.replace(
    'className="absolute top-full left-1/2 -translate-x-1/3 xl:-translate-x-1/4 w-[960px] xl:w-[1020px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"',
    'className="absolute top-full left-1/2 -translate-x-1/3 xl:-translate-x-1/4 w-[960px] xl:w-[1020px] max-h-[calc(100vh-80px)] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"'
)

# Shrink 0 for the top bar
content = content.replace(
    '<div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-gray-100">',
    '<div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-gray-100 shrink-0">'
)

# Fix the 2-Panel Layout Wrapper
content = content.replace(
    '<div className="flex gap-4">',
    '<div className="flex gap-4 flex-1 min-h-0">'
)

# Fix the Left Rail
content = content.replace(
    '<div className="w-64 shrink-0 space-y-1 bg-gray-50/70 p-2 rounded-2xl border border-gray-100">',
    '<div className="w-64 shrink-0 space-y-1 bg-gray-50/70 p-2 rounded-2xl border border-gray-100 overflow-y-auto">'
)

# Fix the Right Panel Wrapper
content = content.replace(
    '<div className="flex-1 min-w-0 flex flex-col justify-between">',
    '<div className="flex-1 min-w-0 flex flex-col min-h-0">'
)

# Shrink 0 for Right Panel Header
content = content.replace(
    '<div className="flex items-center justify-between pb-2 border-b border-gray-100">',
    '<div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">'
)

# Fix Items Grid
content = content.replace(
    '<div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1 py-2">',
    '<div className="grid grid-cols-2 lg:grid-cols-3 gap-2 flex-1 overflow-y-auto pr-1 py-2">'
)

# Shrink 0 for Right Panel Footer
content = content.replace(
    '<div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between text-xs">',
    '<div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between text-xs shrink-0">'
)

# Do the same for Software dropdown just in case
content = content.replace(
    'className="absolute top-full left-0 w-[640px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"',
    'className="absolute top-full left-0 w-[640px] max-h-[calc(100vh-80px)] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"'
)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)

