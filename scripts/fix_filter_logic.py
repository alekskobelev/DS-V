with open('src/pages/HardwarePage.tsx', 'r') as f:
    content = f.read()

import re

# We need to change the useEffect for activeCategory
old_effect = """  useEffect(() => {
    if (activeCategory) {
      setFilterCat(activeCategory);
    }
  }, [activeCategory]);"""

new_effect = """  useEffect(() => {
    if (activeCategory) {
      if (activeCategory.startsWith('brand-')) {
        setSelectedBrand(activeCategory.replace('brand-', ''));
        setFilterCat('all');
      } else {
        setFilterCat(activeCategory);
        setSelectedBrand('all');
      }
    }
  }, [activeCategory]);"""

content = content.replace(old_effect, new_effect)

with open('src/pages/HardwarePage.tsx', 'w') as f:
    f.write(content)
