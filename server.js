require('dotenv').config();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be set in production.');
  process.exit(1);
}
// In development a random secret is used (sessions reset on restart).
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');
const COOKIE_NAME = 'sf_session';
const SESSION_HOURS = 8;

// ---- Simple JSON file store (swap for a real database in production) ----
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'students.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

function readStudents() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeStudents(students) {
  fs.writeFileSync(DB_FILE, JSON.stringify(students, null, 2));
}
function findByEmail(email) {
  return readStudents().find((s) => s.email === email);
}

// ---- Helpers ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (v) => String(v || '').trim().toLowerCase();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

function issueSession(res, student) {
  const token = jwt.sign({ sub: student.id, email: student.email }, JWT_SECRET, {
    expiresIn: `${SESSION_HOURS}h`,
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: IS_PROD,
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  });
}

function requireAuth(req, res, next) {
  try {
    req.user = jwt.verify(req.cookies[COOKIE_NAME], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Not authenticated.' });
  }
}

const publicStudent = (s) => ({ id: s.id, name: s.name, email: s.email });

// ---- App ----
const app = express();
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        mediaSrc: ["'self'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

// Register a student account
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!name || name.length > 100) return res.status(400).json({ error: 'Please enter your full name.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Password must be 8 to 72 characters.' });
  }
  if (findByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists.' });

  const student = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
  };
  const students = readStudents();
  students.push(student);
  writeStudents(students);

  issueSession(res, student);
  res.status(201).json({ student: publicStudent(student) });
});

// Sign in with student email + password
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  if (!EMAIL_RE.test(email) || !password) {
    return res.status(400).json({ error: 'Enter your email and password.' });
  }

  const student = findByEmail(email);
  // Always run bcrypt so response time doesn't reveal whether the email exists.
  const ok = await bcrypt.compare(password, student ? student.passwordHash : DUMMY_HASH);
  if (!student || !ok) return res.status(401).json({ error: 'Invalid email or password.' });

  issueSession(res, student);
  res.json({ student: publicStudent(student) });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'strict', secure: IS_PROD });
  res.json({ ok: true });
});

// Current signed-in student
app.get('/api/auth/me', requireAuth, (req, res) => {
  const student = readStudents().find((s) => s.id === req.user.sub);
  if (!student) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ student: publicStudent(student) });
});

// ---- Static site (whitelisted so server code and data are never exposed) ----
const ROOT = __dirname;
app.get('/', (req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get(/^\/([a-z0-9-]+\.(?:html|css|js))$/i, (req, res, next) => {
  const file = req.params[0];
  if (file === 'server.js') return next();
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return next();
  res.sendFile(full);
});

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => console.log(`Softwaresfast running at http://localhost:${PORT}`));
