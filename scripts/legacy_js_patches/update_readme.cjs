const fs = require('fs');
let readme = fs.readFileSync('docs/README.md', 'utf8');

const replacement = `
## 🚀 Быстрый старт и эксплуатация проекта

\`\`\`bash
# 1. Установка всех необходимых библиотек
npm install

# 2. Настройка окружения
# Скопируйте шаблон окружения и убедитесь, что переменные SQL_* совпадают с настройками в docker-compose.yml
cp .env.example .env

# 3. Запуск локальной базы данных PostgreSQL в Docker
docker-compose up -d

# 4. Применение миграций базы данных (синхронизация схемы)
npm run db:push

# 5. Запуск локального сервера разработки (порт 3000)
npm run dev

# 6. Проверка типизации и кода без ошибок
npm run lint

# 7. Сборка производственной версии системы
npm run build
\`\`\`
`;

readme = readme.replace(/## 🚀 Быстрый старт и эксплуатация проекта[\s\S]*?---/, replacement.trim() + '\n\n---\n');
fs.writeFileSync('docs/README.md', readme);
