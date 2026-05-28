# Karriepalooza

Static invitation site for Karriepalooza.com.

## Files

- `index.html` contains the page content, RSVP form, map embed, hotels, and airport details.
- `styles.css` contains the poster-inspired theme.
- `script.js` controls local story-board unlock behavior and saves submitted stories in the visitor's browser.
- `assets/karriepalooza-hero.png` is the generated no-text hero illustration based on the provided poster theme.

## RSVP Routing

The RSVP form posts to FormSubmit with subject `KarriePalooza RSVP`.
The destination is intentionally not displayed on the page. The first live
submission may require confirming FormSubmit from the destination inbox.

## Story Board Password

The current front-end story-board password is:

```text
karrie70
```

For real private shared stories across all visitors, add a backend or form service with storage. The current version gates the board in the browser and sends each story with the RSVP.

## Deploy With GitHub Pages

This repo includes a `CNAME` file for:

```text
karriepalooza.com
```

Publish from GitHub Pages using the `main` branch and the repository root. In
GoDaddy DNS, point the root domain to GitHub Pages with A records, and point
`www` to your GitHub Pages default domain with a CNAME record.
