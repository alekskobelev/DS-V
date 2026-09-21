with open('src/pages/KnowledgeBasePage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find the last "  );\n};"
for i in range(len(lines)-1, -1, -1):
    if lines[i].strip() == "};":
        # Check if the line before is ");"
        pass

# Actually let's just do a string replace on the whole file
content = "".join(lines)
import re
content = re.sub(r'(\s*</div>\s*</div>\s*);\s*};\s*$', r'\n        </div>\n      </div>\n    </div>\n  );\n};\n', content)
with open('src/pages/KnowledgeBasePage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
