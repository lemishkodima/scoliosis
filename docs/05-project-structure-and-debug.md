# Project structure and debug map

This prototype is intentionally kept without a bundler. The browser loads `styles/main.css` and `scripts/main.js`; those files only route work to smaller files.

## CSS

- `styles/base/base.css` - tokens, typography, reset, global layout
- `styles/components/loader.css` - loading screen and block reveal
- `styles/components/cursor.css` - desktop custom cursor
- `styles/components/header.css` - header, navigation, language dropdown, shared buttons
- `styles/sections/hero.css` - hero video, hero content, legacy logo/orbit styles
- `styles/sections/content.css` - intro, benefits, mission, audience, gallery, steps, CTA sections
- `styles/components/form.css` - membership form
- `styles/components/footer.css` - footer and screen-reader helpers
- `styles/utilities/animations.css` - keyframes
- `styles/utilities/responsive.css` - media queries and reduced-motion behavior

## JavaScript

- `scripts/src/config/translations.js` - all localized copy
- `scripts/src/core/dom.js` - shared selectors and DOM helpers
- `scripts/src/core/debug.js` - exposes the debug API
- `scripts/src/features/i18n.js` - language dropdown and text replacement
- `scripts/src/features/loader.js` - page loader lifecycle
- `scripts/src/features/cursor.js` - custom cursor
- `scripts/src/features/depth-background.js` - distant background and hero-video parallax depth
- `scripts/src/features/header.js` - sticky/scrolled header state
- `scripts/src/features/hero-video.js` - hero video loop fade
- `scripts/src/features/hero-interactions.js` - logo tilt and optional canvas particles
- `scripts/src/features/reveal.js` - scroll reveal cards
- `scripts/src/features/form.js` - membership form validation and prototype payload
- `scripts/src/main.js` - initializes all systems

## Browser debug API

Open DevTools and run:

```js
window.scoliosisDebug.inspect()
```

Useful focused checks:

```js
window.scoliosisDebug.systems.heroVideo.getState()
window.scoliosisDebug.systems.depthBackground.getState()
window.scoliosisDebug.systems.language.getState()
window.scoliosisDebug.systems.loader.getState()
window.scoliosisDebug.systems.form.getState()
```

The API is meant for prototype debugging only. It can be removed or guarded before production.

The page also sets `data-debug-api="ready"` on `<html>` after the debug layer is initialized.
