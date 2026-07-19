# Y.S. Handymen — Website

Static marketing site for **Y.S. Handymen**, a handyman service run by Yosef Silberstein,
servicing Cleveland.

- **Live:** https://yshandyman.pages.dev
- **Phone:** 848-261-9922
- **Email:** yshandymen@gmail.com
- **Slogan:** Quality work. Reliable service. Peace of mind.
- **Tagline:** Small jobs. Big difference. We're here to help.

## Stack

Plain HTML, CSS and vanilla JS. No build step, no framework, no dependencies —
drop the folder on any static host and it works. Deployed on Cloudflare Pages.

## Structure

```
.
├── index.html          Home — hero, services, process, promise, areas served, CTA
├── services.html       Full service catalogue + FAQ
├── about.html          Who runs it, working principles, guarantee, service area
├── contact.html        Contact details + quote request form
├── sitemap.xml         Generated — update if pages are added
├── robots.txt
├── CLIENT-web3forms-setup.txt   Plain-English setup note to send the owner
├── css/styles.css      Single stylesheet (design tokens at the top)
├── js/main.js          Nav drawer, scroll reveals, sticky header, form handling
└── assets/
    ├── logo.png                Full logo, dark — for light backgrounds
    ├── logo-white.png          Knockout full logo — for navy backgrounds
    ├── logo-compact.png        Header lockup (no phone line) — used in nav
    ├── logo-compact-white.png  Knockout header lockup — used in footer
    ├── mark.png / mark-white.png   Hammer-in-fist mark only
    ├── favicon.png (180) / favicon-64.png
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

## Contact form

The quote form posts to [Web3Forms](https://web3forms.com) — free tier, 250 submissions
per month, no server and no account to maintain. **It needs a one-minute activation
step**, described in plain language in `CLIENT-web3forms-setup.txt` (written to be
forwarded straight to the owner):

1. Enter `yshandymen@gmail.com` at https://web3forms.com
2. An access key arrives by email
3. Paste it into `WEB3FORMS_KEY` at the top of the contact-form section in `js/main.js`

The key is a public submission token — safe to commit.

Until a key is set the form **still works**: it falls back to a pre-filled `mailto:`
handoff. The form also carries a hidden honeypot field that silently drops bot
submissions.

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
- Update `BASE` in the SEO block if a custom domain replaces the pages.dev URL.

## Things the owner should confirm or supply

Deliberately left out rather than invented:

- **⚠️ Which Cleveland.** The source branding says only "Servicing Cleveland". The site
  assumes **Cleveland, Ohio** and lists Ohio suburbs (Cleveland Heights, University
  Heights, Beachwood, South Euclid, Lyndhurst, Shaker Heights, Mayfield Heights,
  Richmond Heights, Pepper Pike). Note the phone number is an 848 area code, which is
  New Jersey — most likely a kept cell number, but **confirm this before promoting the
  site**, since the city drives all the local SEO and schema.
- **Customer reviews / testimonials.** No review section was added because there was no
  real review copy to use. Once there are genuine reviews they're worth adding —
  social proof converts well for trade services, and `AggregateRating` schema can then
  be added.
- **Exact business hours.** Currently "Sunday–Friday, daytime hours" with
  "Closed Shabbos & Yom Tov". Schema declares 08:00–17:00 Sun–Fri. Update in the top
  bar of all four pages, in `contact.html`, and in the JSON-LD.
- **Licensing / insurance.** No claims made. If licensed or insured, say so — it converts.
