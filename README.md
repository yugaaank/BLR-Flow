# Gridlock AI Intelligence: Enforcement Command Center

## Project Overview
This project transforms traffic violation logs into an **AI-driven Enforcement Intelligence System**. By shifting from reactive patrols to a **proactive occupation model**, we identify the 6% of junctions that generate 50% of the city's parking friction.

### The "10-50 Rule"
Our analysis reveals that just **10 junctions** generate **49.29%** of all junction-based violations. By "occupying" these nodes, enforcement impact is multiplied by 50x.

---

## 🛠 Tech Stack
*   **Backend:** FastAPI (Python) + Scikit-Learn (K-Means Clustering).
*   **Frontend:** React + Tailwind CSS + Recharts (Interactive Analytics).
*   **Deployment:** Render (Backend) & Vercel (Frontend).

---

## 🚀 Deployment Guide

### Backend (Render)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repo.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `pip install -r requirements.txt`.
5. Set **Start Command** to `uvicorn main:app --host 0.0.0.0 --port 10000`.

### Frontend (Vercel)
1. Create a new Project on Vercel.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable: `VITE_API_URL` = (Your live Render URL).
4. Deploy.

---

## 💻 Local Development

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python3 main.py
```
Backend will run at `http://localhost:8000`.

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at `http://localhost:5173`.

---

## 🧠 AI Intelligence Layer
We use **Unsupervised K-Means Clustering** to categorize junctions into four operational roles:
*   **Volume Engines:** High-frequency targets for permanent presence.
*   **Complexity Zones:** Targets for road engineering audits (high multi-violation rates).
*   **Operational Risk:** Targets for infrastructure audit (high reporting backlogs).
*   **Routine Monitoring:** Standard patrol zones.

---

## 📊 Statistical Defensibility
*   **Persistence Scoring:** We track junctions across 23 weeks; top hotspots are 100% persistent.
*   **Anomaly Detection:** We use a $\mu + 2\sigma$ threshold to flag station-level reporting failures (e.g., Kodigehalli at 45% backlog).

---

&copy; 2026 Gridlock Intelligence Systems
