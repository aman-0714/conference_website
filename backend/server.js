// ============================================================
//  server.js  –  I-PESs 2027 Conference Backend
//  Stack: Node.js + Express + SQLite (better-sqlite3)
// ============================================================

require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const path     = require("path");
const fs       = require("fs");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (papers & payment proofs)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Admin Auth Middleware ─────────────────────────────────
function adminAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ success: false, message: "Admin authentication required." });
  }

  const b64 = authHeader.split(" ")[1];
  const [user, pass] = Buffer.from(b64, "base64").toString().split(":");

  if (user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(403).json({ success: false, message: "Invalid admin credentials." });
  }
}

// ─── Routes ───────────────────────────────────────────────
const papersRouter        = require("./routes/papers");
const registrationsRouter = require("./routes/registrations");
const contactRouter       = require("./routes/contact");
const newsRouter          = require("./routes/news");
const adminRouter         = require("./routes/admin");

app.use("/api/papers",        papersRouter);
app.use("/api/register",      registrationsRouter);
app.use("/api/contact",       contactRouter);
app.use("/api/news",          newsRouter);

// News POST & DELETE and all admin routes require admin auth
app.use("/api/news", adminAuth);     // POST/DELETE on /api/news
app.use("/api/admin", adminAuth, adminRouter);

// ─── Health check ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "I-PESs 2027 Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Internal server error." });
});

// ─── Start server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   I-PESs 2027 Backend Server                     ║
  ║   Running at  http://localhost:${PORT}              ║
  ╠══════════════════════════════════════════════════╣
  ║  POST  /api/papers/submit      (paper upload)    ║
  ║  GET   /api/papers/:id         (track status)    ║
  ║  GET   /api/register/fees      (fee structure)   ║
  ║  POST  /api/register           (registration)    ║
  ║  POST  /api/contact            (contact form)    ║
  ║  GET   /api/news               (news feed)       ║
  ║  GET   /api/admin/dashboard    (admin stats)     ║
  ║  GET   /api/admin/papers       (all papers)      ║
  ║  GET   /api/admin/registrations (all regs)       ║
  ║  GET   /api/admin/export/papers (CSV export)     ║
  ╚══════════════════════════════════════════════════╝
  `);
});
