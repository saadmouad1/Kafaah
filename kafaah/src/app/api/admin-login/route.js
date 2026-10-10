import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (email === adminEmail && password === adminPassword) {
      // Set a simple session cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set('kafaah_admin_session', 'authenticated', {
        httpOnly: false, // Must be false so document.cookie can read it on the client
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
