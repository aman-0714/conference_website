// ============================================================
//  routes/registrations.js  –  Conference registration routes
// ============================================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const db = require("../db");
const { sendRegistrationConfirmation } = require("../mailer");

// Registration fee structure (INR)
const FEE_STRUCTURE = {
  "Student (IEEE Member)":           3000,
  "Student (Non-IEEE Member)":       4000,
  "Research Scholar (IEEE Member)":  5000,
  "Research Scholar (Non-IEEE)":     6000,
  "Faculty (IEEE Member)":           7000,
  "Faculty (Non-IEEE Member)":       8000,
  "Industry (IEEE Member)":          8000,
  "Industry (Non-IEEE Member)":      9000,
  "International Participant":      200,   // USD – handle display separately
};

// ─── Multer: payment screenshot uploads ───────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/payments");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, "payment_" + unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF files are allowed for payment proof."), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Validation ────────────────────────────────────────────
const validateReg = [
  body("full_name").trim().notEmpty().withMessage("Full name is required."),
  body("email").isEmail().withMessage("Valid email is required."),
  body("participation_mode").isIn(["Online", "Offline"]).withMessage("Invalid participation mode."),
  body("category").notEmpty().withMessage("Registration category is required."),
];

// ─── GET /api/register/fees ────────────────────────────────
router.get("/fees", (req, res) => {
  res.json({ success: true, fees: FEE_STRUCTURE });
});

// ─── POST /api/register ────────────────────────────────────
router.post(
  "/",
  upload.single("payment_screenshot"),
  validateReg,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      full_name, email, phone, affiliation, designation,
      country, participation_mode, paper_id, paper_title,
      category, payment_ref,
    } = req.body;

    const amount = FEE_STRUCTURE[category];
    if (!amount) {
      return res.status(400).json({ success: false, message: "Invalid registration category." });
    }

    const file = req.file;

    try {
      const stmt = db.prepare(`
        INSERT INTO registrations
          (full_name, email, phone, affiliation, designation, country,
           participation_mode, paper_id, paper_title,
           category, amount, payment_ref, payment_screenshot)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        full_name, email, phone || null, affiliation || null, designation || null,
        country || null, participation_mode, paper_id || null, paper_title || null,
        category, amount, payment_ref || null,
        file ? file.filename : null
      );

      sendRegistrationConfirmation(email, full_name, category, amount, participation_mode);

      res.status(201).json({
        success: true,
        message: "Registration submitted. Confirmation email sent. Payment will be verified within 2 working days.",
        registration_id: info.lastInsertRowid,
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

module.exports = router;
