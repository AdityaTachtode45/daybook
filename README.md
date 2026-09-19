# Daybook — Master Diary & Life Journal Web Application

**Daybook** is a premium, multi-user daily diary web application. Users record how each day went, browse entries through a monthly calendar, attach videos, photos, and documents, and build writing streaks.

---

## Features

1. **Authentication**: Stateless JWT authentication (access & refresh token rotation with BCrypt password hashing).
2. **Interactive Calendar Dashboard**: Month grid view with glowing today ring highlight, mood-colored entry indicators, and slide animations.
3. **Day Diary Editor**: TipTap rich-text editor with debounced autosave, mood selector, and future-date protection.
4. **Media Attachments**: Signed browser direct uploads to Cloudinary with separate sections for Videos (inline player), Photos (masonry gallery + lightbox), and Documents/Files.
5. **Streaks & Analytics**: Timezone-aware current streak, longest streak, total entries, and monthly written metrics.
6. **User Profile**: Display name, bio, avatar, timezone, password change, and double-confirm account deletion.

---

## Tech Stack

### Backend
- **Java 21**, **Spring Boot 3.3**, Maven
- **Spring Web**, **Spring Security** (Stateless JWT), **Spring Data JPA**
- **MySQL 8** (Aiven SSL production ready, H2 in-memory local dev fallback)
- **Cloudinary SDK** for direct upload signatures
- *No Lombok used* — explicit getters, setters, and constructors throughout.

### Frontend
- **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**
- **TanStack Query**, **Axios** (with token refresh interceptor)
- **Framer Motion**, **GSAP**, **Lenis** smooth scroll
- **React Three Fiber + Drei** (lazy-loaded 3D hero with reduced-motion fallback)
- **TipTap Editor**

---

## Project Layout

```
daybook/
├── backend/
│   ├── src/main/java/com/daybook/
│   │   ├── config/ (SecurityConfig with inline CORS)
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/ (calendar, diary, media, streak, layout, ui)
│   │   ├── pages/ (Landing, Login, Register, Dashboard, Day, Profile)
│   │   └── types/
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── .env.example
└── README.md
```

---

## Local Setup Instructions

### 1. Backend
```bash
cd backend
# Copy env example
cp .env.example .env

# Run unit tests and package
mvn clean package

# Start backend server (runs on port 8080 by default)
java -jar target/daybook-backend-1.0.0.jar
```

### 2. Frontend
```bash
cd frontend
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

---

## Deployment Guide

- **Backend (Render / Docker)**: Deploy `backend/Dockerfile` on Render. Set environment variables (`PORT`, `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `ALLOWED_ORIGINS`).
- **Database (Aiven MySQL)**: Create MySQL database on Aiven with SSL mode enabled. Provide connection string to `DB_URL`.
- **Frontend (Vercel)**: Connect frontend repository to Vercel. Set build command to `npm run build` and publish output to `dist`. Set `VITE_API_URL` to backend API URL.
