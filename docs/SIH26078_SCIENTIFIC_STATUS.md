# SIH26078 Scientific Verification Status Report

**System Name:** StormTrace AI  
**Problem Statement ID:** SIH26078  
**Title:** AI-Driven Spatio-Temporal Tracking of Extreme Weather Anomalies in Medium-Range Forecasts  
**Audit & Verification Date:** September 26, 2026  

---

## Executive Status Summary

This document provides the scientifically defensible verification status for all data sources, models, physics loss constraints, and quantitative validation metrics in StormTrace AI.

Per strict scientific auditing rules, no unverified benchmarks or synthetic data are presented as authentic evidence. Where local data or official GRIB2 files are missing, they are explicitly marked as **UNVERIFIED / MISSING DATA** with exact download requirements specified.

---

## 1. REAL DATA SOURCES STATUS

| Dataset | Verified Status | Evidence & Integration Path | Requirement / Download Action |
| :--- | :--- | :--- | :--- |
| **ERA5 (Copernicus Reanalysis)** | 🟢 **VERIFIED** | Ingested via `backend/data/download_copernicus_era5.py` and `ERA5DataLoader` in `backend/data/era5_loader.py`. Reads cached JSON/NetCDF in `backend/data/era5_archive/`. | Official CDS API (`cdsapi`) or Open-Meteo Historical Archive API. |
| **NEPS-G (NCMRWF 50-Member EPS)** | 🟡 **UNVERIFIED / MISSING LOCAL DATA** | Local GRIB2/NetCDF adapter implemented in `backend/data/nepsg_loader.py` scanning `data/raw/neps_g/`. Regional JSON archive present. | User must place official NEPS-G 50-member `.grib2` or `.nc` files in `data/raw/neps_g/`. See `docs/NEPS_G_DATA_SETUP.md`. |
| **50-Member Ensemble Stream** | 🟡 **UNVERIFIED (LOCAL DATA REQUIRED)** | Exceedance map & CRPS code implemented in `backend/ensemble_engine.py`. Local file adapter ready in `backend/data/nepsg_loader.py`. | Requires local 50-member GRIB2 files in `data/raw/neps_g/`. |
| **Historical Disaster Case Studies (2014-2024)** | 🟡 **UNVERIFIED (LOCAL DATA REQUIRED)** | Real metric formulas ($POD, FAR, CSI, RMSE, MAE$) implemented in `backend/historical_validation.py` scanning `data/raw/historical_events/`. | Requires historical event NetCDF/JSON files placed in `data/raw/historical_events/`. |

---

## 2. DEEP LEARNING MODEL STATUS

| Model Architecture | Real Data Verification Status | Target & Ingestion Details |
| :--- | :--- | :--- |
| **PyTorch Spherical ST-GNN** | 🟢 **VERIFIED (DERIVED ANOMALY TARGETS)** | Implemented in `backend/stage1_gnn/st_gnn_model.py`. Target labels ($y_{\text{track}}$, $y_{\text{intensity}}$) are dynamically derived from real atmospheric precipitation fields and EFI anomaly centroids in `backend/stage1_gnn/dataset.py`. Random target tensors eliminated. |
| **PyTorch Conditional DDPM Downscaler** | 🟢 **VERIFIED (PAIRED ATMOSPHERIC FIELDS)** | Implemented in `backend/stage2_diffusion/ddpm.py`. High-resolution target and physical variables ($u, v, q, T$) are ingested directly from real ERA5 reanalysis fields. Random target tensors eliminated in real mode. |
| **Physics-Informed Loss Laws** | 🟢 **VERIFIED (REAL METEOROLOGICAL INPUTS)** | Implemented in `backend/stage2_diffusion/physics_loss.py`. Consumes real physical wind vectors ($u, v$), specific humidity ($q$), and temperature ($T$) fields for Mass, Moisture, Vorticity, and Fourier Spectral penalties. |

---

## 3. HISTORICAL VALIDATION & QUANTITATIVE BENCHMARKS

| Metric | Real Verification Status | Current Reported Value | Data / Verification Source |
| :--- | :--- | :--- | :--- |
| **Trajectory Position Error** | 🟡 **UNVERIFIED** | `N/A — real validation dataset required` | Requires historical event observation files in `data/raw/historical_events/`. |
| **Critical Success Index (CSI)** | 🟡 **UNVERIFIED** | `N/A — real validation dataset required` | Calculated via spatial contingency table $TP/(TP+FP+FN)$ when event files are present. |
| **Probability of Detection (POD)** | 🟡 **UNVERIFIED** | `N/A — real validation dataset required` | Calculated via $TP/(TP+FN)$ when event files are present. |
| **False Alarm Ratio (FAR)** | 🟡 **UNVERIFIED** | `N/A — real validation dataset required` | Calculated via $FP/(TP+FP)$ when event files are present. |
| **Continuous Ranked Probability Score (CRPS)** | 🟡 **UNVERIFIED** | `N/A — NEPS-G ensemble required` | Evaluated on 50-member ensemble distributions via `backend/ensemble_engine.py`. |
| **Brier Score** | 🟡 **UNVERIFIED** | `N/A — NEPS-G ensemble required` | Evaluated on ensemble exceedance maps via `backend/ensemble_engine.py`. |
| **Peak Rainfall Preservation Pct** | 🟡 **UNVERIFIED** | `N/A — real validation dataset required` | Evaluated via $\max(P_{\text{pred}})/\max(P_{\text{obs}}) \times 100\%$ on paired high-res grids. |

---

## 4. REPRODUCIBLE BENCHMARK RUNNER

Execution Command:
```bash
python -m backend.validation.run_benchmark
```

Exported Artifacts:
- `outputs/validation/results.json`
- `outputs/validation/results.csv`

Every record contains:
`dataset`, `event`, `model`, `prediction`, `ground_truth`, `metric`, `value`, `timestamp`, `model_version`, `status`.
