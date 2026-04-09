/**
 * StayEG Supabase Seed Script
 * ===========================
 * Inserts seed data into all 9 Supabase tables in dependency order.
 * 
 * PREREQUISITE: Run supabase-schema.sql in Supabase Dashboard → SQL Editor first!
 * 
 * Usage: node scripts/seed-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sbwmecxkbfijanwwuvvt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CAN3p3VfoAZw1LsZ2g2u4A_WEOpZu0f';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Color helpers for console output
const green = (msg) => `\x1b[32m${msg}\x1b[0m`;
const red = (msg) => `\x1b[31m${msg}\x1b[0m`;
const yellow = (msg) => `\x1b[33m${msg}\x1b[0m`;
const cyan = (msg) => `\x1b[36m${msg}\x1b[0m`;
const bold = (msg) => `\x1b[1m${msg}\x1b[0m`;

// =============================================
// SEED DATA
// =============================================

const users = [
  { id: 'user-owner1', name: 'Rajesh Kumar', email: 'rajesh@stayeg.in', phone: '+919876543210', role: 'OWNER', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rajesh' },
  { id: 'user-owner2', name: 'Priya Sharma', email: 'priya@stayeg.in', phone: '+919876543211', role: 'OWNER', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya' },
  { id: 'user-owner3', name: 'Amit Patel', email: 'amit@stayeg.in', phone: '+919876543212', role: 'OWNER', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Amit' },
  { id: 'user-tenant1', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+919123456789', role: 'TENANT', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vikram' },
  { id: 'user-tenant2', name: 'Ananya Reddy', email: 'ananya@email.com', phone: '+919123456790', role: 'TENANT', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ananya' },
  { id: 'user-tenant3', name: 'Rohan Mehta', email: 'rohan@email.com', phone: '+919123456791', role: 'TENANT', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rohan' },
  { id: 'user-tenant4', name: 'Sneha Joshi', email: 'sneha@email.com', phone: '+919123456792', role: 'TENANT', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sneha' },
  { id: 'user-tenant5', name: 'Karthik Nair', email: 'karthik@email.com', phone: '+919123456793', role: 'TENANT', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karthik' },
  { id: 'user-tenant6', name: 'Divya Gupta', email: 'divya@email.com', phone: '+919123456794', role: 'TENANT', gender: 'FEMALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Divya' },
  { id: 'user-admin', name: 'Admin User', email: 'admin@stayeg.in', phone: '+919999999999', role: 'ADMIN', gender: 'MALE', is_verified: true, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Admin' },
];

const pgs = [
  {
    id: 'pg-koramangala-1',
    name: 'Sai Residency',
    owner_id: 'user-owner1',
    description: 'A premium PG accommodation in the heart of Koramangala with modern amenities, homely food, and excellent connectivity to IT parks.',
    address: '42, 4th Cross, Koramangala 4th Block',
    city: 'Bangalore',
    lat: 12.9352,
    lng: 77.6245,
    gender: 'UNISEX',
    price: 12000,
    security_deposit: 24000,
    amenities: 'wifi,ac,food,laundry,parking,power_backup,water_heater,cctv,housekeeping',
    images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800,https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800,https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    rating: 4.5,
    total_reviews: 128,
    status: 'APPROVED',
    is_verified: true,
  },
  {
    id: 'pg-hsr-1',
    name: 'Comfort Stay PG',
    owner_id: 'user-owner1',
    description: 'Affordable and clean PG in HSR Layout. Located near HSR BDA complex, close to restaurants and shopping. Perfect for working professionals.',
    address: '18, 27th Main, Sector 2, HSR Layout',
    city: 'Bangalore',
    lat: 12.9116,
    lng: 77.6474,
    gender: 'MALE',
    price: 8500,
    security_deposit: 17000,
    amenities: 'wifi,food,laundry,power_backup,water_heater,housekeeping',
    images: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800,https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800',
    rating: 4.2,
    total_reviews: 89,
    status: 'APPROVED',
    is_verified: true,
  },
  {
    id: 'pg-indiranagar-1',
    name: 'Green Valley Women\'s PG',
    owner_id: 'user-owner2',
    description: 'A safe and comfortable PG exclusively for women in Indiranagar. Features a beautiful garden, security cameras, and nutritious home-cooked meals.',
    address: '100 Feet Road, Indiranagar',
    city: 'Bangalore',
    lat: 12.9784,
    lng: 77.6408,
    gender: 'FEMALE',
    price: 14000,
    security_deposit: 28000,
    amenities: 'wifi,ac,food,laundry,parking,power_backup,water_heater,cctv,housekeeping,gym,ro_water',
    images: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800,https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    rating: 4.8,
    total_reviews: 156,
    status: 'APPROVED',
    is_verified: true,
  },
  {
    id: 'pg-marathahalli-1',
    name: 'Tech Hub PG',
    owner_id: 'user-owner2',
    description: 'Modern PG located near Marathahalli tech corridor. Ideal for IT professionals with high-speed WiFi, co-working space, and 24/7 food.',
    address: 'ITPL Main Road, Marathahalli',
    city: 'Bangalore',
    lat: 12.9591,
    lng: 77.6974,
    gender: 'MALE',
    price: 9500,
    security_deposit: 19000,
    amenities: 'wifi,food,laundry,power_backup,water_heater,cctv,housekeeping,co_working',
    images: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800,https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    rating: 4.0,
    total_reviews: 67,
    status: 'APPROVED',
    is_verified: true,
  },
  {
    id: 'pg-whitefield-1',
    name: 'Royal Stay PG',
    owner_id: 'user-owner3',
    description: 'Premium PG accommodation in Whitefield, close to ITPL and major tech parks. Features spacious rooms, daily housekeeping, and a common recreation area.',
    address: 'ITPL Road, Whitefield',
    city: 'Bangalore',
    lat: 12.9698,
    lng: 77.7500,
    gender: 'UNISEX',
    price: 11000,
    security_deposit: 22000,
    amenities: 'wifi,ac,food,laundry,parking,power_backup,water_heater,cctv,housekeeping,recreation',
    images: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800,https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    rating: 4.3,
    total_reviews: 95,
    status: 'PENDING',
    is_verified: false,
  },
];

const rooms = [
  // Sai Residency rooms (pg-koramangala-1)
  { id: 'room-kora-101', pg_id: 'pg-koramangala-1', room_code: 'A-101', room_type: 'SINGLE', floor: 1, has_ac: true, has_attached_bath: true },
  { id: 'room-kora-102', pg_id: 'pg-koramangala-1', room_code: 'A-102', room_type: 'DOUBLE', floor: 1, has_ac: true, has_attached_bath: true },
  { id: 'room-kora-201', pg_id: 'pg-koramangala-1', room_code: 'B-201', room_type: 'TRIPLE', floor: 2, has_ac: false, has_attached_bath: false },
  { id: 'room-kora-202', pg_id: 'pg-koramangala-1', room_code: 'B-202', room_type: 'DORMITORY', floor: 2, has_ac: true, has_attached_bath: false },

  // Comfort Stay PG rooms (pg-hsr-1)
  { id: 'room-hsr-101', pg_id: 'pg-hsr-1', room_code: 'C-101', room_type: 'DOUBLE', floor: 1, has_ac: false, has_attached_bath: false },
  { id: 'room-hsr-102', pg_id: 'pg-hsr-1', room_code: 'C-102', room_type: 'TRIPLE', floor: 1, has_ac: false, has_attached_bath: false },
  { id: 'room-hsr-201', pg_id: 'pg-hsr-1', room_code: 'D-201', room_type: 'DOUBLE', floor: 2, has_ac: true, has_attached_bath: true },

  // Green Valley Women's PG rooms (pg-indiranagar-1)
  { id: 'room-ind-101', pg_id: 'pg-indiranagar-1', room_code: 'E-101', room_type: 'SINGLE', floor: 1, has_ac: true, has_attached_bath: true },
  { id: 'room-ind-102', pg_id: 'pg-indiranagar-1', room_code: 'E-102', room_type: 'SINGLE', floor: 1, has_ac: true, has_attached_bath: true },
  { id: 'room-ind-201', pg_id: 'pg-indiranagar-1', room_code: 'F-201', room_type: 'DOUBLE', floor: 2, has_ac: true, has_attached_bath: true },
  { id: 'room-ind-301', pg_id: 'pg-indiranagar-1', room_code: 'G-301', room_type: 'DOUBLE', floor: 3, has_ac: false, has_attached_bath: false },

  // Tech Hub PG rooms (pg-marathahalli-1)
  { id: 'room-mar-101', pg_id: 'pg-marathahalli-1', room_code: 'H-101', room_type: 'TRIPLE', floor: 1, has_ac: false, has_attached_bath: false },
  { id: 'room-mar-102', pg_id: 'pg-marathahalli-1', room_code: 'H-102', room_type: 'DOUBLE', floor: 1, has_ac: true, has_attached_bath: true },

  // Royal Stay PG rooms (pg-whitefield-1)
  { id: 'room-wf-101', pg_id: 'pg-whitefield-1', room_code: 'I-101', room_type: 'DOUBLE', floor: 1, has_ac: true, has_attached_bath: true },
  { id: 'room-wf-102', pg_id: 'pg-whitefield-1', room_code: 'I-102', room_type: 'TRIPLE', floor: 1, has_ac: false, has_attached_bath: false },
  { id: 'room-wf-201', pg_id: 'pg-whitefield-1', room_code: 'J-201', room_type: 'SINGLE', floor: 2, has_ac: true, has_attached_bath: true },
];

const beds = [
  // room-kora-101 (SINGLE) - 1 bed
  { id: 'bed-kora-101-1', room_id: 'room-kora-101', bed_number: 1, status: 'OCCUPIED', price: 12000 },
  // room-kora-102 (DOUBLE) - 2 beds
  { id: 'bed-kora-102-1', room_id: 'room-kora-102', bed_number: 1, status: 'OCCUPIED', price: 12000 },
  { id: 'bed-kora-102-2', room_id: 'room-kora-102', bed_number: 2, status: 'AVAILABLE', price: 12000 },
  // room-kora-201 (TRIPLE) - 3 beds
  { id: 'bed-kora-201-1', room_id: 'room-kora-201', bed_number: 1, status: 'AVAILABLE', price: 10000 },
  { id: 'bed-kora-201-2', room_id: 'room-kora-201', bed_number: 2, status: 'OCCUPIED', price: 10000 },
  { id: 'bed-kora-201-3', room_id: 'room-kora-201', bed_number: 3, status: 'AVAILABLE', price: 10000 },
  // room-kora-202 (DORMITORY) - 6 beds
  { id: 'bed-kora-202-1', room_id: 'room-kora-202', bed_number: 1, status: 'AVAILABLE', price: 8000 },
  { id: 'bed-kora-202-2', room_id: 'room-kora-202', bed_number: 2, status: 'AVAILABLE', price: 8000 },
  { id: 'bed-kora-202-3', room_id: 'room-kora-202', bed_number: 3, status: 'MAINTENANCE', price: 8000 },
  { id: 'bed-kora-202-4', room_id: 'room-kora-202', bed_number: 4, status: 'AVAILABLE', price: 8000 },

  // room-hsr-101 (DOUBLE) - 2 beds
  { id: 'bed-hsr-101-1', room_id: 'room-hsr-101', bed_number: 1, status: 'OCCUPIED', price: 8500 },
  { id: 'bed-hsr-101-2', room_id: 'room-hsr-101', bed_number: 2, status: 'AVAILABLE', price: 8500 },
  // room-hsr-102 (TRIPLE) - 3 beds
  { id: 'bed-hsr-102-1', room_id: 'room-hsr-102', bed_number: 1, status: 'AVAILABLE', price: 8500 },
  { id: 'bed-hsr-102-2', room_id: 'room-hsr-102', bed_number: 2, status: 'AVAILABLE', price: 8500 },
  { id: 'bed-hsr-102-3', room_id: 'room-hsr-102', bed_number: 3, status: 'OCCUPIED', price: 8500 },
  // room-hsr-201 (DOUBLE) - 2 beds
  { id: 'bed-hsr-201-1', room_id: 'room-hsr-201', bed_number: 1, status: 'OCCUPIED', price: 9500 },
  { id: 'bed-hsr-201-2', room_id: 'room-hsr-201', bed_number: 2, status: 'AVAILABLE', price: 9500 },

  // room-ind-101 (SINGLE) - 1 bed
  { id: 'bed-ind-101-1', room_id: 'room-ind-101', bed_number: 1, status: 'OCCUPIED', price: 14000 },
  // room-ind-102 (SINGLE) - 1 bed
  { id: 'bed-ind-102-1', room_id: 'room-ind-102', bed_number: 1, status: 'AVAILABLE', price: 14000 },
  // room-ind-201 (DOUBLE) - 2 beds
  { id: 'bed-ind-201-1', room_id: 'room-ind-201', bed_number: 1, status: 'OCCUPIED', price: 13000 },
  { id: 'bed-ind-201-2', room_id: 'room-ind-201', bed_number: 2, status: 'OCCUPIED', price: 13000 },
  // room-ind-301 (DOUBLE) - 2 beds
  { id: 'bed-ind-301-1', room_id: 'room-ind-301', bed_number: 1, status: 'AVAILABLE', price: 11000 },
  { id: 'bed-ind-301-2', room_id: 'room-ind-301', bed_number: 2, status: 'AVAILABLE', price: 11000 },

  // room-mar-101 (TRIPLE) - 3 beds
  { id: 'bed-mar-101-1', room_id: 'room-mar-101', bed_number: 1, status: 'OCCUPIED', price: 9500 },
  { id: 'bed-mar-101-2', room_id: 'room-mar-101', bed_number: 2, status: 'AVAILABLE', price: 9500 },
  { id: 'bed-mar-101-3', room_id: 'room-mar-101', bed_number: 3, status: 'AVAILABLE', price: 9500 },
  // room-mar-102 (DOUBLE) - 2 beds
  { id: 'bed-mar-102-1', room_id: 'room-mar-102', bed_number: 1, status: 'OCCUPIED', price: 9500 },
  { id: 'bed-mar-102-2', room_id: 'room-mar-102', bed_number: 2, status: 'AVAILABLE', price: 9500 },

  // room-wf-101 (DOUBLE) - 2 beds
  { id: 'bed-wf-101-1', room_id: 'room-wf-101', bed_number: 1, status: 'AVAILABLE', price: 11000 },
  { id: 'bed-wf-101-2', room_id: 'room-wf-101', bed_number: 2, status: 'AVAILABLE', price: 11000 },
  // room-wf-102 (TRIPLE) - 3 beds
  { id: 'bed-wf-102-1', room_id: 'room-wf-102', bed_number: 1, status: 'AVAILABLE', price: 11000 },
  { id: 'bed-wf-102-2', room_id: 'room-wf-102', bed_number: 2, status: 'AVAILABLE', price: 11000 },
  { id: 'bed-wf-102-3', room_id: 'room-wf-102', bed_number: 3, status: 'AVAILABLE', price: 11000 },
  // room-wf-201 (SINGLE) - 1 bed
  { id: 'bed-wf-201-1', room_id: 'room-wf-201', bed_number: 1, status: 'AVAILABLE', price: 12000 },
];

const bookings = [
  { id: 'booking-1', user_id: 'user-tenant1', pg_id: 'pg-koramangala-1', bed_id: 'bed-kora-101-1', check_in_date: '2025-01-15T00:00:00Z', status: 'ACTIVE', advance_paid: 12000 },
  { id: 'booking-2', user_id: 'user-tenant2', pg_id: 'pg-koramangala-1', bed_id: 'bed-kora-102-1', check_in_date: '2025-01-20T00:00:00Z', status: 'ACTIVE', advance_paid: 12000 },
  { id: 'booking-3', user_id: 'user-tenant3', pg_id: 'pg-koramangala-1', bed_id: 'bed-kora-201-2', check_in_date: '2025-02-01T00:00:00Z', status: 'ACTIVE', advance_paid: 10000 },
  { id: 'booking-4', user_id: 'user-tenant4', pg_id: 'pg-indiranagar-1', bed_id: 'bed-ind-101-1', check_in_date: '2025-01-10T00:00:00Z', status: 'ACTIVE', advance_paid: 14000 },
  { id: 'booking-5', user_id: 'user-tenant5', pg_id: 'pg-indiranagar-1', bed_id: 'bed-ind-201-1', check_in_date: '2025-02-05T00:00:00Z', status: 'ACTIVE', advance_paid: 13000 },
  { id: 'booking-6', user_id: 'user-tenant6', pg_id: 'pg-indiranagar-1', bed_id: 'bed-ind-201-2', check_in_date: '2025-02-05T00:00:00Z', status: 'CONFIRMED', advance_paid: 13000 },
  { id: 'booking-7', user_id: 'user-tenant1', pg_id: 'pg-hsr-1', bed_id: 'bed-hsr-101-1', check_in_date: '2024-06-01T00:00:00Z', status: 'COMPLETED', advance_paid: 8500 },
  { id: 'booking-8', user_id: 'user-tenant3', pg_id: 'pg-hsr-1', bed_id: 'bed-hsr-102-3', check_in_date: '2025-03-01T00:00:00Z', status: 'PENDING', advance_paid: 0 },
  { id: 'booking-9', user_id: 'user-tenant5', pg_id: 'pg-marathahalli-1', bed_id: 'bed-mar-101-1', check_in_date: '2025-01-25T00:00:00Z', status: 'ACTIVE', advance_paid: 9500 },
  { id: 'booking-10', user_id: 'user-tenant6', pg_id: 'pg-marathahalli-1', bed_id: 'bed-mar-102-1', check_in_date: '2025-02-10T00:00:00Z', status: 'ACTIVE', advance_paid: 9500 },
];

const payments = [
  // Booking 1 payments
  { id: 'pay-1', user_id: 'user-tenant1', pg_id: 'pg-koramangala-1', booking_id: 'booking-1', amount: 24000, type: 'SECURITY_DEPOSIT', status: 'COMPLETED', due_date: '2025-01-14T00:00:00Z', paid_date: '2025-01-13T00:00:00Z', method: 'UPI' },
  { id: 'pay-2', user_id: 'user-tenant1', pg_id: 'pg-koramangala-1', booking_id: 'booking-1', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-02-01T00:00:00Z', paid_date: '2025-01-31T00:00:00Z', method: 'UPI' },
  { id: 'pay-3', user_id: 'user-tenant1', pg_id: 'pg-koramangala-1', booking_id: 'booking-1', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-03-01T00:00:00Z', paid_date: '2025-03-01T00:00:00Z', method: 'NET_BANKING' },
  { id: 'pay-4', user_id: 'user-tenant1', pg_id: 'pg-koramangala-1', booking_id: 'booking-1', amount: 12000, type: 'RENT', status: 'PENDING', due_date: '2025-04-01T00:00:00Z', paid_date: null, method: null },
  // Booking 4 payments
  { id: 'pay-5', user_id: 'user-tenant4', pg_id: 'pg-indiranagar-1', booking_id: 'booking-4', amount: 28000, type: 'SECURITY_DEPOSIT', status: 'COMPLETED', due_date: '2025-01-09T00:00:00Z', paid_date: '2025-01-08T00:00:00Z', method: 'CARD' },
  { id: 'pay-6', user_id: 'user-tenant4', pg_id: 'pg-indiranagar-1', booking_id: 'booking-4', amount: 14000, type: 'RENT', status: 'COMPLETED', due_date: '2025-02-01T00:00:00Z', paid_date: '2025-01-30T00:00:00Z', method: 'UPI' },
  // Booking 5 payments
  { id: 'pay-7', user_id: 'user-tenant5', pg_id: 'pg-indiranagar-1', booking_id: 'booking-5', amount: 26000, type: 'SECURITY_DEPOSIT', status: 'COMPLETED', due_date: '2025-02-04T00:00:00Z', paid_date: '2025-02-03T00:00:00Z', method: 'UPI' },
  { id: 'pay-8', user_id: 'user-tenant5', pg_id: 'pg-indiranagar-1', booking_id: 'booking-5', amount: 13000, type: 'RENT', status: 'COMPLETED', due_date: '2025-03-01T00:00:00Z', paid_date: '2025-03-01T00:00:00Z', method: 'UPI' },
  // Booking 9 payments
  { id: 'pay-9', user_id: 'user-tenant5', pg_id: 'pg-marathahalli-1', booking_id: 'booking-9', amount: 19000, type: 'SECURITY_DEPOSIT', status: 'COMPLETED', due_date: '2025-01-24T00:00:00Z', paid_date: '2025-01-23T00:00:00Z', method: 'CASH' },
  { id: 'pay-10', user_id: 'user-tenant5', pg_id: 'pg-marathahalli-1', booking_id: 'booking-9', amount: 9500, type: 'RENT', status: 'PENDING', due_date: '2025-04-01T00:00:00Z', paid_date: null, method: null },
  // Booking 2 payments
  { id: 'pay-11', user_id: 'user-tenant2', pg_id: 'pg-koramangala-1', booking_id: 'booking-2', amount: 24000, type: 'SECURITY_DEPOSIT', status: 'COMPLETED', due_date: '2025-01-19T00:00:00Z', paid_date: '2025-01-18T00:00:00Z', method: 'UPI' },
  { id: 'pay-12', user_id: 'user-tenant2', pg_id: 'pg-koramangala-1', booking_id: 'booking-2', amount: 12000, type: 'RENT', status: 'COMPLETED', due_date: '2025-02-01T00:00:00Z', paid_date: '2025-02-01T00:00:00Z', method: 'NET_BANKING' },
];

const complaints = [
  { id: 'complaint-1', user_id: 'user-tenant1', pg_id: 'pg-koramangala-1', title: 'Water heater not working', description: 'The geyser in room A-101 is not heating water. It has been 2 days now.', category: 'MAINTENANCE', priority: 'HIGH', status: 'IN_PROGRESS', assigned_to: 'worker-maint-1', resolution: null },
  { id: 'complaint-2', user_id: 'user-tenant2', pg_id: 'pg-koramangala-1', title: 'WiFi connectivity issues', description: 'WiFi keeps disconnecting every 30 minutes. Very disruptive for work.', category: 'MAINTENANCE', priority: 'MEDIUM', status: 'OPEN', assigned_to: null, resolution: null },
  { id: 'complaint-3', user_id: 'user-tenant4', pg_id: 'pg-indiranagar-1', title: 'Room not cleaned properly', description: 'Housekeeping skipped our room for the past 2 days.', category: 'CLEANLINESS', priority: 'MEDIUM', status: 'OPEN', assigned_to: null, resolution: null },
  { id: 'complaint-4', user_id: 'user-tenant5', pg_id: 'pg-indiranagar-1', title: 'Loud noise from neighboring room', description: 'The room next door plays loud music after 10 PM daily.', category: 'NOISE', priority: 'LOW', status: 'RESOLVED', assigned_to: 'worker-mgr-1', resolution: 'Spoke with the residents and established quiet hours after 10 PM.' },
  { id: 'complaint-5', user_id: 'user-tenant1', pg_id: 'pg-koramangala-1', title: 'Broken window lock', description: 'The window latch in my room is broken, security concern.', category: 'SAFETY', priority: 'URGENT', status: 'IN_PROGRESS', assigned_to: 'worker-maint-1', resolution: null },
  { id: 'complaint-6', user_id: 'user-tenant5', pg_id: 'pg-marathahalli-1', title: 'Power outage frequent', description: 'Power goes out 3-4 times daily even though power backup is listed as an amenity.', category: 'MAINTENANCE', priority: 'HIGH', status: 'OPEN', assigned_to: null, resolution: null },
];

const vendors = [
  { id: 'vendor-1', name: 'QuickFix Plumbing', type: 'PLUMBER', phone: '+919876500001', email: 'info@quickfix.com', city: 'Bangalore', area: 'Koramangala', rating: 4.5, status: 'ACTIVE' },
  { id: 'vendor-2', name: 'Spark Electricians', type: 'ELECTRICIAN', phone: '+919876500002', email: 'contact@spark.com', city: 'Bangalore', area: 'HSR Layout', rating: 4.7, status: 'ACTIVE' },
  { id: 'vendor-3', name: 'CleanPro Services', type: 'CLEANER', phone: '+919876500003', email: 'hello@cleanpro.com', city: 'Bangalore', area: 'Indiranagar', rating: 4.3, status: 'ACTIVE' },
  { id: 'vendor-4', name: 'ColorKing Painters', type: 'PAINTER', phone: '+919876500004', email: null, city: 'Bangalore', area: 'Whitefield', rating: 4.1, status: 'ACTIVE' },
  { id: 'vendor-5', name: 'WoodCraft Carpentry', type: 'CARPENTER', phone: '+919876500005', email: 'orders@woodcraft.com', city: 'Bangalore', area: 'Marathahalli', rating: 4.6, status: 'ACTIVE' },
  { id: 'vendor-6', name: 'NetConnect Solutions', type: 'WIFI', phone: '+919876500006', email: 'support@netconnect.com', city: 'Bangalore', area: null, rating: 4.4, status: 'ACTIVE' },
  { id: 'vendor-7', name: 'AllInOne Maintenance', type: 'GENERAL', phone: '+919876500007', email: 'help@allinone.com', city: 'Bangalore', area: 'Koramangala', rating: 4.0, status: 'ACTIVE' },
  { id: 'vendor-8', name: 'Supreme Paints Co', type: 'PAINTER', phone: '+919876500008', email: null, city: 'Bangalore', area: 'HSR Layout', rating: 3.8, status: 'INACTIVE' },
];

const workers = [
  { id: 'worker-sec-1', name: 'Ravi Kumar', role: 'SECURITY', phone: '+919800000001', pg_id: 'pg-koramangala-1', shift: 'NIGHT', status: 'ACTIVE' },
  { id: 'worker-sec-2', name: 'Suresh Babu', role: 'SECURITY', phone: '+919800000002', pg_id: 'pg-koramangala-1', shift: 'MORNING', status: 'ACTIVE' },
  { id: 'worker-clean-1', name: 'Lakshmi Devi', role: 'CLEANER', phone: '+919800000003', pg_id: 'pg-indiranagar-1', shift: 'MORNING', status: 'ACTIVE' },
  { id: 'worker-cook-1', name: 'Mary Joseph', role: 'COOK', phone: '+919800000004', pg_id: 'pg-koramangala-1', shift: 'MORNING', status: 'ACTIVE' },
  { id: 'worker-mgr-1', name: 'Ganesh Reddy', role: 'MANAGER', phone: '+919800000005', pg_id: 'pg-koramangala-1', shift: null, status: 'ACTIVE' },
  { id: 'worker-maint-1', name: 'Krishna Murthy', role: 'MAINTENANCE', phone: '+919800000006', pg_id: null, shift: null, status: 'ACTIVE' },
  { id: 'worker-clean-2', name: 'Padma Kumari', role: 'CLEANER', phone: '+919800000007', pg_id: 'pg-hsr-1', shift: 'EVENING', status: 'ACTIVE' },
  { id: 'worker-cook-2', name: 'Shanti Devi', role: 'COOK', phone: '+919800000008', pg_id: 'pg-hsr-1', shift: 'MORNING', status: 'ACTIVE' },
];

// =============================================
// SEEDING FUNCTIONS
// =============================================

async function seedTable(tableName, data, label) {
  console.log(`\n${cyan('Seeding')} ${bold(label)} (${data.length} records)...`);

  const { data: result, error } = await supabase
    .from(tableName)
    .insert(data)
    .select();

  if (error) {
    // Check if it's a "table doesn't exist" error
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.error(red(`  ✗ Table "${tableName}" does not exist!`));
      console.error(yellow(`  → You need to run supabase-schema.sql in Supabase Dashboard → SQL Editor first.`));
      return false;
    }
    // Check for duplicate key
    if (error.code === '23505') {
      console.error(red(`  ✗ Duplicate key error - data may already exist.`));
      console.error(yellow(`  → ${error.message}`));
      return false;
    }
    // RLS policy error
    if (error.code === '42501') {
      console.error(red(`  ✗ RLS policy denied insert.`));
      console.error(yellow(`  → Make sure you've run supabase-schema.sql to set up policies.`));
      return false;
    }
    console.error(red(`  ✗ Error: ${error.code} - ${error.message}`));
    if (error.hint) console.error(yellow(`  Hint: ${error.hint}`));
    return false;
  }

  console.log(green(`  ✓ Inserted ${result.length} records into "${tableName}"`));
  return true;
}

async function main() {
  console.log('================================================');
  console.log(bold(cyan('  StayEG Supabase Seed Script')));
  console.log(bold(cyan('  ==============================')));
  console.log(`  URL: ${SUPABASE_URL}`);
  console.log('================================================');

  const results = {};

  // Test connection first
  console.log(`\n${cyan('Testing connection...')}`);
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code === '42P01') {
      console.error(red('  ✗ Connection works but "users" table does not exist.'));
      console.error(yellow('  → You MUST run supabase-schema.sql in Supabase Dashboard → SQL Editor first!'));
      console.error(yellow('  → Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query'));
      console.error(yellow('  → Paste the contents of supabase-schema.sql and click "Run"'));
      process.exit(1);
    }
    console.log(green('  ✓ Connected to Supabase successfully'));
  } catch (err) {
    console.error(red(`  ✗ Connection failed: ${err.message}`));
    process.exit(1);
  }

  // Seed in dependency order
  // 1. Users (no deps)
  results.users = await seedTable('users', users, 'Users');

  if (!results.users) {
    console.error(red('\n=== STOPPING: Users table failed. Fix the issue above and re-run. ==='));
    process.exit(1);
  }

  // 2. Vendors (no deps)
  results.vendors = await seedTable('vendors', vendors, 'Vendors');

  // 3. PGs (depends on Users)
  results.pgs = await seedTable('pgs', pgs, 'PGs');

  if (!results.pgs) {
    console.error(red('\n=== STOPPING: PGs table failed. ==='));
    process.exit(1);
  }

  // 4. Workers (depends on PGs, but pg_id can be null)
  results.workers = await seedTable('workers', workers, 'Workers');

  // 5. Rooms (depends on PGs)
  results.rooms = await seedTable('rooms', rooms, 'Rooms');

  if (!results.rooms) {
    console.error(red('\n=== STOPPING: Rooms table failed. ==='));
    process.exit(1);
  }

  // 6. Beds (depends on Rooms)
  results.beds = await seedTable('beds', beds, 'Beds');

  if (!results.beds) {
    console.error(red('\n=== STOPPING: Beds table failed. ==='));
    process.exit(1);
  }

  // 7. Bookings (depends on Users, PGs, Beds)
  results.bookings = await seedTable('bookings', bookings, 'Bookings');

  if (!results.bookings) {
    console.error(red('\n=== STOPPING: Bookings table failed. ==='));
    process.exit(1);
  }

  // 8. Payments (depends on Users, PGs, Bookings)
  results.payments = await seedTable('payments', payments, 'Payments');

  // 9. Complaints (depends on Users, PGs)
  results.complaints = await seedTable('complaints', complaints, 'Complaints');

  // Summary
  console.log('\n================================================');
  console.log(bold('  SEED SUMMARY'));
  console.log('================================================');

  const summary = {
    Users: { count: users.length, ok: results.users },
    PGs: { count: pgs.length, ok: results.pgs },
    Rooms: { count: rooms.length, ok: results.rooms },
    Beds: { count: beds.length, ok: results.beds },
    Bookings: { count: bookings.length, ok: results.bookings },
    Payments: { count: payments.length, ok: results.payments },
    Complaints: { count: complaints.length, ok: results.complaints },
    Vendors: { count: vendors.length, ok: results.vendors },
    Workers: { count: workers.length, ok: results.workers },
  };

  let successCount = 0;
  let totalRecords = 0;

  for (const [name, info] of Object.entries(summary)) {
    const icon = info.ok ? green('✓') : red('✗');
    console.log(`  ${icon} ${name.padEnd(14)} ${String(info.count).padStart(3)} records`);
    if (info.ok) {
      successCount++;
      totalRecords += info.count;
    }
  }

  console.log('------------------------------------------------');
  console.log(`  ${bold(String(successCount) + '/9 tables seeded successfully')}`);
  console.log(`  ${bold(String(totalRecords) + ' total records inserted')}`);

  if (successCount === 9) {
    console.log(green(bold('\n  🎉 All tables seeded successfully!\n')));
  } else {
    console.log(yellow(bold(`\n  ⚠ Some tables failed. Check errors above.\n`)));
  }
}

main().catch((err) => {
  console.error(red(`\nFatal error: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
});
