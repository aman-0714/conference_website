// ============================================================
//  routes/news.js  –  Public news feed + Admin CRUD
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../db");

// ─── GET /api/news  (public) ───────────────────────────────
router.get("/", (req, res) => {
  const news = db
    .prepare("SELECT id, category, content, created_at FROM news WHERE is_active = 1 ORDER BY id DESC")
    .all();
  res.json({ success: true, data: news });
});

// ─── POST /api/news  (admin only – checked in server.js) ──
router.post("/", (req, res) => {
  const { category, content } = req.body;
  if (!category || !content) {
    return res.status(400).json({ success: false, message: "Category and content are required." });
  }
  const info = db.prepare("INSERT INTO news (category, content) VALUES (?, ?)").run(category, content);
  res.status(201).json({ success: true, id: info.lastInsertRowid });
});

// ─── DELETE /api/news/:id  (admin only) ───────────────────
router.delete("/:id", (req, res) => {
  db.prepare("UPDATE news SET is_active = 0 WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: "News item removed." });
});

module.exports = router;
