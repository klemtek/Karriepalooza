# Karriepalooza

Static invitation site for Karriepalooza.com.

## Files

- `index.html` contains the page content, RSVP form, map embed, hotels, and airport details.
- `styles.css` contains the poster-inspired theme.
- `script.js` controls local story-board unlock behavior and saves submitted stories in the visitor's browser.
- `data/rsvps.json` powers the public RSVP list.
- `data/rsvps.csv` is the downloadable RSVP export.
- `.github/workflows/export-rsvps.yml` can export RSVPs from FormSubmit into the GitHub repo.
- `assets/karriepalooza-hero.png` is the generated no-text hero illustration based on the provided poster theme.

## RSVP Routing

The RSVP form posts to FormSubmit with subject `KarriePalooza RSVP`.
The destination is intentionally not displayed on the page. RSVP submissions
also CC Bonni. The first live submission may require confirming FormSubmit from
the destination inbox.

## RSVP Export

The public guest list loads from `data/rsvps.json`. New submissions show
immediately for the person who submitted the RSVP, and the shared list updates
after the GitHub Actions export runs.

To enable the shared database export:

1. Get a FormSubmit API key for the primary RSVP inbox.
2. Add it to the GitHub repo as an Actions secret named `FORMSUBMIT_API_KEY`.
3. Run the `Export RSVPs from FormSubmit` workflow manually, or wait for the
   scheduled 15-minute export.

The workflow updates:

```text
data/rsvps.json
data/rsvps.csv
```

## Story Board Password

The current front-end story-board password is:

```text
karrie70
```

The story board is front-end password gated. The RSVP export intentionally
keeps funny stories out of the public guest list.

## Deploy With GitHub Pages

This repo includes a `CNAME` file for:

```text
karriepalooza.com
```

Publish from GitHub Pages using the `main` branch and the repository root. In
GoDaddy DNS, point the root domain to GitHub Pages with A records, and point
`www` to your GitHub Pages default domain with a CNAME record.
