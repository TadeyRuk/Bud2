-- Create tables for Bud App

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Pets table
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    breed TEXT,
    color TEXT NOT NULL,
    fur_color TEXT NOT NULL,
    gender TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('LOST', 'FOUND')),
    type TEXT NOT NULL CHECK (type IN ('dog', 'cat', 'other')),
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    pin JSONB NOT NULL,
    lat FLOAT8,
    lng FLOAT8,
    owner_name TEXT,
    owner_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    reporter_name TEXT,
    reporter_contact TEXT,
    message TEXT NOT NULL,
    lat FLOAT8,
    lng FLOAT8,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and recreate policies so this script can be rerun safely.
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on pets" ON pets;
DROP POLICY IF EXISTS "Allow public insert access on pets" ON pets;
DROP POLICY IF EXISTS "Allow public insert access on reports" ON reports;
DROP POLICY IF EXISTS "Allow public read access on reports" ON reports;

CREATE POLICY "Allow public read access on pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on pets" ON pets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on reports" ON reports FOR SELECT USING (true);

-- Insert initial mock data. ON CONFLICT keeps reruns from duplicating seed rows.
INSERT INTO pets (
    id,
    name,
    breed,
    color,
    fur_color,
    gender,
    status,
    type,
    location,
    date,
    image,
    description,
    pin,
    lat,
    lng
)
VALUES
(
    'e8305075-744d-4be4-ba34-c9ed6997b01d',
    'Barnaby',
    'Golden Retriever',
    'Red Collar',
    'Golden',
    'Male',
    'LOST',
    'dog',
    'Near San Park',
    'Today - 0.8 mi away',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
    'Barnaby is friendly but may be scared. He was last seen wearing a red collar with a silver tag.',
    '{"topPct": 38, "leftPct": 34}',
    14.5995,
    120.9842
),
(
    'f7123184-2a1c-4b53-9a3d-2f9f1b9f1b9f',
    'Orange Tabby Cat',
    NULL,
    'Orange',
    'Orange tabby',
    'Unknown',
    'FOUND',
    'cat',
    'Key Location Street',
    '2 hrs ago',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
    'Found near the bakery alley. Calm but hungry, with no collar.',
    '{"topPct": 24, "leftPct": 64}',
    14.601,
    120.986
),
(
    'a2b3c4d5-e6f7-4a5b-9c8d-7e6f5a4b3c2d',
    'Luna',
    'Domestic Shorthair',
    'Black',
    'Black',
    'Female',
    'FOUND',
    'cat',
    'Reunited with family',
    '14 hrs search',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    'Luna is home safe. Thank you to everyone who shared sightings and checked in.',
    '{"topPct": 58, "leftPct": 49}',
    14.598,
    120.9825
)
ON CONFLICT (id) DO NOTHING;
