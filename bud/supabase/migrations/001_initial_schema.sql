-- ============================================================
-- Bud: Lost Pet Finder — Initial Database Schema
-- ============================================================

-- Enums
CREATE TYPE pet_status AS ENUM ('LOST', 'FOUND', 'REUNITED');
CREATE TYPE pet_type AS ENUM ('dog', 'cat', 'other');
CREATE TYPE contact_type AS ENUM ('owner', 'barangay');
CREATE TYPE notification_type AS ENUM ('sighting', 'status_change', 'message', 'contact_request');

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  barangay TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Pets
-- ============================================================
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  color TEXT NOT NULL DEFAULT '',
  fur_color TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT 'Unknown',
  status pet_status NOT NULL DEFAULT 'LOST',
  type pet_type NOT NULL DEFAULT 'dog',
  location_text TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  image_url TEXT,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_created_at ON pets(created_at DESC);
CREATE INDEX idx_pets_reporter_id ON pets(reporter_id);
CREATE INDEX idx_pets_location ON pets(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pets"
  ON pets FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert pets"
  ON pets FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters can update own pets"
  ON pets FOR UPDATE USING (auth.uid() = reporter_id);

CREATE POLICY "Reporters can delete own pets"
  ON pets FOR DELETE USING (auth.uid() = reporter_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Sightings ("I Have Info")
-- ============================================================
CREATE TABLE sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  location_text TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sightings_pet_id ON sightings(pet_id);

ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sightings"
  ON sightings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert sightings"
  ON sightings FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can delete own sightings"
  ON sightings FOR DELETE USING (auth.uid() = reporter_id);

-- ============================================================
-- Notifications
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- ============================================================
-- Contacts
-- ============================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_type contact_type NOT NULL,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_pet_id ON contacts(pet_id);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert contacts"
  ON contacts FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Involved parties can view contacts"
  ON contacts FOR SELECT USING (
    auth.uid() = requester_id
    OR auth.uid() IN (SELECT reporter_id FROM pets WHERE pets.id = contacts.pet_id)
  );

-- ============================================================
-- Realtime: enable publication for live subscriptions
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE pets;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- Storage buckets (run via Supabase dashboard or CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
