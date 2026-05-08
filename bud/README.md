# Bud

Mobile-first lost pet finder demo. Run locally:

```bash
cd bud
npm install
npm run dev
```

## Supabase

Run `supabase_schema.sql` in your Supabase SQL editor to create the `pets` and
`reports` tables, RLS policies, and seed data. Then copy `.env.example` to
`.env.local` and replace the Supabase placeholders:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

When these values are missing or still placeholders, the app falls back to local
demo pet data.

## Google Maps (optional)

By default the map uses a static image with positioned pins (no API key).

To use the Google Maps JavaScript API, create `bud/.env`:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

Restart the dev server after changing environment variables.

## Design reference

UI patterns align with `stitch_lost_pet_tracker_map/` in the parent workspace (Grounded Guardian palette and layouts), with the Bud brand colors defined in `tailwind.config.js`.
