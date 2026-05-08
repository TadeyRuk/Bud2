# Bud

Mobile-first lost pet finder demo. Run locally:

```bash
cd bud
npm install
npm run dev
```

## Google Maps (optional)

By default the map uses a static image with positioned pins (no API key).

To use the Google Maps JavaScript API, create `bud/.env`:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

Restart the dev server after changing environment variables.

## Design reference

UI patterns align with `stitch_lost_pet_tracker_map/` in the parent workspace (Grounded Guardian palette and layouts), with the Bud brand colors defined in `tailwind.config.js`.
