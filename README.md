# CobraStore

CobraStore is an advanced multi-vendor marketplace with AI features.

## Tech Stack
- **Backend:** NestJS, PostgreSQL, Redis, Bull Queue, Stripe, Anthropic Claude
- **Frontend:** React, Vite, Tailwind
- **Others:** Docker

## Requirements
- Node 18+
- Docker
- PostgreSQL
- Redis

## Setup Instructions

### 1. استنساخ الريبو
```bash
git clone https://github.com/ahmedyasser1234/cobrastore
```

### 2. تشغيل قاعدة البيانات والـ Redis
```bash
docker-compose up -d
```

### 3. إعداد المتغيرات
```bash
cp .env.example .env
# (عدّل القيم في .env)
```

### 4. تثبيت packages
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. تشغيل الـ migrations
```bash
cd backend && npm run migration:run
```

### 6. تشغيل الـ seed (اختياري)
```bash
POST /seed/run
```

### 7. تشغيل المشروع
```bash
# backend
npm run start:dev

# frontend (تاني terminal)
cd frontend && npm run dev
```

## Ports Configuration
| Service | Port |
|---------|------|
| Backend API | 3005 |
| Frontend | 5173 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Swagger Docs | http://localhost:3005/api |

## Roles
- customer
- vendor
- admin

## AI Features
- chatbot
- fake review detection
- smart search
- price negotiation
- product description generation
- background remover
- auto-translation

## Note on rembg_service.py
This service requires Python 3.9+. You can run it using:
```bash
uvicorn rembg_service:app --port 5001
```
