with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

import re

# We will modify the map that renders the tabs to append the count if it's not already in shortLabel
old_render = """                <span>{tab.shortLabel}</span>"""
new_render = """                <span>{tab.shortLabel} ({tab.count})</span>"""

content = content.replace(old_render, new_render)

with open('src/pages/HardwarePage.tsx', 'w') as f:
    f.write(content)
