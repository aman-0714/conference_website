// ============================================================
//  routes/admin.js  –  Admin panel routes
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");

// ─── GET /api/admin/dashboard ─────────────────────────────
router.get("/dashboard", (req, res) => {
  const papers      = db.prepare("SELECT COUNT(*) as c FROM paper_submissions").get().c;
  const registrations = db.prepare("SELECT COUNT(*) as c FROM registrations").get().c;
  const contacts    = db.prepare("SELECT COUNT(*) as c FROM contacts WHERE replied = 0").get().c;
  const confirmed   = db.prepare("SELECT COUNT(*) as c FROM registrations WHERE status = 'confirmed'").get().c;
  const accepted    = db.prepare("SELECT COUNT(*) as c FROM paper_submissions WHERE status = 'accepted'").get().c;
  const revenue     = db.prepare("SELECT SUM(amount) as total FROM registrations WHERE payment_status = 'paid'").get().total || 0;

  res.json({
    success: true,
    stats: { papers, registrations, contacts_unread: contacts, confirmed_registrations: confirmed, accepted_papers: accepted, revenue },
  });
});

// ─── GET /api/admin/papers ─────────────────────────────────
router.get("/papers", (req, res) => {
  const { status, track, page = 1, limit = 20 } = req.query;
  let query = "SELECT * FROM paper_submissions WHERE 1=1";
  const params = [];

  if (status) { query += " AND status = ?"; params.push(status); }
  if (track)  { query += " AND track = ?";  params.push(track); }

  query += " ORDER BY submitted_at DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  const rows = db.prepare(query).all(...params);
  res.json({ success: true, data: rows });
});

// ─── PATCH /api/admin/papers/:id ──────────────────────────
router.patch("/papers/:id", (req, res) => {
  const { status, reviewer_comments } = req.body;
  db.prepare(
    "UPDATE paper_submissions SET status = ?, reviewer_comments = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, reviewer_comments || null, req.params.id);
  res.json({ success: true, message: "Paper status updated." });
});

// ─── GET /api/admin/registrations ─────────────────────────
router.get("/registrations", (req, res) => {
  const { status, payment_status, page = 1, limit = 20 } = req.query;
  let query = "SELECT * FROM registrations WHERE 1=1";
  const params = [];

  if (status)         { query += " AND status = ?";         params.push(status); }
  if (payment_status) { query += " AND payment_status = ?"; params.push(payment_status); }

  query += " ORDER BY registered_at DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  const rows = db.prepare(query).all(...params);
  res.json({ success: true, data: rows });
});

// ─── PATCH /api/admin/registrations/:id ───────────────────
router.patch("/registrations/:id", (req, res) => {
  const { status, payment_status } = req.body;
  db.prepare(
    "UPDATE registrations SET status = ?, payment_status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, payment_status, req.params.id);
  res.json({ success: true, message: "Registration updated." });
});

// ─── GET /api/admin/contacts ──────────────────────────────
router.get("/contacts", (req, res) => {
  const rows = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
  res.json({ success: true, data: rows });
});

// ─── PATCH /api/admin/contacts/:id/replied ────────────────
router.patch("/contacts/:id/replied", (req, res) => {
  db.prepare("UPDATE contacts SET replied = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ─── GET /api/admin/export/papers ─────────────────────────
router.get("/export/papers", (req, res) => {
  const rows = db.prepare("SELECT * FROM paper_submissions ORDER BY submitted_at DESC").all();

  const csv = [
    "ID,Title,Track,Author,Email,Affiliation,Status,Submitted At",
    ...rows.map(r =>
      [r.id, `"${r.paper_title}"`, r.track, `"${r.author_name}"`, r.author_email,
       `"${r.author_affiliation}"`, r.status, r.submitted_at].join(",")
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=papers_ipess2027.csv");
  res.send(csv);
});

// ─── GET /api/admin/export/registrations ──────────────────
router.get("/export/registrations", (req, res) => {
  const rows = db.prepare("SELECT * FROM registrations ORDER BY registered_at DESC").all();

  const csv = [
    "ID,Name,Email,Phone,Affiliation,Category,Amount,Mode,Payment Status,Status,Registered At",
    ...rows.map(r =>
      [r.id, `"${r.full_name}"`, r.email, r.phone || "", `"${r.affiliation || ""}"`,
       `"${r.category}"`, r.amount, r.participation_mode, r.payment_status, r.status, r.registered_at].join(",")
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=registrations_ipess2027.csv");
  res.send(csv);
});

module.exports = router;
