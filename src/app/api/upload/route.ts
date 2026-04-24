/**
 * POST /api/upload
 * 
 * Handles file uploads to Supabase Storage.
 * Supports avatars, KYC documents, and PG images.
 * Requires authenticated session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string[]> = {
  avatar: ['image/jpeg', 'image/png', 'image/webp'],
  kyc: ['image/jpeg', 'image/png', 'application/pdf'],
  pg_image: ['image/jpeg', 'image/png', 'image/webp'],
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireSession(request);
    if ('error' in authResult) return authResult.error;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'avatar';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedMimes = ALLOWED_TYPES[type] || ALLOWED_TYPES.avatar;
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed: ${allowedMimes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size: 5MB' }, { status: 400 });
    }

    // Use service role client to bypass RLS for upload
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Determine storage bucket and file path
    const bucket = type === 'kyc' ? 'kyc-documents' : type === 'pg_image' ? 'pg-images' : 'avatars';
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${authResult.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Convert File to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path,
      bucket,
      type,
    });
  } catch (error: any) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
