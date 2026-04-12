import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear existing data in reverse dependency order
    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('complaints').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('beds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('workers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('pgs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Create Users
    const { data: owner1 } = await supabase.from('users').insert({ name: 'Rajesh Kumar', email: 'rajesh@stayeg.in', phone: '+919876543210', role: 'OWNER', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rajesh' }).select().single();
    const { data: owner2 } = await supabase.from('users').insert({ name: 'Priya Sharma', email: 'priya@stayeg.in', phone: '+919876543211', role: 'OWNER', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya' }).select().single();
    const { data: owner3 } = await supabase.from('users').insert({ name: 'Amit Patel', email: 'amit@stayeg.in', phone: '+919876543212', role: 'OWNER', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Amit' }).select().single();

    const { data: tenant1 } = await supabase.from('users').insert({ name: 'Vikram Singh', email: 'vikram@email.com', phone: '+919123456789', role: 'TENANT', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram' }).select().single();
    const { data: tenant2 } = await supabase.from('users').insert({ name: 'Ananya Reddy', email: 'ananya@email.com', phone: '+919123456790', role: 'TENANT', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ananya' }).select().single();
    const { data: tenant3 } = await supabase.from('users').insert({ name: 'Rohan Mehta', email: 'rohan@email.com', phone: '+919123456791', role: 'TENANT', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rohan' }).select().single();
    const { data: tenant4 } = await supabase.from('users').insert({ name: 'Sneha Joshi', email: 'sneha@email.com', phone: '+919123456792', role: 'TENANT', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sneha' }).select().single();
    const { data: tenant5 } = await supabase.from('users').insert({ name: 'Karthik Nair', email: 'karthik@email.com', phone: '+919123456793', role: 'TENANT', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karthik' }).select().single();
    const { data: tenant6 } = await supabase.from('users').insert({ name: 'Divya Gupta', email: 'divya@email.com', phone: '+919123456794', role: 'TENANT', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Divya' }).select().single();

    await supabase.from('users').insert({ name: 'Admin User', email: 'admin@stayeg.in', phone: '+919999999999', role: 'ADMIN', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin' });

    // Create PGs
    const { data: pg1 } = await supabase.from('pgs').insert({ name: 'Sunrise PG - Koramangala', owner_id: owner1!.id, description: 'Premium PG accommodation in the heart of Koramangala with modern amenities. Walking distance to major IT parks, restaurants, and metro station. Fully furnished rooms with 24/7 security and high-speed WiFi.', address: '123, 4th Cross, Koramangala 4th Block', city: 'Bangalore', lat: 12.9352, lng: 77.6245, gender: 'UNISEX', price: 12000, security_deposit: 24000, amenities: 'wifi,ac,food,laundry,parking,cctv,power_backup,water_heater,study_table,housekeeping', images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop', rating: 4.5, total_reviews: 128, status: 'APPROVED', is_verified: true }).select().single();
    const { data: pg2 } = await supabase.from('pgs').insert({ name: 'Green Valley PG - HSR Layout', owner_id: owner1!.id, description: 'Peaceful PG surrounded by greenery in HSR Layout. Homely food, clean rooms, and friendly atmosphere. Perfect for students and working professionals.', address: '45, 27th Main, HSR Layout Sector 2', city: 'Bangalore', lat: 12.9116, lng: 77.6389, gender: 'MALE', price: 8500, security_deposit: 17000, amenities: 'wifi,food,laundry,cctv,power_backup,study_table,common_room,tv', images: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', rating: 4.2, total_reviews: 89, status: 'APPROVED', is_verified: true }).select().single();
    const { data: pg3 } = await supabase.from('pgs').insert({ name: 'Ladies Paradise PG - Indiranagar', owner_id: owner2!.id, description: 'Safe and secure PG exclusively for women in Indiranagar. Close to metro and shopping areas. Includes meals, laundry, and 24/7 CCTV surveillance.', address: '78, 100 Feet Road, Indiranagar', city: 'Bangalore', lat: 12.9784, lng: 77.6408, gender: 'FEMALE', price: 14000, security_deposit: 28000, amenities: 'wifi,ac,food,laundry,cctv,power_backup,water_heater,wardrobe,housekeeping,gym', images: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop', rating: 4.8, total_reviews: 156, status: 'APPROVED', is_verified: true }).select().single();
    const { data: pg4 } = await supabase.from('pgs').insert({ name: 'Tech Hub PG - Whitefield', owner_id: owner2!.id, description: 'Modern co-living space near ITPL Whitefield. Ideal for tech professionals. Fully equipped with gym, common room, and high-speed internet.', address: '56, ITPL Main Road, Whitefield', city: 'Bangalore', lat: 12.9698, lng: 77.7500, gender: 'UNISEX', price: 11000, security_deposit: 22000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,common_room,tv,refrigerator', images: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop', rating: 4.3, total_reviews: 95, status: 'APPROVED', is_verified: true }).select().single();
    const { data: pg5 } = await supabase.from('pgs').insert({ name: 'Budget Bliss PG - Marathahalli', owner_id: owner3!.id, description: 'Affordable PG with all basic amenities. Located on the Marathahalli-Sarjapur road with excellent connectivity to IT hubs.', address: '23, Marathahalli Main Road', city: 'Bangalore', lat: 12.9591, lng: 77.6974, gender: 'MALE', price: 6500, security_deposit: 13000, amenities: 'wifi,food,laundry,power_backup,study_table', images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop', rating: 3.9, total_reviews: 67, status: 'APPROVED', is_verified: true }).select().single();
    const { data: pg6 } = await supabase.from('pgs').insert({ name: 'Royal Residency PG - Electronic City', owner_id: owner3!.id, description: 'Premium gated PG community in Electronic City. Resort-like amenities with swimming pool, gym, and landscaped gardens.', address: '89, Phase 1, Electronic City', city: 'Bangalore', lat: 12.8440, lng: 77.6730, gender: 'UNISEX', price: 15000, security_deposit: 30000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,water_heater,study_table,wardrobe,housekeeping,common_room,tv,refrigerator', images: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop', rating: 4.7, total_reviews: 210, status: 'APPROVED', is_verified: true }).select().single();
    const { data: pg7 } = await supabase.from('pgs').insert({ name: 'Cozy Corner PG - BTM Layout', owner_id: owner1!.id, description: 'A cozy and comfortable PG in BTM Layout for students and young professionals. Home-cooked food available.', address: '12, 2nd Stage, BTM Layout', city: 'Bangalore', lat: 12.9166, lng: 77.6101, gender: 'FEMALE', price: 9500, security_deposit: 19000, amenities: 'wifi,food,laundry,cctv,power_backup,water_heater,wardrobe,housekeeping', images: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop', rating: 4.1, total_reviews: 78, status: 'PENDING', is_verified: false }).select().single();
    const { data: pg8 } = await supabase.from('pgs').insert({ name: 'Urban Nest PG - JP Nagar', owner_id: owner2!.id, description: 'Modern PG in the vibrant JP Nagar area. Great food, clean rooms, and amazing community vibe.', address: '34, 4th Phase, JP Nagar', city: 'Bangalore', lat: 12.9100, lng: 77.5850, gender: 'UNISEX', price: 10500, security_deposit: 21000, amenities: 'wifi,food,laundry,parking,cctv,power_backup,study_table,common_room,tv,housekeeping', images: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop', rating: 4.4, total_reviews: 112, status: 'PENDING', is_verified: false }).select().single();

    // Helper to create rooms
    const createRoom = async (pgId: string, roomCode: string, roomType: string, floor: number, hasAC: boolean, hasAttachedBath: boolean) => {
      const { data } = await supabase.from('rooms').insert({ pg_id: pgId, room_code: roomCode, room_type: roomType, floor, has_ac: hasAC, has_attached_bath: hasAttachedBath }).select().single();
      return data!;
    };

    const createBed = async (roomId: string, bedNumber: number, status: string) => {
      await supabase.from('beds').insert({ room_id: roomId, bed_number: bedNumber, status, price: null });
    };

    // Create Rooms for PG1
    const rooms1 = [
      await createRoom(pg1!.id, 'A101', 'DOUBLE', 1, true, true),
      await createRoom(pg1!.id, 'A102', 'DOUBLE', 1, true, true),
      await createRoom(pg1!.id, 'A201', 'TRIPLE', 2, false, false),
      await createRoom(pg1!.id, 'A202', 'SINGLE', 2, true, true),
      await createRoom(pg1!.id, 'A301', 'DORMITORY', 3, false, false),
    ];
    const rooms2 = [
      await createRoom(pg2!.id, 'B101', 'TRIPLE', 1, false, false),
      await createRoom(pg2!.id, 'B102', 'DOUBLE', 1, false, true),
      await createRoom(pg2!.id, 'B201', 'DOUBLE', 2, true, true),
    ];
    const rooms3 = [
      await createRoom(pg3!.id, 'C101', 'DOUBLE', 1, true, true),
      await createRoom(pg3!.id, 'C102', 'SINGLE', 1, true, true),
      await createRoom(pg3!.id, 'C201', 'DOUBLE', 2, true, true),
      await createRoom(pg3!.id, 'C202', 'DOUBLE', 2, false, false),
    ];
    const rooms4 = [
      await createRoom(pg4!.id, 'D101', 'DOUBLE', 1, true, true),
      await createRoom(pg4!.id, 'D102', 'TRIPLE', 1, false, false),
      await createRoom(pg4!.id, 'D201', 'DOUBLE', 2, true, true),
    ];
    const rooms5 = [
      await createRoom(pg5!.id, 'E101', 'DORMITORY', 1, false, false),
      await createRoom(pg5!.id, 'E102', 'TRIPLE', 1, false, false),
    ];
    const rooms6 = [
      await createRoom(pg6!.id, 'F101', 'SINGLE', 1, true, true),
      await createRoom(pg6!.id, 'F102', 'SINGLE', 1, true, true),
      await createRoom(pg6!.id, 'F201', 'DOUBLE', 2, true, true),
      await createRoom(pg6!.id, 'F202', 'DOUBLE', 2, true, true),
      await createRoom(pg6!.id, 'F301', 'DORMITORY', 3, false, false),
    ];
    const rooms7 = [
      await createRoom(pg7!.id, 'G101', 'DOUBLE', 1, false, true),
      await createRoom(pg7!.id, 'G201', 'DOUBLE', 2, false, true),
    ];
    const rooms8 = [
      await createRoom(pg8!.id, 'H101', 'TRIPLE', 1, false, false),
      await createRoom(pg8!.id, 'H102', 'DOUBLE', 1, true, true),
    ];

    // Create Beds for all rooms
    const allRooms = [...rooms1, ...rooms2, ...rooms3, ...rooms4, ...rooms5, ...rooms6, ...rooms7, ...rooms8];
    for (const room of allRooms) {
      const bedCount = room.room_type === 'SINGLE' ? 1 : room.room_type === 'DOUBLE' ? 2 : room.room_type === 'TRIPLE' ? 3 : 6;
      for (let i = 1; i <= bedCount; i++) {
        await createBed(room.id, i, Math.random() > 0.35 ? 'OCCUPIED' : 'AVAILABLE');
      }
    }

    // Create some Bookings
    const { data: allBeds } = await supabase.from('beds').select('id, room_id, status').eq('status', 'OCCUPIED').limit(6);
    const now = new Date();
    const tenants = [tenant1, tenant2, tenant3, tenant4, tenant5, tenant6];
    const bookings: any[] = [];
    const pgs = [pg1, pg2, pg3, pg4, pg5, pg6];

    for (let i = 0; i < Math.min((allBeds || []).length, 6); i++) {
      const bed = allBeds![i];
      const { data: room } = await supabase.from('rooms').select('pg_id').eq('id', bed.room_id).single();
      if (!room) continue;
      const pg = pgs.find(p => p!.id === room.pg_id);
      if (!pg) continue;
      const tenant = tenants[i];
      if (!tenant) continue;

      const { data: booking } = await supabase.from('bookings').insert({
        user_id: tenant.id,
        pg_id: pg.id,
        bed_id: bed.id,
        check_in_date: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        advance_paid: pg.price,
      }).select().single();
      bookings.push({ booking, pg, tenant });
    }

    // Create Payments
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (const { booking, pg, tenant } of bookings) {
      for (let m = 0; m < months.length; m++) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - (months.length - 1 - m), 1);
        const isPaid = m < months.length - 1 || Math.random() > 0.3;
        await supabase.from('payments').insert({
          user_id: tenant.id,
          pg_id: pg.id,
          booking_id: booking.id,
          amount: pg.price,
          type: 'RENT',
          status: isPaid ? 'COMPLETED' : 'PENDING',
          due_date: dueDate.toISOString(),
          paid_date: isPaid ? new Date(dueDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : null,
          method: isPaid ? ['UPI', 'CARD', 'NET_BANKING', 'CASH'][Math.floor(Math.random() * 4)] : null,
        });
      }
    }

    // Create Complaints
    const complaintsData = [
      { user_id: tenant1!.id, pg_id: pg1!.id, title: 'WiFi not working in Room A101', category: 'MAINTENANCE', priority: 'HIGH', status: 'IN_PROGRESS' },
      { user_id: tenant2!.id, pg_id: pg3!.id, title: 'Water heater not functioning', category: 'MAINTENANCE', priority: 'MEDIUM', status: 'OPEN' },
      { user_id: tenant3!.id, pg_id: pg2!.id, title: 'Excessive noise from construction nearby', category: 'NOISE', priority: 'LOW', status: 'OPEN' },
      { user_id: tenant4!.id, pg_id: pg3!.id, title: 'Common bathroom cleanliness issue', category: 'CLEANLINESS', priority: 'MEDIUM', status: 'RESOLVED' },
      { user_id: tenant5!.id, pg_id: pg4!.id, title: 'AC remote missing', category: 'MAINTENANCE', priority: 'LOW', status: 'RESOLVED' },
      { user_id: tenant6!.id, pg_id: pg3!.id, title: 'Security gate malfunction', category: 'SAFETY', priority: 'URGENT', status: 'IN_PROGRESS' },
    ];
    for (const c of complaintsData) {
      await supabase.from('complaints').insert({ ...c, description: `${c.title} - needs immediate attention. Reported on ${new Date().toLocaleDateString()}.` });
    }

    // Create Vendors
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
      await supabase.from('vendors').insert({ ...v, city: 'Bangalore', rating: 3.5 + Math.random() * 1.5 });
    }

    // Create Workers
    const workersData = [
      { name: 'Ramesh', role: 'SECURITY', phone: '+919876550001', pg_id: pg1!.id, shift: 'NIGHT' },
      { name: 'Geeta', role: 'CLEANER', phone: '+919876550002', pg_id: pg1!.id, shift: 'MORNING' },
      { name: 'Suresh', role: 'COOK', phone: '+919876550003', pg_id: pg2!.id, shift: 'MORNING' },
      { name: 'Lakshmi', role: 'CLEANER', phone: '+919876550004', pg_id: pg3!.id, shift: 'EVENING' },
      { name: 'Mohan', role: 'MANAGER', phone: '+919876550005', pg_id: pg1!.id, shift: 'MORNING' },
      { name: 'Kavitha', role: 'COOK', phone: '+919876550006', pg_id: pg3!.id, shift: 'MORNING' },
      { name: 'Arjun', role: 'MAINTENANCE', phone: '+919876550007', pg_id: pg4!.id, shift: 'MORNING' },
      { name: 'Padma', role: 'SECURITY', phone: '+919876550008', pg_id: pg3!.id, shift: 'MORNING' },
    ];
    for (const w of workersData) {
      await supabase.from('workers').insert(w);
    }

    return NextResponse.json({ message: 'Database seeded successfully!', stats: { users: 10, pgs: 8, bookings: bookings.length } });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
  }
}
