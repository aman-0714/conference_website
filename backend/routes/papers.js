// ============================================================
//  routes/papers.js  –  Paper submission routes
// ============================================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const db = require("../db");
const { sendSubmissionConfirmation } = require("../mailer");

// ─── Multer: PDF uploads ───────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/papers");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, "paper_" + unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for paper submission."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ─── Validation rules ──────────────────────────────────────
const validateSubmission = [
  body("paper_title").trim().notEmpty().withMessage("Paper title is required."),
  body("abstract").trim().isLength({ min: 100 }).withMessage("Abstract must be at least 100 characters."),
  body("track").isIn(["Track 1", "Track 2", "Track 3"]).withMessage("Invalid track selected."),
  body("author_name").trim().notEmpty().withMessage("Author name is required."),
  body("author_email").isEmail().withMessage("Valid author email is required."),
];

// ─── POST /api/papers/submit ───────────────────────────────
router.post(
  "/submit",
  upload.single("paper_file"),
  validateSubmission,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      paper_title,
      abstract,
      track,
      keywords,
      author_name,
      author_email,
      author_affiliation,
      author_country,
      co_authors,
      cmt_id,
    } = req.body;

    const file = req.file;

    try {
      const stmt = db.prepare(`
        INSERT INTO paper_submissions
          (paper_title, abstract, track, keywords,
           author_name, author_email, author_affiliation, author_country,
           co_authors, file_name, file_path, cmt_id)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        paper_title,
        abstract,
        track,
        keywords || "",
        author_name,
        author_email,
        author_affiliation || "",
        author_country || "",
        co_authors || "[]",
        file ? file.filename : null,
        file ? file.path : null,
        cmt_id || null
      );

      // Send confirmation email (non-blocking)
      sendSubmissionConfirmation(author_email, author_name, paper_title, track);

      res.status(201).json({
        success: true,
        message: "Paper submitted successfully. A confirmation email has been sent.",
        submission_id: info.lastInsertRowid,
      });
    } catch (err) {
      console.error("Paper submission error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

// ─── GET /api/papers/:id  (track submission status) ───────
router.get("/:id", (req, res) => {
  const row = db
    .prepare("SELECT id, paper_title, track, author_name, status, submitted_at FROM paper_submissions WHERE id = ?")
    .get(req.params.id);

  if (!row) return res.status(404).json({ success: false, message: "Submission not found." });
  res.json({ success: true, data: row });
});

module.exports = router;
