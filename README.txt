# Villager Marketplace

Full-stack marketplace app (NestJS + React + Prisma + MySQL cloud DB).

---

## Tech Stack

**Backend**
- NestJS
- Prisma
- MySQL (cloud)
- JWT Auth
- Swagger

**Frontend**
- React (Vite)
- React Hook Form + Zod
- MUI
- React Query

---

## Environment (.env)

Create or load `.env` in `/backend`:

DEFAULT_PORT=

JWT_SECRET=
JWT_ACCESS_TOKEN_EXPIRATION_TIME=
JWT_REFRESH_TOKEN_EXPIRATION_TIME=

DATABASE_URL=

MAIL_SERVICE_EMAIL=
MAIL_SERVICE_PASSWORD=

---

## Setup (local)

### Backend
cd backend
npm install
npm run prisma:generate
npm run start:dev

### Frontend
cd frontend
npm install
npm run dev

## Setup (Docker)
docker compose up --build

### Services
Backend: http://localhost:3003
Frontend: http://localhost:5173
Swagger API Docs: http://localhost:3003/docs

### Ports
Backend: 3003
Frontend: 5173