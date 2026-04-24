import pg from 'pg';

const { Client } = pg;

const SUPABASE_DB_URL = 'postgresql://postgres:BizMeals%401998@db.rgkbkdxfekslaygvjngm.supabase.co:5432/postgres';

const client = new Client({
  connectionString: SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!\n');

    // Step 1: Add missing columns to users table
    console.log('=== Step 1: Adding security columns to users ===');
    const columns = [
      { col: 'password_hash', type: 'TEXT' },
      { col: 'otp_code', type: 'TEXT' },
      { col: 'otp_expires_at', type: 'TIMESTAMPTZ' },
    ];
    
    for (const { col, type } of columns) {
      const { rows } = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = $1`,
        [col]
      );
      if (rows.length === 0) {
        await client.query(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
        console.log(`  Added column: ${col} ${type}`);
      } else {
        console.log(`  Column already exists: ${col}`);
      }
    }

    // Add kyc_status with CHECK constraint
    const { rows: kycRows } = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'kyc_status'`
    );
    if (kycRows.length === 0) {
      await client.query(`ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'NOT_SUBMITTED' CHECK (kyc_status IN ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED'))`);
      console.log(`  Added column: kyc_status`);
    } else {
      console.log(`  Column already exists: kyc_status`);
    }

    // Step 2: Add RazorPay columns to payments table
    console.log('\n=== Step 2: Adding RazorPay columns to payments ===');
    const payColumns = [
      { col: 'razorpay_order_id', type: 'TEXT' },
      { col: 'razorpay_payment_id', type: 'TEXT' },
    ];
    
    for (const { col, type } of payColumns) {
      const { rows } = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'payments' AND column_name = $1`,
        [col]
      );
      if (rows.length === 0) {
        await client.query(`ALTER TABLE payments ADD COLUMN ${col} ${type}`);
        console.log(`  Added column: ${col}`);
      } else {
        console.log(`  Column already exists: ${col}`);
      }
    }

    // Allow RAZORPAY and ONLINE as payment methods
    console.log('\n=== Step 3: Updating payment method constraint ===');
    try {
      await client.query(`ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check`);
      await client.query(`ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('UPI', 'CARD', 'NET_BANKING', 'CASH', 'RAZORPAY', 'ONLINE'))`);
      console.log('  Updated payments_method_check constraint');
    } catch (e) {
      console.log(`  Constraint update: ${e.message}`);
    }

    // Step 4: Hash default passwords
    console.log('\n=== Step 4: Setting default password hashes ===');
    const defaultHash = '$2b$12$OAb6dl9UxARmmIeDXIfBI.kDrveZIcLF0wzwlzAuLdmNwHXHM.n/C';
    const { rowCount } = await client.query(
      `UPDATE users SET password_hash = $1 WHERE password_hash IS NULL`,
      [defaultHash]
    );
    console.log(`  Set hashed password for ${rowCount} users`);

    // Step 5: Drop old open RLS policies
    console.log('\n=== Step 5: Dropping old open RLS policies ===');
    const oldPolicies = [
      ['users', 'Users readable by all'], ['users', 'Users insertable by anon'], ['users', 'Users updatable by all'],
      ['pgs', 'PGs readable by all'], ['pgs', 'PGs insertable by all'], ['pgs', 'PGs updatable by all'],
      ['rooms', 'Rooms readable by all'], ['rooms', 'Rooms insertable by all'], ['rooms', 'Rooms updatable by all'], ['rooms', 'Rooms deletable by all'],
      ['beds', 'Beds readable by all'], ['beds', 'Beds insertable by all'], ['beds', 'Beds updatable by all'], ['beds', 'Beds deletable by all'],
      ['bookings', 'Bookings readable by all'], ['bookings', 'Bookings insertable by all'], ['bookings', 'Bookings updatable by all'], ['bookings', 'Bookings deletable by all'],
      ['payments', 'Payments readable by all'], ['payments', 'Payments insertable by all'], ['payments', 'Payments updatable by all'], ['payments', 'Payments deletable by all'],
      ['complaints', 'Complaints readable by all'], ['complaints', 'Complaints insertable by all'], ['complaints', 'Complaints updatable by all'],
      ['vendors', 'Vendors readable by all'], ['vendors', 'Vendors insertable by all'], ['vendors', 'Vendors updatable by all'], ['vendors', 'Vendors deletable by all'],
      ['workers', 'Workers readable by all'], ['workers', 'Workers insertable by all'], ['workers', 'Workers updatable by all'], ['workers', 'Workers deletable by all'],
      ['tenant_notes', 'Tenant notes readable by all'], ['tenant_notes', 'Tenant notes insertable by all'], ['tenant_notes', 'Tenant notes updatable by all'], ['tenant_notes', 'Tenant notes deletable by all'],
      ['activity_log', 'Activity log readable by all'], ['activity_log', 'Activity log insertable by all'],
    ];
    
    let droppedCount = 0;
    for (const [table, policy] of oldPolicies) {
      try {
        await client.query(`DROP POLICY IF EXISTS "${policy}" ON ${table}`);
        droppedCount++;
      } catch (e) {
        // ignore
      }
    }
    console.log(`  Processed ${droppedCount} old policies`);

    // Step 6: Create secure RLS policies
    console.log('\n=== Step 6: Creating secure RLS policies ===');
    
    const newPolicies = [
      // Users
      { table: 'users', name: 'users_select_public', cmd: 'SELECT', using: 'true' },
      { table: 'users', name: 'users_insert_public', cmd: 'INSERT', using: null, check: 'true' },
      { table: 'users', name: 'users_update_own', cmd: 'UPDATE', using: `auth.uid()::text = id OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'ADMIN' OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // PGs
      { table: 'pgs', name: 'pgs_select_public', cmd: 'SELECT', using: "status = 'APPROVED' OR is_verified = true" },
      { table: 'pgs', name: 'pgs_insert_owner', cmd: 'INSERT', using: null, check: 'true' },
      { table: 'pgs', name: 'pgs_update_own', cmd: 'UPDATE', using: `owner_id = auth.uid()::text OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
      { table: 'pgs', name: 'pgs_delete_admin', cmd: 'DELETE', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Rooms
      { table: 'rooms', name: 'rooms_select_public', cmd: 'SELECT', using: `pg_id IN (SELECT id FROM pgs WHERE status = 'APPROVED' OR is_verified = true) OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
      { table: 'rooms', name: 'rooms_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Beds
      { table: 'beds', name: 'beds_select_public', cmd: 'SELECT', using: `room_id IN (SELECT id FROM rooms WHERE pg_id IN (SELECT id FROM pgs WHERE status = 'APPROVED' OR is_verified = true)) OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
      { table: 'beds', name: 'beds_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Bookings
      { table: 'bookings', name: 'bookings_select_own', cmd: 'SELECT', using: `user_id = auth.uid()::text OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
      { table: 'bookings', name: 'bookings_insert_auth', cmd: 'INSERT', using: null, check: 'true' },
      { table: 'bookings', name: 'bookings_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Payments
      { table: 'payments', name: 'payments_select_own', cmd: 'SELECT', using: `user_id = auth.uid()::text OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
      { table: 'payments', name: 'payments_insert_auth', cmd: 'INSERT', using: null, check: 'true' },
      { table: 'payments', name: 'payments_update_admin', cmd: 'UPDATE', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Complaints
      { table: 'complaints', name: 'complaints_select_own', cmd: 'SELECT', using: `user_id = auth.uid()::text OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
      { table: 'complaints', name: 'complaints_insert_auth', cmd: 'INSERT', using: null, check: 'true' },
      { table: 'complaints', name: 'complaints_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Vendors
      { table: 'vendors', name: 'vendors_select_public', cmd: 'SELECT', using: 'true' },
      { table: 'vendors', name: 'vendors_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Workers
      { table: 'workers', name: 'workers_select_public', cmd: 'SELECT', using: `pg_id IN (SELECT id FROM pgs WHERE status = 'APPROVED' OR is_verified = true) OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
      { table: 'workers', name: 'workers_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Tenant notes
      { table: 'tenant_notes', name: 'tenant_notes_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },

      // Activity log
      { table: 'activity_log', name: 'activity_log_manage', cmd: 'ALL', using: `current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'` },
    ];

    let createdCount = 0;
    for (const p of newPolicies) {
      try {
        await client.query(`DROP POLICY IF EXISTS "${p.name}" ON ${p.table}`);
        
        if (p.cmd === 'ALL') {
          await client.query(`CREATE POLICY "${p.name}" ON ${p.table} FOR ALL USING (${p.using})`);
        } else if (p.using && !p.check) {
          await client.query(`CREATE POLICY "${p.name}" ON ${p.table} FOR ${p.cmd} USING (${p.using})`);
        } else if (p.check) {
          await client.query(`CREATE POLICY "${p.name}" ON ${p.table} FOR ${p.cmd} WITH CHECK (${p.check})`);
        }
        createdCount++;
      } catch (e) {
        console.log(`  Failed to create ${p.name}: ${e.message.substring(0, 100)}`);
      }
    }
    console.log(`  Created ${createdCount} RLS policies`);

    // Step 7: Verify
    console.log('\n=== Step 7: Verification ===');
    const { rows: verifyRows } = await client.query(
      `SELECT email, password_hash IS NOT NULL as has_hash FROM users LIMIT 5`
    );
    for (const row of verifyRows) {
      console.log(`  ${row.email}: password_hash = ${row.has_hash ? 'SET' : 'MISSING'}`);
    }

    const { rows: colRows } = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`
    );
    console.log(`\n  Users table columns (${colRows.length}): ${colRows.map(r => r.column_name).join(', ')}`);

    console.log('\n=== MIGRATION COMPLETE ===');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
