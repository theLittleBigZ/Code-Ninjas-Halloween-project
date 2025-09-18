# Code-Ninjas-Halloween-project

### Project Overview
This project is going to be used in an upcoming Halloween event, we are going to be creating an automated photo-booth this photobooth has 2 parts a registration form for users to signup once they have signed up they will be emailed a QR code, and will wait in line to get to the photo booth once at the photobooth they will scan the qrcode code to start the photobooth the photobooth will take photos and apply edits to them then email them to the user

### Registration 
For the user registration the following is needed
- Parent / guardian first name
- Parent / guardian last name
- Parent / guardian Email
- Parent / guardian Phone number
- Postal code
- how many photos to take
- Child(ern) names
- Child(ern) ages
this infomation will be used to make a QR code and must be saved for use later

### PhotoBooth 
Will be running on a tablet and will take a photo of the user and apply edits to them and email it out the the user

### Student Project Checklist

#### Registration Page (public/index.html, script.js)
- [ ] Build the registration form with all required fields (see project overview)
- [ ] Validate form input on the client side
- [ ] Send registration data to the backend (server.js)
- [ ] Show a success message after registration
- [ ] (Optional) Show QR code after registration

#### Backend (server.js)
- [ ] Create an endpoint to receive registration data and save it (in memory, file, or database)
- [ ] Generate a unique UUID for each registration
- [ ] Generate a QR code for the user (use a simple npm package or API)
- [ ] Email the QR code to the user (use nodemailer or similar)
- [ ] Store registration info for later lookup

#### Photobooth Page (public/photobooth.html, script.js)
- [ ] Add a QR code scanner (use a simple JS library or placeholder)
- [ ] Fetch user info from backend using scanned UUID
- [ ] Show user info and allow photo capture (use getUserMedia or placeholder)
- [ ] Allow employee to take/upload photo
- [ ] Send photo to backend for processing
- [ ] Backend: receive photo, apply simple edit (e.g., grayscale, overlay), and email to user
- [ ] Mark user as "photo taken" in storage

#### General
- [ ] Style the pages (public/style.css)
- [ ] Test the full flow end-to-end
- [ ] Add comments to your code

#### Stretch Goals (Optional)
- [ ] Add Google Sheets integration for registration data
- [ ] Add more advanced photo effects
- [ ] Add admin dashboard to view registrations

---

## Database (SQLite) setup

This project now uses SQLite (via Knex) for storing registrations in `data/dev.sqlite3`.

Quick steps to set up the database locally:

1. Install dependencies (if you haven't already):

```bash
npm install
```

2. Create the data directory (if it doesn't exist) and run migrations to create the `registrations` table:

```bash
mkdir -p data
npx knex --knexfile knexfile.js migrate:latest
```

3. Start the server and test the registration form:

```bash
node server.js
# then open http://localhost:3000 in your browser and use the registration form
```

What was added
- `knexfile.js` — Knex configuration (development uses `./data/dev.sqlite3`)
- `db.js` — simple Knex connection helper
- `migrations/20250913_create_registrations.js` — migration to create the `registrations` table
- Updated `server.js` to insert registrations into the DB and read by `uuid`

Notes
- The project intentionally skips importing existing `db.csv` test data. If you want to import it later, I can add a migration/import script.
- Don't commit `data/dev.sqlite3` to git; `.gitignore` already ignores the `data/` directory.
- To switch to Postgres later, update `knexfile.js` to use `pg` and set the connection via environment variables.
