-- Create tables for Bud App

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

-- Enable RLS (Optional, but recommended. For simplicity, we can disable or add open policies)
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access on reports" ON reports FOR SELECT USING (true);

-- Insert Initial Mock Data
INSERT INTO pets (id, name, breed, color, fur_color, gender, status, type, location, date, image, description, pin, lat, lng)
VALUES 
('e8305075-744d-4be4-ba34-c9ed6997b01d', 'Barnaby', 'Golden Retriever', 'Red Collar', 'Golden', 'Male', 'LOST', 'dog', 'Near San Park', 'Today · 0.8 mi away', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS09qsZ5-IfFOypkJJQZwkFWrwY6TfmYrS3Wwch4lSNJiz-JdYaMJEM5DOQn70blOQHjK-RTxvcjvEnEs9WvFDmOjJFvJhASgqyenI_YZJJY-f7Wlt5mpcP9rCNJ4JSZ8DA4tCyERo2bNXX2FLsigA7YYSXDr3gY4Jnl2nTrMzTAdsNrQKW5B09zY_x29XanZsLSwDk0z8u0fwpPEW05F6HEd9G5vme0N5v3TIy_c2Ah39z21RX3UHRe9_pAoxgFTaS3tkbsHqX3n1', 'Barnaby is friendly but may be scared. He was last seen wearing a red collar with a silver tag. Please call if you spot him—he may respond to treats.', '{"topPct": 38, "leftPct": 34}', 14.5995, 120.9842),
('f7123184-2a1c-4b53-9a3d-2f9f1b9f1b9f', 'Orange Tabby Cat', NULL, 'Orange', 'Orange tabby', 'Unknown', 'FOUND', 'other', 'Key Location Street', '2 hrs ago', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVgz3SqP1xSusxuVeTNJWbPLtY-VMqkKKWTnLnu0YQp-ukdt-_ddLvkIjVb1k78aE7yFJBSoZrRfsMl_0Oo6Wv0TddadEiH1uTteL9Kwx_tLWg4PLQSG6DPOMgG8v77xp_dPVQS98tXhFWs4ElrRfYB13-vsvxqx1boG6VOz4AbKZxYhyXcz8mmA40WZjxkO1zWyalfs9DyJ-xCy5AHAKFGhevQPKeriW3hO0_Fgxl97zoIxDMoKVsKxJlqaIZNue2y1Bbm2_9zA8m', 'Found near the bakery alley—calm but hungry. No collar. Community is holding the cat safely while searching for the owner.', '{"topPct": 24, "leftPct": 64}', 14.601, 120.986),
('a2b3c4d5-e6f7-4a5b-9c8d-7e6f5a4b3c2d', 'Luna', 'Domestic Shorthair', 'Black', 'Black', 'Female', 'FOUND', 'cat', 'Reunited with family', '14 hrs search', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Qy4b90QLzov4ww2r2vz9pPUCdhNw8w0jvP7iYn7qV5zKZw9qE7hKio6kp6tBbZqngwuj7Yz5H-qfxsmiUwa5ydVT8ivP8GvNAYLxt0nkRb2LO0VTL1dLvzhXMzwCPvSHQUqrYqbjUknvTiLFZJWv1Buyob_7sm487lyGV7NjYYz0jPALbQsTOV4cvre609YNwQS-p0GbBFaqYRRZlp-BuDEOLN8bLYc0warxUQwiOi0OvQk6IkxTVFV-TSNFVPC6H63kLTOo3VvZ', 'Luna is home safe. Thank you to everyone who shared sightings and checked in—this is what community care looks like.', '{"topPct": 58, "leftPct": 49}', 14.598, 120.9825);
