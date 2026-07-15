# Alpine Capital — ECM Credentials Site

A single-page website that presents Alpine Capital's ECM credentials deck and a
guide to opening an account, styled in the Alpine Capital brand (deep teal +
orange).

## What it does

From the landing page, visitors choose one of two paths:

1. **View ECM Transactions** — a full-screen deck viewer that flicks through all
   31 slides of the June 2026 ECM Credentials deck.
   - Next / previous arrows, `←` `→` keyboard keys, and touch swipe
   - Progress bar + slide counter
   - "All slides" thumbnail grid to jump to any slide
   - Fullscreen mode
2. **Open an Account** — a step-by-step guide to becoming an Alpine client, with
   the team's contact details.

## Structure

```
index.html              # landing + deck viewer + account steps (one page, JS view switching)
assets/css/style.css    # Alpine-branded styles
assets/js/app.js         # router + slide deck viewer
assets/slides/           # slide-01.jpg … slide-31.jpg (rendered from the PDF deck)
```

## Running locally

It's a static site — serve the folder with any static server, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Updating the deck

The slides are images rendered from the source PDF. To refresh them:

```bash
pdftoppm -jpeg -jpegopt quality=88 -r 150 "Alpine_Capital_ECM_Credentials.pdf" assets/slides/slide
```

If the number of slides changes, update `TOTAL` at the top of `assets/js/app.js`.
