# DAYBOOK — Master Build Specification

> **AGENT: READ THIS ENTIRE FILE FIRST, THEN BUILD THE COMPLETE PROJECT.**
> Build all phases in order without stopping to ask questions between modules. Make sensible decisions yourself. Write complete, copy-paste-ready files, never partial snippets or placeholders like "TODO" or "rest of code here". After each phase, run the build, fix any errors, and verify in the browser before moving on. Stop only when the Acceptance Checklist at the bottom passes.

---

## 1. Product

**Daybook** is a premium, multi-user daily diary web app. Users record how each day went, browse everything through a calendar, attach videos / photos / documents to each day, and build writing streaks.

### Core features
1. **Auth**: register and login with **email + password only** (JWT). Extra details are collected later in the Profile section.
2. **Calendar home**: a month grid. **Today is visibly highlighted** (glowing ring). Days that have an entry show a dot / mood color. Month navigation with smooth animation.
3. **Day page**: clicking any date opens that date's diary page (`/day/YYYY-MM-DD`). Shows and edits the diary text, mood, and all attachments for that day. Clicking a future date is allowed to open but shows a subtle "future" state; entries can only be created for today and past dates.
4. **Media and files**: upload videos, photos, PDFs, and any other file. Display in separate sections on the day page: **Videos** (inline player), **Photos** (gallery grid with lightbox), **Documents & Files** (cards with icon, name, size, download/preview).
5. **Streaks**: current streak, longest streak, total entries, entries this month. Shown on the dashboard and profile.
6. **Profile**: name, avatar, bio, timezone, optional extras. Editable. Also change password and delete account.
7. **Multi-user**: thousands of users; every query is strictly scoped to the authenticated user's ID.

---

## 2. Tech Stack (fixed, do not substitute)

**Backend**
- Java 21, Spring Boot 3.x, Maven
- Spring Web, Spring Security (stateless JWT), Spring Data JPA, Validation
- MySQL 8 (production on Aiven, requires SSL)
- jjwt for JWT, BCrypt for passwords
- **Do NOT use Lombok anywhere.** Write explicit constructors, getters, and setters in every model and DTO.
- **CORS is configured inside `SecurityConfig`**, not in a separate config class.
- Cloudinary for file storage (browser uploads directly using a signed request from the backend)

**Frontend**
- React 18+ with Vite and TypeScript
- Tailwind CSS + shadcn/ui components
- React Router, TanStack Query, Axios
- Motion (Framer Motion) for UI animation
- date-fns for dates
- TipTap for the rich-text diary editor
- GSAP + Lenis for the landing page scroll effects
- React Three Fiber + drei for ONE lightweight 3D hero on the landing/login page (lazy-loaded, disabled on low-power/mobile devices, respects `prefers-reduced-motion`)
- lucide-react icons

**Deployment targets**: frontend on Vercel, backend on Render (Dockerfile), MySQL on Aiven, files on Cloudinary.

---

## 3. Repository Layout

```
daybook/
├── PROJECT_SPEC.md
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/daybook/
│       ├── DaybookApplication.java
│       ├── config/        (SecurityConfig, CloudinaryProperties)
│       ├── security/      (JwtService, JwtAuthFilter, UserDetailsServiceImpl)
│       ├── model/         (User, Profile, DiaryEntry, MediaAttachment, RefreshToken)
│       ├── repository/
│       ├── dto/
│       ├── service/       (AuthService, EntryService, MediaService, StreakService, ProfileService)
│       ├── controller/    (AuthController, EntryController, MediaController, StreakController, ProfileController)
│       └── exception/     (GlobalExceptionHandler + custom exceptions)
└── frontend/
    ├── package.json, vite.config.ts, tailwind config, vercel.json
    └── src/
        ├── api/           (axios client with token refresh interceptor)
        ├── auth/          (AuthContext, ProtectedRoute)
        ├── components/    (ui/, calendar/, diary/, media/, streak/, layout/)
        ├── pages/         (Landing, Login, Register, Dashboard, Day, Profile, NotFound)
        ├── hooks/, lib/, styles/
        └── main.tsx, App.tsx
```

---

## 4. Database Schema (MySQL)

Use JPA entities with `ddl-auto=update` for first run; also provide `schema.sql` for reference.

**users**
- id BIGINT PK auto
- email VARCHAR(255) UNIQUE NOT NULL
- password_hash VARCHAR(255) NOT NULL
- created_at, updated_at DATETIME

**profiles** (1:1 with users, created empty at registration)
- id, user_id FK UNIQUE
- display_name, bio TEXT, avatar_url, timezone (default `UTC`), date_of_birth (nullable), location (nullable)

**diary_entries**
- id, user_id FK NOT NULL
- entry_date DATE NOT NULL
- title VARCHAR(200)
- content LONGTEXT (TipTap HTML)
- mood VARCHAR(20) (e.g. GREAT, GOOD, OKAY, LOW, BAD) nullable
- created_at, updated_at
- **UNIQUE (user_id, entry_date)** and index on (user_id, entry_date)

**media_attachments**
- id, entry_id FK (ON DELETE CASCADE), user_id FK
- type ENUM(VIDEO, IMAGE, DOCUMENT, OTHER)
- url VARCHAR(1000), public_id VARCHAR(500), resource_type VARCHAR(20)
- file_name, mime_type, size_bytes BIGINT
- created_at

**refresh_tokens**
- id, user_id FK, token_hash, expires_at, revoked BOOLEAN

---

## 5. REST API

All under `/api`. All except `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh` require `Authorization: Bearer <accessToken>`.

**Auth**
- `POST /api/auth/register` `{email, password}` → tokens + user
- `POST /api/auth/login` `{email, password}` → tokens + user
- `POST /api/auth/refresh` `{refreshToken}` → new access token (rotate refresh token)
- `POST /api/auth/logout`
- `PUT /api/auth/password` `{currentPassword, newPassword}`

**Entries**
- `GET /api/entries?year=YYYY&month=MM` → lightweight list for the calendar (date, mood, hasMedia, id)
- `GET /api/entries/{date}` → full entry + attachments (404-style empty response if none)
- `PUT /api/entries/{date}` `{title, content, mood}` → create or update (upsert). Reject future dates.
- `DELETE /api/entries/{date}`

**Media**
- `GET /api/media/signature?type=video|image|raw` → Cloudinary signed upload params (timestamp, signature, apiKey, cloudName, folder `daybook/{userId}`)
- `POST /api/entries/{date}/media` `{url, publicId, resourceType, fileName, mimeType, sizeBytes}` → save metadata after browser upload (creates the entry if it doesn't exist)
- `DELETE /api/media/{id}` → delete DB row and Cloudinary asset

**Streaks**
- `GET /api/streaks` → `{currentStreak, longestStreak, totalEntries, entriesThisMonth, wroteToday}`

**Profile**
- `GET /api/profile`, `PUT /api/profile`, `DELETE /api/account`

Errors use a consistent JSON shape `{timestamp, status, error, message, path}` from a `GlobalExceptionHandler`.

---

## 6. Business Rules

**Streak logic** (StreakService)
- Use the user's profile timezone to determine "today".
- Fetch the user's distinct entry dates (sorted desc).
- **Current streak**: count of consecutive days ending **today**; if no entry today but there is one yesterday, the streak is still alive and counts back from yesterday; otherwise 0.
- **Longest streak**: longest run of consecutive dates ever.
- An entry counts if it has non-empty content OR at least one attachment.

**Security**
- BCrypt (strength 12) for passwords; access token 15 min, refresh token 14 days, stored hashed.
- Every repository query includes the authenticated `userId`. Never trust an ID from the client to access another user's data.
- Password rules: min 8 chars. Rate-limit login attempts (simple in-memory bucket per IP is enough).
- Validate uploads: allow up to 500 MB for video, 25 MB for images, 50 MB for other files (enforced client-side and by the Cloudinary signature params where possible).
- Config from environment variables only; no secrets in the repo.

---

## 7. Frontend Pages and Behavior

**Landing** (`/`): full-viewport hero with the lazy-loaded 3D/shader background, large headline, "Get started" and "Log in" buttons, a few scroll-triggered feature sections (GSAP + Lenis). Keep it fast.

**Login / Register**: centered glass card over the animated background, inline validation, clear error messages.

**Dashboard** (`/app`): 
- Left/top: streak cards (current streak with a flame icon, longest, total, this month), animated count-up.
- Main: **month calendar**. Today has a glowing accent ring and slightly raised style. Days with entries show a mood-colored dot. Hover shows a small preview (title). Click → `/day/YYYY-MM-DD`. Prev/next month with a slide animation; a "Today" button.

**Day page** (`/day/:date`):
- Header with the formatted date, prev/next day arrows, back to calendar.
- Title input, mood selector (5 emoji-style options), TipTap editor with autosave (debounced, with a "Saved" indicator).
- **Media sections** below, each with its own heading and count:
  - **Videos**: drag-and-drop zone + grid of video players
  - **Photos**: drag-and-drop + masonry/grid gallery with lightbox
  - **Documents & Files**: drag-and-drop + list of cards (icon by type, name, size, open/download, delete)
- Upload progress bars, cancel support, and optimistic UI. Delete with confirm dialog.

**Profile** (`/profile`): avatar upload, display name, bio, timezone select, optional fields, change password, delete account (double confirm).

Route protection: unauthenticated users go to `/login`; authenticated users hitting `/login` go to `/app`.

---

## 8. Design System (premium, dark-first)

- **Theme**: dark by default (near-black background `#0B0B12`, surfaces `#12121C` / `#181826`), optional light theme toggle.
- **Accent**: violet → indigo gradient (`#8B5CF6` → `#6366F1`), **gold `#F5B94A`** reserved for streak/flame highlights.
- **Mood colors**: green, teal, amber, orange, red-rose (muted, not neon).
- **Typography**: Inter (UI) + a refined display font such as "Fraunces" or "Instrument Serif" for headings and dates. Tight tracking on headings.
- **Surfaces**: subtle glassmorphism (blur + 1px translucent border), soft layered shadows, faint noise/grain overlay, large radii (16–24px).
- **Motion**: 150–300 ms ease-out micro-interactions; spring transitions between pages; staggered reveals; calendar month slide; count-up on streaks. Everything respects `prefers-reduced-motion`.
- **Layout**: fully responsive (mobile first); calendar collapses gracefully on small screens; generous whitespace.
- **Quality bar**: consistent spacing scale, visible focus states, accessible contrast, skeleton loaders instead of spinners, thoughtful empty states ("Nothing written yet — how was your day?"), toast notifications, no layout shift.
- Clean, minimal, professional. No clutter and no rainbow colors.

---

## 9. Environment Variables

**Backend (`application.properties` reads from env)**
```
PORT=8080
DB_URL=jdbc:mysql://localhost:3306/daybook?sslMode=PREFERRED&serverTimezone=UTC
DB_USER=root
DB_PASSWORD=
JWT_SECRET=<long random 64+ char string>
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ALLOWED_ORIGINS=http://localhost:5173
```
For Aiven, the URL uses their host/port with `sslMode=REQUIRED`.

**Frontend (`.env`)**
```
VITE_API_URL=http://localhost:8080/api
```

Provide `.env.example` files for both.

---

## 10. Deployment Files to Generate

- `backend/Dockerfile`: multi-stage (Maven build → slim JRE 21 runtime), `server.port=${PORT:8080}`, container-friendly JVM flags (`-XX:MaxRAMPercentage=75`).
- `backend` health endpoint `GET /api/health` (public) for uptime pings.
- `frontend/vercel.json` with the SPA rewrite to `/index.html`.
- `README.md` with local run steps and deploy steps for Vercel, Render, and Aiven.

---

## 11. Build Phases (execute all, in order, without stopping)

1. **Backend foundation**: project, entities, repositories, security (JWT, CORS in SecurityConfig), auth endpoints, exception handling, health endpoint. Run and test with sample requests.
2. **Backend features**: entries upsert, calendar list, media signature + metadata endpoints, streak service, profile endpoints. Write basic tests for streak logic and user data isolation.
3. **Frontend foundation**: Vite + Tailwind + shadcn setup, design tokens, layout, axios client with refresh interceptor, auth context, login/register pages.
4. **Calendar dashboard**: calendar component, today highlight, mood dots, month navigation, streak cards.
5. **Day page**: editor with autosave, mood selector, Cloudinary direct upload, Videos / Photos / Documents sections, lightbox, delete flows.
6. **Profile and landing**: profile page, landing page with the lazy-loaded 3D hero and scroll effects.
7. **Polish**: animations, skeletons, empty and error states, responsiveness, accessibility, reduced-motion handling, performance pass (code-split the 3D bundle).
8. **Docs and deploy files**: Dockerfile, vercel.json, README, `.env.example` files.

---

## 12. Acceptance Checklist (do not finish until all pass)

- [ ] Register, login, logout, and token refresh work; wrong credentials show clear errors
- [ ] Two different users cannot see each other's entries or files (verified)
- [ ] Calendar highlights today; entry days show dots; clicking a date opens that day's page
- [ ] Writing an entry autosaves and appears on reload
- [ ] Uploading a video, a photo, and a PDF each show up in their own section and persist
- [ ] Deleting an attachment removes it from the UI, DB, and Cloudinary
- [ ] Streak numbers are correct for: no entries, today only, consecutive days, a gap, and yesterday-only cases
- [ ] Profile updates persist; password change works
- [ ] Backend builds with `mvn clean package` and the Docker image runs
- [ ] Frontend builds with `npm run build` with no TypeScript errors
- [ ] No Lombok anywhere in the backend
- [ ] UI is dark-themed, responsive on mobile, and smooth with no console errors
