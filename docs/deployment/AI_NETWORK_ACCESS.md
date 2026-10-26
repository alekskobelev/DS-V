# 🌐 Сетевой доступ к ИИ-сервисам: DNS, DoH и прокси

Практическая инструкция для случая, когда ИИ-функции портала (Gemini API, `generativelanguage.googleapis.com`)
или внешние нейросети не отвечают: таймауты, `ENOTFOUND`, `ECONNRESET`, `403`, «сервис недоступен в вашем регионе».

---

## 1. Главное: DNS лечит только DNS-блокировки

| Тип блокировки | Помогает ли смена DNS | Что нужно на самом деле |
| :--- | :--- | :--- |
| Домен не резолвится / отдаётся «мусорный» IP (DNS-фильтр провайдера) | ✅ Да | Публичный или шифрованный DNS (DoH/DoT) |
| Блокировка по IP-адресу сервиса | ❌ Нет | Прокси / VPN / собственный релей |
| Блокировка по SNI / DPI (TLS-инспекция) | ❌ Нет | ECH + прокси / VPN |
| Сервис сам отдаёт 403 по региону (geo-ограничение) | ❌ Нет | Прокси в разрешённой стране или локальный аналог (YandexGPT, GigaChat) |

Поэтому порядок действий всегда такой: **сначала диагностика (раздел 5), потом DNS, и только если не помогло — прокси.**

---

## 2. Рабочие публичные DNS-серверы

Классический DNS (UDP/TCP 53) — для роутера, сервера, Docker:

| Провайдер | IPv4 | IPv6 | Комментарий |
| :--- | :--- | :--- | :--- |
| **Cloudflare** | `1.1.1.1`, `1.0.0.1` | `2606:4700:4700::1111` | Самый быстрый и нейтральный, рекомендуется по умолчанию |
| **Google Public DNS** | `8.8.8.8`, `8.8.4.4` | `2001:4860:4860::8888` | Надёжен, но часть провайдеров РФ его подменяет/замедляет |
| **Quad9** | `9.9.9.9`, `149.112.112.112` | `2620:fe::fe` | Блокирует вредоносные домены |
| **AdGuard DNS** | `94.140.14.14`, `94.140.15.15` | `2a10:50c0::ad1:ff` | С рекламной фильтрацией |
| **Yandex DNS** | `77.88.8.8`, `77.88.8.1` | `2a02:6b8::feed:0ff` | Работает из РФ, но фильтрует по реестру — для ИИ не годится |

Шифрованный DNS (DoH/DoT) — обходит подмену ответов и DPI на 53-м порту:

| Провайдер | DoH (URL) | DoT (хост) |
| :--- | :--- | :--- |
| Cloudflare | `https://cloudflare-dns.com/dns-query` | `1dot1dot1dot1.cloudflare-dns.com` |
| Google | `https://dns.google/dns-query` | `dns.google` |
| Quad9 | `https://dns.quad9.net/dns-query` | `dns.quad9.net` |
| AdGuard | `https://dns.adguard-dns.com/dns-query` | `dns.adguard-dns.com` |

> В браузере (Chrome/Edge/Firefox) DoH включается отдельно от ОС:
> `Настройки → Конфиденциальность и безопасность → Использовать безопасный DNS` → «Свой» → URL из таблицы.
> Именно браузерный DoH чаще всего «включает» веб-нейросети, когда системный DNS уже подменён.

---

## 3. Где прописать DNS на сервере портала

### 3.1. Ubuntu 22.04/24.04 (systemd-resolved)

```bash
sudo mkdir -p /etc/systemd/resolved.conf.d
sudo tee /etc/systemd/resolved.conf.d/99-ai-dns.conf >/dev/null <<'EOF'
[Resolve]
DNS=1.1.1.1 8.8.8.8 9.9.9.9
FallbackDNS=1.0.0.1 8.8.4.4
Domains=~.
DNSSEC=allow-downgrade
DNSOverTLS=yes
EOF
sudo systemctl restart systemd-resolved
resolvectl flush-caches && resolvectl status | head -20
```

Проверка:

```bash
resolvectl query generativelanguage.googleapis.com
```

### 3.2. Docker

Контейнеры не наследуют DNS хоста. Пропишите его в `/etc/docker/daemon.json`:

```json
{
  "dns": ["1.1.1.1", "8.8.8.8"],
  "dns-opts": ["ndots:1"]
}
```

```bash
sudo systemctl restart docker
docker run --rm alpine cat /etc/resolv.conf   # проверить, что DNS применился
```

Либо точечно в `docker-compose.yml`:

```yaml
services:
  app:
    dns:
      - 1.1.1.1
      - 8.8.8.8
```

### 3.3. Windows / macOS (рабочая станция)

- Windows: `Параметры → Сеть → Свойства адаптера → IP-назначение DNS → Вручную` → `1.1.1.1`, `1.0.0.1`.
  Затем `ipconfig /flushdns`.
- macOS: `Системные настройки → Сеть → DNS → +` → `1.1.1.1`, `1.0.0.1`.

### 3.4. Роутер

`WAN/LAN → DHCP → Primary/Secondary DNS` = `1.1.1.1` / `1.0.0.1`, затем переподключить клиентов.
Учтите: если провайдер перехватывает 53-й порт (прозрачный DNS-прокси), роутерные настройки не сработают — нужен DoH/DoT.

---

## 4. Если DNS не помог: прокси для исходящих вызовов ИИ

Когда сервис доступен по DNS, но соединение рвётся — настройте исходящий прокси для процесса, а не для всей ОС.

### 4.1. Проверка через прокси

```bash
curl -x http://USER:PASS@PROXY_HOST:3128 -sS -o /dev/null -w '%{http_code}\n' \
  https://generativelanguage.googleapis.com/v1beta/models
```

### 4.2. systemd-юнит портала

```ini
[Service]
Environment=HTTPS_PROXY=http://PROXY_HOST:3128
Environment=HTTP_PROXY=http://PROXY_HOST:3128
Environment=NO_PROXY=localhost,127.0.0.1,.internal
```

### 4.3. Node.js: важный нюанс

Встроенный `fetch` (undici) **не читает** `HTTP_PROXY`/`HTTPS_PROXY` автоматически.
Для серверных вызовов Gemini нужен явный диспетчер:

```ts
import { ProxyAgent, setGlobalDispatcher } from 'undici';

if (process.env.HTTPS_PROXY) {
  setGlobalDispatcher(new ProxyAgent(process.env.HTTPS_PROXY));
}
```

Альтернатива — собственный релей: Cloudflare Worker / VPS в ЕС, который проксирует
`generativelanguage.googleapis.com`, а портал ходит на него по своему домену
(тогда меняется только `baseUrl` клиента `@google/genai`).

### 4.4. Если прокси недоступен

Для ИИ-функций портала предусмотрите локальные модели/API, работающие из РФ:
YandexGPT (`llm.api.cloud.yandex.net`), GigaChat (`gigachat.devices.sberbank.ru`) —
это убирает зависимость от внешнего канала и geo-ограничений.

---

## 5. Диагностика за 6 команд

```bash
# 1. Резолвится ли домен и каким DNS
dig +short generativelanguage.googleapis.com @1.1.1.1

# 2. Что отдаёт системный резолвер
getent hosts generativelanguage.googleapis.com

# 3. Есть ли TCP-соединение до 443
curl -sS -o /dev/null -w 'connect=%{time_connect} tls=%{time_appconnect} code=%{http_code}\n' \
  https://generativelanguage.googleapis.com/v1beta/models

# 4. Полный трейс TLS/HTTP
curl -v --max-time 15 https://generativelanguage.googleapis.com/v1beta/models 2>&1 | tail -30

# 5. Проверка API-ключа (ожидается 401/403 без ключа, но не таймаут)
curl -sS -H "x-goog-api-key: $GEMINI_API_KEY" \
  'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1' | head -c 300

# 6. Сравнение с эталоном — доступен ли вообще внешний HTTPS
curl -sS -o /dev/null -w '%{http_code}\n' https://www.google.com
```

Расшифровка результатов:

| Симптом | Причина | Решение |
| :--- | :--- | :--- |
| `dig @1.1.1.1` даёт IP, `getent` — нет | Локальный/провайдерский DNS подменяет ответы | Раздел 3 (DoH/DoT) |
| `dig` и `getent` пусто | Нет маршрута до DNS или блокировка 53-го порта | DoH (443) вместо 53 |
| Резолвится, но `curl` висит на `time_appconnect` | DPI по SNI либо блок по IP | Прокси (раздел 4) |
| `curl` отдаёт `403` с телом про регион | Geo-ограничение сервиса | Прокси в разрешённой стране или локальная модель |
| `401`/`400` | Сеть в порядке, проблема в ключе/квоте | Проверить `GEMINI_API_KEY` и лимиты |

---

## 6. Чек-лист администратора

1. `resolvectl status` / `cat /etc/resolv.conf` — активны ли `1.1.1.1` и `8.8.8.8`.
2. `DNSOverTLS=yes` на сервере — защита от подмены ответов.
3. В `/etc/docker/daemon.json` прописан `dns` — иначе контейнеры ходят через DNS хоста-неймспейса.
4. Браузерный DoH включён отдельно у сотрудников.
5. Для исходящих вызовов ИИ есть резервный маршрут: прокси или локальная модель.
6. Секреты (`GEMINI_API_KEY`) только в `.env`/секретах платформы, не в репозитории.

---

## 🔗 Связанная документация

- [Руководство по развертыванию сервера (`SERVER_DEPLOYMENT_GUIDE.md`)](./SERVER_DEPLOYMENT_GUIDE.md)
- [Реестр документации развертывания (`README.md`)](./README.md)
- [Технический паспорт системы (`docs/SITE_PASSPORT.md`)](../SITE_PASSPORT.md)
