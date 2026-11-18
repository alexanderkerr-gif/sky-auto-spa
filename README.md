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

Each section has its own JSON file under `content/` and its own native dashboard form. Publishing one section changes only its file. The old all-in-one form is retired; previous content remains in Git history.

Dashboard routes use `/admin/#edit/hero` (and the other collection IDs). They open the matching authenticated editor directly. Frames remain mounted when switching sections so unsaved work is not discarded simply by using the sidebar. A full page reload can still discard edits.

Phone/directions buttons use Location & Details by default. Choose Custom for another URL. Menu links use `#home`, `#services`, `#about`, `#visit`, or `#faqs`. Upload images through the CMS. Do not add secrets to any content file.

## Publishing

GitHub OAuth is configured in Netlify. Editors need repository write access. Netlify builds on commits to main; publishing in the CMS saves content, and deployment must succeed before it appears publicly. No bookings, payments, or contact form backend is configured.

## Validation

Run `node tests/sections.mjs` for section/schema/render/security regression checks. Build validates uploaded image paths, link protocols, phone format and FAQ answers. Existing public layout styles are preserved.

## Native editing and publishing

The admin has no embedded CMS or iframe. Forms use the dashboard styles and the structured field schema in cms-config.json. That filename is retained for schema compatibility; Decap is no longer loaded.

Sign in with GitHub through the existing Netlify OAuth provider. Only users with repository write access can publish. The access token stays in memory, never in browser storage. Refreshing requires signing in again.

Save draft stores text changes in this browser only. Pending photo bytes stay in the open tab until publishing; after closing the tab, reselect pending photos. Reload section explicitly discards that section's draft after confirmation.

Publishing checks the latest section content for conflicting changes, uploads new images, creates one commit containing the section and photos, and advances main without force. Netlify then builds. The editor reports repository save separately from deployment completion. If deployment fails, check Netlify's build log.

Validation: node tests/native-editor.mjs and node tests/sections.mjs after building. OAuth and actual publishing also need a signed-in browser acceptance test.
