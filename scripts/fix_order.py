import re

with open('src/pages/SoftwarePage.tsx', 'r') as f:
    content = f.read()

parts = re.split(r'(\s*\{\/\*\s*Card [123]:.*?\*\/})', content)

# 0: before cards
# 1: card 1 comment
# 2: card 1 content
# 3: card 2 comment
# 4: card 2 content
# 5: card 3 comment
# 6: card 3 content + rest

card3_lines = parts[6].split('\n')
card3_end_idx = -7 # the last 7 lines are the rest of the file (from `          </div>`)

card3_content = '\n'.join(card3_lines[:card3_end_idx])
rest_of_file = '\n'.join(card3_lines[card3_end_idx:])

new_content = (
    parts[0] + 
    parts[5] + "\n" + card3_content + 
    parts[1] + parts[2] + 
    parts[3] + parts[4] + 
    "\n" + rest_of_file
)

with open('src/pages/SoftwarePage.tsx', 'w') as f:
    f.write(new_content)

