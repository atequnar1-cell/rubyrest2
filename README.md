# Ruby Rest 2

Ruby Rest 2 is a VIP membership platform MVP built with plain HTML, CSS, and JavaScript. It includes a user login/register flow, VIP plan marketplace, deposit and withdrawal request handling, referral bonus system, daily claim logic, transaction history, and an admin approval dashboard.

## Features

- User registration and login
- VIP plans from Level 1 to Level 10
- Deposit request workflow
- Withdrawal request workflow
- 10% referral bonus for approved purchases
- Daily profit claim system
- Transaction history
- Admin dashboard for review and approval
- Supabase-ready architecture with localStorage fallback

## Project Structure

- `index.html` — application layout and UI
- `styles.css` — dashboard and mobile styling
- `app.js` — all app logic and local state handling
- `.gitignore` — ignores local environment files and editor artifacts
- `.env.example` — sample Supabase configuration values

## Running locally

1. Open `index.html` directly in a browser, or serve the folder with a local web server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Default admin account

- Email: `admin@rubyrest2.com`
- Password: `admin123`

## Supabase configuration

This project is structured to work with a Supabase backend if you want to connect it later. Copy `.env.example` to a real environment file and update the values if you plan to use Supabase.

Example:

```bash
cp .env.example .env
```

Then configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your environment or client integration.

## Notes

The MVP uses localStorage as the default data layer so it works without a backend. If you connect Supabase, you can replace the storage functions in `app.js` with database queries for persistence.
