"use client";
import { useEffect, useState } from "react";

type Contact = {
  id: number;
  name: string;
  phone: string;
  role: string;
  color: string;
};

type SmsLog = {
  id: number;
  name: string;
  phone: string;
  message: string;
  sent_at: string;
  role: string;
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
}

const QUICK = [
  "Salom! Siz bilan bog'lanmoqchi edim.",
  "Iltimos, telefon qilib qo'ying.",
  "Yig'ilish bugun soat 15:00 da.",
  "Buyurtmangiz tayyor. Olib keta olasiz.",
];

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filtered, setFiltered] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kontaktlarni yuklash
  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => {
        setContacts(data);
        setFiltered(data);
        setLoading(false);
      });
  }, []);

  // Qidiruv
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      contacts.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
      )
    );
  }, [search, contacts]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const allSel = filtered.every((c) => selected.has(c.id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSel) filtered.forEach((c) => next.delete(c.id));
      else filtered.forEach((c) => next.add(c.id));
      return next;
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  async function sendSMS() {
    if (!message.trim() || selected.size === 0) return;
    const res = await fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactIds: [...selected], message }),
    });
    const data = await res.json();
    if (data.smsUri) {
      window.location.href = data.smsUri;
      showToast(`📱 ${data.count} ta kontaktga SMS oynasi ochildi!`);
    }
  }

  async function loadLogs() {
    const res = await fetch("/api/sms");
    setLogs(await res.json());
    setShowLogs(true);
  }

  const selContacts = contacts.filter((c) => selected.has(c.id));
  const allSel = filtered.length > 0 && filtered.every((c) => selected.has(c.id));
  const canSend = selected.size > 0 && message.trim().length > 0;

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 20% 10%, rgba(108,99,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(67,233,123,0.07) 0%, transparent 60%)"
      }} />

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{
          width: 48, height: 48, background: "linear-gradient(135deg,#6c63ff,#ff6b6b)",
          borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, boxShadow: "0 0 24px rgba(108,99,255,0.4)"
        }}>💬</div>
        <h1 style={{ fontFamily: "Syne,sans-serif", fontSize: 26, fontWeight: 800 }}>
          SMS <span style={{ color: "var(--accent)" }}>Yuboruvchi</span>
        </h1>
        <button onClick={loadLogs} style={{
          marginLeft: "auto", background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.3)",
          color: "var(--accent)", fontSize: 13, padding: "6px 14px", borderRadius: 20, cursor: "pointer"
        }}>📋 Loglar</button>
      </header>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { val: contacts.length, label: "Jami kontakt" },
          { val: selected.size, label: "Tanlangan" },
          { val: logs.length, label: "Yuborilgan" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 16, textAlign: "center"
          }}>
            <div style={{
              fontFamily: "Syne,sans-serif", fontSize: 28, fontWeight: 800,
              background: "linear-gradient(135deg,#6c63ff,#ff6b6b)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>

        {/* Contacts panel */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
          <div style={{
            padding: "18px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10, background: "var(--surface2)"
          }}>
            <span>👥</span>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Kontaktlar</span>
            <span style={{
              background: "var(--selected-bg)", border: "1px solid var(--accent)",
              color: "var(--accent)", fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 10
            }}>{selected.size} ta</span>
          </div>

          {/* Search */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism yoki telefon qidirish..."
              style={{
                width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "9px 14px", color: "var(--text)",
                fontFamily: "DM Sans,sans-serif", fontSize: 14, outline: "none"
              }}
            />
          </div>

          {/* Select all */}
          <div
            onClick={toggleAll}
            style={{
              padding: "10px 16px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer"
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 6,
              border: `2px solid ${allSel ? "var(--accent)" : "var(--border)"}`,
              background: allSel ? "var(--accent)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {allSel && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Barchasini tanlash</span>
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Yuklanmoqda...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Kontakt topilmadi</div>
            ) : filtered.map((c) => {
              const sel = selected.has(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", cursor: "pointer",
                    borderBottom: "1px solid rgba(42,42,61,0.5)",
                    background: sel ? "var(--selected-bg)" : "transparent",
                    position: "relative"
                  }}
                >
                  {sel && <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 3, background: "var(--accent)", borderRadius: "0 2px 2px 0"
                  }} />}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: c.color + "22", color: c.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15
                  }}>{initials(c.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{c.phone}{c.role ? " · " + c.role : ""}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                    background: sel ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {sel && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "var(--surface2)" }}>
              <span>✍️</span>
              <span style={{ fontFamily: "Syne,sans-serif", fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Xabar yozish</span>
            </div>

            <div style={{ padding: 20 }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Bu yerga SMS matningizni yozing..."
                style={{
                  width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "14px 16px", color: "var(--text)",
                  fontFamily: "DM Sans,sans-serif", fontSize: 15, resize: "none",
                  outline: "none", minHeight: 140, lineHeight: 1.6
                }}
              />
              <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                {message.length} / 160 belgi
              </div>
            </div>

            {/* Quick messages */}
            <div style={{ padding: "0 20px 16px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", fontWeight: 600, marginBottom: 10 }}>Tezkor xabarlar</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QUICK.map((q) => (
                  <button key={q} onClick={() => setMessage(q)} style={{
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "var(--muted)",
                    cursor: "pointer", fontFamily: "DM Sans,sans-serif"
                  }}>{q.substring(0, 20)}...</button>
                ))}
              </div>
            </div>

            {/* Send section */}
            <div style={{ padding: 20, borderTop: "1px solid var(--border)" }}>
              <div style={{
                marginBottom: 14, padding: "12px 14px", background: "var(--surface2)",
                borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, color: "var(--muted)", lineHeight: 1.5
              }}>
                {selContacts.length === 0
                  ? "Hech qanday kontakt tanlanmagan."
                  : <><strong style={{ color: "var(--text)" }}>{selContacts.length} ta</strong> kontaktga yuboriladi: {selContacts.map((c) => <span key={c.id} style={{ color: "var(--accent)", fontWeight: 500 }}>{c.phone} </span>)}</>
                }
              </div>
              <button
                onClick={sendSMS}
                disabled={!canSend}
                style={{
                  width: "100%", padding: 16,
                  background: canSend ? "linear-gradient(135deg,#6c63ff,#8b5cf6)" : "var(--surface2)",
                  border: "none", borderRadius: 14, color: canSend ? "white" : "var(--muted)",
                  fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 700,
                  cursor: canSend ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: canSend ? "0 4px 20px rgba(108,99,255,0.35)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: 20 }}>🚀</span>
                Barchaga SMS Yuborish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs modal */}
      {showLogs && (
        <div
          onClick={() => setShowLogs(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)", zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 28, width: 560, maxWidth: "90vw", maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <h3 style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 SMS Loglar</h3>
            {logs.length === 0
              ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Hali SMS yuborilmagan.</p>
              : logs.map((l) => (
                <div key={l.id} style={{
                  padding: "12px 0", borderBottom: "1px solid var(--border)",
                  fontSize: 13, lineHeight: 1.6
                }}>
                  <div style={{ fontWeight: 500 }}>{l.name} <span style={{ color: "var(--muted)" }}>({l.phone})</span></div>
                  <div style={{ color: "var(--muted)", marginTop: 2 }}>{l.message}</div>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 4 }}>{l.sent_at}</div>
                </div>
              ))
            }
            <button
              onClick={() => setShowLogs(false)}
              style={{
                marginTop: 20, width: "100%", padding: 10,
                background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: 10, color: "var(--muted)", cursor: "pointer",
                fontFamily: "DM Sans,sans-serif", fontSize: 14
              }}
            >Yopish</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--surface2)", border: "1px solid var(--accent3)",
          color: "var(--accent3)", padding: "12px 24px", borderRadius: 12,
          fontSize: 14, fontWeight: 500, zIndex: 100, whiteSpace: "nowrap"
        }}>{toast}</div>
      )}
    </div>
  );
}
