# Y.S. Handymen LLC — Website

Static marketing site for **Y.S. Handymen LLC**, a handyman service run by Yosef
Silberstein, servicing Cleveland.

- **Live:** https://yshandymen.com
- **Phone:** 848-261-9922
- **Email:** yshandymen@gmail.com
- **WhatsApp:** https://wa.me/18482619922 (click-to-chat, message pre-filled)
- **Slogan:** Quality work. Reliable service. Peace of mind.
- **Tagline:** Small jobs. Big difference. We're here to help.

## Stack

Plain HTML, CSS and vanilla JS. No build step, no framework — deployed on
Cloudflare Pages. Dynamic content (reviews, before/after gallery, owner console)
runs on Supabase (Postgres + Auth + Storage) called directly from the browser
via `@supabase/supabase-js` off the CDN; row-level security does all the
gatekeeping, so no server is involved anywhere.

## Structure

```
.
├── index.html          Home — hero, services, process, promise, areas served, CTA
├── services.html       Full service catalogue + FAQ
├── about.html          Who runs it, working principles, guarantee, service area
├── contact.html        Contact details + quote request form
├── gallery.html        Before/after project photos, loaded from Supabase
├── reviews.html        Approved customer reviews + public submission form
├── admin.html          Owner console — Supabase Auth login, moderation, uploads (noindex)
├── sitemap.xml         Generated — update if pages are added
├── robots.txt
├── supabase/schema.sql Tables, RLS policies, storage bucket — run in the SQL editor
├── css/styles.css      Single stylesheet (design tokens at the top)
├── js/main.js          Nav drawer, scroll reveals, sticky header, form handling
├── js/db.js            Supabase client init + tiny shared helpers
├── js/reviews.js       Reviews page: list approved, submit new (arrive unapproved)
├── js/gallery.js       Gallery page: render before/after cards from the DB
├── js/admin.js         Owner console: auth, review moderation, gallery uploads
└── assets/
    ├── logo.png                Full logo, dark — for light backgrounds
    ├── logo-white.png          Knockout full logo — for navy backgrounds
    ├── logo-compact.png        Header lockup (no phone line) — used in nav
    ├── logo-compact-white.png  Knockout header lockup — used in footer
    ├── mark.png / mark-white.png   Hammer-in-fist mark only
    ├── favicon.png (180) / favicon-64.png
    ├── og-image.jpg            1200x630 social preview card (generated)
    ├── flyer-*.jpg             Web-optimised flyer artwork used in page sections
    └── source/                 Original untouched artwork (masters — keep these)
```

All derived assets were generated from `assets/source/` with Pillow — the knockout
versions recolour dark pixels to white and drop the white background to transparent,
so the logo works on navy without a separate file from the designer.

## Services offered

Plumbing repairs · Fixture replacements · Garbage disposals · Mounting & assembly ·
Vent cleaning · Vinyl flooring (small jobs) · General handyman work

## Brand tokens

Sampled directly from the supplied logo, flyers and business card.
All defined as CSS custom properties at the top of `css/styles.css`.

| Token | Value | Use |
|---|---|---|
| `--navy` | `#03203E` | Primary brand colour, dark sections |
| `--navy-900` | `#021629` | Top bar, footer |
| `--orange` | `#EA7013` | Fills, rules, icons, CTAs |
| `--orange-ink` | `#B4530A` | **Orange text on light backgrounds only** |
| `--orange-400` | `#F58C3A` | Orange text on navy |
| `--sky` | `#2FA3EE` | Third slogan line ("Peace of mind.") |
| `--slate` | `#5C6673` | Body copy on light backgrounds |

**Type:** [Oswald](https://fonts.google.com/specimen/Oswald) (condensed, uppercase — display)
paired with [Barlow](https://fonts.google.com/specimen/Barlow) (body). Oswald was chosen
because it closely matches the condensed headline face already used across the flyers
and business card.

**Design direction:** "Blueprint & Steel" — industrial trade craft. Blueprint grid
texture on dark sections, orange safety-stripe dividers, spec-sheet numbering on
service cards, heavy condensed caps.

### Two colour rules worth knowing

Both were live bugs, both are now guarded by comments in the stylesheet:

1. **Brand orange is 3.08:1 on white** — fine for fills and graphics, fails WCAG AA
   as small text. Use `--orange-ink` for orange text on light backgrounds. Where white
   sits *on* orange (buttons, trust strip, call bar), type is set at 19.2px/700 so it
   qualifies as WCAG large text and passes at 3.08:1 without dulling the orange.
2. **Dark sections need explicit overrides.** `.hero`, `.page-head` and `.cta-band` are
   navy but are not `.on-navy`. Anything inheriting a light-background colour there
   renders muddy or invisible — this put navy-on-navy buttons in the hero and slate body
   copy on the navy CTA band. If you add a new dark section, add it to the override
   selector lists near the top of the stylesheet.

Verified with a scripted audit: **no horizontal overflow at 320–2560px, and all text
passes WCAG AA** at both 390px and 1440px across all four pages.

## Local preview

```bash
python -m http.server 8000
# → http://127.0.0.1:8000
```

## Deployment

`.github/workflows/deploy.yml` deploys every push to `main` to the Cloudflare Pages
project **`yshandymen`** in the client's Cloudflare account (the account that holds the
`yshandymen.com` zone). It stages only the site files (HTML, `css/`, `js/`, `assets/`,
`robots.txt`, `sitemap.xml`) so repo-only files like this README are never published.

The workflow needs two GitHub repo secrets (**Settings → Secrets and variables →
Actions**), both from the **client's** Cloudflare account:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → any zone → Overview, right sidebar |
| `CLOUDFLARE_API_TOKEN` | Dashboard → My Profile → API Tokens → Create Token → custom token with **Account · Cloudflare Pages · Edit** |

One-time steps after the first successful deploy (the workflow auto-creates the Pages
project):

1. Dashboard → Workers & Pages → `yshandymen` → **Custom domains** → add
   `yshandymen.com` (and optionally `www.yshandymen.com`). The zone is in the same
   account, so Cloudflare creates the DNS records automatically.
2. Delete the old `yshandyman` Pages project in the previous (Shalomkarr) account —
   it is Git-connected to this repo and will otherwise keep deploying in parallel.

## Reviews, gallery & owner console (Supabase)

Project: `ahpdemhyqxcdgxqeyzot.supabase.co`. The anon key in `js/db.js` is a
public client token — every read and write is gated by row-level security,
defined in `supabase/schema.sql` (idempotent; paste into the SQL editor to
set up or repair).

**Data model**

- `reviews` — anyone can insert (forced `approved = false`); the public can
  only read approved rows; admins read/update/delete everything.
- `gallery` — public read; admin-only writes. Images live in the public
  `gallery` storage bucket (10 MB cap, jpeg/png/webp only, admin-only writes).
- `admins` — emails with moderation rights (seeded with the owner). The
  `is_admin()` security-definer function is the single source of truth for
  every policy and for the console's UI routing (`rpc('is_admin')`).

**Owner console** (`admin.html`, linked as "Owner Login" in the footer,
noindexed): email/password sign-in via Supabase Auth. Being signed in grants
nothing — the email must also be in `admins`. From there the owner approves,
edits, unpublishes or deletes reviews, and posts/deletes before-and-after
projects (two photos upload to storage, then a `gallery` row is inserted).

**One-time setup**: run `supabase/schema.sql`, then create the login under
Authentication → Users → Add user (owner's email + password, Auto Confirm).
To add another moderator: add the email to `admins` and create a login for it.

## Contact form

The quote form posts to [Web3Forms](https://web3forms.com) — free tier, 250 submissions
per month, no server and no account to maintain. The access key is **already set** in
`WEB3FORMS_KEY` at the top of the contact-form section in `js/main.js`; submissions go
to `yshandymen@gmail.com`. The key is a public submission token — safe to commit. To
rotate it, request a new key for the same email at https://web3forms.com and replace
the value.

Until a key is set the form **still works**: it falls back to a pre-filled `mailto:`
handoff. The form also carries a hidden honeypot field that silently drops bot
submissions.

## WhatsApp

Click-to-chat uses `wa.me` — no API, no account, no cost. The link opens WhatsApp
(app on mobile, WhatsApp Web on desktop) with a message pre-filled:

```
https://wa.me/18482619922?text=Hi%20Y.S.%20Handymen%2C%20I%27d%20like%20a%20quote%20for%20a%20job.
```

The number must be in full international format with no `+`, spaces or dashes —
`18482619922`. If the business number ever changes, update it in all four HTML files
and in the `sameAs` / `WA` entries of the SEO generator.

Placed in: the homepage hero, every CTA band, the footer contact list, the contact-page
details, and the sticky mobile bar.

The button uses `#0F7A6D` rather than WhatsApp's own `#25D366` — white text on the
official green is only 1.8:1 and would be unreadable. This teal clears 5.2:1 at any
size while still reading as WhatsApp.

## Social previews

`assets/og-image.jpg` is a purpose-built 1200x630 card (navy, blueprint grid, knockout
logo, headline, phone and slogan triad) rather than the bare logo, which would letterbox
badly in a link preview. It's referenced by `og:image` and `twitter:image` with explicit
width/height/alt on all four pages.

It's generated, not hand-drawn — the script lives in the git history for this commit and
uses Arial Narrow Bold as a local stand-in for Oswald. Regenerate it if the tagline or
phone number changes.

## SEO

Targeted at local searches like "handyman Cleveland" / "handyman near me".

- Keyword-front-loaded `<title>` and meta descriptions per page
- The target phrase sits inside the `<h1>` on every page
- Geo meta tags (`geo.region`, `geo.placename`, `geo.position`, `ICBM`)
- Open Graph + Twitter card tags
- `sitemap.xml` and `robots.txt`
- An "Areas We Serve" section on the homepage listing the covered suburbs
- **JSON-LD** on every page:
  - `LocalBusiness` / `HomeAndConstructionBusiness` with `areaServed`, `geo`,
    opening hours and a full `hasOfferCatalog` of services
  - `FAQPage` on services.html — the seven questions in the markup match the seven
    visible on the page, which Google requires
  - `BreadcrumbList` on all subpages, plus `WebSite` / `AboutPage` / `ContactPage`

### After launch

- Create a **Google Business Profile** — for "handyman in Cleveland" this will drive
  more traffic than the site itself. The site then acts as the landing page.
- Submit `sitemap.xml` in Google Search Console.

## Things the owner should confirm or supply

- **Exact business hours.** Currently "Sunday–Friday, daytime hours" with
  "Closed Shabbos & Yom Tov". Schema declares 08:00–17:00 Sun–Fri. Update in the top
  bar of all pages, in `contact.html`, and in the JSON-LD.
- **Licensing / insurance.** No claims made. If licensed or insured, say so — it converts.
- **`AggregateRating` schema.** Once a handful of genuine reviews are approved, the
  average rating can be added to the JSON-LD for star snippets in search results.

Resolved: the city is confirmed as **Cleveland, Ohio** (the 848 number is a kept
New Jersey cell), and customer reviews are now collected live on `reviews.html`
with owner moderation.
