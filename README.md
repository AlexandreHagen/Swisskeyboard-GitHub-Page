# SwissKeyboard GitHub Page

Static marketing site (GitHub Pages) built from HTML components loaded dynamically, with an i18n system.

## Run locally

This site loads components via `fetch(...)`, so it **will not work** when opening `index.html` with `file://`.

Start a local server:

```bash
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

## Quick structure

- `index.html` : main page, loads components and initializes i18n + script.
- `components/` : HTML sections (navigation, hero, cta, etc.).
- `styles.css` : global styles.
- `js/i18n.js` : language handling.
- `js/translations.json` : translated strings.
- `script.js` : animations and front-end logic (map, newsletter, etc.).

## Internationalization (i18n)

- Copy lives in `js/translations.json`.
- Elements use `data-i18n` / `data-i18n-placeholder` / `data-i18n-title`.
- Language is chosen via URL (`?lang=fr`) or stored in localStorage.

## “Join” form (CTA)

The email form uses a `mailto:` to send an email to `contact@swisskeyboard.ch`.

- Subject and body are localized via:
  - `cta.emailSubject`
  - `cta.emailBody`
- The subject always appends the English version in parentheses to help inbox filtering.
- The `{email}` placeholder is replaced with the submitted address.

## Map

The script expects a `#swissMap` element to animate the map.
Currently, `components/map-section.html` is empty, so map init is skipped without blocking the rest.
If you add the map, make sure the SVG element has `id="swissMap"`.

## Deployment

The site is static and can be hosted on GitHub Pages.
The custom domain is configured via `CNAME`.
