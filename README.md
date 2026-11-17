# Sky Auto Spa

Static website and owner dashboard, hosted on Netlify. Build with `CMS_REPOSITORY=alexanderkerr-gif/sky-auto-spa node build.mjs`; publish `dist/`.

## Section-based editing

Open `/admin/`, then choose a section in the sidebar or Website sections:

- **Navigation** — logo, branding, menu links, mobile labels and header phone visibility.
- **Hero** — eyebrow, heading, supporting copy, desktop/mobile images, alt text and two buttons.
- **50/50 Feature** — image, heading/highlight, body, ordered detail/service rows and button.
- **Full-width Showcase** — heading/highlight, wide image, caption, story heading, paragraphs and optional button.
- **Location & Details** — business name, address, phone, hours, map and directions button.
- **FAQs** — heading and ordered questions/answers. Answers can be custom or automatically use hours/address.
- **SEO & Footer** — search title/description and footer labels.

Each section has its own JSON file under `content/` and its own Decap CMS file collection. Publishing one section changes only its file. The old all-in-one form is retired; previous content remains in Git history.

Dashboard routes use `/admin/#edit/hero` (and the other collection IDs). They open the matching authenticated editor directly. Frames remain mounted when switching sections so unsaved work is not discarded simply by using the sidebar. A full page reload can still discard edits.

Phone/directions buttons use Location & Details by default. Choose Custom for another URL. Menu links use `#home`, `#services`, `#about`, `#visit`, or `#faqs`. Upload images through the CMS. Do not add secrets to any content file.

## Publishing

GitHub OAuth is configured in Netlify. Editors need repository write access. Netlify builds on commits to main; publishing in the CMS saves content, and deployment must succeed before it appears publicly. No bookings, payments, or contact form backend is configured.

## Validation

Run `node tests/sections.mjs` for section/schema/render/security regression checks. Build validates uploaded image paths, link protocols, phone format and FAQ answers. Existing public layout styles are preserved.
