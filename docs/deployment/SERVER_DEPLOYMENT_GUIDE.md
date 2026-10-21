# ИНСТРУКЦИЯ ПО РАЗВЕРТЫВАНИЮ И ЗАПУСКУ САЙТА НА ASUSTOR NAS И VPS-СЕРВЕРАХ

*(Для системных администраторов, DevOps-инженеров и технических специалистов «ДС-Инжиниринг»)*

Данное руководство содержит пошаговые инструкции по развертыванию, настройке и обеспечению непрерывной работы корпоративного портала **ООО «ДС-Инжиниринг»** (версия `v2.9.112-PROD`) на сетевых хранилищах **ASUSTOR NAS** (ADMA / ASUSTOR Data Master) и любых **VPS/VDS-серверах** под управлением Linux (Ubuntu 22.04/24.04 LTS, Debian, Rocky Linux, AlmaLinux).

---

## 1. Архитектура и требования к окружению

Корпоративный портал «ДС-Инжиниринг» представляет собой высокопроизводительное full-stack приложение:
- **Frontend + Backend Core:** Node.js 20+ (LTS) / Express + Vite SSR/SPA middleware (порт `3000`, привязка к `0.0.0.0:3000`).
- **СУБД:** **PostgreSQL 17** (образ `postgres:17-alpine`, порт `5432`, Drizzle ORM, пул `pg`).
- **Отказоустойчивость:** Автоматический гибридный режим (In-Memory кэширование + дисковая персистентность в `data/` при временной недоступности PostgreSQL).
- **Минимальные аппаратные требования:**
  - **CPU:** 2 ядра (x86_64 / ARM64 для NAS).
  - **RAM:** 2 ГБ оперативной памяти (рекомендуется 4 ГБ).
  - **Дисковое пространство:** 10–20 ГБ свободного места на SSD/NVMe/RAID-массиве.

---

## 2. Развертывание на сетевом накопителе ASUSTOR NAS (ADM)

Сетевые накопители ASUSTOR (серии Lockerstor, Flashstor, Drivestor Pro, AS52/AS53/AS66/AS67 и др.) работают под управлением ОС **ADM** и поддерживают контейнеризацию через **Docker Engine** и графический интерфейс **Portainer CE** или **Docker Compose CLI**.

### Шаг 2.1. Подготовка ASUSTOR ADM и установка Docker
1. Войдите в веб-интерфейс **ADM** под учетной записью администратора.
2. Откройте **App Central** (Центр приложений).
3. Найдите и установите пакеты:
   - **Docker Engine** (официальный движок контейнеризации).
   - **Portainer CE** (графический веб-интерфейс управления контейнерами и стеками).
   - **ASUSTOR EZ-Connect / DDNS** (или настройте статический белый IP и проброс портов в роутере).
4. Включите доступ по SSH в ADM:  
   `Управление службами (Services)` ➔ `Терминал (Terminal)` ➔ `Включить службу SSH` (порт 22 или нестандартный порт, например 2222).

### Шаг 2.2. Размещение файлов проекта на томе ASUSTOR
Подключитесь к ASUSTOR по SSH (например, через PuTTY, Windows Terminal или SSH-клиент macOS/Linux):

```bash
ssh admin@<IP_АДРЕС_ASUSTOR> -p 22
```

Перейдите в директорию общих папок накопителя (обычно `/volume1/Docker` или `/volume1/Public`):

```bash
# Создаем директорию под проект ДС-Инжиниринг
mkdir -p /volume1/Docker/ds-engineering
cd /volume1/Docker/ds-engineering

# Клонируем репозиторий или распаковываем архив с проектом
git clone <URL_РЕПОЗИТОРИЯ> .
# Либо скопируйте файлы через SMB/FTP в папку /volume1/Docker/ds-engineering/
```

### Шаг 2.3. Создание конфигурации Docker Compose для ASUSTOR
Создайте или скорректируйте файл `docker-compose.asustor.yml`:

```yaml
version: '3.8'

services:
  # 1. Реляционная база данных PostgreSQL 17
  postgres:
    image: postgres:17-alpine
    container_name: ds_engineering_db
    restart: always
    environment:
      POSTGRES_DB: ds_engineering
      POSTGRES_USER: ds_admin
      POSTGRES_PASSWORD: ds_password_secure_2026
    ports:
      - "5432:5432"
    volumes:
      - /volume1/Docker/ds-engineering/pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ds_admin -d ds_engineering"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Корпоративный портал «ДС-Инжиниринг»
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ds_engineering_app
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      SQL_HOST: postgres
      SQL_PORT: 5432
      SQL_DB_NAME: ds_engineering
      SQL_USER: ds_admin
      SQL_PASSWORD: ds_password_secure_2026
      # Оповещения дежурных инженеров (Telegram и Российский мессенджер МАКС)
      TELEGRAM_BOT_TOKEN: "123456789:ABCdefGHIjklmnOPQRstuvwXYZ"
      TELEGRAM_CHAT_ID: "-1001234567890"
      MAX_BOT_TOKEN: "max_sec_token_987654321"
      MAX_CHAT_ID: "12003456"
      MAX_WEBHOOK_URL: "https://max.internal.ds-enginering.ru/api/webhooks/leads"
      VITE_YANDEX_METRICA_ID: "112028524"
    volumes:
      - /volume1/Docker/ds-engineering/data:/app/data

volumes:
  pgdata:
```

### Шаг 2.4. Dockerfile для сборки контейнера портала
Убедитесь, что в корне проекта присутствует производственный `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Финальный легковесный образ запуска
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
```

### Шаг 2.5. Запуск стека на ASUSTOR
Выполните команду сборки и запуска:

```bash
docker-compose -f docker-compose.asustor.yml up -d --build
```

Для инициализации таблиц и применения схемы Drizzle ORM:
```bash
docker exec -it ds_engineering_app npm run db:push
```

### Шаг 2.6. Публикация сайта и настройка Reverse Proxy в ADM
1. В веб-интерфейсе ADM откройте **Настройки (Settings)** ➔ **Руководство по подключению (EZ-Connect / DDNS)** или настройте локальный Reverse Proxy.
2. В **ADM Reverse Proxy** добавьте правило:
   - **Источник:** `https://ds-engineering.your-domain.ru` (порт 443).
   - **SSL-сертификат:** Let's Encrypt (выпускается автоматически в ADM).
   - **Назначение:** `http://127.0.0.1:3000` (порт контейнера портала).

---

## 3. Развертывание на VPS/VDS-сервере (Ubuntu 22.04/24.04 LTS)

Развертывание на облачных VPS/VDS (Selectel, Timeweb Cloud, Yandex Cloud, VK Cloud, Hetzner, DigitalOcean) обеспечивает максимальную скорость отклика и надежность канала 100+ Мбит/с.

### Шаг 3.1. Первоначальная настройка и безопасность сервера
Подключитесь к VPS по SSH и обновите систему:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban certbot python3-certbot-nginx
```

Настройка межсетевого экрана (UFW):
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP для Let's Encrypt
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Шаг 3.2. Установка Docker Engine и Docker Compose v2
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Проверка установки
docker --version && docker compose version
```

### Шаг 3.3. Развертывание проекта
```bash
# Создаем директорию для веб-ресурсов
sudo mkdir -p /var/www/ds-engineering
sudo chown -R $USER:$USER /var/www/ds-engineering
cd /var/www/ds-engineering

# Клонируем проект
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> .

# Создаем рабочий файл переменных окружения
cp .env.example .env
nano .env
```

Отредактируйте `.env`:
```env
PORT=3000
NODE_ENV=production

# Подключение к PostgreSQL 17 в Docker
SQL_HOST=127.0.0.1
SQL_PORT=5432
SQL_DB_NAME=ds_engineering
SQL_USER=ds_admin
SQL_PASSWORD=StrongAdminPassword2026!

# Каналы оповещений
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklmnOPQRstuvwXYZ"
TELEGRAM_CHAT_ID="-1001234567890"
MAX_BOT_TOKEN="max_sec_token_987654321"
MAX_CHAT_ID="12003456"
MAX_WEBHOOK_URL="https://max.internal.ds-enginering.ru/api/webhooks/leads"

VITE_YANDEX_METRICA_ID="112028524"
```

### Шаг 3.4. Запуск PostgreSQL 17 и приложения
```bash
# 1. Запуск контейнера PostgreSQL 17
docker compose up -d postgres

# 2. Установка зависимостей и сборка
npm ci
npm run build

# 3. Синхронизация реляционной схемы с БД
npm run db:push

# 4. Запуск приложения через PM2 (для непрерывного фонового процесса с автоперезапуском)
sudo npm install -g pm2
pm2 start npm --name "ds-engineering" -- run start
pm2 save
pm2 startup
```

*(Альтернативно: запуск через полный `docker compose up -d --build`)*.

---

## 4. Настройка Nginx и SSL-сертификатов Let's Encrypt

Для защиты передачи коммерческих данных, запросов ТКП, 3D CAD-моделей и учетных записей настройте Nginx в качестве обратного прокси с протоколом HTTP/2 и TLS 1.3.

Создайте конфигурационный файл `/etc/nginx/sites-available/ds-engineering.conf`:

```nginx
server {
    listen 80;
    server_name ds-enginering.ru www.ds-enginering.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ds-enginering.ru www.ds-enginering.ru;

    # SSL сертификаты (будут сгенерированы Certbot)
    ssl_certificate /etc/letsencrypt/live/ds-enginering.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ds-enginering.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Оптимизация передачи статики и кэширование
    client_max_body_size 100M; # Разрешаем загрузку 3D CAD/Mesh файлов до 100 МБ

    # Сжатие gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Проксирование на Node.js приложение (порт 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Безопасность заголовков
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

Активируйте конфигурацию и выпустите сертификат Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/ds-engineering.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Выпуск бесплатного SSL-сертификата Let's Encrypt
sudo certbot --nginx -d ds-enginering.ru -d www.ds-enginering.ru
```

---

## 5. Резервное копирование и регламент обслуживания

### Автоматический бэкап PostgreSQL 17 в Cron (каждую ночь в 03:00)
Создайте скрипт `/var/www/ds-engineering/scripts/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ds-engineering"
DATE=$(date +%Y-%m-%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Снятие дампа базы данных
docker exec ds_engineering_db pg_dump -U ds_admin ds_engineering | gzip > "$BACKUP_DIR/ds_engineering_$DATE.sql.gz"

# Архивирование персистентных JSON-файлов и загруженных 3D-моделей
tar -czf "$BACKUP_DIR/data_files_$DATE.tar.gz" -C /var/www/ds-engineering data

# Удаление бэкапов старше 30 дней
find $BACKUP_DIR -type f -mtime +30 -delete

echo "[$DATE] Бэкап успешно создан: ds_engineering_$DATE.sql.gz"
```

Сделайте скрипт исполняемым и добавьте в `crontab -e`:
```bash
chmod +x /var/www/ds-engineering/scripts/backup_db.sh
# В crontab:
0 3 * * * /var/www/ds-engineering/scripts/backup_db.sh >> /var/log/ds_backup.log 2>&1
```

---

## 6. Чек-лист проверки после развертывания
- [ ] Портал открывается по HTTPS без предупреждений безопасности.
- [ ] Проверка статуса БД: `GET https://ds-enginering.ru/api/db-health` возвращает `status: ok, database: postgresql`.
- [ ] Все 6 направлений услуг (3D-сканирование, измерения и GD&T, реверс-инжиниринг, постпроцессоры и УП ЧПУ, оснастка, ТО/калибровка КИМ) отображаются с корректными ценами и шагами.
- [ ] Тестовая заявка из калькулятора или формы звонка регистрируется в CRM и доставляет мгновенные уведомления в Telegram и МАКС-бот.
- [ ] 3D WebGL просмотрщик (`CadModel3DViewer`) корректно отображает геометрию деталей и карты отклонений без задержек.
