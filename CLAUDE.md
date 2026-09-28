# CLAUDE.md — candle-craft-admin

Admin panel for Candle Craft. Follow these project conventions in every change.

## Stack

- React 19 + Vite + TypeScript
- HeroUI (`@heroui/react`) + Tailwind 4
- React Router, Zustand, react-hook-form, axios
- Framer Motion for animations
- Package manager: **bun** only

## Architecture (DDD)

```
src/
  domain/           # entities, value objects, business rules — no React/axios
  application/      # use cases, ports
  infrastructure/   # API adapters, storage
  presentation/     # pages, UI features, UI hooks
  shared/           # i18n, config, pure utils
```

- Presentation must not call axios directly; go through application → infrastructure
- Feature folders map to bounded contexts (`categories`, `products`, `auth`, …)

## UI

- All UI components from **HeroUI** — no custom buttons/inputs/modals/tables when HeroUI provides them
- Forms: react-hook-form + HeroUI controls
- Typography: body/UI — **DM Sans** (`font-sans`); headings/brand — **Fraunces** (`font-heading`, `font-family: Fraunces, serif`)
- Fonts are loaded in `index.html` (Google Fonts) and tokens live in `src/global.css` `@theme`

## i18n (ro / ru)

- Locales: **Romanian (`ro`)** and **Russian (`ru`)**
- No hardcoded user-facing strings — always `t('...')`
- Every new key must be added to **both** locale files in the same change
- Bilingual content fields: `{ ro: string; ru: string }`

## Animations

- Use **framer-motion** (`motion`, `AnimatePresence`) for page/list/modal transitions
- Prefer purposeful, light motion over CSS-only animation hacks

## Other

- Code comments: do not add unless explicitly requested
- Git commits: English only; do not commit unless asked
- Swagger/API docs: English only
- Answers to the user: Russian
