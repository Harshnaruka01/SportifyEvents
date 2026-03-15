# Sportify Events — Registration Portal

A React + Vite web app to manage sports event registration for the **Open National Athletics Championship 2026**.

## Features

- Public registration form with file uploads (photo/Aadhar/payment proof)
- Confirmation slip with unique entry ID
- Admin panel with password access
- Export entries to CSV
- Filter by event and age category
- Entry closing date control

## Running the project

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Admin access

- Default admin password: `admin2026`
- Admin panel: `/admin`

## Notes

- Registration is stored in `localStorage` in the browser.
- CSV export is generated from stored entries.
