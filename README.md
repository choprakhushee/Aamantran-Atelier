# Aamantran Atelier

The studio website — invitations, written in light and motion.

A walk through a palace: the gate (the chhatri is engraved in gold and the doors swing open),
the forecourt, a corridor of cusped arches whose doors open as you scroll, then the Darbar,
the Gallery (a live sample invitation playing the five signature motions), the Colonnade,
the Toshakhana (Signature, Couture and Heirloom), the Atelier (how an invitation comes to life)
and the Writing Room, where couples send an enquiry.

Built to the Palace Parlour brand kit (`aamantran-brand`): patterns, motifs, the chhatri seal and
the A emblem in `assets/` come from it.

## Files

```
index.html            the page
css/site.css          styles
js/site.js            the gate, the corridor, the live invitation, the enquiry form
assets/logos|patterns|motifs   from the brand kit
assets/art/           illustrations (see its README)
tools/enquiry-apps-script.gs   receives enquiries into a Google Sheet
```

No build step. Open `index.html` through any static server, or publish with GitHub Pages
(Settings → Pages → Deploy from branch → `main` / root).

## The gallery wall

Every painting on the gallery wall comes from `assets/gallery.json`, in wall order. To add or
swap an invitation, edit that file; no code changes are needed. Each entry has:

- `title`, `style`, `package` ("Ready design" or "Couture"), `sample` (true for non-client work)
- `frame`: carved, brass, floral, temple, phulkari or lacquer
- `poster`: a 9:16 still, about 720 × 1280 (put it in `assets/gallery/`)
- `video`: optional muted 8–12 second loop, MP4, 9:16, under 3 MB; it plays when the painting is
  on screen or hovered, and in the phone when opened
- `website`: optional; when set, the viewer shows the site in the phone and offers
  "See the wedding website"

The posters there now (except Lotus Arch) are placeholders and are marked as such.

## Personal links

Add `?for=Riya&with=Arjun` to the site's address before you send it to a couple. The welcome room
greets them by name, their names appear in the live invitation, and the enquiry form is filled in.

## Connecting the enquiry form (about 5 minutes)

Until this is done the form refuses to send, so no enquiry is lost silently.
Follow the steps at the top of `tools/enquiry-apps-script.gs`, paste the web app URL into
`LEAD_ENDPOINT` at the top of `js/site.js`, then commit and push. Each enquiry becomes a row in
your Google Sheet, and you get an email for each one.
