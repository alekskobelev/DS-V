# 🚀 РЕЕСТР ДОКУМЕНТАЦИИ РАЗВЕРТЫВАНИЯ И DEVOPS (/docs/deployment/)
## Руководства по развертыванию СУБД, серверов и инфраструктуры «ДС-Инжиниринг»

В данном разделе собраны специализированные инструкции для системных администраторов, инженеров DevOps и технических специалистов.

---

## 📁 Содержимое подраздела

| Файл | Документ | Ключевое назначение |
| :--- | :--- | :--- |
| **[`DATABASE_DEPLOYMENT.md`](./DATABASE_DEPLOYMENT.md)** | **Развертывание СУБД PostgreSQL 17** | Руководство по запуску контейнера `postgres:17-alpine`, миграциям Drizzle ORM (`npm run db:push`), резервному копированию, пулу соединений `pg` и Drizzle Studio. |
| **[`SERVER_DEPLOYMENT_GUIDE.md`](./SERVER_DEPLOYMENT_GUIDE.md)** | **Развертывание на ASUSTOR NAS и VPS** | Пошаговое руководство по развертыванию платформы на сетевых хранилищах ASUSTOR NAS (ADM/Docker) и облачных VPS Linux с Nginx, SSL Let's Encrypt и systemd/Docker Compose. |
| **[`AI_NETWORK_ACCESS.md`](./AI_NETWORK_ACCESS.md)** | **Сетевой доступ к ИИ-сервисам (DNS, DoH, прокси)** | Рабочие публичные DNS-серверы, настройка DoH/DoT на сервере и в Docker, прокси для исходящих вызовов Gemini API, диагностика блокировок (DPI, geo-ограничения) и чек-лист администратора. |

---

## 🔗 Связь с общей документацией

- [Главный реестр документации (`docs/README.md`)](../README.md)
- [Технический паспорт системы (`docs/SITE_PASSPORT.md`)](../SITE_PASSPORT.md)
- [Инструкция по эксплуатации (`docs/USER_MANUAL.md`)](../USER_MANUAL.md)
