# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing site for SwissKeyboard (swisskeyboard.ch) — a voice-to-text keyboard app for Swiss dialects. Deployed on GitHub Pages with custom domain via `CNAME`. No build system, no npm, no bundlers — pure HTML/CSS/JS.

## Local Development

Components load via `fetch()`, so `file://` won't work. Use a local server:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

There are no tests, linters, or build commands.

## Architecture

### Component Loading

`index.html` and `privacy.html` dynamically load HTML fragments from `components/` via async `fetch()`. Components are injected into placeholder `<div>` elements, then any inline `<script>` tags within them are re-executed. All components load in parallel (`Promise.all`), then i18n initializes, then `script.js` loads.

### i18n System

- **Engine:** `js/i18n.js` — exposes `window.i18n` with `init()`, `t(key)`, `setLanguage(lang)`, `getCurrentLanguage()`
- **Data:** `js/translations.json` — flat file with 5 top-level language keys: `de`, `fr`, `it`, `rm`, `en`
- **Binding:** HTML elements use `data-i18n="key.path"` for text, `data-i18n-placeholder` for placeholders, `data-i18n-title` for title attributes
- **Language detection priority:** URL param (`?lang=fr`) > localStorage (`swisskeyboard_lang`) > browser language > default (`de`)
- **Cache busting:** translations fetched with `?v=${TRANSLATIONS_VERSION}` — bump the version constant in `i18n.js` when changing translations
- **Meta tags:** page title, description, OG tags, Twitter cards, and canonical URLs update dynamically per language

### Key Files

- `index.html` — main page; contains inline wave background animation (canvas-based, ~15fps, paused when tab hidden)
- `privacy.html` — privacy policy page with same i18n system, loads only the navigation component
- `script.js` — canton map interaction, newsletter mailto form, hero animations
- `styles.css` — all global styles (~1300 lines), responsive with breakpoints at 768px and 480px
- `components/navigation.html` — header with Edelweiss logo, brand name (links to `/`), and language switcher dropdown

### CTA Email Form

Uses `mailto:` links with localized subject/body from `cta.emailSubject` and `cta.emailBody` translation keys. The `{email}` placeholder in `emailBody` is replaced with the user's input. Subject always appends the English version for inbox filtering.

## Content & Copy

All user-facing text lives in `js/translations.json`, not in HTML. When editing copy, update all 5 languages. The `privacy.html` file also has inline German text as fallback before i18n loads — keep it in sync with the `de` translations.

## Analytics

Umami Analytics (cookie-free, GDPR compliant) is included via a `<script>` tag in both HTML pages. The privacy policy in all 5 languages discloses this under the analytics and third-party sections.
