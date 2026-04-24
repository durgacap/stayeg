/**
 * StayEg Database Seed Script
 * Uses Supabase REST API (service role) to seed all tables
 * Run: node scripts/seed-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rgkbkdxfekslaygvjngm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const avatar = (name) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

async function seed() {
  console.log('🗑️  Clearing existing data...');

  for (const table of ['activity_log', 'tenant_notes', 'payments', 'bookings', 'complaints', 'beds', 'rooms', 'workers', 'vendors', 'pgs', 'users']) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && !error.message.includes('does not exist')) {
      console.log(`  Warning clearing ${table}: ${error.message.substring(0, 60)}`);
    }
  }

  console.log('👤 Seeding users...');
  const users = [
    { id: '00000000-0001-4000-8000-000000000001', name: 'Rajesh Kumar', email: 'rajesh@stayeg.in', phone: '+919876543210', role: 'OWNER', gender: 'MALE', is_verified: true, is_approved: true, avatar: avatar('Rajesh'), bio: 'Experienced PG owner', city: 'Bangalore', occupation: 'Property Manager' },
    { id: '00000000-0001-4000-8000-000000000002', name: 'Priya Sharma', email: 'priya@stayeg.in', phone: '+919876543211', role: 'OWNER', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: avatar('Priya'), bio: 'Managing 2 PGs in Bangalore', city: 'Bangalore', occupation: 'Property Manager' },
    { id: '00000000-0001-4000-8000-000000000003', name: 'Amit Patel', email: 'amit@stayeg.in', phone: '+919876543212', role: 'OWNER', gender: 'MALE', is_verified: true, is_approved: true, avatar: avatar('Amit'), bio: 'Tech professional turned PG entrepreneur', city: 'Bangalore', occupation: 'Property Manager' },
    { id: '00000000-0002-4000-8000-000000000001', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+919123456789', role: 'TENANT', gender: 'MALE', is_verified: true, is_approved: true, avatar: avatar('Vikram'), city: 'Bangalore', occupation: 'Software Engineer' },
    { id: '00000000-0002-4000-8000-000000000002', name: 'Ananya Reddy', email: 'ananya@email.com', phone: '+919123456790', role: 'TENANT', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: avatar('Ananya'), city: 'Bangalore', occupation: 'Data Analyst' },
    { id: '00000000-0002-4000-8000-000000000003', name: 'Rohan Mehta', email: 'rohan@email.com', phone: '+919123456791', role: 'TENANT', gender: 'MALE', is_verified: true, is_approved: true, avatar: avatar('Rohan'), city: 'Bangalore', occupation: 'MBA Student' },
    { id: '00000000-0002-4000-8000-000000000004', name: 'Sneha Joshi', email: 'sneha@email.com', phone: '+919123456792', role: 'TENANT', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: avatar('Sneha'), city: 'Bangalore', occupation: 'UX Designer' },
    { id: '00000000-0002-4000-8000-000000000005', name: 'Karthik Nair', email: 'karthik@email.com', phone: '+919123456793', role: 'TENANT', gender: 'MALE', is_verified: true, is_approved: true, avatar: avatar('Karthik'), city: 'Bangalore', occupation: 'IT Consultant' },
    { id: '00000000-0002-4000-8000-000000000006', name: 'Divya Gupta', email: 'divya@email.com', phone: '+919123456794', role: 'TENANT', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: avatar('Divya'), city: 'Bangalore', occupation: 'Content Writer' },
    { id: '00000000-0003-4000-8000-000000000001', name: 'Admin User', email: 'admin@stayeg.in', phone: '+919999999999', role: 'ADMIN', gender: 'MALE', is_verified: true, is_approved: true, avatar: avatar('Admin'), bio: 'StayEg admin', city: 'Bangalore', occupation: 'Administrator' },
  ];

  const { error: usersErr } = await supabase.from('users').insert(users);
  if (usersErr) throw new Error(`Users: ${usersErr.message}`);
  console.log(`  ✅ ${users.length} users created`);

  console.log('🏢 Seeding PGs...');
  const pgs = [
    { id: '10000000-0001-4000-8000-000000000001', name: 'Sunrise PG - Koramangala', owner_id: '00000000-0001-4000-8000-000000000001', description: 'Premium PG in Koramangala with modern amenities.', address: '123, 4th Cross, Koramangala 4th Block', city: 'Bangalore', lat: 12.9352, lng: 77.6245, gender: 'UNISEX', price: 12000, security_deposit: 24000, amenities: 'wifi,ac,food,laundry,parking,cctv,power_backup,water_heater,study_table,housekeeping', images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop', rating: 4.5, total_reviews: 128, status: 'APPROVED', is_verified: true },
    { id: '10000000-0001-4000-8000-000000000002', name: 'Green Valley PG - HSR Layout', owner_id: '00000000-0001-4000-8000-000000000001', description: 'Peaceful PG with homely food.', address: '45, 27th Main, HSR Layout Sector 2', city: 'Bangalore', lat: 12.9116, lng: 77.6389, gender: 'MALE', price: 8500, security_deposit: 17000, amenities: 'wifi,food,laundry,cctv,power_backup,study_table,common_room,tv', images: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop', rating: 4.2, total_reviews: 89, status: 'APPROVED', is_verified: true },
    { id: '10000000-0001-4000-8000-000000000003', name: 'Ladies Paradise PG - Indiranagar', owner_id: '00000000-0001-4000-8000-000000000002', description: 'Safe PG for women in Indiranagar.', address: '78, 100 Feet Road, Indiranagar', city: 'Bangalore', lat: 12.9784, lng: 77.6408, gender: 'FEMALE', price: 14000, security_deposit: 28000, amenities: 'wifi,ac,food,laundry,cctv,power_backup,water_heater,wardrobe,housekeeping,gym', images: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop', rating: 4.8, total_reviews: 156, status: 'APPROVED', is_verified: true },
    { id: '10000000-0001-4000-8000-000000000004', name: 'Tech Hub PG - Whitefield', owner_id: '00000000-0001-4000-8000-000000000002', description: 'Modern co-living near ITPL.', address: '56, ITPL Main Road, Whitefield', city: 'Bangalore', lat: 12.9698, lng: 77.75, gender: 'UNISEX', price: 11000, security_deposit: 22000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,common_room,tv', images: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop', rating: 4.3, total_reviews: 95, status: 'APPROVED', is_verified: true },
    { id: '10000000-0001-4000-8000-000000000005', name: 'Budget Bliss PG - Marathahalli', owner_id: '00000000-0001-4000-8000-000000000003', description: 'Affordable PG with basic amenities.', address: '23, Marathahalli Main Road', city: 'Bangalore', lat: 12.9591, lng: 77.6974, gender: 'MALE', price: 6500, security_deposit: 13000, amenities: 'wifi,food,laundry,power_backup,study_table', images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop', rating: 3.9, total_reviews: 67, status: 'APPROVED', is_verified: true },
    { id: '10000000-0001-4000-8000-000000000006', name: 'Royal Residency PG - Electronic City', owner_id: '00000000-0001-4000-8000-000000000003', description: 'Premium gated PG community.', address: '89, Phase 1, Electronic City', city: 'Bangalore', lat: 12.844, lng: 77.673, gender: 'UNISEX', price: 15000, security_deposit: 30000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,water_heater,study_table,wardrobe,housekeeping', images: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', rating: 4.7, total_reviews: 210, status: 'APPROVED', is_verified: true },
  ];

  const { error: pgsErr } = await supabase.from('pgs').insert(pgs);
  if (pgsErr) throw new Error(`PGs: ${pgsErr.message}`);
  console.log(`  ✅ ${pgs.length} PGs created`);

  console.log('🏠 Seeding rooms...');
  const rooms = [
    { id: '20000000-0001-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', room_code: 'A101', room_type: 'DOUBLE', floor: 1, has_ac: true, has_attached_bath: true },
    { id: '20000000-0001-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000001', room_code: 'A102', room_type: 'DOUBLE', floor: 1, has_ac: true, has_attached_bath: true },
    { id: '20000000-0001-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000001', room_code: 'A201', room_type: 'TRIPLE', floor: 2, has_ac: false, has_attached_bath: false },
    { id: '20000000-0001-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000001', room_code: 'A202', room_type: 'SINGLE', floor: 2, has_ac: true, has_attached_bath: true },
    { id: '20000000-0001-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000001', room_code: 'A301', room_type: 'DORMITORY', floor: 3, has_ac: false, has_attached_bath: false },
    { id: '20000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000002', room_code: 'B101', room_type: 'TRIPLE', floor: 1, has_ac: false, has_attached_bath: false },
    { id: '20000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000002', room_code: 'B102', room_type: 'DOUBLE', floor: 1, has_ac: false, has_attached_bath: true },
    { id: '20000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', room_code: 'B201', room_type: 'DOUBLE', floor: 2, has_ac: true, has_attached_bath: true },
    { id: '20000000-0003-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000003', room_code: 'C101', room_type: 'DOUBLE', floor: 1, has_ac: true, has_attached_bath: true },
    { id: '20000000-0003-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', room_code: 'C102', room_type: 'SINGLE', floor: 1, has_ac: true, has_attached_bath: true },
    { id: '20000000-0003-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000003', room_code: 'C201', room_type: 'DOUBLE', floor: 2, has_ac: true, has_attached_bath: true },
    { id: '20000000-0003-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000003', room_code: 'C202', room_type: 'DOUBLE', floor: 2, has_ac: false, has_attached_bath: false },
    { id: '20000000-0004-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000004', room_code: 'D101', room_type: 'DOUBLE', floor: 1, has_ac: true, has_attached_bath: true },
    { id: '20000000-0004-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000004', room_code: 'D102', room_type: 'TRIPLE', floor: 1, has_ac: false, has_attached_bath: false },
    { id: '20000000-0004-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000004', room_code: 'D201', room_type: 'DOUBLE', floor: 2, has_ac: true, has_attached_bath: true },
    { id: '20000000-0005-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000005', room_code: 'E101', room_type: 'DORMITORY', floor: 1, has_ac: false, has_attached_bath: false },
    { id: '20000000-0005-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000005', room_code: 'E102', room_type: 'TRIPLE', floor: 1, has_ac: false, has_attached_bath: false },
    { id: '20000000-0006-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000006', room_code: 'F101', room_type: 'SINGLE', floor: 1, has_ac: true, has_attached_bath: true },
    { id: '20000000-0006-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000006', room_code: 'F102', room_type: 'SINGLE', floor: 1, has_ac: true, has_attached_bath: true },
    { id: '20000000-0006-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000006', room_code: 'F201', room_type: 'DOUBLE', floor: 2, has_ac: true, has_attached_bath: true },
    { id: '20000000-0006-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000006', room_code: 'F202', room_type: 'DOUBLE', floor: 2, has_ac: true, has_attached_bath: true },
    { id: '20000000-0006-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000006', room_code: 'F301', room_type: 'DORMITORY', floor: 3, has_ac: false, has_attached_bath: false },
  ];

  const { error: roomsErr } = await supabase.from('rooms').insert(rooms);
  if (roomsErr) throw new Error(`Rooms: ${roomsErr.message}`);
  console.log(`  ✅ ${rooms.length} rooms created`);

  console.log('🛏️  Seeding beds...');
  const beds = [
    // PG1
    { id: '30000000-0001-4000-8000-000000000001', room_id: '20000000-0001-4000-8000-000000000001', bed_number: 1, status: 'OCCUPIED', price: 12000 },
    { id: '30000000-0001-4000-8000-000000000002', room_id: '20000000-0001-4000-8000-000000000001', bed_number: 2, status: 'AVAILABLE', price: 12000 },
    { id: '30000000-0001-4000-8000-000000000003', room_id: '20000000-0001-4000-8000-000000000002', bed_number: 1, status: 'AVAILABLE', price: 12000 },
    { id: '30000000-0001-4000-8000-000000000004', room_id: '20000000-0001-4000-8000-000000000002', bed_number: 2, status: 'OCCUPIED', price: 12000 },
    { id: '30000000-0001-4000-8000-000000000005', room_id: '20000000-0001-4000-8000-000000000003', bed_number: 1, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0001-4000-8000-000000000006', room_id: '20000000-0001-4000-8000-000000000003', bed_number: 2, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0001-4000-8000-000000000007', room_id: '20000000-0001-4000-8000-000000000003', bed_number: 3, status: 'AVAILABLE', price: 10000 },
    { id: '30000000-0001-4000-8000-000000000008', room_id: '20000000-0001-4000-8000-000000000004', bed_number: 1, status: 'OCCUPIED', price: 15000 },
    { id: '30000000-0001-4000-8000-000000000009', room_id: '20000000-0001-4000-8000-000000000005', bed_number: 1, status: 'OCCUPIED', price: 7000 },
    { id: '30000000-0001-4000-8000-000000000010', room_id: '20000000-0001-4000-8000-000000000005', bed_number: 2, status: 'AVAILABLE', price: 7000 },
    { id: '30000000-0001-4000-8000-000000000011', room_id: '20000000-0001-4000-8000-000000000005', bed_number: 3, status: 'OCCUPIED', price: 7000 },
    { id: '30000000-0001-4000-8000-000000000012', room_id: '20000000-0001-4000-8000-000000000005', bed_number: 4, status: 'AVAILABLE', price: 7000 },
    { id: '30000000-0001-4000-8000-000000000013', room_id: '20000000-0001-4000-8000-000000000005', bed_number: 5, status: 'OCCUPIED', price: 7000 },
    { id: '30000000-0001-4000-8000-000000000014', room_id: '20000000-0001-4000-8000-000000000005', bed_number: 6, status: 'AVAILABLE', price: 7000 },
    // PG2
    { id: '30000000-0002-4000-8000-000000000001', room_id: '20000000-0002-4000-8000-000000000001', bed_number: 1, status: 'OCCUPIED', price: 8500 },
    { id: '30000000-0002-4000-8000-000000000002', room_id: '20000000-0002-4000-8000-000000000001', bed_number: 2, status: 'AVAILABLE', price: 8500 },
    { id: '30000000-0002-4000-8000-000000000003', room_id: '20000000-0002-4000-8000-000000000001', bed_number: 3, status: 'OCCUPIED', price: 8500 },
    { id: '30000000-0002-4000-8000-000000000004', room_id: '20000000-0002-4000-8000-000000000002', bed_number: 1, status: 'AVAILABLE', price: 9000 },
    { id: '30000000-0002-4000-8000-000000000005', room_id: '20000000-0002-4000-8000-000000000002', bed_number: 2, status: 'OCCUPIED', price: 9000 },
    { id: '30000000-0002-4000-8000-000000000006', room_id: '20000000-0002-4000-8000-000000000003', bed_number: 1, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0002-4000-8000-000000000007', room_id: '20000000-0002-4000-8000-000000000003', bed_number: 2, status: 'OCCUPIED', price: 10000 },
    // PG3
    { id: '30000000-0003-4000-8000-000000000001', room_id: '20000000-0003-4000-8000-000000000001', bed_number: 1, status: 'OCCUPIED', price: 14000 },
    { id: '30000000-0003-4000-8000-000000000002', room_id: '20000000-0003-4000-8000-000000000001', bed_number: 2, status: 'OCCUPIED', price: 14000 },
    { id: '30000000-0003-4000-8000-000000000003', room_id: '20000000-0003-4000-8000-000000000002', bed_number: 1, status: 'AVAILABLE', price: 16000 },
    { id: '30000000-0003-4000-8000-000000000004', room_id: '20000000-0003-4000-8000-000000000003', bed_number: 1, status: 'OCCUPIED', price: 14000 },
    { id: '30000000-0003-4000-8000-000000000005', room_id: '20000000-0003-4000-8000-000000000003', bed_number: 2, status: 'AVAILABLE', price: 14000 },
    { id: '30000000-0003-4000-8000-000000000006', room_id: '20000000-0003-4000-8000-000000000004', bed_number: 1, status: 'OCCUPIED', price: 12000 },
    { id: '30000000-0003-4000-8000-000000000007', room_id: '20000000-0003-4000-8000-000000000004', bed_number: 2, status: 'OCCUPIED', price: 12000 },
    // PG4
    { id: '30000000-0004-4000-8000-000000000001', room_id: '20000000-0004-4000-8000-000000000001', bed_number: 1, status: 'OCCUPIED', price: 11000 },
    { id: '30000000-0004-4000-8000-000000000002', room_id: '20000000-0004-4000-8000-000000000001', bed_number: 2, status: 'AVAILABLE', price: 11000 },
    { id: '30000000-0004-4000-8000-000000000003', room_id: '20000000-0004-4000-8000-000000000002', bed_number: 1, status: 'AVAILABLE', price: 10000 },
    { id: '30000000-0004-4000-8000-000000000004', room_id: '20000000-0004-4000-8000-000000000002', bed_number: 2, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0004-4000-8000-000000000005', room_id: '20000000-0004-4000-8000-000000000002', bed_number: 3, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0004-4000-8000-000000000006', room_id: '20000000-0004-4000-8000-000000000003', bed_number: 1, status: 'OCCUPIED', price: 12000 },
    { id: '30000000-0004-4000-8000-000000000007', room_id: '20000000-0004-4000-8000-000000000003', bed_number: 2, status: 'AVAILABLE', price: 12000 },
    // PG5
    { id: '30000000-0005-4000-8000-000000000001', room_id: '20000000-0005-4000-8000-000000000001', bed_number: 1, status: 'OCCUPIED', price: 6500 },
    { id: '30000000-0005-4000-8000-000000000002', room_id: '20000000-0005-4000-8000-000000000001', bed_number: 2, status: 'OCCUPIED', price: 6500 },
    { id: '30000000-0005-4000-8000-000000000003', room_id: '20000000-0005-4000-8000-000000000001', bed_number: 3, status: 'AVAILABLE', price: 6500 },
    { id: '30000000-0005-4000-8000-000000000004', room_id: '20000000-0005-4000-8000-000000000001', bed_number: 4, status: 'OCCUPIED', price: 6500 },
    { id: '30000000-0005-4000-8000-000000000005', room_id: '20000000-0005-4000-8000-000000000001', bed_number: 5, status: 'AVAILABLE', price: 6500 },
    { id: '30000000-0005-4000-8000-000000000006', room_id: '20000000-0005-4000-8000-000000000001', bed_number: 6, status: 'OCCUPIED', price: 6500 },
    { id: '30000000-0005-4000-8000-000000000007', room_id: '20000000-0005-4000-8000-000000000002', bed_number: 1, status: 'AVAILABLE', price: 7000 },
    { id: '30000000-0005-4000-8000-000000000008', room_id: '20000000-0005-4000-8000-000000000002', bed_number: 2, status: 'OCCUPIED', price: 7000 },
    { id: '30000000-0005-4000-8000-000000000009', room_id: '20000000-0005-4000-8000-000000000002', bed_number: 3, status: 'AVAILABLE', price: 7000 },
    // PG6
    { id: '30000000-0006-4000-8000-000000000001', room_id: '20000000-0006-4000-8000-000000000001', bed_number: 1, status: 'OCCUPIED', price: 15000 },
    { id: '30000000-0006-4000-8000-000000000002', room_id: '20000000-0006-4000-8000-000000000002', bed_number: 1, status: 'OCCUPIED', price: 15000 },
    { id: '30000000-0006-4000-8000-000000000003', room_id: '20000000-0006-4000-8000-000000000003', bed_number: 1, status: 'AVAILABLE', price: 16000 },
    { id: '30000000-0006-4000-8000-000000000004', room_id: '20000000-0006-4000-8000-000000000003', bed_number: 2, status: 'OCCUPIED', price: 16000 },
    { id: '30000000-0006-4000-8000-000000000005', room_id: '20000000-0006-4000-8000-000000000004', bed_number: 1, status: 'OCCUPIED', price: 16000 },
    { id: '30000000-0006-4000-8000-000000000006', room_id: '20000000-0006-4000-8000-000000000004', bed_number: 2, status: 'OCCUPIED', price: 16000 },
    { id: '30000000-0006-4000-8000-000000000007', room_id: '20000000-0006-4000-8000-000000000005', bed_number: 1, status: 'AVAILABLE', price: 10000 },
    { id: '30000000-0006-4000-8000-000000000008', room_id: '20000000-0006-4000-8000-000000000005', bed_number: 2, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0006-4000-8000-000000000009', room_id: '20000000-0006-4000-8000-000000000005', bed_number: 3, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0006-4000-8000-000000000010', room_id: '20000000-0006-4000-8000-000000000005', bed_number: 4, status: 'AVAILABLE', price: 10000 },
    { id: '30000000-0006-4000-8000-000000000011', room_id: '20000000-0006-4000-8000-000000000005', bed_number: 5, status: 'OCCUPIED', price: 10000 },
    { id: '30000000-0006-4000-8000-000000000012', room_id: '20000000-0006-4000-8000-000000000005', bed_number: 6, status: 'AVAILABLE', price: 10000 },
  ];

  const { error: bedsErr } = await supabase.from('beds').insert(beds);
  if (bedsErr) throw new Error(`Beds: ${bedsErr.message}`);
  console.log(`  ✅ ${beds.length} beds created`);

  console.log('📋 Seeding bookings...');
  const bookings = [
    { id: '40000000-0001-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', bed_id: '30000000-0001-4000-8000-000000000001', check_in_date: '2025-01-15', status: 'ACTIVE', advance_paid: 12000 },
    { id: '40000000-0001-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', bed_id: '30000000-0003-4000-8000-000000000001', check_in_date: '2025-02-01', status: 'ACTIVE', advance_paid: 14000 },
    { id: '40000000-0001-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', bed_id: '30000000-0002-4000-8000-000000000001', check_in_date: '2025-01-20', status: 'ACTIVE', advance_paid: 8500 },
    { id: '40000000-0001-4000-8000-000000000004', user_id: '00000000-0002-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000003', bed_id: '30000000-0003-4000-8000-000000000002', check_in_date: '2025-03-01', status: 'ACTIVE', advance_paid: 14000 },
    { id: '40000000-0001-4000-8000-000000000005', user_id: '00000000-0002-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000004', bed_id: '30000000-0004-4000-8000-000000000004', check_in_date: '2025-02-15', status: 'ACTIVE', advance_paid: 11000 },
    { id: '40000000-0001-4000-8000-000000000006', user_id: '00000000-0002-4000-8000-000000000006', pg_id: '10000000-0001-4000-8000-000000000003', bed_id: '30000000-0003-4000-8000-000000000006', check_in_date: '2025-04-01', status: 'ACTIVE', advance_paid: 14000 },
  ];

  const { error: bookingsErr } = await supabase.from('bookings').insert(bookings);
  if (bookingsErr) throw new Error(`Bookings: ${bookingsErr.message}`);
  console.log(`  ✅ ${bookings.length} bookings created`);

  console.log('💰 Seeding payments...');
  const payments = [
    // Vikram -> PG1
    { id: '50000000-0001-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', booking_id: '40000000-0001-4000-8000-000000000001', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-01-01', paid_date: '2025-01-02', method: 'UPI' },
    { id: '50000000-0001-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', booking_id: '40000000-0001-4000-8000-000000000001', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-02-01', paid_date: '2025-02-03', method: 'CARD' },
    { id: '50000000-0001-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', booking_id: '40000000-0001-4000-8000-000000000001', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-03-01', paid_date: '2025-03-02', method: 'UPI' },
    { id: '50000000-0001-4000-8000-000000000004', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', booking_id: '40000000-0001-4000-8000-000000000001', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-04-01', paid_date: '2025-04-01', method: 'NET_BANKING' },
    { id: '50000000-0001-4000-8000-000000000005', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', booking_id: '40000000-0001-4000-8000-000000000001', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-05-01', paid_date: '2025-05-03', method: 'UPI' },
    { id: '50000000-0001-4000-8000-000000000006', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', booking_id: '40000000-0001-4000-8000-000000000001', amount: 12000, type: 'RENT', status: 'PENDING', due_date: '2025-06-01', paid_date: null, method: null },
    // Ananya -> PG3
    { id: '50000000-0002-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000002', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-02-01', paid_date: '2025-02-01', method: 'UPI' },
    { id: '50000000-0002-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000002', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-03-01', paid_date: '2025-03-02', method: 'CASH' },
    { id: '50000000-0002-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000002', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-04-01', paid_date: '2025-04-01', method: 'UPI' },
    { id: '50000000-0002-4000-8000-000000000004', user_id: '00000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000002', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-05-01', paid_date: '2025-05-02', method: 'UPI' },
    { id: '50000000-0002-4000-8000-000000000005', user_id: '00000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000002', amount: 14000, type: 'RENT', status: 'PENDING', due_date: '2025-06-01', paid_date: null, method: null },
    // Rohan -> PG2
    { id: '50000000-0003-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', booking_id: '40000000-0001-4000-8000-000000000003', amount: 8500, type: 'RENT', status: 'COMPLETED', due_date: '2025-01-01', paid_date: '2025-01-03', method: 'UPI' },
    { id: '50000000-0003-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', booking_id: '40000000-0001-4000-8000-000000000003', amount: 8500, type: 'RENT', status: 'COMPLETED', due_date: '2025-02-01', paid_date: '2025-02-02', method: 'CARD' },
    { id: '50000000-0003-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', booking_id: '40000000-0001-4000-8000-000000000003', amount: 8500, type: 'RENT', status: 'COMPLETED', due_date: '2025-03-01', paid_date: '2025-03-01', method: 'UPI' },
    { id: '50000000-0003-4000-8000-000000000004', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', booking_id: '40000000-0001-4000-8000-000000000003', amount: 8500, type: 'RENT', status: 'COMPLETED', due_date: '2025-04-01', paid_date: '2025-04-03', method: 'CASH' },
    { id: '50000000-0003-4000-8000-000000000005', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', booking_id: '40000000-0001-4000-8000-000000000003', amount: 8500, type: 'RENT', status: 'COMPLETED', due_date: '2025-05-01', paid_date: '2025-05-02', method: 'UPI' },
    { id: '50000000-0003-4000-8000-000000000006', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', booking_id: '40000000-0001-4000-8000-000000000003', amount: 8500, type: 'RENT', status: 'PENDING', due_date: '2025-06-01', paid_date: null, method: null },
    // Sneha -> PG3
    { id: '50000000-0004-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000004', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-03-01', paid_date: '2025-03-02', method: 'UPI' },
    { id: '50000000-0004-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000004', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-04-01', paid_date: '2025-04-01', method: 'UPI' },
    { id: '50000000-0004-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000004', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-05-01', paid_date: '2025-05-03', method: 'CARD' },
    { id: '50000000-0004-4000-8000-000000000004', user_id: '00000000-0002-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000004', amount: 14000, type: 'RENT', status: 'PENDING', due_date: '2025-06-01', paid_date: null, method: null },
    // Karthik -> PG4
    { id: '50000000-0005-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000004', booking_id: '40000000-0001-4000-8000-000000000005', amount: 11000, type: 'RENT', status: 'COMPLETED', due_date: '2025-02-01', paid_date: '2025-02-02', method: 'UPI' },
    { id: '50000000-0005-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000004', booking_id: '40000000-0001-4000-8000-000000000005', amount: 11000, type: 'RENT', status: 'COMPLETED', due_date: '2025-03-01', paid_date: '2025-03-03', method: 'UPI' },
    { id: '50000000-0005-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000004', booking_id: '40000000-0001-4000-8000-000000000005', amount: 11000, type: 'RENT', status: 'COMPLETED', due_date: '2025-04-01', paid_date: '2025-04-02', method: 'NET_BANKING' },
    { id: '50000000-0005-4000-8000-000000000004', user_id: '00000000-0002-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000004', booking_id: '40000000-0001-4000-8000-000000000005', amount: 11000, type: 'RENT', status: 'COMPLETED', due_date: '2025-05-01', paid_date: '2025-05-01', method: 'UPI' },
    { id: '50000000-0005-4000-8000-000000000005', user_id: '00000000-0002-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000004', booking_id: '40000000-0001-4000-8000-000000000005', amount: 11000, type: 'RENT', status: 'PENDING', due_date: '2025-06-01', paid_date: null, method: null },
    // Divya -> PG3
    { id: '50000000-0006-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000006', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000006', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-04-01', paid_date: '2025-04-02', method: 'UPI' },
    { id: '50000000-0006-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000006', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000006', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-05-01', paid_date: '2025-05-03', method: 'UPI' },
    { id: '50000000-0006-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000006', pg_id: '10000000-0001-4000-8000-000000000003', booking_id: '40000000-0001-4000-8000-000000000006', amount: 14000, type: 'RENT', status: 'PENDING', due_date: '2025-06-01', paid_date: null, method: null },
  ];

  const { error: paymentsErr } = await supabase.from('payments').insert(payments);
  if (paymentsErr) throw new Error(`Payments: ${paymentsErr.message}`);
  console.log(`  ✅ ${payments.length} payments created`);

  console.log('🔔 Seeding complaints...');
  const complaints = [
    { id: '60000000-0001-4000-8000-000000000001', user_id: '00000000-0002-4000-8000-000000000001', pg_id: '10000000-0001-4000-8000-000000000001', title: 'WiFi not working in Room A101', description: 'WiFi has been down for 2 days.', category: 'MAINTENANCE', priority: 'HIGH', status: 'IN_PROGRESS', assigned_to: 'Arjun' },
    { id: '60000000-0001-4000-8000-000000000002', user_id: '00000000-0002-4000-8000-000000000002', pg_id: '10000000-0001-4000-8000-000000000003', title: 'Water heater not functioning', description: 'Water heater stopped working.', category: 'MAINTENANCE', priority: 'MEDIUM', status: 'OPEN' },
    { id: '60000000-0001-4000-8000-000000000003', user_id: '00000000-0002-4000-8000-000000000003', pg_id: '10000000-0001-4000-8000-000000000002', title: 'Excessive noise from construction', description: 'Construction noise daily.', category: 'NOISE', priority: 'LOW', status: 'OPEN' },
    { id: '60000000-0001-4000-8000-000000000004', user_id: '00000000-0002-4000-8000-000000000004', pg_id: '10000000-0001-4000-8000-000000000003', title: 'Bathroom cleanliness issue', description: 'Bathroom not being cleaned properly.', category: 'CLEANLINESS', priority: 'MEDIUM', status: 'RESOLVED', assigned_to: 'Lakshmi', resolution: 'Cleaning schedule updated.' },
    { id: '60000000-0001-4000-8000-000000000005', user_id: '00000000-0002-4000-8000-000000000005', pg_id: '10000000-0001-4000-8000-000000000004', title: 'AC remote missing', description: 'AC remote in Room D102 is missing.', category: 'MAINTENANCE', priority: 'LOW', status: 'RESOLVED', assigned_to: 'Arjun', resolution: 'Replacement remote provided.' },
    { id: '60000000-0001-4000-8000-000000000006', user_id: '00000000-0002-4000-8000-000000000006', pg_id: '10000000-0001-4000-8000-000000000003', title: 'Security gate malfunction', description: 'Main gate electronic lock not working.', category: 'SAFETY', priority: 'URGENT', status: 'IN_PROGRESS', assigned_to: 'Ramesh' },
  ];

  const { error: complaintsErr } = await supabase.from('complaints').insert(complaints);
  if (complaintsErr) throw new Error(`Complaints: ${complaintsErr.message}`);
  console.log(`  ✅ ${complaints.length} complaints created`);

  console.log('🔧 Seeding vendors...');
  const vendors = [
    { id: '70000000-0001-4000-8000-000000000001', name: 'QuickFix Plumbing', type: 'PLUMBER', phone: '+919876540001', email: 'quickfix@email.com', city: 'Bangalore', area: 'Koramangala', rating: 4.2 },
    { id: '70000000-0001-4000-8000-000000000002', name: 'Spark Electric', type: 'ELECTRICIAN', phone: '+919876540002', email: 'spark@email.com', city: 'Bangalore', area: 'HSR Layout', rating: 4.5 },
    { id: '70000000-0001-4000-8000-000000000003', name: 'CleanPro Services', type: 'CLEANER', phone: '+919876540003', city: 'Bangalore', area: 'Indiranagar', rating: 4.0 },
    { id: '70000000-0001-4000-8000-000000000004', name: 'Fresh Paint Co', type: 'PAINTER', phone: '+919876540004', email: 'freshpaint@email.com', city: 'Bangalore', area: 'Whitefield', rating: 3.8 },
    { id: '70000000-0001-4000-8000-000000000005', name: 'WoodCraft Works', type: 'CARPENTER', phone: '+919876540005', city: 'Bangalore', area: 'Marathahalli', rating: 4.3 },
    { id: '70000000-0001-4000-8000-000000000006', name: 'NetConnect WiFi', type: 'WIFI', phone: '+919876540006', email: 'netconnect@email.com', city: 'Bangalore', area: 'Electronic City', rating: 4.6 },
    { id: '70000000-0001-4000-8000-000000000007', name: 'Mr. Right Services', type: 'GENERAL', phone: '+919876540007', city: 'Bangalore', area: 'JP Nagar', rating: 3.9 },
    { id: '70000000-0001-4000-8000-000000000008', name: 'PowerGrid Electric', type: 'ELECTRICIAN', phone: '+919876540008', email: 'powergrid@email.com', city: 'Bangalore', area: 'BTM Layout', rating: 4.1 },
  ];

  const { error: vendorsErr } = await supabase.from('vendors').insert(vendors);
  if (vendorsErr) throw new Error(`Vendors: ${vendorsErr.message}`);
  console.log(`  ✅ ${vendors.length} vendors created`);

  console.log('👷 Seeding workers...');
  const workers = [
    { id: '80000000-0001-4000-8000-000000000001', name: 'Ramesh', role: 'SECURITY', phone: '+919876550001', pg_id: '10000000-0001-4000-8000-000000000001', shift: 'NIGHT' },
    { id: '80000000-0001-4000-8000-000000000002', name: 'Geeta', role: 'CLEANER', phone: '+919876550002', pg_id: '10000000-0001-4000-8000-000000000001', shift: 'MORNING' },
    { id: '80000000-0001-4000-8000-000000000003', name: 'Suresh', role: 'COOK', phone: '+919876550003', pg_id: '10000000-0001-4000-8000-000000000002', shift: 'MORNING' },
    { id: '80000000-0001-4000-8000-000000000004', name: 'Lakshmi', role: 'CLEANER', phone: '+919876550004', pg_id: '10000000-0001-4000-8000-000000000003', shift: 'EVENING' },
    { id: '80000000-0001-4000-8000-000000000005', name: 'Mohan', role: 'MANAGER', phone: '+919876550005', pg_id: '10000000-0001-4000-8000-000000000001', shift: 'MORNING' },
    { id: '80000000-0001-4000-8000-000000000006', name: 'Kavitha', role: 'COOK', phone: '+919876550006', pg_id: '10000000-0001-4000-8000-000000000003', shift: 'MORNING' },
    { id: '80000000-0001-4000-8000-000000000007', name: 'Arjun', role: 'MAINTENANCE', phone: '+919876550007', pg_id: '10000000-0001-4000-8000-000000000004', shift: 'MORNING' },
    { id: '80000000-0001-4000-8000-000000000008', name: 'Padma', role: 'SECURITY', phone: '+919876550008', pg_id: '10000000-0001-4000-8000-000000000003', shift: 'MORNING' },
  ];

  const { error: workersErr } = await supabase.from('workers').insert(workers);
  if (workersErr) throw new Error(`Workers: ${workersErr.message}`);
  console.log(`  ✅ ${workers.length} workers created`);

  console.log('\n✅ Database seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   Users: ${users.length} (3 owners, 6 tenants, 1 admin)`);
  console.log(`   PGs: ${pgs.length}`);
  console.log(`   Rooms: ${rooms.length}`);
  console.log(`   Beds: ${beds.length}`);
  console.log(`   Bookings: ${bookings.length}`);
  console.log(`   Payments: ${payments.length}`);
  console.log(`   Complaints: ${complaints.length}`);
  console.log(`   Vendors: ${vendors.length}`);
  console.log(`   Workers: ${workers.length}`);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
