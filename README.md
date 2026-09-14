# WebMint — Agency Website

A one-page marketing site for WebMint, a web development & digital experience
agency. Built with plain HTML5, CSS3 and vanilla JavaScript — no build step,
no frameworks, no dependencies.

## Running it locally

You can just open `index.html` directly in a browser, or serve it with any
static server for the most accurate experience (some browsers restrict
certain features on the `file://` protocol):

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Project structure

```
/
├── index.html
├── styles.css
├── script.js
├── robots.txt
├── sitemap.xml
├── assets/
│   └── logo/
│       └── mark.svg        # W + leaf brand mark (used in nav, footer, favicon)
└── README.md
```

## Design system

Brand tokens live at the top of `styles.css` as CSS custom properties:

- `--color-dark` (#142725), `--color-mint` (#6CBF91), `--color-white`,
  `--color-grey`, `--color-mint-light`.
- `--color-mint-deep` (#2F7D57) — a darker mint reserved for **text** on
  light backgrounds. The brand mint doesn't meet WCAG AA contrast as text
  on white, so anywhere mint is used for a label, number or headline word
  on a light section, this deeper shade is used instead. The original
  brand mint is still used everywhere else (buttons, borders, glows, and
  text on dark backgrounds, where its contrast is fine).

Typeface: Plus Jakarta Sans, loaded from Google Fonts in `index.html`.

## Content that needs real data before launch

A few sections are intentionally left as clearly-labelled placeholders
rather than fabricated content:

- **Selected Work** — all four projects are marked "Concept Project" since
  WebMint has no client work yet. Swap in real case studies (and real
  screenshots in place of the CSS-drawn mockups) as they're completed.
- **Social Proof** — stats show as "—" rather than invented numbers. Once
  there's real data, replace `data-target="0"` with a real positive number
  on each `.proof__value` in `index.html`; the counter animation in
  `script.js` will pick it up automatically.

## Contact form

The enquiry form (`#enquiryForm`) does full client-side validation but
**is not wired to send anywhere yet** — see the `handleValidSubmit()`
function in `script.js`. Before launch, connect it to one of:

- [Formspree](https://formspree.io)
- [EmailJS](https://www.emailjs.com)
- A custom backend endpoint

The code comment in `script.js` marks exactly where to add the request.

## Browser support

Uses modern, broadly-supported CSS (Grid, `clamp()`, `gap`, custom
properties) and progressively enhances with `IntersectionObserver` for
scroll reveals and animated counters — both degrade gracefully (content is
simply shown immediately) if JavaScript doesn't run or the API is
unavailable. Motion respects `prefers-reduced-motion`.
