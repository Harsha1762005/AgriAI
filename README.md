# AgriAI – Intelligent Crop Recommendation & Farm Analytics Platform

AgriAI is a premium, production-ready, AI-powered Smart Agriculture SaaS platform designed to help farmers make data-driven agricultural decisions. Using advanced Machine Learning, environmental analytics, and real-time simulations, AgriAI provides crop suitability suggestions, tailored fertilizer schedules, yield predictions, weather alerts, and interactive AI chatbot assistance.

---

## 🌟 Key Features

* **AI Crop Recommendation**: Uses a highly trained **Random Forest Classifier (99.7% Accuracy)** to predict optimal crops based on soil macronutrients (Nitrogen, Phosphorus, Potassium) and local microclimate data (Temperature, Humidity, pH, Rainfall).
* **Fertilizer Deficit Analyzer**: Calculates nitrogen, phosphorus, and potassium gaps based on the targeted crop needs and crafts an adaptive replenishment schedule.
* **Yield Forecasting**: Integrates climate, area, and soil quality modifiers to project crop tonnage, gross market revenues, and net farm ROI.
* **Weather Forecast Center**: Real-time simulation of meteorological indicators (UV Index, Soil Moisture, Wind speed, Rainfall probability) customized across different regional terrains.
* **Analytics Dashboard**: Dynamic charts displaying recommendation history distributions, user registrations, and metrics audits.
* **AI Agrobot Chatbot**: A responsive, contextual farming assistant offering instant answers to crop cultivation, pest control, and soil management queries.
* **Admin Control Panel**: Full management interface allowing administrators to edit the crop database catalog (CRUD) and manage system users.
* **Local-First Poly Database**: Seamless polymorphism allowing local-first executions with file persistence (`localdb.json`) while supporting production MongoDB Atlas configurations without any code updates.

---

## 🏗️ Project Architecture

The workspace is organized as a clean, decoupled monorepo:

```
AgriAI/
├── ml-service/          # Python Flask microservice (Scikit-Learn Random Forest)
├── backend/             # Node.js + TypeScript + Express server (Seeded Local/Atlas DB)
├── frontend/            # React + Vite + TypeScript + Tailwind CSS v4 dashboard
├── run-all.js           # Multi-process orchestrator script (Windows/Mac/Linux)
└── package.json         # Root package file mapping dev scripts
```

---

## 🚀 Getting Started (Quick Run)

A root orchestrator is provided to download, coordinate, and run all 3 services concurrently:

1. Ensure **Node.js** (v18+) and **Python 3.11** are installed on your machine.
2. In the root directory, start the platform services:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to **`http://localhost:5173`**.

### Default Seed Logins:
* **Farmer Account**:
  * **Email**: `farmer@agriai.com`
  * **Password**: `farmer123`
* **Admin Control Account**:
  * **Email**: `admin@agriai.com`
  * **Password**: `adminpassword123`

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Registers a new farmer profile.
* `POST /api/auth/login` - Authenticates user and returns JWT access token.
* `GET /api/auth/profile` - Fetches active profile metadata.
* `PUT /api/auth/profile` - Updates personal data, coordinates, and avatar.

### Predictions & Diagnostics (`/api/crop`, `/api/fertilizer`, `/api/yield`)
* `POST /api/crop/predict` - Contacts ML service for recommendation.
* `POST /api/fertilizer/recommend` - Runs nitrogen, phosphorus, and potassium target gap calculations.
* `POST /api/yield/predict` - Calculates harvest estimates and ROI metrics.

### System Control & History (`/api/history`, `/api/admin`)
* `GET /api/history/predictions` - Retrieves historical diagnostic audits.
* `GET /api/admin/users` - Fetches user listings (Admin only).
* `GET /api/admin/analytics` - Pulls platform-wide usage metrics (Admin only).
* `POST /api/admin/crops` - Registers new crop metadata catalog entries.

---

## 📦 Production Deployment Guide

### 1. Database (MongoDB Atlas)
Rename `.env.example` in `backend/.env` and replace `MONGODB_URI` with your MongoDB Atlas connection string. The server will automatically migrate from the local JSON database to your cluster on reboot.

### 2. Python ML Microservice (WSGI)
For production environments, run the Flask backend using a robust WSGI HTTP server such as `gunicorn`:
```bash
cd ml-service
pip install gunicorn
gunicorn --bind 0.0.0.0:5001 app:app
```

### 3. Backend (PM2 Daemon)
Compile TypeScript and host the server daemon with PM2:
```bash
cd backend
npm run build
npm install -g pm2
pm2 start dist/server.js --name "agriai-backend"
```

### 4. Frontend (Vite Static Hosting)
Generate the optimized production build bundle:
```bash
cd frontend
npm run build
```
Deploy the resulting static build output (`frontend/dist/`) to premium CDN hosts such as Vercel, Netlify, or AWS S3.
