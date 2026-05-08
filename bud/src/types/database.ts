export type PetStatus = "LOST" | "FOUND" | "REUNITED";
export type PetType = "dog" | "cat" | "other";
export type ContactType = "owner" | "barangay";
export type NotificationType = "sighting" | "status_change" | "message" | "contact_request";

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  phone: string;
  barangay: string;
  created_at: string;
};

export type DbPet = {
  id: string;
  reporter_id: string;
  name: string;
  breed: string | null;
  color: string;
  fur_color: string;
  gender: string;
  status: PetStatus;
  type: PetType;
  location_text: string;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Sighting = {
  id: string;
  pet_id: string;
  reporter_id: string;
  message: string;
  location_text: string;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  pet_id: string | null;
  read: boolean;
  created_at: string;
};

export type Contact = {
  id: string;
  pet_id: string;
  requester_id: string;
  contact_type: ContactType;
  message: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      pets: { Row: DbPet; Insert: Omit<DbPet, "id" | "created_at" | "updated_at">; Update: Partial<DbPet> };
      sightings: { Row: Sighting; Insert: Omit<Sighting, "id" | "created_at">; Update: Partial<Sighting> };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at">; Update: Partial<Notification> };
      contacts: { Row: Contact; Insert: Omit<Contact, "id" | "created_at">; Update: Partial<Contact> };
    };
  };
};
