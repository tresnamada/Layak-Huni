This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Teknologi yang Digunakan

- Next.js
- TypeScript
- Firebase (Firestore)
- Google Gemini AI
- Tailwind CSS

## Troubleshooting

Jika Anda mengalami masalah dengan SiHuni AI, coba langkah-langkah berikut:

### "Failed to get response from AI"

1. Periksa koneksi internet Anda
2. Pastikan API key Gemini sudah benar di file `.env.local`
3. Periksa apakah database Firestore dapat diakses dengan membuka endpoint test:
   ```
   http://localhost:3000/api/ai-chat/test
   ```
4. Uji koneksi Gemini API secara terpisah:
   ```
   http://localhost:3000/api/ai-chat/gemini-test
   ```
5. Periksa log server untuk melihat pesan error yang lebih detail

### Masalah dengan Firestore

1. Pastikan Anda telah mengonfigurasi Firebase dengan benar
2. Periksa apakah koleksi `test` dan dokumen `minimalist house` dan `modern house` sudah ada di Firestore
3. Pastikan Anda memiliki aturan keamanan Firestore yang memungkinkan membaca koleksi `test`

### Masalah dengan Gemini API

1. Pastikan Anda menggunakan API key yang valid dan aktif
2. Jika model `gemini-1.5-pro` tidak tersedia, sistem akan mencoba `gemini-pro` sebagai fallback
3. Anda mungkin perlu mengaktifkan API Gemini di Google Cloud Console

Jika masalah masih berlanjut, periksa log server dan browser untuk pesan error yang lebih detail.

## Admin Functionality

SiapHuni includes an admin panel that allows privileged users to manage the application. Here's how the admin system works:

### Admin Pages

- **Admin Dashboard** (`/Admin`): The main admin panel with access to various management tools
- **User Management** (`/Admin/Users`): Interface for managing users and assigning admin privileges

### Admin Access Control

A user can be assigned admin privileges in one of two ways:

1. Setting the `isAdmin` flag to `true` in the user's profile document in Firestore
2. Adding the user's ID to the `admins` collection in Firestore with `active: true`

The authentication flow checks both methods to determine if a user has admin privileges.

### Admin Features

- View all registered users
- Assign and revoke admin privileges
- Redirect non-admin users away from admin pages
- Admin link in navigation bar (only visible to admin users)

### Implementation Details

- Role-based access control (RBAC) using Firestore
- Admin status check using custom hooks
- Secure routes with client-side authentication checks
