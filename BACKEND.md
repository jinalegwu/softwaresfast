# Backend & Student Authentication

The site now ships with a small Node/Express backend that authenticates students by **email + password**.

## Run locally

```bash
npm install
cp .env.example .env   # then set JWT_SECRET to a long random string
npm start
# open http://localhost:3000/login.html
```

> The login page must be opened through this server (not by double-clicking the file or via GitHub Pages), because it calls `/api/auth/*`.

## API

| Method | Route | Body | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` | Create a student account and sign in |
| POST | `/api/auth/login` | `{ email, password }` | Sign in |
| POST | `/api/auth/logout` | – | Clear the session |
| GET | `/api/auth/me` | – | Current signed-in student |

## Security measures

- Passwords hashed with **bcrypt** (cost 12); never stored or returned in plain text
- Session in a signed **JWT** inside an `HttpOnly`, `SameSite=Strict` cookie (`Secure` in production)
- Generic "Invalid email or password" error and constant-time-style check to avoid account enumeration
- **Rate limiting** on auth routes, **helmet** security headers, request size limit
- Static serving is whitelisted so `server.js`, `.env`, and `data/` are never exposed

## Before production

- Replace the JSON file store (`data/students.json`) with a real database (PostgreSQL, MongoDB, etc.)
- Set `NODE_ENV=production` and a strong `JWT_SECRET`, and serve over HTTPS
- Consider email verification and password reset
