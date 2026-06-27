// ============================================================
//  routes/contact.js  –  Contact form route
// ============================================================

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../db");

// ─── POST /api/contact ─────────────────────────────────────
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("message").trim().isLength({ min: 20 }).withMessage("Message must be at least 20 characters."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    try {
      db.prepare(
        "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)"
      ).run(name, email, subject || "General Inquiry", message);

      res.status(201).json({
        success: true,
        message: "Your message has been received. We will get back to you within 2 working days.",
      });
    } catch (err) {
      console.error("Contact form error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

module.exports = router;
