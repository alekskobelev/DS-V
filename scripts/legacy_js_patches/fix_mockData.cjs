const fs = require('fs');

let content = fs.readFileSync('src/data/mockData.ts', 'utf8');

const targetStr = `];

export const DEFAULT_CLIENT_ACCOUNTS`;

const newModeratorStr = `  ,
  {
    id: 'adm-06',
    email: 'moderator@ds-enginering.ru',
    fullName: 'Модератор Сайта',
    role: 'admin',
    position: 'Контент-менеджер',
    company: 'ООО «ДС-Инжиниринг»',
    phone: '+7 (000) 000-00-00',
    password: 'moderator123',
    contractNumber: 'АДМ-006',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-09-01',
  }
];

export const DEFAULT_CLIENT_ACCOUNTS`;

content = content.replace(targetStr, newModeratorStr);

fs.writeFileSync('src/data/mockData.ts', content);
console.log('Added moderator account');
