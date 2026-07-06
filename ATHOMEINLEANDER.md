# At Home In Leander — Static HTML Site

A modern, self-contained static rebuild of the WordPress site
[athomeinleander.com](https://athomeinleander.com) — the Leander, Texas real
estate & community guide by **Betty Saenz, REALTOR® (eXp Realty)**,
phone **(512) 785-5050**.

The site is plain HTML/CSS/JS with no server, database, or build step required
to host it. Everything the browser needs lives under [`public/`](public/).

> Note: this document covers the At Home In Leander rebuild that lives on the
> `claude/wordpress-html-redesign-z1g8dy` branch. The repository's root
> `README.md` describes a separate project and has been left untouched.

## Structure

```
public/                     ← deployable web root (upload this anywhere)
  index.html                ← home page
  <slug>/index.html         ← every migrated page (clean URLs preserved)
  assets/
    css/style.css           ← all styling
    js/main.js              ← nav dropdowns + mobile menu
    img/                    ← logo, agent photo, and all in-content images
    docs/                   ← Texas IABS & Consumer Protection Notice PDFs
build/
  build.py                  ← generator that migrated the WordPress content
```

## Functions carried over from WordPress

| WordPress feature | Static replacement |
|---|---|
| Multi-level nav + mobile ☰ menu | CSS dropdowns + `assets/js/main.js` |
| Contact form | Click-to-call `tel:` + `mailto:` + eXp Realty link |
| Search Properties | Diverse Solutions IDX search iframe (live MLS) |
| Blog + posts | `/blog/` index + static post pages |
| ~50 neighborhoods, listings, resources | Static pages on a shared template |
| Images from `wp-content/uploads` | Downloaded locally — no WordPress dependency |

## Hosting

Upload the contents of `public/` to any static host (Netlify, Cloudflare Pages,
GitHub Pages, S3, or classic web hosting). Clean URLs like `/about/` work
because each page is an `index.html` inside its own folder.

Local preview:

```bash
python3 -m http.server -d public 8080
# open http://localhost:8080
```

## Regenerating from the live site

The generator re-scrapes the live WordPress site and rebuilds `public/`
(images are cached on disk, so re-runs are fast):

```bash
python3 build/build.py
```

## Notes

- The contact form was intentionally replaced with call/email links (no backend
  needed). A hosted form service can be added later if desired.
- Betty's public email and the IDX account are wired into `build/build.py`
  constants near the top of the file.
- One source blog post (`national-night-out-2017-leander-texas`) currently
  returns HTTP 500 from the live WordPress server, so it could not be migrated.
