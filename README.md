# CobraStore

CobraStore is an advanced multi-vendor marketplace with an integrated AI chatbot, background removal for products, and extensive admin/vendor dashboards.

## Architecture
- **Backend:** NestJS, TypeORM, PostgreSQL, Redis (Bull Queue)
- **Frontend:** React (Vite), TailwindCSS, Zustand
- **AI Services:** Anthropic API for chatbots and smart categorization, Rembg for background removal.

## Setup Instructions

### 1. Environment Variables
Copy the `.env.example` files to `.env` in the root, backend, and frontend directories, and fill in the required keys.
- **Root/Backend:** Requires PostgreSQL credentials, Stripe keys, JWT secrets, and `ANTHROPIC_API_KEY`.
- **Frontend:** Requires `VITE_API_URL` and `VITE_STRIPE_PUBLISHABLE_KEY`.

### 2. Services Configuration
Ensure Docker is installed to run the required services (PostgreSQL, Redis, Rembg).
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run build

# Run migrations
npm run migration:run

# (Optional) Seed the database
npm run seed

# Start the server (Port 3005)
npm run start:dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Start the development server (Port 5173)
npm run dev
```

### 5. Services Details
- **Backend API:** `http://localhost:3005`
- **Frontend App:** `http://localhost:5173`
- **AI Background Removal:** `http://localhost:5001` (Docker service)
- **Postgres:** `5432`
- **Redis:** `6379`
