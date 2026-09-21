with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# Fix Hardware Dropdown
target_hw = 'className="absolute top-full left-1/2 -translate-x-1/3 xl:-translate-x-1/4 w-[960px] xl:w-[1020px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"'
replacement_hw = 'className="absolute top-full left-1/2 -translate-x-1/3 xl:-translate-x-1/4 w-[960px] xl:w-[1020px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"'
content = content.replace(target_hw, replacement_hw)

# Fix Software Dropdown
target_sw = 'className="absolute top-full left-0 w-[640px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"'
replacement_sw = 'className="absolute top-full left-0 w-[640px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"'
content = content.replace(target_sw, replacement_sw)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
