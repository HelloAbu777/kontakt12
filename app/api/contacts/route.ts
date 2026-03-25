import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { seedContacts } from "@/lib/seed";

// Seed faqat bir marta
seedContacts();

// GET /api/contacts — barcha kontaktlarni qaytarish
export async function GET() {
  const contacts = db.prepare("SELECT * FROM contacts ORDER BY name").all();
  return NextResponse.json(contacts);
}

// POST /api/contacts — yangi kontakt qo'shish
export async function POST(req: NextRequest) {
  const { name, phone, role = "", color = "#6c63ff" } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: "name va phone majburiy" }, { status: 400 });
  }
  try {
    const result = db
      .prepare("INSERT INTO contacts (name, phone, role, color) VALUES (?, ?, ?, ?)")
      .run(name, phone, role, color);
    const contact = db.prepare("SELECT * FROM contacts WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Telefon raqam allaqachon mavjud" }, { status: 409 });
  }
}

// DELETE /api/contacts?id=1 — kontaktni o'chirish
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id kerak" }, { status: 400 });
  db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
