# Scoliosis.ua landing prototype

Перший working prototype лендінгу Української асоціації сколіозу.

## Що є в прототипі

- Адаптивний односторінковий лендінг.
- Hero з локальним логотипом і canvas/parallax 3D-like ефектом.
- Великий header із 3D-like brand object.
- Перемикач мов UA/EN без перезавантаження сторінки.
- Прозорий логотип `assets/images/logo-mark-transparent.webp`.
- Блоки членства, місії, аудиторії, переваг і кроків вступу.
- Форма заявки з клієнтською валідацією.
- Demo submit, який готує payload під майбутній endpoint `/api/membership/apply`.
- Локальні brand assets у `assets/images`.

## Як запустити

Можна відкрити файл напряму:

`index.html`

Або запустити локальний сервер:

```bash
python3 -m http.server 4173
```

Після цього відкрити:

`http://localhost:4173/`

## Наступний технічний етап

1. Перенести прототип у Next.js.
2. Реалізувати `POST /api/membership/apply`.
3. Підключити Google Sheets API.
4. Підключити transactional email.
5. Підключити Telegram bot notification.
6. Замінити demo submit на реальну відправку.
7. Підготувати production deploy для `scoliosis.ua`.
8. Зробити production 3D-модель логотипу у `.glb` за планом із `docs/04-logo-background-and-3d-workflow.md`.
