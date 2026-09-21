import re

with open('src/components/crm/CrmManualView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_categories = """  const categories = [
    { id: 'all', label: 'Все разделы' },
    { id: 'pipeline', label: 'Сквозной процесс' },
    { id: 'crm', label: 'CRM & Воронки' },
    { id: 'kp', label: 'Реестр КП' },
    { id: 'contracts', label: 'Реестр Договоров' },
    { id: 'analytics', label: 'Аналитика' },
    { id: 'email', label: 'Почта Яндекс 360' },
    { id: 'support', label: 'Техподдержка' },
    { id: 'licenses', label: 'Лицензии и ключи' },
    { id: 'checklists', label: 'Чек-листы и FAQ' },
  ];"""

new_categories = """  const categories = [
    { id: 'all', label: 'Все разделы', icon: BookOpen },
    { id: 'pipeline', label: 'Сквозной процесс', icon: TrendingUp },
    { id: 'crm', label: 'CRM & Воронки', icon: Layers },
    { id: 'kp', label: 'Реестр КП', icon: FileText },
    { id: 'contracts', label: 'Реестр Договоров', icon: FileSignature },
    { id: 'analytics', label: 'Аналитика', icon: Percent },
    { id: 'email', label: 'Почта Яндекс 360', icon: Mail },
    { id: 'support', label: 'Техподдержка', icon: LifeBuoy },
    { id: 'licenses', label: 'Лицензии и ключи', icon: KeyRound },
    { id: 'checklists', label: 'Чек-листы и FAQ', icon: CheckSquare },
  ];"""

if old_categories in content:
    content = content.replace(old_categories, new_categories)
    with open('src/components/crm/CrmManualView.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Categories updated successfully")
else:
    print("Failed to find categories")
