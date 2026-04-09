import { NextResponse } from 'next/server';
import pg from 'pg';

const SUPABASE_PROJECT_ID = 'sbwmecxkbfijanwwuvvt';

function buildConnectionStrings(dbPassword: string): string[] {
  const pw = encodeURIComponent(dbPassword);
  return [
    // Format 1: Direct connection (most reliable)
    `postgresql://postgres:${pw}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`,
    // Format 2: Pooler with project ID as user
    `postgresql://postgres.${SUPABASE_PROJECT_ID}:${pw}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    // Format 3: Pooler alternative port
    `postgresql://postgres.${SUPABASE_PROJECT_ID}:${pw}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
  ];
}

async function tryConnect(connectionString: string): Promise<{ client: pg.PoolClient; pool: pg.Pool } | null> {
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    max: 1,
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    return { client, pool };
  } catch {
    await pool.end().catch(() => {});
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dbPassword, connectionString: userConnStr } = body;

    // If user provided a full connection string, use it
    let connectionStrings: string[] = [];

    if (userConnStr && typeof userConnStr === 'string' && userConnStr.trim().startsWith('postgresql')) {
      // Insert password into user's connection string
      const connStr = userConnStr.trim().replace(/\[YOUR-PASSWORD\]/g, dbPassword || '');
      connectionStrings = [connStr];
    } else if (dbPassword && typeof dbPassword === 'string') {
      connectionStrings = buildConnectionStrings(dbPassword);
    } else {
      return NextResponse.json(
        { error: 'Database password is required', code: 'NO_PASSWORD' },
        { status: 400 }
      );
    }

    // Try each connection string
    let lastError = '';
    let connected = false;
    let client: pg.PoolClient | null = null;
    let pool: pg.Pool | null = null;

    for (const connStr of connectionStrings) {
      const result = await tryConnect(connStr);
      if (result) {
        client = result.client;
        pool = result.pool;
        connected = true;
        break;
      }
      lastError = `Failed with: ${connStr.substring(0, 80)}...`;
    }

    if (!connected || !client || !pool) {
      return NextResponse.json(
        {
          error: 'Could not connect to Supabase. Please try the Connection String method below.',
          code: 'CONNECTION_FAILED',
          details: lastError,
        },
        { status: 500 }
      );
    }

    // SQL to create all tables
    const createTablesSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'TENANT' CHECK (role IN ('TENANT', 'OWNER', 'ADMIN')),
  avatar TEXT,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  is_verified BOOLEAN DEFAULT false,
  kyc_doc TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PGs table
CREATE TABLE IF NOT EXISTS pgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'UNISEX')),
  price INTEGER NOT NULL,
  security_deposit INTEGER DEFAULT 0,
  amenities TEXT,
  images TEXT,
  rating DOUBLE PRECISION DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pg_id UUID NOT NULL REFERENCES pgs(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY')),
  floor INTEGER DEFAULT 1,
  has_ac BOOLEAN DEFAULT false,
  has_attached_bath BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Beds table
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number INTEGER NOT NULL,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED')),
  price INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pg_id UUID REFERENCES pgs(id) ON DELETE SET NULL,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  check_in_date TIMESTAMPTZ,
  check_out_date TIMESTAMPTZ,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  advance_paid INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pg_id UUID REFERENCES pgs(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT DEFAULT 'RENT' CHECK (type IN ('RENT', 'DEPOSIT', 'MAINTENANCE', 'PENALTY', 'REFUND')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  method TEXT CHECK (method IN ('UPI', 'CARD', 'NET_BANKING', 'CASH', 'CHEQUE', null)),
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pg_id UUID REFERENCES pgs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('MAINTENANCE', 'CLEANLINESS', 'NOISE', 'SAFETY', 'FOOD', 'OTHER')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('PLUMBER', 'ELECTRICIAN', 'CLEANER', 'PAINTER', 'CARPENTER', 'WIFI', 'GENERAL')),
  phone TEXT,
  email TEXT,
  city TEXT,
  area TEXT,
  rating DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('SECURITY', 'CLEANER', 'COOK', 'MANAGER', 'MAINTENANCE')),
  phone TEXT,
  pg_id UUID REFERENCES pgs(id) ON DELETE SET NULL,
  shift TEXT CHECK (shift IN ('MORNING', 'EVENING', 'NIGHT')),
  salary INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pgs_owner_id ON pgs(owner_id);
CREATE INDEX IF NOT EXISTS idx_pgs_city ON pgs(city);
CREATE INDEX IF NOT EXISTS idx_pgs_status ON pgs(status);
CREATE INDEX IF NOT EXISTS idx_pgs_gender ON pgs(gender);
CREATE INDEX IF NOT EXISTS idx_pgs_price ON pgs(price);
CREATE INDEX IF NOT EXISTS idx_rooms_pg_id ON rooms(pg_id);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pg_id ON bookings(pg_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_pg_id ON complaints(pg_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_workers_pg_id ON workers(pg_id);
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(type);
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Public read users" ON users FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert users" ON users FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update users" ON users FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read pgs" ON pgs FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert pgs" ON pgs FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update pgs" ON pgs FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public delete pgs" ON pgs FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert rooms" ON rooms FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update rooms" ON rooms FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public delete rooms" ON rooms FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read beds" ON beds FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert beds" ON beds FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update beds" ON beds FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public delete beds" ON beds FOR DELETE USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read bookings" ON bookings FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update bookings" ON bookings FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read payments" ON payments FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert payments" ON payments FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update payments" ON payments FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read complaints" ON complaints FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert complaints" ON complaints FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update complaints" ON complaints FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read vendors" ON vendors FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert vendors" ON vendors FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update vendors" ON vendors FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read workers" ON workers FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public insert workers" ON workers FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public update workers" ON workers FOR UPDATE USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER pgs_updated_at BEFORE UPDATE ON pgs FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER beds_updated_at BEFORE UPDATE ON beds FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TRIGGER workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at(); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

    // Execute table creation
    try {
      await client.query(createTablesSQL);
    } catch (sqlErr) {
      await client.release();
      await pool.end();
      const details = sqlErr instanceof Error ? sqlErr.message : String(sqlErr);
      return NextResponse.json(
        { error: 'Failed to create tables', details, code: 'SQL_ERROR' },
        { status: 500 }
      );
    }

    // Verify tables were created
    const { rows: tables } = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
    );
    const tableNames = tables.map((t: { table_name: string }) => t.table_name);

    await client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'All tables created successfully!',
      tables: tableNames,
      count: tableNames.length,
    });
  } catch (error) {
    console.error('Setup-db error:', error);
    return NextResponse.json(
      { error: 'Setup failed', details: String(error), code: 'UNKNOWN' },
      { status: 500 }
    );
  }
}
