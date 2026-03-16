import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;

    if (!envUser || !envPass) {
      console.warn("ADMIN_USERNAME or ADMIN_PASSWORD environment variables not set");
      // Fallback for local testing if env is missing, but railway should have it
      if (username === 'Administrator' && password === 'BEIN1801') {
        return NextResponse.json({ success: true });
      }
    }

    if (username === envUser && password === envPass) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
