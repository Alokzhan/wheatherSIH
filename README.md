# 🌩️ StormTrace AI
**3D Pan-India GIS Engine & Extreme Weather Forecaster**

![StormTrace AI](https://img.shields.io/badge/Status-Hackathon_Ready-success?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=Mapbox&logoColor=white)

StormTrace AI is a full-stack, AI-powered extreme weather tracking and hyperlocal alert dispatch system. Designed for disaster officers and emergency responders, it provides early warnings by downscaling coarse global weather predictions (NWP) to a hyperlocal resolution and evaluating them against historical climatology.

## 🚀 Key Features

* **🌍 3D Pan-India GIS Dashboard**: A fully responsive React-based interface utilizing Mapbox GL JS to render real-time weather layers, terrain, and tracking data in an immersive 3D environment.
* **📈 Extreme Forecast Index (EFI)**: A lightweight, `SciPy`-based statistical anomaly engine that compares current precipitation forecasts against a 30-year climatological percentile rank to flag unprecedented weather anomalies.
* **🧠 AI-Powered Downscaling**: Leverages PyTorch-driven logic (simulated/optimized for the demo) to downscale 12km coarse grids to a 5km hyperlocal resolution while preserving extreme weather peaks.
* **🚨 Automated Rule-Engine & Alerts**: A robust Python rule-engine that triggers critical disaster alerts when multi-hazard combinations (e.g., Extreme Rainfall + High Vulnerability Index) cross predefined thresholds.
* **📱 Mobile Responsive UI**: Modern glassmorphism UI with sidebars, mobile drawers, and dark/light modes built with Tailwind CSS.

---

## 🛠️ Technology Stack

**Frontend**
* React 18 (Vite)
* TypeScript
* Tailwind CSS 
* Mapbox GL JS & Lucide Icons

**Backend**
* Python (FastAPI)
* PyTorch & SciPy (Machine Learning & Statistics)
* NumPy (Grid Data Processing)
* Uvicorn (ASGI Server)

---

## ⚙️ How to Run Locally

To run this project locally, you will need two separate terminal windows.

### 1. Environment Setup
Create a `.env` file in the root directory (where `package.json` exists) for frontend Mapbox configuration:
```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

Create a `.env` file inside the `backend/` directory for backend secrets:
```env
OWM_KEY=your_openweathermap_api_key
MAPBOX_TOKEN=your_mapbox_token
# Note: In the codebase, API keys are securely proxied.
```

### 2. Start the Backend API
Open your first terminal and run the FastAPI server:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --port 8000
```
*The backend will be available at `http://localhost:8000` and API docs at `http://localhost:8000/docs`.*

### 3. Start the Frontend Application
Open a second terminal and run the React frontend:
```bash
npm install
npm run dev
```
*The app will launch at `http://localhost:5173`. Open this URL in your browser to interact with the 3D map.*

### 4. Run the Real-time Pipeline Demo
To simulate the entire EFI and AI downscaling pipeline independently from the UI:
```bash
python demo.py
```
This script will output the entire pipeline execution log (fetching data -> EFI computation -> PyTorch downscaling -> Dispatching Alert) in your terminal.

---

## 🏗️ Hackathon Specifics

For the purpose of the Smart India Hackathon:
- **GNN/Diffusion Model Note**: Full continuous training of the spherical icosahedral GNN and Diffusion models is highly time-intensive and requires significant compute. For this demo, a lightweight statistical version (`SciPy` implementation) has been developed and integrated in `backend/stage1_gnn/efi_compute.py` which computes anomalies. This ensures the demo is highly stable and works flawlessly in front of judges!
- **Data Source**: Real-world statistical integration logic has been established, avoiding heavy 4.5TB downloads while maintaining pipeline integrity.

---
*Built with ❤️ for Smart India Hackathon*
