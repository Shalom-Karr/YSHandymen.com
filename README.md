# Y.S. Handymen — Website

Static marketing site for **Y.S. Handymen**, a handyman service run by Yosef Silberstein,
servicing Cleveland.

- **Phone:** 848-261-9922
- **Email:** yshandymen@gmail.com
- **Slogan:** Quality work. Reliable service. Peace of mind.
- **Tagline:** Small jobs. Big difference. We're here to help.

## Stack

Plain HTML, CSS and vanilla JS. No build step, no framework, no dependencies —
drop the folder on any static host and it works.

## Structure

```
.
├── index.html          Home — hero, services overview, process, promise, CTA
├── services.html       Full service catalogue + FAQ
├── about.html          Who runs it, working principles, guarantee, service area
├── contact.html        Contact details + quote request form
├── css/styles.css      Single stylesheet (design tokens at the top)
├── js/main.js          Nav drawer, scroll reveals, sticky header, form handling
└── assets/
    ├── logo.png            Trimmed logo, dark — for light backgrounds
    ├── logo-white.png      Knockout logo — for navy backgrounds
    ├── mark.png            Hammer-in-fist mark only
    ├── mark-white.png      Knockout mark
    ├── favicon.png         180×180 apple-touch-icon
    ├── favicon-64.png      64×64 favicon
    ├── flyer-*.jpg         Web-optimised flyer artwork used in page sections
    └── source/             Original untouched artwork (masters — keep these)
```

## Brand tokens

Sampled directly from the supplied logo, flyers and business card.
All defined as CSS custom properties at the top of `css/styles.css`.

| Token | Value | Use |
|---|---|---|
| `--navy` | `#03203E` | Primary brand colour, dark sections |
| `--navy-900` | `#021629` | Top bar, footer |
| `--orange` | `#EA7013` | Accent, CTAs, rules, active states |
| `--sky` | `#2FA3EE` | Third slogan line ("Peace of mind.") |
| `--slate` | `#5C6673` | Body copy on light backgrounds |
| `--paper-2` | `#F4F6F9` | Alternating section background |

**Type:** [Oswald](https://fonts.google.com/specimen/Oswald) (condensed, uppercase — display)
paired with [Barlow](https://fonts.google.com/specimen/Barlow) (body). Oswald was chosen
because it closely matches the condensed headline face already used across the flyers
and business card.

**Design direction:** "Blueprint & Steel" — industrial trade craft. Blueprint grid
texture on dark sections, orange safety-stripe dividers, spec-sheet numbering on
service cards, heavy condensed caps.

## Local preview

```bash
python -m http.server 8000
# → http://127.0.0.1:8000
```

## Contact form

`contact.html` has no backend. On submit, `js/main.js` builds a pre-filled `mailto:`
handoff to `yshandymen@gmail.com` so the form works on plain static hosting with zero
configuration.

To wire up a real endpoint (so submissions arrive without opening a mail client),
replace the `mailto:` block in the `#quote-form` submit handler in `js/main.js` with a
`fetch()` POST to a form service — [Formspree](https://formspree.io),
[Netlify Forms](https://docs.netlify.com/forms/setup/) or a Cloudflare Worker all work.

## Things the owner should fill in

These were deliberately left out rather than invented:

- **Customer reviews / testimonials.** No review section was added because there was no
  real review copy to use. Once there are genuine reviews, they're worth adding — social
  proof converts well for trade services.
- **Exact business hours.** Currently stated as "Sunday–Friday, daytime hours." Update in
  the top bar of all four pages and in `contact.html`.
- **Service area specifics.** Currently "Servicing Cleveland" verbatim from the branding.
  Adding the state and a list of covered neighbourhoods would help local SEO.
- **Licensing / insurance.** No claims made. If licensed or insured, say so — it converts.
- **Canonical domain.** `index.html` has a placeholder `<link rel="canonical">` and
  `og:image` pointing at `yshandymen.com`. Update once the real domain is live.

## Deploying

Any static host: GitHub Pages, Netlify, Cloudflare Pages, Vercel.

For GitHub Pages — repo **Settings → Pages → Source: deploy from branch `main`, folder `/root`**.
