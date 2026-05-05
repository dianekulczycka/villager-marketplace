# Villager Marketplace

------------------------------------------------------------------

## Overview
    This is a marketplace-style application with a role-based system where users can browse, manage, and trade items.

------------------------------------------------------------------

## Authentication
    Users can register and log in
    Uses JWT authentication
    Tokens are stored in cookies (frontend) and in a database table (backend)
    Supports token refresh and invalidation

## Roles & Permissions
    Buyer
        View items and users
        Search, sort, paginate
        Can become a seller
    Seller
        Create, edit, and soft-delete items
        View users
        Choose a seller type
    Manager
        Moderate users and items
        Ban / unban, flag / unflag
        Soft-delete entities
    Admin
        Full control
        Promote users to manager
        Hard delete users/items
        View soft-deleted data

## Items
    Items are created from predefined enums
    Supports search, sorting, filtering, and pagination

## Moderation
    Automatic system:
        1st offense → flagged
        2nd offense → banned
    Manual moderation by managers/admins

## Email System
    Users receive emails when flagged or banned
    Users can request unban or data restoration
    Requests are sent to all managers

## Data
    Core entities: Users, Items, Tokens
    Supports soft and hard deletion
    Access controlled by role

------------------------------------------------------------------

## Tech Stack
    Backend
    - NestJS
    - Prisma
    - MySQL (cloud)
    - JWT Auth
    - Swagger

    Frontend
    - React (Vite)
    - React Hook Form + Zod
    - MUI
    - React Query

------------------------------------------------------------------

## Environment (.env)
Create `.env` based on `.env,.example` or load existing file in `/backend`

------------------------------------------------------------------

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

------------------------------------------------------------------

## Setup (Docker)
docker compose up --build

------------------------------------------------------------------

## Services
Backend: http://localhost:3003
Frontend: http://localhost:5173
Swagger API Docs: http://localhost:3003/docs

------------------------------------------------------------------

## Ports
Backend: 3003
Frontend: 5173

------------------------------------------------------------------
