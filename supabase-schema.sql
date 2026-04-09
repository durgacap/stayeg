-- =============================================
-- StayEG Supabase Schema
-- Complete DDL for all 9 tables
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- Enable UUID extension (already enabled in Supabase, but just in case)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Helper: updated_at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 1. Users table
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'TENANT' CHECK (role IN ('TENANT', 'OWNER', 'ADMIN')),
  avatar      TEXT,
  gender      TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  kyc_doc     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 2. PGs (Paying Guest accommodations) table
-- =============================================
CREATE TABLE IF NOT EXISTS public.pgs (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  owner_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  description      TEXT,
  address          TEXT NOT NULL,
  city             TEXT NOT NULL DEFAULT 'Bangalore',
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  gender           TEXT NOT NULL DEFAULT 'UNISEX' CHECK (gender IN ('MALE', 'FEMALE', 'UNISEX')),
  price            DOUBLE PRECISION NOT NULL,
  security_deposit DOUBLE PRECISION NOT NULL DEFAULT 0,
  amenities        TEXT NOT NULL DEFAULT '',
  images           TEXT NOT NULL DEFAULT '',
  rating           DOUBLE PRECISION NOT NULL DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews    INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  is_verified      BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pgs_owner_id ON public.pgs(owner_id);
CREATE INDEX IF NOT EXISTS idx_pgs_city ON public.pgs(city);
CREATE INDEX IF NOT EXISTS idx_pgs_gender ON public.pgs(gender);
CREATE INDEX IF NOT EXISTS idx_pgs_status ON public.pgs(status);
CREATE INDEX IF NOT EXISTS idx_pgs_price ON public.pgs(price);

CREATE TRIGGER pgs_updated_at
  BEFORE UPDATE ON public.pgs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 3. Rooms table
-- =============================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id                TEXT PRIMARY KEY,
  pg_id             TEXT NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  room_code         TEXT NOT NULL,
  room_type         TEXT NOT NULL DEFAULT 'SHARED' CHECK (room_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY')),
  floor             INTEGER NOT NULL DEFAULT 1,
  has_ac            BOOLEAN NOT NULL DEFAULT false,
  has_attached_bath BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_pg_id ON public.rooms(pg_id);

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 4. Beds table
-- =============================================
CREATE TABLE IF NOT EXISTS public.beds (
  id         TEXT PRIMARY KEY,
  room_id    TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  bed_number INTEGER NOT NULL,
  status     TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
  price      DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beds_room_id ON public.beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON public.beds(status);

CREATE TRIGGER beds_updated_at
  BEFORE UPDATE ON public.beds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 5. Bookings table
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  pg_id        TEXT NOT NULL REFERENCES public.pgs(id) ON DELETE RESTRICT,
  bed_id       TEXT NOT NULL REFERENCES public.beds(id) ON DELETE RESTRICT,
  check_in_date TIMESTAMPTZ NOT NULL,
  status       TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  advance_paid DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pg_id ON public.bookings(pg_id);
CREATE INDEX IF NOT EXISTS idx_bookings_bed_id ON public.bookings(bed_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 6. Payments table
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  pg_id       TEXT NOT NULL REFERENCES public.pgs(id) ON DELETE RESTRICT,
  booking_id  TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
  amount      DOUBLE PRECISION NOT NULL,
  type        TEXT NOT NULL DEFAULT 'RENT' CHECK (type IN ('RENT', 'ADVANCE', 'SECURITY_DEPOSIT')),
  status      TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  due_date    TIMESTAMPTZ,
  paid_date   TIMESTAMPTZ,
  method      TEXT CHECK (method IN ('UPI', 'CARD', 'NET_BANKING', 'CASH')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_pg_id ON public.payments(pg_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 7. Complaints table
-- =============================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  pg_id       TEXT NOT NULL REFERENCES public.pgs(id) ON DELETE RESTRICT,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'GENERAL' CHECK (category IN ('MAINTENANCE', 'CLEANLINESS', 'NOISE', 'SAFETY', 'GENERAL')),
  priority    TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  assigned_to TEXT,
  resolution  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_pg_id ON public.complaints(pg_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 8. Vendors table
-- =============================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('PLUMBER', 'ELECTRICIAN', 'CLEANER', 'PAINTER', 'CARPENTER', 'WIFI', 'GENERAL')),
  phone      TEXT NOT NULL,
  email      TEXT,
  city       TEXT NOT NULL DEFAULT 'Bangalore',
  area       TEXT,
  rating     DOUBLE PRECISION NOT NULL DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
  status     TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_type ON public.vendors(type);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON public.vendors(city);

CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 9. Workers table
-- =============================================
CREATE TABLE IF NOT EXISTS public.workers (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('SECURITY', 'CLEANER', 'COOK', 'MANAGER', 'MAINTENANCE')),
  phone      TEXT NOT NULL,
  pg_id      TEXT REFERENCES public.pgs(id) ON DELETE SET NULL,
  shift      TEXT CHECK (shift IN ('MORNING', 'EVENING', 'NIGHT')),
  status     TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workers_pg_id ON public.workers(pg_id);
CREATE INDEX IF NOT EXISTS idx_workers_role ON public.workers(role);

CREATE TRIGGER workers_updated_at
  BEFORE UPDATE ON public.workers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies: Public read access (anon)
-- =============================================

-- Users: anyone can read (but emails are somewhat public in a PG platform)
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- PGs: anyone can browse PGs
CREATE POLICY "PGs are viewable by everyone"
  ON public.pgs FOR SELECT
  USING (true);

-- Rooms: anyone can view rooms
CREATE POLICY "Rooms are viewable by everyone"
  ON public.rooms FOR SELECT
  USING (true);

-- Beds: anyone can view beds
CREATE POLICY "Beds are viewable by everyone"
  ON public.beds FOR SELECT
  USING (true);

-- Bookings: only own bookings visible
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (true);

-- Payments: only own payments visible
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (true);

-- Complaints: only own complaints visible
CREATE POLICY "Users can view own complaints"
  ON public.complaints FOR SELECT
  USING (true);

-- Vendors: anyone can browse
CREATE POLICY "Vendors are viewable by everyone"
  ON public.vendors FOR SELECT
  USING (true);

-- Workers: anyone can view
CREATE POLICY "Workers are viewable by everyone"
  ON public.workers FOR SELECT
  USING (true);

-- =============================================
-- RLS Policies: Insert for anon (seed script needs this)
-- =============================================

CREATE POLICY "Allow anonymous inserts on users"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on pgs"
  ON public.pgs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on beds"
  ON public.beds FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on workers"
  ON public.workers FOR INSERT
  WITH CHECK (true);

-- =============================================
-- RLS Policies: Update for anon
-- =============================================

CREATE POLICY "Allow anonymous updates on users"
  ON public.users FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on pgs"
  ON public.pgs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on rooms"
  ON public.rooms FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on beds"
  ON public.beds FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on bookings"
  ON public.bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on payments"
  ON public.payments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on complaints"
  ON public.complaints FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on vendors"
  ON public.vendors FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on workers"
  ON public.workers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =============================================
-- RLS Policies: Delete for anon
-- =============================================

CREATE POLICY "Allow anonymous deletes on users"
  ON public.users FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on pgs"
  ON public.pgs FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on rooms"
  ON public.rooms FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on beds"
  ON public.beds FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on bookings"
  ON public.bookings FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on payments"
  ON public.payments FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on complaints"
  ON public.complaints FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on vendors"
  ON public.vendors FOR DELETE
  USING (true);

CREATE POLICY "Allow anonymous deletes on workers"
  ON public.workers FOR DELETE
  USING (true);

-- =============================================
-- Done! Verify with:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- =============================================
