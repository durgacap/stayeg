#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * StayEg Supabase Database Setup Script
 * =======================================
 * Creates all tables via direct PostgreSQL connection and seeds data.
 *
 * Usage:
 *   node scripts/create-supabase-tables.js YOUR_DB_PASSWORD
 *
 * Or with environment variable:
 *   SUPABASE_DB_PASSWORD=xxx node scripts/create-supabase-tables.js
 *
 * Where to find the DB password:
 *   Supabase Dashboard → Settings → Database → Database password
 *   https://supabase.com/dashboard/project/rgkbkdxfekslaygvjngm/settings/database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PROJECT_REF = 'rgkbkdxfekslaygvjngm';
const ADMIN_SECRET = 'stayeg-v1.2-secure-2025';

// Color helpers
const green = (msg) => `\x1b[32m${msg}\x1b[0m`;
const red = (msg) => `\x1b[31m${msg}\x1b[0m`;
const yellow = (msg) => `\x1b[33m${msg}\x1b[0m`;
const cyan = (msg) => `\x1b[36m${msg}\x1b[0m`;
const bold = (msg) => `\x1b[1m${msg}\x1b[0m`;

function buildConnectionStrings(password) {
  const pw = encodeURIComponent(password);
  return [
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${pw}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${pw}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
  ];
}

async function tryConnect(connStr) {
  const pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    max: 1,
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    return { client, pool, connStr };
  } catch (err) {
    await pool.end().catch(() => {});
    return null;
  }
}

async function seedData() {
  console.log(`\n${cyan('Seeding data via /api/seed-supabase...')}`);
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({});
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/seed-supabase',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET,
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 120000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            console.log(green('  ✓ Data seeded successfully!'));
            console.log(`  Stats: ${JSON.stringify(result.stats)}`);
          } else {
            console.log(red(`  ✗ Seed failed: ${result.details || result.error}`));
          }
          resolve(result.success);
        } catch (e) {
          console.log(red(`  ✗ Failed to parse seed response`));
          resolve(false);
        }
      });
    });
    req.on('error', (err) => {
      console.log(yellow(`  ⚠ Could not reach seed endpoint: ${err.message}`));
      console.log(yellow('  You can seed manually later:'));
      console.log(yellow('  curl -X POST http://localhost:3000/api/seed-supabase -H "Content-Type: application/json" -H "x-admin-secret: stayeg-v1.2-secure-2025" -d \'{}\''));
      resolve(false);
    });
    req.on('timeout', () => {
      console.log(yellow('  ⚠ Seed request timed out'));
      req.destroy();
      resolve(false);
    });
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('================================================');
  console.log(bold(cyan('  StayEg — Supabase Database Setup')));
  console.log(bold(cyan('  ===================================')));
  console.log(`  Project: ${PROJECT_REF}`);
  console.log('================================================');

  // Get password
  const password = process.argv[2] || process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    console.log(red('\n  Error: Database password is required!\n'));
    console.log(yellow('  Usage:'));
    console.log('    node scripts/create-supabase-tables.js YOUR_DB_PASSWORD');
    console.log('    SUPABASE_DB_PASSWORD=xxx node scripts/create-supabase-tables.js');
    console.log('');
    console.log(yellow('  Where to find it:'));
    console.log('    Supabase Dashboard → Settings → Database → Database password');
    console.log(`    https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`);
    console.log('');
    console.log(yellow('  Alternative: Run SQL manually in the Dashboard → SQL Editor:'));
    console.log(`    https://supabase.com/dashboard/project/${PROJECT_REF}/sql`);
    console.log('    Then paste the contents of supabase-schema.sql and click "Run"');
    console.log('');
    process.exit(1);
  }

  // Read SQL file
  const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.log(red(`\n  Error: SQL file not found at ${sqlPath}`));
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`  SQL file: ${sqlPath} (${sql.split('\n').length} lines)`);

  // Try connections
  const connStrings = buildConnectionStrings(password);
  console.log(`\n${cyan('Connecting to database...')}`);

  let connected = null;
  for (let i = 0; i < connStrings.length; i++) {
    console.log(`  Attempt ${i + 1}/${connStrings.length}: ${connStrings[i].substring(0, 80)}...`);
    const result = await tryConnect(connStrings[i]);
    if (result) {
      connected = result;
      console.log(green('  ✓ Connected!'));
      break;
    }
    console.log(yellow('  ✗ Failed'));
  }

  if (!connected) {
    console.log(red('\n  Could not connect to database with the provided password.'));
    console.log(red('  Please verify your password at:'));
    console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`);
    process.exit(1);
  }

  const { client, pool, connStr } = connected;

  // Execute SQL
  console.log(`\n${cyan('Executing schema SQL...')}`);
  try {
    await client.query(sql);
    console.log(green('  ✓ Schema executed successfully'));
  } catch (err) {
    console.log(red(`  ✗ SQL execution failed: ${err.message}`));
    await client.release();
    await pool.end();
    process.exit(1);
  }

  // Verify tables
  console.log(`\n${cyan('Verifying tables...')}`);
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
  );
  const tableNames = rows.map(r => r.table_name);
  console.log(`  Found ${tableNames.length} tables: ${tableNames.join(', ')}`);

  const required = ['users', 'pgs', 'rooms', 'beds', 'bookings', 'payments', 'complaints', 'vendors', 'workers'];
  const missing = required.filter(t => !tableNames.includes(t));
  if (missing.length > 0) {
    console.log(yellow(`  ⚠ Missing tables: ${missing.join(', ')}`));
  }

  await client.release();
  await pool.end();

  // Summary
  console.log('\n================================================');
  console.log(bold('  SETUP COMPLETE'));
  console.log('================================================');
  console.log(green(`  ✓ ${tableNames.length} tables created`));
  if (missing.length > 0) {
    console.log(yellow(`  ⚠ ${missing.length} required tables missing`));
  }
  console.log('');
  console.log(bold('  Next step: Seed data'));
  console.log('  The script will now attempt to seed data automatically...');
  console.log('');

  // Wait for PostgREST to reload schema cache
  console.log(yellow('  Waiting 5 seconds for PostgREST schema cache reload...'));
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Seed data
  await seedData();

  console.log('\n================================================');
  console.log(bold(cyan('  All done!')));
  console.log('================================================');
}

main().catch(err => {
  console.error(red(`\nFatal error: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
});
