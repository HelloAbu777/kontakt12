import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// POST /api/sms — SMS yuborish va logga yozish
export async function POST(req: NextRequest) {
  const { contactIds, message } = await req.json() as {
    contactIds: number[];
    message: string;
  };

  if (!contactIds?.length || !message?.trim()) {
    return NextResponse.json({ error: "contactIds va message kerak" }, { status: 400 });
  }

  // Tanlangan kontaktlarni olish
  const placeholders = contactIds.map(() => "?").join(",");
  const contacts = db
    .prepare(`SELECT * FROM contacts WHERE id IN (${placeholders})`)
    .all(...contactIds) as { id: number; phone: string; name: string }[];

  if (!contacts.length) {
    return NextResponse.json({ error: "Kontaktlar topilmadi" }, { status: 404 });
  }

  // SMS logini saqlash
  const insertLog = db.prepare(
    "INSERT INTO sms_logs (contact_id, phone, message) VALUES (?, ?, ?)"
  );
  const logAll = db.transaction(() => {
    for (const c of contacts) insertLog.run(c.id, c.phone, message);
  });
  logAll();

  // SMS URI qaytarish (mobil qurilmada ochiladi)
  const phones = contacts.map((c) => c.phone).join(";");
  const smsUri = `sms:${phones}?body=${encodeURIComponent(message)}`;

  return NextResponse.json({
    success: true,
    count: contacts.length,
    smsUri,
    contacts: contacts.map((c) => ({ id: c.id, phone: c.phone, name: c.name })),
  });
}

// GET /api/sms — SMS loglarini ko'rish
export async function GET() {
  const logs = db
    .prepare(`
      SELECT l.id, l.message, l.sent_at, l.phone,
             c.name, c.role
      FROM sms_logs l
      LEFT JOIN contacts c ON c.id = l.contact_id
      ORDER BY l.sent_at DESC
      LIMIT 100
    `)
    .all();
  return NextResponse.json(logs);
}
