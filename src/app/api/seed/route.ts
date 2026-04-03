import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear existing data
    await db.payment.deleteMany();
    await db.booking.deleteMany();
    await db.complaint.deleteMany();
    await db.bed.deleteMany();
    await db.room.deleteMany();
    await db.worker.deleteMany();
    await db.vendor.deleteMany();
    await db.pG.deleteMany();
    await db.user.deleteMany();

    // Create Users
    const owner1 = await db.user.create({ data: { name: 'Rajesh Kumar', email: 'rajesh@stayease.in', phone: '+919876543210', role: 'OWNER', gender: 'MALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rajesh' } });
    const owner2 = await db.user.create({ data: { name: 'Priya Sharma', email: 'priya@stayease.in', phone: '+919876543211', role: 'OWNER', gender: 'FEMALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya' } });
    const owner3 = await db.user.create({ data: { name: 'Amit Patel', email: 'amit@stayease.in', phone: '+919876543212', role: 'OWNER', gender: 'MALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Amit' } });
    
    const tenant1 = await db.user.create({ data: { name: 'Vikram Singh', email: 'vikram@email.com', phone: '+919123456789', role: 'TENANT', gender: 'MALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram' } });
    const tenant2 = await db.user.create({ data: { name: 'Ananya Reddy', email: 'ananya@email.com', phone: '+919123456790', role: 'TENANT', gender: 'FEMALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ananya' } });
    const tenant3 = await db.user.create({ data: { name: 'Rohan Mehta', email: 'rohan@email.com', phone: '+919123456791', role: 'TENANT', gender: 'MALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rohan' } });
    const tenant4 = await db.user.create({ data: { name: 'Sneha Joshi', email: 'sneha@email.com', phone: '+919123456792', role: 'TENANT', gender: 'FEMALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sneha' } });
    const tenant5 = await db.user.create({ data: { name: 'Karthik Nair', email: 'karthik@email.com', phone: '+919123456793', role: 'TENANT', gender: 'MALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karthik' } });
    const tenant6 = await db.user.create({ data: { name: 'Divya Gupta', email: 'divya@email.com', phone: '+919123456794', role: 'TENANT', gender: 'FEMALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Divya' } });
    
    const admin = await db.user.create({ data: { name: 'Admin User', email: 'admin@stayease.in', phone: '+919999999999', role: 'ADMIN', gender: 'MALE', isVerified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin' } });

    // Create PGs
    const pg1 = await db.pG.create({ data: { name: 'Sunrise PG - Koramangala', ownerId: owner1.id, description: 'Premium PG accommodation in the heart of Koramangala with modern amenities. Walking distance to major IT parks, restaurants, and metro station. Fully furnished rooms with 24/7 security and high-speed WiFi.', address: '123, 4th Cross, Koramangala 4th Block', city: 'Bangalore', lat: 12.9352, lng: 77.6245, gender: 'UNISEX', price: 12000, securityDeposit: 24000, amenities: 'wifi,ac,food,laundry,parking,cctv,power_backup,water_heater,study_table,housekeeping', images: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop', rating: 4.5, totalReviews: 128, status: 'APPROVED', isVerified: true } });
    const pg2 = await db.pG.create({ data: { name: 'Green Valley PG - HSR Layout', ownerId: owner1.id, description: 'Peaceful PG surrounded by greenery in HSR Layout. Homely food, clean rooms, and friendly atmosphere. Perfect for students and working professionals.', address: '45, 27th Main, HSR Layout Sector 2', city: 'Bangalore', lat: 12.9116, lng: 77.6389, gender: 'MALE', price: 8500, securityDeposit: 17000, amenities: 'wifi,food,laundry,cctv,power_backup,study_table,common_room,tv', images: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop', rating: 4.2, totalReviews: 89, status: 'APPROVED', isVerified: true } });
    const pg3 = await db.pG.create({ data: { name: 'Ladies Paradise PG - Indiranagar', ownerId: owner2.id, description: 'Safe and secure PG exclusively for women in Indiranagar. Close to metro and shopping areas. Includes meals, laundry, and 24/7 CCTV surveillance.', address: '78, 100 Feet Road, Indiranagar', city: 'Bangalore', lat: 12.9784, lng: 77.6408, gender: 'FEMALE', price: 14000, securityDeposit: 28000, amenities: 'wifi,ac,food,laundry,cctv,power_backup,water_heater,wardrobe,housekeeping,gym', images: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop', rating: 4.8, totalReviews: 156, status: 'APPROVED', isVerified: true } });
    const pg4 = await db.pG.create({ data: { name: 'Tech Hub PG - Whitefield', ownerId: owner2.id, description: 'Modern co-living space near ITPL Whitefield. Ideal for tech professionals. Fully equipped with gym, common room, and high-speed internet.', address: '56, ITPL Main Road, Whitefield', city: 'Bangalore', lat: 12.9698, lng: 77.7500, gender: 'UNISEX', price: 11000, securityDeposit: 22000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,common_room,tv,refrigerator', images: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop', rating: 4.3, totalReviews: 95, status: 'APPROVED', isVerified: true } });
    const pg5 = await db.pG.create({ data: { name: 'Budget Bliss PG - Marathahalli', ownerId: owner3.id, description: 'Affordable PG with all basic amenities. Located on the Marathahalli-Sarjapur road with excellent connectivity to IT hubs.', address: '23, Marathahalli Main Road', city: 'Bangalore', lat: 12.9591, lng: 77.6974, gender: 'MALE', price: 6500, securityDeposit: 13000, amenities: 'wifi,food,laundry,power_backup,study_table', images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop', rating: 3.9, totalReviews: 67, status: 'APPROVED', isVerified: true } });
    const pg6 = await db.pG.create({ data: { name: 'Royal Residency PG - Electronic City', ownerId: owner3.id, description: 'Premium gated PG community in Electronic City. Resort-like amenities with swimming pool, gym, and landscaped gardens.', address: '89, Phase 1, Electronic City', city: 'Bangalore', lat: 12.8440, lng: 77.6730, gender: 'UNISEX', price: 15000, securityDeposit: 30000, amenities: 'wifi,ac,food,laundry,parking,gym,cctv,power_backup,water_heater,study_table,wardrobe,housekeeping,common_room,tv,refrigerator', images: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop', rating: 4.7, totalReviews: 210, status: 'APPROVED', isVerified: true } });
    const pg7 = await db.pG.create({ data: { name: 'Cozy Corner PG - BTM Layout', ownerId: owner1.id, description: 'A cozy and comfortable PG in BTM Layout for students and young professionals. Home-cooked food available.', address: '12, 2nd Stage, BTM Layout', city: 'Bangalore', lat: 12.9166, lng: 77.6101, gender: 'FEMALE', price: 9500, securityDeposit: 19000, amenities: 'wifi,food,laundry,cctv,power_backup,water_heater,wardrobe,housekeeping', images: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop', rating: 4.1, totalReviews: 78, status: 'PENDING', isVerified: false } });
    const pg8 = await db.pG.create({ data: { name: 'Urban Nest PG - JP Nagar', ownerId: owner2.id, description: 'Modern PG in the vibrant JP Nagar area. Great food, clean rooms, and amazing community vibe.', address: '34, 4th Phase, JP Nagar', city: 'Bangalore', lat: 12.9100, lng: 77.5850, gender: 'UNISEX', price: 10500, securityDeposit: 21000, amenities: 'wifi,food,laundry,parking,cctv,power_backup,study_table,common_room,tv,housekeeping', images: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=400&fit=crop,https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop', rating: 4.4, totalReviews: 112, status: 'PENDING', isVerified: false } });

    // Create Rooms and Beds
    const rooms1 = [
      await db.room.create({ data: { pgId: pg1.id, roomCode: 'A101', roomType: 'DOUBLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg1.id, roomCode: 'A102', roomType: 'DOUBLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg1.id, roomCode: 'A201', roomType: 'TRIPLE', floor: 2, hasAC: false, hasAttachedBath: false } }),
      await db.room.create({ data: { pgId: pg1.id, roomCode: 'A202', roomType: 'SINGLE', floor: 2, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg1.id, roomCode: 'A301', roomType: 'DORMITORY', floor: 3, hasAC: false, hasAttachedBath: false } }),
    ];
    const rooms2 = [
      await db.room.create({ data: { pgId: pg2.id, roomCode: 'B101', roomType: 'TRIPLE', floor: 1, hasAC: false, hasAttachedBath: false } }),
      await db.room.create({ data: { pgId: pg2.id, roomCode: 'B102', roomType: 'DOUBLE', floor: 1, hasAC: false, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg2.id, roomCode: 'B201', roomType: 'DOUBLE', floor: 2, hasAC: true, hasAttachedBath: true } }),
    ];
    const rooms3 = [
      await db.room.create({ data: { pgId: pg3.id, roomCode: 'C101', roomType: 'DOUBLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg3.id, roomCode: 'C102', roomType: 'SINGLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg3.id, roomCode: 'C201', roomType: 'DOUBLE', floor: 2, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg3.id, roomCode: 'C202', roomType: 'DOUBLE', floor: 2, hasAC: false, hasAttachedBath: false } }),
    ];
    const rooms4 = [
      await db.room.create({ data: { pgId: pg4.id, roomCode: 'D101', roomType: 'DOUBLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg4.id, roomCode: 'D102', roomType: 'TRIPLE', floor: 1, hasAC: false, hasAttachedBath: false } }),
      await db.room.create({ data: { pgId: pg4.id, roomCode: 'D201', roomType: 'DOUBLE', floor: 2, hasAC: true, hasAttachedBath: true } }),
    ];
    const rooms5 = [
      await db.room.create({ data: { pgId: pg5.id, roomCode: 'E101', roomType: 'DORMITORY', floor: 1, hasAC: false, hasAttachedBath: false } }),
      await db.room.create({ data: { pgId: pg5.id, roomCode: 'E102', roomType: 'TRIPLE', floor: 1, hasAC: false, hasAttachedBath: false } }),
    ];
    const rooms6 = [
      await db.room.create({ data: { pgId: pg6.id, roomCode: 'F101', roomType: 'SINGLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg6.id, roomCode: 'F102', roomType: 'SINGLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg6.id, roomCode: 'F201', roomType: 'DOUBLE', floor: 2, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg6.id, roomCode: 'F202', roomType: 'DOUBLE', floor: 2, hasAC: true, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg6.id, roomCode: 'F301', roomType: 'DORMITORY', floor: 3, hasAC: false, hasAttachedBath: false } }),
    ];
    const rooms7 = [
      await db.room.create({ data: { pgId: pg7.id, roomCode: 'G101', roomType: 'DOUBLE', floor: 1, hasAC: false, hasAttachedBath: true } }),
      await db.room.create({ data: { pgId: pg7.id, roomCode: 'G201', roomType: 'DOUBLE', floor: 2, hasAC: false, hasAttachedBath: true } }),
    ];
    const rooms8 = [
      await db.room.create({ data: { pgId: pg8.id, roomCode: 'H101', roomType: 'TRIPLE', floor: 1, hasAC: false, hasAttachedBath: false } }),
      await db.room.create({ data: { pgId: pg8.id, roomCode: 'H102', roomType: 'DOUBLE', floor: 1, hasAC: true, hasAttachedBath: true } }),
    ];

    // Create Beds for all rooms
    for (const room of [...rooms1, ...rooms2, ...rooms3, ...rooms4, ...rooms5, ...rooms6, ...rooms7, ...rooms8]) {
      const bedCount = room.roomType === 'SINGLE' ? 1 : room.roomType === 'DOUBLE' ? 2 : room.roomType === 'TRIPLE' ? 3 : 6;
      for (let i = 1; i <= bedCount; i++) {
        await db.bed.create({
          data: {
            roomId: room.id,
            bedNumber: i,
            status: Math.random() > 0.35 ? 'OCCUPIED' : 'AVAILABLE',
            price: undefined,
          }
        });
      }
    }

    // Create some Bookings
    const allBeds = await db.bed.findMany({ where: { status: 'OCCUPIED' }, take: 6 });
    const now = new Date();
    const bookings: { booking: any; pg: any; tenant: any }[] = [];
    for (let i = 0; i < Math.min(allBeds.length, 6); i++) {
      const bed = allBeds[i];
      const room = await db.room.findUnique({ where: { id: bed.roomId } });
      if (!room) continue;
      const pg = await db.pG.findUnique({ where: { id: room.pgId } });
      if (!pg) continue;
      const tenant = [tenant1, tenant2, tenant3, tenant4, tenant5, tenant6][i];
      if (!tenant) continue;

      const booking = await db.booking.create({
        data: {
          userId: tenant.id,
          pgId: pg.id,
          bedId: bed.id,
          checkInDate: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          advancePaid: pg.price,
        }
      });
      bookings.push({ booking, pg, tenant });
    }

    // Create Payments
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (const { booking, pg, tenant } of bookings) {
      for (let m = 0; m < months.length; m++) {
        const dueDate = new Date(now.getFullYear(), now.getMonth() - (months.length - 1 - m), 1);
        const isPaid = m < months.length - 1 || Math.random() > 0.3;
        await db.payment.create({
          data: {
            userId: tenant.id,
            pgId: pg.id,
            bookingId: booking.id,
            amount: pg.price,
            type: 'RENT',
            status: isPaid ? 'COMPLETED' : 'PENDING',
            dueDate,
            paidDate: isPaid ? new Date(dueDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
            method: isPaid ? ['UPI', 'CARD', 'NET_BANKING', 'CASH'][Math.floor(Math.random() * 4)] : null,
          }
        });
      }
    }

    // Create Complaints
    const complaintsData = [
      { userId: tenant1.id, pgId: pg1.id, title: 'WiFi not working in Room A101', category: 'MAINTENANCE', priority: 'HIGH', status: 'IN_PROGRESS' },
      { userId: tenant2.id, pgId: pg3.id, title: 'Water heater not functioning', category: 'MAINTENANCE', priority: 'MEDIUM', status: 'OPEN' },
      { userId: tenant3.id, pgId: pg2.id, title: 'Excessive noise from construction nearby', category: 'NOISE', priority: 'LOW', status: 'OPEN' },
      { userId: tenant4.id, pgId: pg3.id, title: 'Common bathroom cleanliness issue', category: 'CLEANLINESS', priority: 'MEDIUM', status: 'RESOLVED' },
      { userId: tenant5.id, pgId: pg4.id, title: 'AC remote missing', category: 'MAINTENANCE', priority: 'LOW', status: 'RESOLVED' },
      { userId: tenant6.id, pgId: pg3.id, title: 'Security gate malfunction', category: 'SAFETY', priority: 'URGENT', status: 'IN_PROGRESS' },
    ];
    for (const c of complaintsData) {
      await db.complaint.create({ data: { ...c, description: `${c.title} - needs immediate attention. Reported on ${new Date().toLocaleDateString()}.` } });
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
      await db.vendor.create({ data: { ...v, city: 'Bangalore', rating: 3.5 + Math.random() * 1.5 } });
    }

    // Create Workers
    const workersData = [
      { name: 'Ramesh', role: 'SECURITY', phone: '+919876550001', pgId: pg1.id, shift: 'NIGHT' },
      { name: 'Geeta', role: 'CLEANER', phone: '+919876550002', pgId: pg1.id, shift: 'MORNING' },
      { name: 'Suresh', role: 'COOK', phone: '+919876550003', pgId: pg2.id, shift: 'MORNING' },
      { name: 'Lakshmi', role: 'CLEANER', phone: '+919876550004', pgId: pg3.id, shift: 'EVENING' },
      { name: 'Mohan', role: 'MANAGER', phone: '+919876550005', pgId: pg1.id, shift: 'MORNING' },
      { name: 'Kavitha', role: 'COOK', phone: '+919876550006', pgId: pg3.id, shift: 'MORNING' },
      { name: 'Arjun', role: 'MAINTENANCE', phone: '+919876550007', pgId: pg4.id, shift: 'MORNING' },
      { name: 'Padma', role: 'SECURITY', phone: '+919876550008', pgId: pg3.id, shift: 'MORNING' },
    ];
    for (const w of workersData) {
      await db.worker.create({ data: w });
    }

    return NextResponse.json({ message: 'Database seeded successfully!', stats: { users: 10, pgs: 8, bookings: bookings.length } });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
