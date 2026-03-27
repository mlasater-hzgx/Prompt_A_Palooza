# Incident Investigation & Corrective Action System

## Project Structure
- `backend/` - Node.js/Express API with Prisma ORM
- `frontend/` - React + Vite SPA

## Tech Stack
- **Backend**: TypeScript, Express, Prisma, PostgreSQL, Zod
- **Frontend**: TypeScript, React 19, Vite, MUI v6, TanStack Query, Zustand, React Hook Form
- **Auth**: Azure AD via passport-azure-ad (backend) and @azure/msal-react (frontend)

## Commands
- `docker-compose up -d` - Start PostgreSQL
- `npm run dev` - Start both backend and frontend in dev mode
- `npm run dev -w backend` - Start backend only
- `npm run dev -w frontend` - Start frontend only
- `npm run db:migrate -w backend` - Run Prisma migrations
- `npm run db:seed -w backend` - Seed the database
- `npm run test` - Run all tests
- `npm run lint` - Lint all code

## Conventions
- All code is TypeScript with strict mode
- Backend follows route → controller → service → Prisma pattern
- Frontend uses feature-sliced architecture (features/incidents/, features/capa/, etc.)
- Forms use React Hook Form + Zod validation
- Server state managed by TanStack Query, UI state by Zustand
- Branding follows Herzog UI Brand System (see herzog-branding SKILL 1 1.md)
- All API responses use envelope: { success, data, meta, errors }
- Database columns use snake_case, TypeScript uses camelCase
- Medical data fields are encrypted at the application layer
