import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { requireAdminSecret } from '@/lib/api-auth';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'stayeg-v1.2-secure-2025';

export async function POST(request: Request) {
  try {
    // ============================================================
    // CRITICAL: Validate admin secret before allowing database wipe
    // ============================================================
    const authError = requireAdminSecret(request as any);
    if (authError) return authError;

    // ---- Clear existing data (reverse dependency order) ----
    const clearTable = async (table: string) => {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    };

    await clearTable('payments');
    await clearTable('bookings');
    await clearTable('complaints');
    await clearTable('beds');
    await clearTable('rooms');
    await clearTable('workers');
    await clearTable('vendors');
    await clearTable('pgs');
    await clearTable('users');

    // =========================================================
    // USERS
    // =========================================================
    const avatar = (name: string) =>
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const insertUser = async (
      name: string,
      email: string,
      phone: string,
      role: string,
      gender: string,
      verified: boolean
    ) => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          phone,
          role,
          gender,
          is_verified: verified,
          avatar: avatar(name),
        })
        .select()
        .single();
      if (error) throw new Error(`Failed to create user ${name}: ${error.message}`);
      return data!;
    };

    const owner1 = await insertUser('Rajesh Kumar', 'rajesh@stayeg.in', '+919876543210', 'OWNER', 'MALE', true);
    const owner2 = await insertUser('Priya Sharma', 'priya@stayeg.in', '+919876543211', 'OWNER', 'FEMALE', true);
    const owner3 = await insertUser('Amit Patel', 'amit@stayeg.in', '+919876543212', 'OWNER', 'MALE', true);

    const tenant1 = await insertUser('Vikram Singh', 'vikram@email.com', '+919123456789', 'TENANT', 'MALE', true);
    const tenant2 = await insertUser('Ananya Reddy', 'ananya@email.com', '+919123456790', 'TENANT', 'FEMALE', true);
    const tenant3 = await insertUser('Rohan Mehta', 'rohan@email.com', '+919123456791', 'TENANT', 'MALE', true);
    const tenant4 = await insertUser('Sneha Joshi', 'sneha@email.com', '+919123456792', 'TENANT', 'FEMALE', true);
    const tenant5 = await insertUser('Karthik Nair', 'karthik@email.com', '+919123456793', 'TENANT', 'MALE', true);
    const tenant6 = await insertUser('Divya Gupta', 'divya@email.com', '+919123456794', 'TENANT', 'FEMALE', true);

    // Admin
    await supabase.from('users').insert({
      name: 'Admin User',
      email: 'admin@stayeg.in',
      phone: '+919999999999',
      role: 'ADMIN',
      gender: 'MALE',
      is_verified: true,
      avatar: avatar('Admin'),
    });

    // =========================================================
    // PGs
    // =========================================================
    const insertPG = async (
      name: string,
      ownerId: string,
      description: string,
      address: string,
      gender: string,
      price: number,
      amenities: string,
      images: string,
      rating: number,
      totalReviews: number,
      status: string,
      verified: boolean,
      lat: number,
      lng: number
    ) => {
      const { data, error } = await supabase
        .from('pgs')
        .insert({
          name,
          owner_id: ownerId,
          description,
          address,
          city: 'Bangalore',
          lat,
          lng,
          gender,
          price,
          security_deposit: price * 2,
          amenities,
          images,
          rating,
          total_reviews: totalReviews,
          status,
          is_verified: verified,
        })
        .select()
        .single();
      if (error) throw new Error(`Failed to create PG ${name}: ${error.message}`);
      return data!;
    };

    const pg1 = await insertPG(
      'Sunrise PG - Koramangala', owner1.id,
      'Premium PG accommodation in the heart of Koramangala with modern amenities. Walking distance to major IT parks and metro.',
      '123, 4th Cross, Koramangala 4th Block', 'UNISEX', 12000,
      'wifi,ac,food,laundry,parking,cctv,power_backup,water_heater,study_table,housekeeping',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop',
      4.5, 128, 'APPROVED', true, 12.9352, 77.6245
    );
    const pg2 = await insertPG(
      'Green Valley PG - HSR Layout', owner1.id,
      'Peaceful PG surrounded by greenery. Homely food, clean rooms, and friendly atmosphere.',
      '45, 27th Main, HSR Layout Sector 2', 'MALE', 8500,
      'wifi,food,laundry,cctv,power_backup,study_table,common_room,tv',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop',
      4.2, 89, 'APPROVED', true, 12.9116, 77.6389
    );
    const pg3 = await insertPG(
      'Ladies Paradise PG - Indiranagar', owner2.id,
      'Safe and secure PG exclusively for women. Close to metro and shopping areas.',
      '78, 100 Feet Road, Indiranagar', 'FEMALE', 14000,
      'wifi,ac,food,laundry,cctv,power_backup,water_heater,wardrobe,housekeeping,gym',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
      4.8, 156, 'APPROVED', true, 12.9784, 77.6408
    );
    const pg4 = await insertPG(
      'Tech Hub PG - Whitefield', owner2.id,
      'Modern co-living space near ITPL Whitefield. Ideal for tech professionals.',
      '56, ITPL Main Road, Whitefield', 'UNISEX', 11000,
      'wifi,ac,food,laundry,parking,gym,cctv,power_backup,common_room,tv,refrigerator',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',
      4.3, 95, 'APPROVED', true, 12.9698, 77.75
    );
    const pg5 = await insertPG(
      'Budget Bliss PG - Marathahalli', owner3.id,
      'Affordable PG with all basic amenities. Excellent connectivity to IT hubs.',
      '23, Marathahalli Main Road', 'MALE', 6500,
      'wifi,food,laundry,power_backup,study_table',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
      3.9, 67, 'APPROVED', true, 12.9591, 77.6974
    );
    const pg6 = await insertPG(
      'Royal Residency PG - Electronic City', owner3.id,
      'Premium gated PG community with resort-like amenities.',
      '89, Phase 1, Electronic City', 'UNISEX', 15000,
      'wifi,ac,food,laundry,parking,gym,cctv,power_backup,water_heater,study_table,wardrobe,housekeeping,common_room,tv,refrigerator',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
      4.7, 210, 'APPROVED', true, 12.844, 77.673
    );

    // =========================================================
    // ROOMS & BEDS
    // =========================================================
    const bedCount = (type: string) =>
      type === 'SINGLE' ? 1 : type === 'DOUBLE' ? 2 : type === 'TRIPLE' ? 3 : 6;

    const createRoomWithBeds = async (
      pgId: string,
      code: string,
      type: string,
      floor: number,
      ac: boolean,
      bath: boolean
    ) => {
      const { data: room, error } = await supabase
        .from('rooms')
        .insert({ pg_id: pgId, room_code: code, room_type: type, floor, has_ac: ac, has_attached_bath: bath })
        .select()
        .single();
      if (error) throw new Error(`Failed to create room ${code}: ${error.message}`);

      const count = bedCount(type);
      for (let i = 1; i <= count; i++) {
        const status = Math.random() > 0.4 ? 'OCCUPIED' : 'AVAILABLE';
        await supabase.from('beds').insert({ room_id: room!.id, bed_number: i, status, price: null });
      }
      return room!;
    };

    // PG1 rooms
    await createRoomWithBeds(pg1.id, 'A101', 'DOUBLE', 1, true, true);
    await createRoomWithBeds(pg1.id, 'A102', 'DOUBLE', 1, true, true);
    await createRoomWithBeds(pg1.id, 'A201', 'TRIPLE', 2, false, false);
    await createRoomWithBeds(pg1.id, 'A202', 'SINGLE', 2, true, true);
    await createRoomWithBeds(pg1.id, 'A301', 'DORMITORY', 3, false, false);

    // PG2 rooms
    await createRoomWithBeds(pg2.id, 'B101', 'TRIPLE', 1, false, false);
    await createRoomWithBeds(pg2.id, 'B102', 'DOUBLE', 1, false, true);
    await createRoomWithBeds(pg2.id, 'B201', 'DOUBLE', 2, true, true);

    // PG3 rooms
    await createRoomWithBeds(pg3.id, 'C101', 'DOUBLE', 1, true, true);
    await createRoomWithBeds(pg3.id, 'C102', 'SINGLE', 1, true, true);
    await createRoomWithBeds(pg3.id, 'C201', 'DOUBLE', 2, true, true);
    await createRoomWithBeds(pg3.id, 'C202', 'DOUBLE', 2, false, false);

    // PG4 rooms
    await createRoomWithBeds(pg4.id, 'D101', 'DOUBLE', 1, true, true);
    await createRoomWithBeds(pg4.id, 'D102', 'TRIPLE', 1, false, false);
    await createRoomWithBeds(pg4.id, 'D201', 'DOUBLE', 2, true, true);

    // PG5 rooms
    await createRoomWithBeds(pg5.id, 'E101', 'DORMITORY', 1, false, false);
    await createRoomWithBeds(pg5.id, 'E102', 'TRIPLE', 1, false, false);

    // PG6 rooms
    await createRoomWithBeds(pg6.id, 'F101', 'SINGLE', 1, true, true);
    await createRoomWithBeds(pg6.id, 'F102', 'SINGLE', 1, true, true);
    await createRoomWithBeds(pg6.id, 'F201', 'DOUBLE', 2, true, true);
    await createRoomWithBeds(pg6.id, 'F202', 'DOUBLE', 2, true, true);
    await createRoomWithBeds(pg6.id, 'F301', 'DORMITORY', 3, false, false);

    // =========================================================
    // BOOKINGS (for occupied beds)
    // =========================================================
    const { data: occupiedBeds } = await supabase
      .from('beds')
      .select('id, room_id')
      .eq('status', 'OCCUPIED')
      .limit(6);

    const tenants = [tenant1, tenant2, tenant3, tenant4, tenant5, tenant6];
    const pgs = [pg1, pg2, pg3, pg4, pg5, pg6];
    const now = new Date();
    const bookingCount = Math.min((occupiedBeds ?? []).length, 6);

    const createdBookings: { booking: Record<string, unknown>; pg: typeof pg1; tenant: typeof tenant1 }[] = [];

    for (let i = 0; i < bookingCount; i++) {
      const bed = occupiedBeds![i];
      const { data: room } = await supabase
        .from('rooms')
        .select('pg_id')
        .eq('id', bed.room_id)
        .single();
      if (!room) continue;

      const pg = pgs.find((p) => p!.id === room.pg_id);
      const tenant = tenants[i];
      if (!pg || !tenant) continue;

      const { data: booking } = await supabase
        .from('bookings')
        .insert({
          user_id: tenant.id,
          pg_id: pg.id,
          bed_id: bed.id,
          check_in_date: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE',
          advance_paid: pg.price,
        })
        .select()
        .single();

      createdBookings.push({ booking: booking!, pg, tenant });
    }

    // =========================================================
    // PAYMENTS
    // =========================================================
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const methods = ['UPI', 'CARD', 'NET_BANKING', 'CASH'];

    for (const { booking, pg, tenant } of createdBookings) {
      for (let m = 0; m < months.length; m++) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - (months.length - 1 - m), 1);
        const isPaid = m < months.length - 1 || Math.random() > 0.3;
        await supabase.from('payments').insert({
          user_id: tenant.id,
          pg_id: pg.id,
          booking_id: (booking as Record<string, unknown>).id,
          amount: pg.price,
          type: 'RENT',
          status: isPaid ? 'COMPLETED' : 'PENDING',
          due_date: dueDate.toISOString(),
          paid_date: isPaid
            ? new Date(dueDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
            : null,
          method: isPaid ? methods[Math.floor(Math.random() * methods.length)] : null,
        });
      }
    }

    // =========================================================
    // COMPLAINTS
    // =========================================================
    const complaintsData = [
      { user_id: tenant1.id, pg_id: pg1.id, title: 'WiFi not working in Room A101', category: 'MAINTENANCE', priority: 'HIGH', status: 'IN_PROGRESS' },
      { user_id: tenant2.id, pg_id: pg3.id, title: 'Water heater not functioning', category: 'MAINTENANCE', priority: 'MEDIUM', status: 'OPEN' },
      { user_id: tenant3.id, pg_id: pg2.id, title: 'Excessive noise from construction nearby', category: 'NOISE', priority: 'LOW', status: 'OPEN' },
      { user_id: tenant4.id, pg_id: pg3.id, title: 'Common bathroom cleanliness issue', category: 'CLEANLINESS', priority: 'MEDIUM', status: 'RESOLVED' },
      { user_id: tenant5.id, pg_id: pg4.id, title: 'AC remote missing', category: 'MAINTENANCE', priority: 'LOW', status: 'RESOLVED' },
      { user_id: tenant6.id, pg_id: pg3.id, title: 'Security gate malfunction', category: 'SAFETY', priority: 'URGENT', status: 'IN_PROGRESS' },
    ];
    for (const c of complaintsData) {
      await supabase.from('complaints').insert({
        ...c,
        description: `${c.title} — needs immediate attention. Reported on ${new Date().toLocaleDateString()}.`,
      });
    }

    // =========================================================
    // VENDORS
    // =========================================================
    const vendorsData = [
      { name: 'QuickFix Plumbing', type: 'PLUMBER', phone: '+919876540001', email: 'quickfix@email.com', area: 'Koramangala' },
      { name: 'Spark Electric', type: 'ELECTRICIAN', phone: '+919876540002', email: 'spark@email.com', area: 'HSR Layout' },
      { name: 'CleanPro Services', type: 'CLEANER', phone: '+919876540003', area: 'Indiranagar' },
      { name: 'Fresh Paint Co', type: 'PAINTER', phone: '+919876540004', email: 'freshpaint@email.com', area: 'Whitefield' },
      { name: 'WoodCraft Works', type: 'CARPENTER', phone: '+919876540005', area: 'Marathahalli' },
      { name: 'NetConnect WiFi', type: 'WIFI', phone: '+919876540006', email: 'netconnect@email.com', area: 'Electronic City' },
      { name: 'Mr. Right Services', type: 'GENERAL', phone: '+919876540007', area: 'JP Nagar' },
      { name: 'PowerGrid Electric', type: 'ELECTRICIAN', phone: '+919876540008', email: 'powergrid@email.com', area: 'BTM Layout' },
    ];
    for (const v of vendorsData) {
      await supabase.from('vendors').insert({
        ...v,
        city: 'Bangalore',
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      });
    }

    // =========================================================
    // WORKERS
    // =========================================================
    const workersData = [
      { name: 'Ramesh', role: 'SECURITY', phone: '+919876550001', pg_id: pg1.id, shift: 'NIGHT' },
      { name: 'Geeta', role: 'CLEANER', phone: '+919876550002', pg_id: pg1.id, shift: 'MORNING' },
      { name: 'Suresh', role: 'COOK', phone: '+919876550003', pg_id: pg2.id, shift: 'MORNING' },
      { name: 'Lakshmi', role: 'CLEANER', phone: '+919876550004', pg_id: pg3.id, shift: 'EVENING' },
      { name: 'Mohan', role: 'MANAGER', phone: '+919876550005', pg_id: pg1.id, shift: 'MORNING' },
      { name: 'Kavitha', role: 'COOK', phone: '+919876550006', pg_id: pg3.id, shift: 'MORNING' },
      { name: 'Arjun', role: 'MAINTENANCE', phone: '+919876550007', pg_id: pg4.id, shift: 'MORNING' },
      { name: 'Padma', role: 'SECURITY', phone: '+919876550008', pg_id: pg3.id, shift: 'MORNING' },
    ];
    for (const w of workersData) {
      await supabase.from('workers').insert(w);
    }

    // =========================================================
    // DONE
    // =========================================================
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      stats: {
        users: 10,
        pgs: 6,
        rooms: 20,
        bookings: createdBookings.length,
        complaints: 6,
        vendors: 8,
        workers: 8,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
