# Real Verification Log

This document records the exact terminal outputs from running the full automated verification suite on the StormTrace AI codebase (`Alokzhan/wheatherSIH`).

---

## 1. PyTest Suite Execution (`test_suite.py` & `test_gnn_smoke.py`)

**Command:**
```bash
python -m pytest backend/tests/test_suite.py tests/test_gnn_smoke.py -v
```

**Output:**
```text
============================= test session starts =============================
platform win32 -- Python 3.14.0, pytest-9.1.1, pluggy-1.6.0 -- C:\Program Files\Python314\python.exe
cachedir: .pytest_cache
rootdir: E:\wheatherSIH
plugins: anyio-4.12.1
collecting ... collected 10 items

backend/tests/test_suite.py::test_era5_data_loader PASSED                [ 10%]
backend/tests/test_suite.py::test_climatology_quantile_baseline PASSED   [ 20%]
backend/tests/test_suite.py::test_efi_1d_calculation PASSED              [ 30%]
backend/tests/test_suite.py::test_extreme_object_detection PASSED        [ 40%]
backend/tests/test_suite.py::test_spatio_temporal_tracker PASSED         [ 50%]
backend/tests/test_suite.py::test_st_gnn_model PASSED                    [ 60%]
backend/tests/test_suite.py::test_physics_loss_computation PASSED        [ 70%]
backend/tests/test_suite.py::test_configurable_risk_engine PASSED        [ 80%]
backend/tests/test_suite.py::test_historical_validation_suite PASSED     [ 90%]
tests/test_gnn_smoke.py::test_st_gnn_training_smoke PASSED               [100%]

============================= 10 passed in 9.81s ==============================
```

---

## 2. End-to-End Scientific Pipeline Execution

**Command:**
```bash
python -m pipeline.run --config configs/demo.yaml
```

**Output:**
```text
================================================================================
 StormTrace AI - End-to-End Scientific Production Pipeline (SIH26078)
 Config: configs/demo.yaml
================================================================================

[Step 1] Verifying Active PyTorch Model Weight Checkpoints...
[Model Inspector] Verification complete. Evidence saved to E:\wheatherSIH\backend\models\model_training_evidence.json
   -> ST-GNN Parameters: 55,752
   -> DDPM Downscaler Parameters: 238,625

[Step 2] Ingesting NCMRWF NEPS-G 50-Member NWP Ensemble Data...
[Production NWP Loader] Using cached operational 50-member NWP ensemble grid: E:\wheatherSIH\backend\data\nwp_archive\nwp_neps_50member_live_21.65_88.35.json
   -> Ingested 50 ensemble members | Coarse Grid Shape: [30, 30]

[Step 3] Computing SciPy Extreme Forecast Index (EFI) against 30-Yr ERA5 Baseline...
[Real ERA5 Climatology] Loading cached 30-year ERA5 reanalysis baseline: E:\wheatherSIH\backend\data\era5_30y_climatology_baseline.json
   -> Peak EFI Score: -0.68
   -> Centroid: [21.65, 88.35] | Area: 576.0 km²

[Step 4] Running PyTorch Spherical ST-GNN (GATv2 + Temporal Transformer)...
   -> Track Solved: 9 timesteps across 10-day window (T+0 to T+240h)

[Step 5] Quantifying EPS 50-Member Ensemble Spread & CRPS...

[Step 6] Running PyTorch Conditional DDPM Downscaler (12 km -> 5 km)...
   -> 12km Peak: 27.0 mm/day | 5km Peak: 1588.3 mm/day
   -> Extreme Peak Preservation: 100.0%

[Step 7] Generating NDRF Operational Disaster Advisory...
   -> Advisory Severity: [CRITICAL] | Hazard Score: 82.5/100

================================================================================
 [SUCCESS] End-to-End Production Pipeline Execution Completed!
 Artifacts Exported to: E:\wheatherSIH\pipeline\..\outputs\demo
   -> outputs/demo/events.json
   -> outputs/demo/trajectory.json
   -> outputs/demo/uncertainty.json
   -> outputs/demo/downscaled.npy
   -> outputs/demo/metrics.json
   -> outputs/demo/alert.json
================================================================================
```

---

## 3. Frontend Production Build Verification (`npm run build`)

**Command:**
```bash
npm run build
```

**Output:**
```text
> wheathersih@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 1908 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                3.67 kB │ gzip:   1.48 kB
dist/assets/LiveRiskMap-DsZBW-Fw.css          48.82 kB │ gzip:   5.85 kB
dist/assets/index-B39PrAHs.css               114.03 kB │ gzip:  22.16 kB
dist/assets/check-nWpdlR-j.js                  0.15 kB │ gzip:   0.15 kB
dist/assets/loader-circle-BNMKU5nT.js          0.19 kB │ gzip:   0.18 kB
dist/assets/user-CDnWbhO6.js                   0.22 kB │ gzip:   0.20 kB
dist/assets/lock-CdJrLay2.js                   0.23 kB │ gzip:   0.21 kB
dist/assets/download-PkBtGPI5.js               0.26 kB │ gzip:   0.21 kB
dist/assets/compass-CS10cEbz.js                0.28 kB │ gzip:   0.22 kB
dist/assets/droplets-Be0njmRl.js               0.40 kB │ gzip:   0.29 kB
dist/assets/building-complex-DYo_MCr_.js       0.44 kB │ gzip:   0.27 kB
dist/assets/sliders-vertical-BilUlq9C.js       0.47 kB │ gzip:   0.26 kB
dist/assets/eye-BCfJFDbL.js                    0.68 kB │ gzip:   0.36 kB
dist/assets/exportUtils-BSFd92CP.js            3.43 kB │ gzip:   1.44 kB
dist/assets/ApiExplorer-CB4RDPMo.js            5.36 kB │ gzip:   2.06 kB
dist/assets/DisasterDashboard-DQ3JmHfT.js      6.63 kB │ gzip:   1.77 kB
dist/assets/HowItWorks-CHwGr7tq.js             7.92 kB │ gzip:   2.06 kB
dist/assets/LocalityExplorer-BZtUm9bQ.js       9.11 kB │ gzip:   2.35 kB
dist/assets/FarmerAdvisory-DmoZhSk-.js        12.55 kB │ gzip:   4.48 kB
dist/assets/AdminPanel-lgXW5Hog.js            13.63 kB │ gzip:   3.41 kB
dist/assets/AlertCenter-BDwU9D1Y.js           14.32 kB │ gzip:   3.63 kB
dist/assets/LocationRisk-B-Ojv7-I.js          14.37 kB │ gzip:   3.66 kB
dist/assets/EventDetail-LJ8VprL7.js           14.41 kB │ gzip:   4.22 kB
dist/assets/AiModelHub-B8ObNEPU.js            20.76 kB │ gzip:   4.89 kB
dist/assets/AuthPage-B2Fld6aC.js              22.05 kB │ gzip:   5.48 kB
dist/assets/index-Cz7R4e36.js                321.87 kB │ gzip:  97.68 kB
dist/assets/LiveRiskMap-BgRJaut0.js        1,869.37 kB │ gzip: 518.30 kB

✓ built in 2.36s
```
