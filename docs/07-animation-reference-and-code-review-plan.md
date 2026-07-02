# Animation Reference and Code Review Plan

Дата: 2026-07-01

## Мета

Зробити анімації сайту ближчими до референсу з другого запису екрана: більш преміальними, керованими, архітектурними і менш схожими на набір окремих fade/slide ефектів.

Цей документ не описує нові тексти. Він фокусується тільки на motion design, UI/UX анімаціях і технічній реалізації в межах поточного статичного проєкту.

## Вхідні відео

Поточний сайт:

- Файл: `Запис екрана 2026-07-01 о 23.54.57.mov`
- Тривалість: приблизно `11.79s`
- Розмір: `3420x1908`
- Частота: `60fps`

Референс:

- Файл: `Запис екрана 2026-07-01 о 23.56.21.mov`
- Тривалість: приблизно `8.80s`
- Розмір: `3420x1908`
- Частота: `60fps`

## UI/UX Аналіз Анімацій

### Що зараз працює

- Є сильний візуальний актив у hero: відео зі спиною/хребтом має потенціал для cinematic-сцени.
- Loader уже має ідею розкриття через блоки, тобто напрям правильний.
- Контраст між світлим hero і темним блоком "Не просто членство" дає основу для premium transition.
- CTA добре помітний завдяки лаймовому акценту.
- У проекті вже є базові motion-модулі: loader, reveal cards, hero video fade, cursor, sticky hero.

### Що зараз заважає wow-ефекту

- Анімації виглядають як окремі події, а не як одна режисована сцена.
- Hero і наступний блок конфліктують по таймінгу: іноді здається, що блоки просто накладаються, а не розкриваються.
- Scroll-анімації не мають єдиної логіки progress: частина працює CSS scroll-timeline, частина sticky, частина IntersectionObserver.
- Loader живе окремо від hero: після розкриття немає відчуття, що loader "передав" рух у перший екран.
- Section reveal зараз переважно fade/translate/clip, але у референсі контент відкривається через маски, плити, viewport-wipes і pinned panels.
- На поточному сайті багато руху йде вертикально, але бракує горизонтальних/модульних reveal-патернів, як у референсі.
- Курсор і micro-interactions існують, але вони не пов'язані з основною анімаційною системою.

### Чому референс виглядає дорожче

- У нього є чітка motion-архітектура: dark hero -> pinned transition -> grid/cards -> service lists -> logo strip -> block wipe.
- Блоки рухаються як фізичні шари: темні плити, світлі полотна, картки й медіа мають відчуття глибини.
- Анімації мають сильний directionality: елементи або відкриваються з центру, або заходять із країв, або підрізаються маскою.
- Таймінг короткий і впевнений: немає довгих "плаваючих" fade-in ефектів.
- Кожен новий екран має власний тип появи, але всі вони належать до однієї системи: mask, tile, pin, reveal.
- Hero не перевантажений деталями. Він працює як сцена, де головне - простір, контраст і один сильний об'єкт.

## Motion Direction Для Поточного Сайту

### Загальна Ідея

Сайт має перейти від "анімованого лендингу" до "cinematic membership experience":

- Loader відкриває сайт як набір темно-синіх плит.
- Hero фіксується як перша сцена.
- Текст і CTA рухаються не самостійно, а як один foreground-layer.
- Темний блок "Не просто членство" піднімається як наступний шар поверх hero.
- Далі секції відкриваються не fade-in, а масками, плитами і staged card reveals.

## План Переробки Анімацій

### Етап 1. Єдина Motion-Система

Статус: done

Задача: створити централізовані motion tokens, щоб усі анімації мали єдиний ритм.

Реалізовано:

- Додано `styles/utilities/motion.css`.
- Підключено motion tokens у `styles/main.css`.
- Нові hero/reveal/loader правки вже використовують `--ease-premium`, `--ease-soft`, `--dur-*`.

Реалізація:

- Додати `styles/utilities/motion.css`.
- Винести туди CSS variables:
  - `--ease-premium: cubic-bezier(0.74, 0, 0.16, 1)`
  - `--ease-soft: cubic-bezier(0.2, 0.78, 0.24, 1)`
  - `--dur-fast: 360ms`
  - `--dur-medium: 720ms`
  - `--dur-scene: 1180ms`
  - `--panel-dark: #102642`
- Підключити `motion.css` у `styles/main.css`.
- Поступово замінити дублікати easing/duration у `loader.css`, `hero.css`, `content.css`, `animations.css`.

Критерій готовності:

- Нові анімації не мають випадкових різних easing.
- Основний motion-рівень можна налаштувати з одного файлу.

### Етап 2. Loader Як Референсний Block Reveal

Статус: done

Поточна проблема: loader уже має плити, але вони відчуваються як заставка, а не як початок сцени.

Що змінити:

- Залишити темно-сині плити, але зробити їх більш схожими на референс:
  - більше плит;
  - різна висота;
  - розкриття від центру;
  - центральний горизонтальний "проріз", через який починає виднітися сайт;
  - коротша пауза перед відкриттям.
- Зменшити `minimumDuration` у `scripts/src/features/loader.js` з `2200ms` до приблизно `1400-1700ms`.
- Зробити cleanup швидшим, щоб після розкриття не було відчуття, що сайт ще чекає завершення loader.
- Після `is-revealing` додати клас на body, наприклад `is-intro-ready`, який запускає hero intro sequence.

Файли:

- `styles/components/loader.css`
- `styles/utilities/animations.css`
- `scripts/src/features/loader.js`
- `index.html`

Реалізовано:

- Loader переведено на коротший `minimumDuration`.
- Додано стани `is-loader-enter`, `is-loader-open`, `is-hero-ready`.
- Плити відкриваються через motion tokens і центральний slit-layer.

Критерій готовності:

- Loader відкривається як архітектурні плити.
- Після loader рух природно переходить у hero.
- Немає вертикальних ліній/артефактів після видалення loader.

### Етап 3. Hero Як Pinned Scene

Статус: done

Поточна проблема: hero має сильне відео, але scroll-поведінка постійно потребує ручного балансування.

Що зробити:

- Переписати hero на явну структуру шарів:
  - `.hero-scene`
  - `.hero-bg-layer`
  - `.hero-video-layer`
  - `.hero-content-layer`
  - `.hero-dock-layer`
  - `.hero-overlay-trigger`
- Не покладатися тільки на `margin-top` для overlay.
- Ввести CSS custom properties для progress:
  - `--hero-progress`
  - `--hero-title-y`
  - `--hero-video-scale`
  - `--intro-panel-y`
- Керувати ними маленьким JS-модулем без smooth scroll:
  - слухати native scroll;
  - рахувати progress тільки в межах hero;
  - оновлювати CSS variables через `requestAnimationFrame`.

Важливо:

- Це не повернення самописного smooth scroll.
- Це тільки scroll progress controller для одного блоку.
- Нативний scroll залишається.

Файли:

- `scripts/src/features/hero-scroll-scene.js`
- `scripts/src/main.js`
- `styles/sections/hero.css`
- `styles/sections/content.css`

Реалізовано:

- Додано `scripts/src/features/hero-scroll-scene.js`.
- Hero отримав `data-hero-scene`, `data-hero-copy`, `data-hero-dock`, `data-hero-intro`.
- JS керує тільки CSS variables і не перехоплює native scroll.
- Прибрано CSS scroll-timeline для hero-title, який конфліктував зі sticky-поведінкою.

Критерій готовності:

- Hero background не "стрибає" і не їде вниз.
- CTA, lead і stats не зникають раніше часу.
- Intro заходить поверх hero як керований шар, а не як випадковий negative margin.

### Етап 4. Section Reveal Через Маски, А Не Fade

Статус: done

Поточна проблема: більшість блоків просто проявляється через opacity/translate.

Що зробити:

- Додати `data-reveal="mask-up"`, `data-reveal="tile"`, `data-reveal="media-card"`, `data-reveal="text-line"`.
- У `reveal.js` не просто додавати `.is-visible`, а ставити тип reveal.
- Для текстів:
  - split by line або wrapping spans вручну для ключових заголовків;
  - reveal через `clip-path: inset(100% 0 0 0)` -> `clip-path: inset(0)`.
- Для карток:
  - reveal через top/bottom mask;
  - stagger 80-120ms;
  - не піднімати всі картки однаково.
- Для фото:
  - container clip reveal;
  - image scale 1.08 -> 1.0;
  - overlay wipe 100% -> 0%.

Файли:

- `scripts/src/features/reveal.js`
- `styles/sections/content.css`
- `styles/utilities/animations.css`

Реалізовано:

- `reveal.js` тепер призначає типи `line-mask`, `card-tile`, `media-wipe`, `form-panel`, `section-panel`, `tile-transition`.
- Додано CSS для typed reveal states.
- Фото отримали media-wipe і scale-lock після появи.

Критерій готовності:

- Секції відчуваються як відкриття полотен/карток, не як стандартний fade-in.
- Рух стає ближчим до референсу.

### Етап 5. Плиткові Переходи Між Секціями

Статус: partially done

Що додати:

- Для ключових переходів додати `.section-transition-tiles`.
- Плитки мають бути не декоративним фоном, а transition-layer:
  - темно-сині або білі блоки;
  - частково перекривають межу секцій;
  - рухаються від центру або з країв;
  - використовуються тільки 2-3 рази, щоб не перевантажити сайт.

Де використати:

- Hero -> Intro.
- Benefits -> Mission.
- Apply -> Footer.

Файли:

- `index.html`
- `styles/utilities/animations.css`
- `styles/sections/content.css`

Реалізовано:

- Додано перший `.section-transition-tiles` між hero і intro.
- Плити відкриваються від центру через stagger.

Залишається:

- Додати ще 1-2 transition-layer між ключовими секціями після візуальної QA.

Критерій готовності:

- Перехід між секціями має характер референсу: блоки фізично відкривають наступний екран.

### Етап 6. Micro Motion І Cursor

Статус: planned

Поточна проблема: cursor існує, але живе окремо від UI.

Що зробити:

- На hover CTA:
  - cursor стискається;
  - CTA отримує короткий light sweep;
  - border/тінь змінюються за 180-220ms.
- На hover карток:
  - image/card shift не більше 3-5px;
  - icon line draw або rotate до 6deg;
  - без великих scale.
- На language menu:
  - reveal вниз через clip-path;
  - arrow rotate;
  - menu items stagger 30ms.

Файли:

- `scripts/src/features/cursor.js`
- `styles/components/cursor.css`
- `styles/components/header.css`
- `styles/sections/content.css`

Критерій готовності:

- Взаємодії відчуваються дорогими і тихими, не іграшковими.

## Code Review: Поточний Стан Реалізації

### 1. Анімації Розкидані По Файлах

Проблема:

- Keyframes лежать у `styles/utilities/animations.css`.
- Частина animation declarations лежить у `loader.css`, `hero.css`, `content.css`, `responsive.css`.
- Таймінги дублюються вручну.

Ризик:

- Кожна нова правка може ламати ритм іншої анімації.
- Складно зробити референсний scroll-flow, бо немає спільної motion-мови.

Рішення:

- Додати `motion.css` з токенами.
- Поступово замінити raw `cubic-bezier` і duration у компонентах на variables.

### 2. Loader Не Має Явного State Machine

Проблема:

- У `loader.js` є тільки `is-revealing`, `is-hidden`, `loader-cleanup`.
- Таймінги в JS не синхронізовані з тривалістю CSS-анімацій.

Ризик:

- На слабших пристроях або при довгому завантаженні може бути візуальний розрив.
- Важко запускати hero-анімацію точно після loader.

Рішення:

- Зробити стани:
  - `is-loader-enter`
  - `is-loader-hold`
  - `is-loader-open`
  - `is-hero-ready`
- У JS слухати `animationend` головної loader-анімації або мати єдину timeline-конфігурацію.

### 3. Hero Overlay Зараз Залежить Від CSS-Балансу

Проблема:

- Hero залежить від `sticky`, `min-height`, `margin-top`, `top`, `clamp`.
- Це працює, але кожна правка viewport може знову зламати mobile/desktop.

Ризик:

- Важко повторити референс, де scroll progress дуже контрольований.

Рішення:

- Додати `hero-scroll-scene.js`, який керує тільки CSS variables.
- Не чіпати native scroll.
- У CSS лишити fallback для reduced-motion і старих браузерів.

### 4. Scroll Reveal Занадто Загальний

Проблема:

- `reveal.js` додає один клас `scroll-reveal` різним секціям.
- Усі елементи мають приблизно однакову логіку появи.

Ризик:

- Сайт виглядає менш преміально, бо немає різниці між текстом, карткою, фото і формою.

Рішення:

- Ввести типізований reveal:
  - `data-reveal="line-mask"`
  - `data-reveal="card-tile"`
  - `data-reveal="media-wipe"`
  - `data-reveal="form-panel"`

### 5. Cache-Busting Вручну

Проблема:

- У `index.html`, `styles/main.css`, `scripts/main.js`, `scripts/src/main.js` вручну прописані query-string версії.

Ризик:

- При кожній зміні легко забути оновити один із файлів.
- Багато шуму в diff.

Рішення:

- Для поточного static-проєкту короткостроково можна залишити.
- Середньостроково додати простий build script, який оновлює version token у всіх файлах.

### 6. Reduced Motion Є, Але Не Покриває Нову Майбутню Timeline

Проблема:

- Є глобальний `prefers-reduced-motion`, але складні scroll-scenes ще не мають окремого fallback.

Рішення:

- Для кожної нової сцени одразу прописувати:
  - no pin;
  - no scrub;
  - no large translate;
  - content visible by default.

## Рекомендована Технічна Архітектура

### Нові Файли

- `styles/utilities/motion.css`
- `scripts/src/features/hero-scroll-scene.js`
- `scripts/src/features/motion-observer.js`

### Оновлені Файли

- `styles/main.css`
- `styles/components/loader.css`
- `styles/sections/hero.css`
- `styles/sections/content.css`
- `styles/utilities/animations.css`
- `scripts/src/main.js`
- `scripts/src/features/loader.js`
- `scripts/src/features/reveal.js`

### JS-Модулі

`motion-observer.js`:

- Один IntersectionObserver для reveal-елементів.
- Підтримка reveal types.
- Debug state через `window.scoliosisDebug`.

`hero-scroll-scene.js`:

- Рахує progress від `0` до `1` в межах hero.
- Оновлює CSS variables.
- Не робить smooth scroll.
- Не перехоплює колесо/тач.

`loader.js`:

- Перейти від timeout-only до state machine.
- Додати callback/class для старту hero sequence.

## Пріоритет Реалізації

1. Створити motion tokens.
2. Переписати loader під block reveal як у референсі.
3. Зробити hero scroll scene через CSS variables.
4. Переробити reveal.js на typed reveals.
5. Додати tile transitions між 2-3 ключовими секціями.
6. Відполірувати hover/cursor micro motion.
7. Провести QA на:
   - `390x844`
   - `430x932`
   - `1440x900`
   - `1920x1080`
   - `2560x1440`

## Definition of Done

- Loader відкриває сайт через керовані плити, схожі на референс.
- Hero не має випадкового стрибка, просвіту або перекриття CTA.
- Другий блок не просто стоїть під hero, а відчувається як наступний шар.
- Секції відкриваються масками/плитами, а не тільки opacity.
- Анімації мають єдині easing/duration tokens.
- Нативний scroll не замінений smooth-scroll бібліотекою.
- Reduced-motion режим не ламає доступність.
- У `window.scoliosisDebug.inspect()` можна побачити стан основних motion-модулів.
