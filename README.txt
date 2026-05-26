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
        Create purchase orders
    Seller
        Create, edit, and soft-delete items
        View users
        Choose a seller type
        Confirm / reject incoming orders
        Can also purchase items from other sellers
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

## Orders
    Buyers can create purchase requests for items
    Sellers can confirm or reject incoming orders

### Order Flow
    Order creation:
        Buyer selects item and amount
        Amount is validated against available stock
        Order is created with PENDING status

    Order confirmation:
        Seller confirms order
        Item stock is decremented
        Order status changes to CONFIRMED
        Email notifications are sent to buyer and seller

    Order rejection:
        Seller rejects order
        Order status changes to REJECTED

### Order Rules
    Users cannot purchase their own items
    Only order owner seller can confirm/reject orders
    Only pending orders can be confirmed/rejected
    Banned or deleted users cannot interact with orders

## Moderation
    Automatic moderation system:
        1st offense → user is flagged
        2nd offense → user is banned

### Flagged Users
    Receive warning email
    Remain able to use platform features

### Banned Users
    Tokens are invalidated automatically
    Cannot authenticate or access protected endpoints
    Cannot create/edit items or interact with orders

### Manual Moderation
    Managers/admins can:
        Ban / unban users
        Flag / unflag users
        Soft-delete entities

## Email System
    Users receive emails when:
        Flagged
        Banned
        Order is confirmed

    Users can request:
        Unban
        Data restoration

    Requests are sent to all managers

## Data
    Core entities:
        Users
        Items
        Orders
        Tokens

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
