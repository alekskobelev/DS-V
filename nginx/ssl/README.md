# Инструкция по установке SSL/TLS сертификата от REG.RU

В эту директорию (`nginx/ssl/`) помещаются файлы вашего сертификата от REG.RU:

### 1. Необходимые файлы:
1. **`fullchain.crt`** — цепочка сертификатов.
   - Если REG.RU выдал файл вашего домена (например, `ds-engineering_ru.crt`) и промежуточный сертификат (`ca_bundle.crt` или `Sectigo/GlobalSign CA`), объедините их в один файл:
     ```bash
     cat ds-engineering_ru.crt ca_bundle.crt > fullchain.crt
     ```
   - Либо просто переименуйте готовый файл полной цепочки от REG.RU в `fullchain.crt`.

2. **`private.key`** — ваш закрытый (приватный) ключ.
   - Это файл с ключом, который был сгенерирован при заказе сертификата (CSR-запросе) в личном кабинете REG.RU или на сервере.
   - Начинается с `-----BEGIN RSA PRIVATE KEY-----` или `-----BEGIN PRIVATE KEY-----`.

### 2. Проверка прав доступа:
Убедитесь, что права на приватный ключ защищены:
```bash
chmod 600 nginx/ssl/private.key
chmod 644 nginx/ssl/fullchain.crt
```

### 3. Применение в Nginx:
После добавления файлов в папку `nginx/ssl/` перезапустите Nginx:
```bash
docker compose restart nginx
```
Либо на «живом» сервере:
```bash
nginx -t && nginx -s reload
```
