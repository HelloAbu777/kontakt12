// contacts.json dan ma'lumotlarni DB ga import qilish
// Faqat bir marta ishlaydi (phone UNIQUE bo'lgani uchun)
import db from "./db";
import contactsJson from "../contacts.json";

export function seedContacts() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO contacts (name, phone, role, color)
    VALUES (@name, @phone, @role, @color)
  `);

  const insertMany = db.transaction((rows: typeof contactsJson) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(contactsJson);
}
