import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdminSecret } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authError = requireAdminSecret(request);
  if (authError) return authError;

  try {
    // Check if users table has data
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userCount && userCount > 0) {
      return NextResponse.json({
        message: `Database already has ${userCount} user(s). Skipping seed.`,
        skipped: true,
      });
    }

    // Seed users
    const { error: usersErr } = await supabase.from('users').insert([
      { id: '00000000-0001-4000-8000-000000000001', name: 'Rajesh Kumar', email: 'rajesh@stayeg.in', phone: '+919876543210', role: 'OWNER', gender: 'MALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rajesh', bio: 'Experienced PG owner managing premium accommodations in Bengaluru.', city: 'Bangalore', occupation: 'Property Manager' },
      { id: '00000000-0001-4000-8000-000000000002', name: 'Priya Sharma', email: 'priya@stayeg.in', phone: '+919876543211', role: 'OWNER', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya', bio: 'Managing 2 PGs in Bengaluru.', city: 'Bangalore', occupation: 'Property Manager' },
      { id: '00000000-0001-4000-8000-000000000003', name: 'Amit Patel', email: 'amit@stayeg.in', phone: '+919876543212', role: 'OWNER', gender: 'MALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Amit', bio: 'Tech turned PG entrepreneur.', city: 'Bangalore', occupation: 'Property Manager' },
      { id: '00000000-0002-4000-8000-000000000001', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+919123456789', role: 'TENANT', gender: 'MALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram', city: 'Bangalore', occupation: 'Software Engineer' },
      { id: '00000000-0002-4000-8000-000000000002', name: 'Ananya Reddy', email: 'ananya@email.com', phone: '+919123456790', role: 'TENANT', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ananya', city: 'Bangalore', occupation: 'Data Analyst' },
      { id: '00000000-0002-4000-8000-000000000003', name: 'Rohan Mehta', email: 'rohan@email.com', phone: '+919123456791', role: 'TENANT', gender: 'MALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rohan', city: 'Bangalore', occupation: 'MBA Student' },
      { id: '00000000-0002-4000-8000-000000000004', name: 'Sneha Joshi', email: 'sneha@email.com', phone: '+919123456792', role: 'TENANT', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sneha', city: 'Bangalore', occupation: 'UX Designer' },
      { id: '00000000-0002-4000-8000-000000000005', name: 'Karthik Nair', email: 'karthik@email.com', phone: '+919123456793', role: 'TENANT', gender: 'MALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karthik', city: 'Bangalore', occupation: 'IT Consultant' },
      { id: '00000000-0002-4000-8000-000000000006', name: 'Divya Gupta', email: 'divya@email.com', phone: '+919123456794', role: 'TENANT', gender: 'FEMALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Divya', city: 'Bangalore', occupation: 'Content Writer' },
      { id: '00000000-0003-4000-8000-000000000001', name: 'Admin User', email: 'admin@stayeg.in', phone: '+919999999999', role: 'ADMIN', gender: 'MALE', is_verified: true, is_approved: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin', bio: 'StayEg platform administrator.', city: 'Bangalore', occupation: 'Administrator' },
    ]);
    if (usersErr) throw new Error(`Users seed failed: ${usersErr.message}`);

    // Seed PGs
    const { error: pgsErr } = await supabase.from('pgs').insert([
      { id: '10000000-0001-4000-8000-000000000001', name: 'Sunrise PG - Koramangala', owner_id: '00000000-0001-4000-8000-000000000001', description: 'Premium PG in Koramangala with modern amenities.', address: '123, 4th Cross, Koramangala 4th Block', city: 'Bangalore', lat: 12.9352, lng: 77.6245, gender: 'UNISEX', price: 12000, security_deposit: 24000, amenities: 'wifi,ac,food,laundry,parking,cctv,power_backup,water_heater,study_table,housekeeping', images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop', rating: 4.5, total_reviews: 128, status: 'APPROVED', is_verified: true },
      { id: '10000000-0001-4000-8000-000000000002', name: 'Green Valley PG - HSR Layout', owner_id: '00000000-0001-4000-8000-000000000001', description: 'Peaceful PG with homely food.', address: '45, 27th Main, HSR Layout Sector 2', city: 'Bangalore', lat: 12.9116, lng: 77.6389, gender: 'MALE', price: 8500, security_deposit: 17000, amenities: 'wifi,food,laundry,cctv,power_backup,study_table,common_room,tv', images: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop', rating: 4.2, total_reviews: 89, status: 'APPROVED', is_verified: true },
      { id: '10000000-0001-4000-8000-000000000003', name: 'Ladies Paradise PG - Indiranagar', owner_id: '00000000-0001-4000-8000-000000000002', description: 'Safe PG for women in Indiranagar.', address: '78, 100 Feet Road, Indiranagar', city: 'Bangalore', lat: 12.9784, lng: 77.6408, gender: 'FEMALE', price: 14000, security_deposit: 28000, amenities: 'wifi,ac,food,laundry,cctv,power_backup,water_heater,wardrobe,housekeeping,gym', images: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop', rating: 4.8, total_reviews: 156, status: 'APPROVED', is_verified: true },
      { id: '10000000-0001-4000-8000-000000000004', name: 'Tech Hub PG - Whitefield', owner_id: '00000000-0001-4000-8000-000000000002', description: 'Modern co-living near ITPL.', address: '56, ITPL Main Road, Whitefield', city: 'Bangalore', lat: 12.9698, lng: 77.75, gender: 'UNISEX', price: 11000, security_deposit: 22000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,common_room,tv', images: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop', rating: 4.3, total_reviews: 95, status: 'APPROVED', is_verified: true },
      { id: '10000000-0001-4000-8000-000000000005', name: 'Budget Bliss PG - Marathahalli', owner_id: '00000000-0001-4000-8000-000000000003', description: 'Affordable PG with basic amenities.', address: '23, Marathahalli Main Road', city: 'Bangalore', lat: 12.9591, lng: 77.6974, gender: 'MALE', price: 6500, security_deposit: 13000, amenities: 'wifi,food,laundry,power_backup,study_table', images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop', rating: 3.9, total_reviews: 67, status: 'APPROVED', is_verified: true },
      { id: '10000000-0001-4000-8000-000000000006', name: 'Royal Residency PG - Electronic City', owner_id: '00000000-0001-4000-8000-000000000003', description: 'Premium gated PG community.', address: '89, Phase 1, Electronic City', city: 'Bangalore', lat: 12.844, lng: 77.673, gender: 'UNISEX', price: 15000, security_deposit: 30000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,water_heater,study_table,wardrobe,housekeeping', images: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', rating: 4.7, total_reviews: 210, status: 'APPROVED', is_verified: true },
    ]);
    if (pgsErr) throw new Error(`PGs seed failed: ${pgsErr.message}`);

    // Seed vendors
    const { error: vendorsErr } = await supabase.from('vendors').insert([
      { id: '70000000-0001-4000-8000-000000000001', name: 'QuickFix Plumbing', type: 'PLUMBER', phone: '+919876540001', email: 'quickfix@email.com', city: 'Bangalore', area: 'Koramangala', rating: 4.2, status: 'ACTIVE' },
      { id: '70000000-0001-4000-8000-000000000002', name: 'Spark Electric', type: 'ELECTRICIAN', phone: '+919876540002', email: 'spark@email.com', city: 'Bangalore', area: 'HSR Layout', rating: 4.5, status: 'ACTIVE' },
      { id: '70000000-0001-4000-8000-000000000003', name: 'CleanPro Services', type: 'CLEANER', phone: '+919876540003', city: 'Bangalore', area: 'Indiranagar', rating: 4.0, status: 'ACTIVE' },
      { id: '70000000-0001-4000-8000-000000000004', name: 'Fresh Paint Co', type: 'PAINTER', phone: '+919876540004', email: 'freshpaint@email.com', city: 'Bangalore', area: 'Whitefield', rating: 3.8, status: 'ACTIVE' },
      { id: '70000000-0001-4000-8000-000000000005', name: 'WoodCraft Works', type: 'CARPENTER', phone: '+919876540005', city: 'Bangalore', area: 'Marathahalli', rating: 4.3, status: 'ACTIVE' },
      { id: '70000000-0001-4000-8000-000000000006', name: 'NetConnect WiFi', type: 'WIFI', phone: '+919876540006', email: 'netconnect@email.com', city: 'Bangalore', area: 'Electronic City', rating: 4.6, status: 'ACTIVE' },
      { id: '70000000-0001-4000-8000-000000000007', name: 'Mr. Right Services', type: 'GENERAL', phone: '+919876540007', city: 'Bangalore', area: 'JP Nagar', rating: 3.9, status: 'ACTIVE' },
      { id: '70000000-0001-4000-8000-000000000008', name: 'PowerGrid Electric', type: 'ELECTRICIAN', phone: '+919876540008', email: 'powergrid@email.com', city: 'Bangalore', area: 'BTM Layout', rating: 4.1, status: 'ACTIVE' },
    ]);
    if (vendorsErr) throw new Error(`Vendors seed failed: ${vendorsErr.message}`);

    // Seed workers
    const { error: workersErr } = await supabase.from('workers').insert([
      { id: '80000000-0001-4000-8000-000000000001', name: 'Ramesh', role: 'SECURITY', phone: '+919876550001', pg_id: '10000000-0001-4000-8000-000000000001', shift: 'NIGHT', status: 'ACTIVE' },
      { id: '80000000-0001-4000-8000-000000000002', name: 'Geeta', role: 'CLEANER', phone: '+919876550002', pg_id: '10000000-0001-4000-8000-000000000001', shift: 'MORNING', status: 'ACTIVE' },
      { id: '80000000-0001-4000-8000-000000000003', name: 'Suresh', role: 'COOK', phone: '+919876550003', pg_id: '10000000-0001-4000-8000-000000000002', shift: 'MORNING', status: 'ACTIVE' },
      { id: '80000000-0001-4000-8000-000000000004', name: 'Lakshmi', role: 'CLEANER', phone: '+919876550004', pg_id: '10000000-0001-4000-8000-000000000003', shift: 'EVENING', status: 'ACTIVE' },
      { id: '80000000-0001-4000-8000-000000000005', name: 'Mohan', role: 'MANAGER', phone: '+919876550005', pg_id: '10000000-0001-4000-8000-000000000001', shift: 'MORNING', status: 'ACTIVE' },
      { id: '80000000-0001-4000-8000-000000000006', name: 'Kavitha', role: 'COOK', phone: '+919876550006', pg_id: '10000000-0001-4000-8000-000000000004', shift: 'EVENING', status: 'ACTIVE' },
      { id: '80000000-0001-4000-8000-000000000007', name: 'Arjun', role: 'MAINTENANCE', phone: '+919876550007', pg_id: '10000000-0001-4000-8000-000000000006', shift: 'MORNING', status: 'ACTIVE' },
      { id: '80000000-0001-4000-8000-000000000008', name: 'Deepa', role: 'CLEANER', phone: '+919876550008', pg_id: '10000000-0001-4000-8000-000000000005', shift: 'MORNING', status: 'ACTIVE' },
    ]);
    if (workersErr) throw new Error(`Workers seed failed: ${workersErr.message}`);

    return NextResponse.json({
      message: 'Seed complete! Created 10 users, 6 PGs, 8 vendors, 8 workers.',
      success: true,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Seed failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
