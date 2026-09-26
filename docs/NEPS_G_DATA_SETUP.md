# NCMRWF NEPS-G Ensemble Data Setup & Ingestion Guide

**System:** StormTrace AI (SIH26078)  
**Module:** `backend/data/nepsg_loader.py` & `backend/data/nwp_loader.py`  

---

## 1. Overview

The SIH26078 problem statement requires ingesting operational 50-member Ensemble Prediction System (EPS) forecasts to calculate Extreme Forecast Index (EFI), spatial exceedance probability maps, and Continuous Ranked Probability Scores (CRPS).

This document provides instructions for acquiring and placing official NCMRWF NEPS-G or ECMWF EPS ensemble files into the local StormTrace AI pipeline.

---

## 2. Official Data Sources

1. **NCMRWF NEPS-G (National Centre for Medium Range Weather Forecasting):**
   - **System:** NCMRWF Ensemble Prediction System Global (NEPS-G)
   - **Spatial Resolution:** ~12 km
   - **Ensemble Members:** 50 members + 1 control run
   - **Forecast Window:** +240 hours (10-day medium range)
   - **Portal:** NCMRWF Data Dissemination Portal (`https://www.ncmrwf.gov.in/`) / IMD Pune Data Center

2. **ECMWF EPS (Copernicus Atmosphere/Climate Services):**
   - **System:** ECMWF Integrated Forecasting System (IFS) Ensemble (ENS)
   - **Portal:** Copernicus Climate Data Store (`https://cds.climate.copernicus.eu/`) / MARS Archive

---

## 3. Local Data Folder & Naming Protocol

Place downloaded GRIB2 or NetCDF ensemble files inside the target raw data directory:

```
data/raw/neps_g/
```

### Supported Formats & Extensions:
- GRIB2 files: `.grib2`, `.grb2`, `.grib`
- NetCDF files: `.nc`, `.nc4`

---

## 4. Expected Data Schema & Dimensions

| Dimension | Name in File | Size / Bounds | Description |
| :--- | :--- | :--- | :--- |
| **Ensemble Members** | `number` / `member` | 50 | Member index (0 to 49 or 1 to 50) |
| **Forecast Initialization** | `time` / `initial_time` | ISO 8601 | Forecast run time (e.g. 00Z / 12Z UTC) |
| **Forecast Lead Time** | `step` / `forecast_time` | 9 timesteps | T+0h, T+24h, T+48h, ..., T+240h |
| **Latitude** | `latitude` / `lat` | 30 points | 6.0°N to 38.0°N (0.12° / 12 km grid) |
| **Longitude** | `longitude` / `lon` | 30 points | 68.0°E to 98.0°E (0.12° / 12 km grid) |

### Required Variables:
- `total_precipitation` / `tp` (mm/24h)
- `10m_u_component_of_wind` / `u10` (m/s)
- `10m_v_component_of_wind` / `v10` (m/s)
- `2m_temperature` / `t2m` (K)
- `surface_pressure` / `sp` / `msl` (hPa)
- `relative_humidity` / `r` (%)

---

## 5. Automated Data Validation Command

Run the local validation command to verify that your downloaded NEPS-G files are detected and correctly parsed:

```bash
python -m backend.data.nepsg_loader
```

### Expected Output when Data is Present:
```
NEPS-G Loader Status: REAL_DATA_VERIFIED Source: Local Official NEPS-G Ensemble (nepsg_20230701_00z.grib2) Members: 50
```

### Expected Output when Data is Missing:
```
NEPS-G Loader Status: UNVERIFIED Source: NCMRWF NEPS-G / ECMWF 50-Member Operational EPS Reason: N/A — real 50-member NEPS-G GRIB2/NetCDF files required in data/raw/neps_g/
```
