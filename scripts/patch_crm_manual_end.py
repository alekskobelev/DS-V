import re

with open('src/components/crm/CrmManualView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the last `    </div>\n  );\n};` with `        </div>\n      </div>\n    </div>\n  );\n};`
content = re.sub(r'(\s*</div>\s*\);\s*};)\s*$', r'\n        </div>\n      </div>\n    </div>\n  );\n};\n', content)

with open('src/components/crm/CrmManualView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("End replaced successfully")
