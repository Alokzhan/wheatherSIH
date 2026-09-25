# 🌩️ StormTrace AI
### **Automated 4D EPS Anomaly Tracking & 5km Diffusion Downscaling Pipeline**
*SIH Problem Statement SIH26078: Extreme Weather Anomaly Tracking and Hyperlocal Impact Downscaling*

![StormTrace AI](https://img.shields.io/badge/Status-Hackathon_Production_Ready-success?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Mapbox 3D](https://img.shields.io/badge/Mapbox_3D-000000?style=for-the-badge&logo=mapbox&logoColor=white)

---

## 📌 Executive Summary & Problem Context
In medium-range Numerical Weather Prediction (3 to 10 days), global 12 km Ensemble Prediction Systems (EPS)—such as NCMRWF NEPS-G and NCUM—generate massive 4D arrays. Manually sifting through these outputs to identify and track severe anomalies (cloudbursts, cyclones, heat domes) is computationally intensive.

Standard deep learning models (e.g. traditional CNNs or U-Nets) suffer from **spectral smoothing**—they average out spatial data, erasing the extreme peak amplitudes of rainfall or wind speed that forecasters critically need.

**StormTrace AI** solves this with a two-stage hybrid AI paradigm:
1. **Stage 1 (Spherical GNN Anomaly Tracker)**: Maps atmospheric variables onto a spherical icosahedral mesh to isolate moving anomalies and predict 3-to-10 day spatio-temporal trajectories ($T+0$ to $T+240$).
2. **Stage 2 (Amplitude-Preserving Generative Diffusion)**: Downscales 12 km NWP grids to a **hyperlocal 5 km subgrid** via conditional diffusion (DDPM/DDIM) without peak blurring.
3. **Physics-Informed Loss Constraints**: Embedded fluid dynamics laws (**Mass Conservation, Moisture Flux Convergence, Thermodynamic Energy, and Vorticity Dynamics**) penalize physically impossible states.
4. **Hyperlocal 5 km NDRF Alert Radius & Farmer Advisory**: Translates 5 km centroid arrays into categorized spatial alerts (Low, Moderate, Severe, Critical) and actionable agricultural guidance.

---

## 🏗️ 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Data_Layer ["1. Data Ingestion & Reanalysis Layer"]
        A1["NCMRWF NEPS-G / NCUM 12km NWP Arrays"]
        A2["ERA5 30-Year Climatology Reanalysis"]
        A3["RainViewer Live Doppler Radar Tile Cache"]
    end

    subgraph Stage1_GNN ["2. Stage 1: Anomaly Detection & Spherical GNN Tracking"]
        B1["Data Wrangling & Preprocessing (data_pipeline.py)"]
        B2["SciPy EFI Integral Anomaly Solver (efi_compute.py)"]
        B3["PyTorch Spherical GNN Icosahedral Mesh (gnn_model.py)"]
        B4["4D Bounding Box & 3-10 Day Trajectory Cones (T+0 to T+240)"]
    end

    subgraph Stage2_Diffusion ["3. Stage 2: Amplitude-Preserving Generative Diffusion"]
        C1["PyTorch Conditional DDPM/DDIM Downscaler (ddpm.py)"]
        C2["12km -> 5km Subgrid Matrix Expansion"]
        C3["Physics-Informed Loss Laws (Mass, Moisture, Energy, Vorticity)"]
        C4["Quantitative Verification & Peak Preservation (evaluation_metrics.py)"]
    end

    subgraph Backend_Services ["4. FastAPI Backend & Persistence Layer"]
        D1["FastAPI ASGI Router (api/main.py)"]
        D2["SQLite User & Auth DB (backend/data/stormtrace.db)"]
        D3["REST Endpoints (/gnn-track, /inference, /radar, /auth, /advisory)"]
    end

    subgraph Frontend_UI ["5. 3D GIS Visualization & Dispatch Layer"]
        E1["React 19 + Mapbox GL 3D Globe Engine (LiveRiskMap.tsx)"]
        E2["5km Downscaled Rainfall Isohyet Field Overlay"]
        E3["NDRF 5km Radius Alert & Command Room (AlertCenter.tsx)"]
        E4["Dynamic Agricultural Advisory Engine (FarmerAdvisory.tsx)"]
        E5["Split-Screen Authentication Hub (AuthPage.tsx)"]
    end

    A1 --> B1
    A2 --> B2
    A3 --> E1
    B1 --> B2
    B2 -->|EFI >= 0.65 Anomaly Trigger| B3
    B3 --> B4
    B4 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> D1
    D2 <--> D1
    D1 --> E1
    D1 --> E3
    D1 --> E4
    D1 --> E5
```

---

## 🔄 2. Data Flow Diagram (DFD Level-1)

```mermaid
sequenceDiagram
    autonumber
    participant NWP as 12km NWP Stream
    participant D_Pipeline as NWP Data Pipeline
    participant Stage1 as Stage-1 GNN Anomaly Tracker
    participant Stage2 as Stage-2 Diffusion Downscaler
    participant Physics as Physics Loss Engine
    participant API as FastAPI Router
    participant GIS as 3D GIS Dashboard
    participant Alert as NDRF & Farmer Advisory

    NWP->>D_Pipeline: Ingest 4D Weather Grid (Rain, Wind, Temp, Pressure)
    D_Pipeline->>Stage1: Compare 50-member Ensemble against ERA5 30-Yr Baseline
    Stage1->>Stage1: Calculate Extreme Forecast Index (EFI) Integral
    alt EFI >= 0.65 Anomaly Detected
        Stage1->>Stage1: Run Spherical GNN Mesh Trajectory (T+0 to T+240)
        Stage1->>Stage2: Pass Cropped 4D Anomaly Bounding Box
        Stage2->>Stage2: Conditional DDPM Downscaling (12km -> 5km)
        Stage2->>Physics: Enforce Mass, Moisture, Energy & Vorticity Laws
        Physics-->>Stage2: Return Penalized Gradients & Preserve Peak Amplitudes
        Stage2->>API: Output 5km Downscaled Grid & Verification Scores
        API->>GIS: Render 5km Isohyet Overlay & 3D Extruded Grid
        API->>Alert: Calculate Risk (Intensity * Prob * Exposure) & Issue 5km Spatial Warning
    else EFI < 0.65 Normal Weather
        Stage1->>API: Return Standard Climatological Field
        API->>GIS: Display Baseline Map Layer
    end
```

---

## 🏛️ 3. Pipeline Processing Flow Architecture

```text
       NWP / EPS Data (12 km Grid)
                  │
                  ▼
      ┌──────────────────────┐
      │   Stage 1: GNN +     │
      │  EFI Anomaly Engine  │
      └──────────┬───────────┘
                 │
        4D Bounding Box &
      3-10 Day Trajectory
                 │
                 ▼
      ┌──────────────────────┐
      │  Stage 2: Generative │
      │  Diffusion (12->5km) │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │  Physics Constraints │
      │  Mass / Moisture /   │
      │  Energy / Vorticity  │
      └──────────┬───────────┘
                 │
                 ▼
       5 km Hyperlocal Threat Map
                 │
        ┌────────┴────────┐
        ▼                 ▼
   NDRF Alerts     Farmer Advisory
        │                 │
        └────────┬────────┘
                 ▼
      3D Pan-India GIS Dashboard
```

---

## 🌟 Actual Codebase Implementation & Key Modules

### 💻 Frontend Architecture (`src/`)
* **`LiveRiskMap.tsx`**: Interactive 3D Pan-India GIS Map engine built with Mapbox GL 3D globe / Carto GL fallback. Features live precipitation Doppler radar tiles (`/api/v1/tiles/radar/{z}/{x}/{y}`), downscaled 5km rainfall isohyets across India, 3D extruded risk grids, and animated 4D trajectory lines ($T+0$ to $T+240$).
* **`AuthPage.tsx`**: Split-screen authentication card matching SIH UI specifications. Supports Sign In, Sign Up, Google SSO, Govt. SSO (NDMA/IMD), and 1-Click Evaluator Demo Access.
* **`AiModelHub.tsx`**: Technical model deep-dive showcasing 4D GNN tracking, explicit physics loss law breakdown, and a **Side-by-Side Peak Rainfall Comparison Table** (Original 12km vs Standard Interpolation vs StormTrace DDPM 5km).
* **`LocalityExplorer.tsx` & `LocationRisk.tsx`**: Hyperlocal 5km weather inspection with flood vulnerability index, DEM terrain elevation, and live Scipy EFI exceedance calculations.
* **`AlertCenter.tsx` & `DisasterDashboard.tsx`**: Emergency Operations Command Room with officer alert acknowledgement workflow and NDRF battalion dispatch management.
* **`FarmerAdvisory.tsx`**: Dynamic agricultural guidance (Paddy, Wheat, Sugarcane, Cotton) for upcoming extreme events.
* **`HistoricalAnalysis.tsx`**: Case study evaluations (Cyclone Amphan, North India Heatwave, Mumbai Inundation).

### ⚡ Backend Architecture (`backend/`)
* **`api/main.py`**: Production FastAPI server with CORS, proxy tile streaming, SQLite DB authentication, and model inference endpoints.
* **`data_pipeline.py`**: `NWPDataPipeline` using NumPy and Xarray logic to process 12km NWP variables (`rain_mm_24h`, `u_wind`, `v_wind`, `temperature`, `pressure`, `humidity`) and ERA5 30-year climatology baselines.
* **`stage1_gnn/`**:
  * `efi_compute.py`: Analytical integral solver computing Extreme Forecast Index against 30-year ERA5 baseline and generating 4D spatio-temporal bounding boxes.
  * `gnn_model.py`: PyTorch Graph Attention Layers (`SphericalGNN`, `GraphAttentionLayer`) and trajectory predictor outputting 3-10 day vectors ($T+0$ to $T+240$).
* **`stage2_diffusion/`**:
  * `ddpm.py`: PyTorch `ConditionalDDPMDownscaler` and `NativeUNetDownscaler` performing 12km $\rightarrow$ 5km downscaling.
  * `physics_loss.py`: Multi-objective physics loss module calculating Mass Conservation, Moisture Flux, Energy, and Vorticity penalties.
  * `evaluation_metrics.py`: Computes quantitative extreme-value preservation and verification scores (RMSE, MAE, POD, FAR, CSI).
* **`data/stormtrace.db`**: Persistent SQLite database storing user accounts with SHA-256 password hashing.

---

## 🗄️ Pre-Seeded Evaluator Demo Accounts (SQLite DB)

For judge testing during hackathon presentations, one-click demo accounts are pre-loaded:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **NDRF Operations Chief** | `rajesh.sharma@ndrf.gov.in` | `ndrf123` | NDRF 9th Battalion (Kosi Basin) |
| **Farmer Representative** | `gurdeep.krishi@agri.in` | `kisan123` | Kisan Samiti & Crop Protection Cell |
| **Climate Researcher** | `ananya.roy@meteorology.org` | `research123` | Indian Institute of Tropical Meteorology |

---

## 🔌 API Endpoint Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Backend status & PyTorch / SQLite health diagnostic |
| `POST` | `/api/v1/auth/signup` | Registers new user into SQLite database |
| `POST` | `/api/v1/auth/login` | Authenticates email & password hash against SQLite DB |
| `GET` | `/api/v1/tiles/radar/{z}/{x}/{y}` | Live Pan-India precipitation Doppler radar tile proxy |
| `GET` | `/api/v1/location-risk?q={query}` | Geocodes query & calculates live EFI climatology exceedance |
| `GET` | `/api/v1/model/gnn-track` | Stage 1 GNN inference returning 4D bounding box & 3-10 day trajectory |
| `POST` | `/api/v1/model/inference` | Stage 2 DDPM downscaling with physics loss breakdown |
| `GET` | `/api/v1/model/validation` | Quantitative verification scores (POD, FAR, CSI, RMSE, MAE) |
| `POST` | `/api/v1/advisory/farmer` | Dynamic AI crop recommendations based on predicted rain |

---

## ⚙️ How to Run Locally

### 1. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

Create `backend/.env` (optional for OpenWeatherMap integration):
```env
OWM_KEY=your_openweathermap_api_key
MAPBOX_TOKEN=your_mapbox_token
```

### 2. Start the Backend API (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```
*Backend will be running at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.*

### 3. Start the Frontend Application (Terminal 2)
```bash
npm install
npm run dev
```
*Launch `http://localhost:5173` in your browser to access the 3D GIS Radar Map and Dashboard.*

---

## 🏗️ Hackathon Demonstration Note
*We have implemented the complete two-stage inference architecture and a computationally efficient analytical/AI prototype for hackathon demonstration. The architecture is engineered to ingest real NEPS-G/NCUM arrays, while the current prototype delivers sub-second inference without multi-terabyte model training overheads.*

---
*Built with ❤️ for Smart India Hackathon*
