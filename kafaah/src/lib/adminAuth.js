// ─────────────────────────────────────────────────────────────────────────────
//  kafaah · admin auth helper (server-side)
//  يتحقق من جلسة المالك عبر الكوكي. تُستخدم من Route Handlers فقط.
// ─────────────────────────────────────────────────────────────────────────────
import { cookies } from 'next/headers';

export async function isAdmin() {
  const store = await cookies();
  return store.get('kafaah_admin_session')?.value === 'authenticated';
}
