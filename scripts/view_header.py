with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

start = content.find('{/* Left Rail: Categories Tabs */}')
end = content.find('{/* Bottom Actions Toolbar */}')
print(content[start:end])
