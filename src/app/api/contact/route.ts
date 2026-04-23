import { supabase, isTableMissing } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('contact_submissions').insert({
      name,
      email,
      subject,
      message,
    });

    if (error) {
      if (isTableMissing(error)) {
        return NextResponse.json({ success: true, message: 'Contact form received' });
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Contact form submitted' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}
