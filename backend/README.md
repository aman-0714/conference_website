# I-PESs 2027 – Backend

Node.js + Express + SQLite backend for the I-PESs 2027 conference website.

## Quick Start

```bash
cd backend
npm install
node server.js       # production
# or
npm run dev          # with auto-restart (nodemon)
```

Server starts at **http://localhost:3001**

---

## API Reference

### Papers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/papers/submit` | Submit a paper (multipart/form-data, PDF) |
| GET  | `/api/papers/:id`    | Track submission status by ID |

**Submit fields:** `paper_title`, `abstract`, `track` (Track 1/2/3), `keywords`, `author_name`, `author_email`, `author_affiliation`, `author_country`, `co_authors` (JSON), `cmt_id`, `paper_file` (PDF, max 10MB)

### Registration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/register/fees` | Get fee structure |
| POST | `/api/register`      | Submit registration (multipart, payment screenshot) |

**Submit fields:** `full_name`, `email`, `phone`, `affiliation`, `designation`, `country`, `participation_mode` (Online/Offline), `category`, `payment_ref`, `paper_id` (optional), `payment_screenshot` (image/PDF)

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact query |

**Fields:** `name`, `email`, `subject`, `message`

### News (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Get all active news items |

### Admin (Basic Auth required)
Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`.  
Use `Authorization: Basic base64(user:pass)` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/admin/dashboard`            | Stats summary |
| GET    | `/api/admin/papers`               | List papers (filter: status, track) |
| PATCH  | `/api/admin/papers/:id`           | Update paper status / add reviewer comments |
| GET    | `/api/admin/registrations`        | List registrations |
| PATCH  | `/api/admin/registrations/:id`    | Confirm/reject registration, mark payment |
| GET    | `/api/admin/contacts`             | View all contact queries |
| PATCH  | `/api/admin/contacts/:id/replied` | Mark contact as replied |
| GET    | `/api/admin/export/papers`        | Download CSV of all papers |
| GET    | `/api/admin/export/registrations` | Download CSV of all registrations |
| POST   | `/api/news`                       | Add news item |
| DELETE | `/api/news/:id`                   | Remove news item |

---

## Email Setup (Optional)

To send confirmation emails, fill in `.env`:
```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16char_app_password
```
Generate an App Password at: https://myaccount.google.com/apppasswords  
Email failures are non-critical — the API still returns success.

---

## Database

SQLite file: `ipess2027.db` (auto-created on first run)  
Tables: `paper_submissions`, `registrations`, `contacts`, `news`

## Connecting to the Frontend

In your HTML forms, send requests to `http://localhost:3001/api/...`  
The news feed (`/api/news`) can replace the static news cards in `index.html` with a `fetch()` call.
