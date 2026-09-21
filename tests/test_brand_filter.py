import re
with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

start = content.find('// 2. Brand filter')
end = content.find('// 3. Search query')
print(content[start:end])
