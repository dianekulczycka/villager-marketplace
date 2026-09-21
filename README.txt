# Villager Marketplace

------------------------------------------------------------------

## Overview
This is a marketplace-style application with a role-based system where users can browse, manage, and trade items.

The application also supports:

* Real-time user-to-user chat
* Cloudinary-hosted images and user avatars
* Public 8-character hexadecimal IDs for entities
* Password confirmation for destructive actions
* Request logging with user and request metadata

------------------------------------------------------------------

## Authentication
Users can register and log in
Uses JWT authentication
Tokens are stored in cookies (frontend) and in a database table (backend)
Supports token refresh and invalidation
Destructive actions require re-entering the authenticated user's password

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
Hard delete users and related entities (messages, orders, items, tokens)
View soft-deleted data

## Items
Items are created from predefined enums
Supports search, sorting, filtering, and pagination
Sellers are restricted to item types allowed by their seller type
Item views are tracked
Items support soft deletion while preserving relevant historical data

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
Soft-deleting an item rejects its pending orders while preserving order history

## Public IDs
Public-facing entities use unique 8-character hexadecimal `publicId` values instead of exposing database
auto-increment IDs.

Internal numeric IDs are still used for database relations, while public IDs are used in:

* API responses
* Routes
* Entity lookups exposed to the frontend
* User, item, and order references

## User Profiles & Images
Users can update their profile information and change their avatar.

Images are uploaded to Cloudinary, with the resulting secure image URL stored in the database rather than storing image
files directly on the application server.

## Real-Time Chat
Users can communicate through a persistent one-to-one chat system.

### Backend

* Messages are stored in a dedicated `message` database table
* Chat history is persisted in the database
* Messages track sender, recipient, creation time, and read status
* Unread messages are tracked per conversation
* A WebSocket Gateway handles real-time communication
* Socket.IO is used for WebSocket communication
* Opening a chat marks the relevant messages as read

### Chat Flow

```
   User opens a chat with another user
   Frontend establishes a WebSocket connection
   `openChat` event identifies the other user
   Backend marks unread messages as read
   Messages are sent through WebSocket events
   New messages are persisted in the database
   Recipient receives the message in real time
```

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

## Request Logging
Backend requests are logged with metadata including HTTP method, URL, status code, timestamp, duration,
authenticated user ID, role, and IP address.

## Data
Core entities:
Users
Items
Orders
Messages
Tokens

Supports soft and hard deletion
Access controlled by role
Database relations use internal IDs while public APIs use unique public IDs

------------------------------------------------------------------

## Tech Stack
Backend

* NestJS
* Prisma
* MySQL (cloud)
* JWT Auth
* WebSockets / Socket.IO
* Swagger
* Cloudinary

Frontend

* React (Vite)
* React Hook Form + Zod
* MUI
* React Query
* Socket.IO Client

Infrastructure

* Docker / Docker Compose
* Nginx
* AWS Elastic Beanstalk

------------------------------------------------------------------

## Environment (.env)
Create `.env` based on `.env.example` or load existing file in `/backend`

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
Backend: [http://localhost:3003]
Frontend: [http://localhost:5173]
Swagger API Docs: [http://localhost:3003/docs]

------------------------------------------------------------------

## Ports
Backend: 3003
Frontend: 5173
WebSocket Gateway: 3004

In production, the frontend/Nginx proxies API requests and WebSocket connections to the backend through the same host.

------------------------------------------------------------------
