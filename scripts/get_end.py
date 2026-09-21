import re

with open('src/pages/SoftwarePage.tsx', 'r') as f:
    content = f.read()

parts = re.split(r'(\s*\{\/\*\s*Card [123]:.*?\*\/})', content)

card3_and_rest = parts[6]

# find where card 3 ends. It's a div that ends the card.
# Then there are closing divs for the grid and the container.
# Let's print the last 20 lines of the file to see how it ends.
lines = card3_and_rest.split('\n')
for i, line in enumerate(lines[-20:]):
    print(f"{len(lines)-20+i}: {line}")

