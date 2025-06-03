# 💸 Money Tracker

A modern, full-stack expense and income tracker built with **Next.js 15**, **MongoDB**, **NextAuth**, and **TypeScript**.
Track your finances, manage your budget, and gain insights into your spending and earnings.

---

## 🚀 Features

* **User Authentication** (Google OAuth via NextAuth)
* **Add/Edit/Delete Transactions** (income & expenses)
* **Category-based analytics**
* **Multi-currency support**
* **User settings** (theme, language, date format, etc.)
* **Responsive UI** (mobile & desktop)
* **Dark/Light mode**
* **i18n (internationalization)**
* **Docker & Docker Compose support**
* **Production-ready**

---

## 🛠️ Tech Stack

* [Next.js 15 (App Router)](https://nextjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [MongoDB + Mongoose](https://mongoosejs.com/)
* [NextAuth.js](https://next-auth.js.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [react-hot-toast](https://react-hot-toast.com/)
* [Docker](https://www.docker.com/)

---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/money-tracker.git
cd money-tracker
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB connection string (do NOT use NEXT_PUBLIC_ prefix)
MONGODB_URI=mongodb+srv://user:password@host/db

# NextAuth secret (generate with `openssl rand -base64 32`)
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# (Optional) Public API URL for client-side code
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker

### Build and run with Docker

```bash
docker build -t money-tracker .
docker run -d --env-file .env.local -p 3000:3000 money-tracker
```

### With Docker Compose (MongoDB + App)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  app:
    build: .
    depends_on:
      - mongo
    environment:
      MONGODB_URI: mongodb://root:example@mongo:27017/moneytracker?authSource=admin
      NEXTAUTH_SECRET: your-nextauth-secret
      GOOGLE_CLIENT_ID: your-google-client-id
      GOOGLE_CLIENT_SECRET: your-google-client-secret
      NEXT_PUBLIC_API_URL: http://localhost:3000
    ports:
      - "3000:3000"

volumes:
  mongo-data:
```

Then run:

```bash
docker-compose up -d
```

---

## 🌍 Deployment

* **Vercel**: Set all environment variables in the Vercel dashboard.

* **VPS/Cloud**: Use Docker as above, or set environment variables and run:

  ```bash
  npm run build && npm start
  ```

* **Reverse Proxy**: Use Nginx or Caddy for HTTPS and custom domains.

---

## 🧑‍💻 Project Structure

```
src/
├── app/             # Next.js app directory
├── api/             # API routes (server only)
├── components/      # React components
├── constants/       # App constants
├── hooks/           # Custom React hooks
├── lib/             # Server-side utilities (db, auth, etc.)
├── models/          # Mongoose models
├── providers/       # Context providers
├── types/           # TypeScript types
├── utils/           # Utility functions
public/              # Static assets
styles/              # Global styles
```

---
