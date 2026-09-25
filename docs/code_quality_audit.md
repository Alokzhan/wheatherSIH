# Code Quality Audit — SIH26078 (StormTrace AI)

Date: 2026-09-26  
Auditor: Senior Staff Software Engineer  
Repository: [wheatherSIH](https://github.com/Alokzhan/wheatherSIH)

---

## Executive Summary

An initial architectural and code quality audit was conducted across the `backend/`, `pipeline/`, `tests/`, `configs/`, `src/`, and `docs/` modules. While the core scientific concept (NWP ensemble → 30-yr ERA5 baseline → EFI → ST-GNN trajectory tracking → conditional DDPM downscaling → physics loss → alerts) is intact and functional, the codebase exhibits common software debt patterns:

1. **Triplicated GNN Model Implementations**: `model.py`, `gnn_model.py`, and `st_gnn_model.py` define three variations of spherical graph neural networks.
2. **Duplicated Data Pipeline Logic**: `backend/data_pipeline.py` and `backend/data/era5_loader.py` maintain duplicate API fetching, grid synthesis, and parameter setup routines.
3. **Hardcoded Evaluation Metrics in Pipeline Execution**: `pipeline/run.py` hardcodes CRPS (`30.7136`), Brier score (`0.0305`), CSI (`0.978`), POD (`0.988`), and FAR (`0.011`) outputs instead of invoking `EnsembleNWPEngine` and `calculate_metrics()`.
4. **Deprecated Python Calls & Deprecation Warnings**: Widespread usage of `datetime.utcnow()` (deprecated in Python 3.12+) and `torch.tensor(sourceTensor)` re-wrapping.
5. **Insecure & Unhandled Database Contexts**: SQLite database calls in `backend/api/main.py` leave connection lifecycle unmanaged upon request errors and use permissive CORS wildcard configuration with `allow_credentials=True`.
6. **Verbose / AI-Generated Docstring Bloat**: Excessively repetitive docstrings ("Priority 4: Advanced...", "This function calculates...") that explain *what* standard syntax does rather than *why* scientific operations occur.

---

## Detailed Code Quality Audit Table

| Area | Problem | Severity | Proposed Fix | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **backend/api/main.py** | Deprecated `datetime.utcnow()`, insecure CORS wildcard with credentials, unclosed SQLite connections on exception. | High | Replace with `datetime.now(timezone.utc)`, fix CORS headers, wrap SQLite calls with context managers (`with sqlite3.connect...`). | Low |
| **pipeline/run.py** | Hardcoded evaluation metrics (CRPS, Brier, CSI, POD, FAR) instead of computing live metrics from tensor outputs. | High | Connect live evaluation calls using `calculate_metrics` and `EnsembleNWPEngine`. | Low |
| **backend/stage1_gnn** | Three separate GNN files (`model.py`, `gnn_model.py`, `st_gnn_model.py`) with duplicate/conflicting model classes. | High | Consolidate core ST-GNN architectures into `st_gnn_model.py` and alias/export necessary legacy symbols for backwards compatibility. | Medium |
| **backend/data_pipeline.py & era5_loader.py** | Duplicate Open-Meteo fetchers and log-normal grid synthesis algorithms across multiple files. | Medium | Refactor shared grid generation into `data_pipeline.py` and have `era5_loader.py` leverage `RealERA5DataPipeline`. | Low |
| **backend/uncertainty/quantifier.py** | Hardcoded CRPS (`30.7136`) and Brier score (`0.0305`) in return dictionary. | Medium | Import and invoke `EnsembleNWPEngine` or compute real sample-based CRPS/Brier values. | Low |
| **backend/alerts/risk_engine.py** | Hardcoded input parameters inside `generate_advisory` wrapper (`0.85`, `90.0`, `vulnerability_score=70.0`). | Medium | Pass dynamic event metrics (anomaly EFI, exceedance prob, vulnerability) to `calculate_risk_score`. | Low |
| **tests/ & backend/tests/** | Deprecation warnings (`torch.tensor(tensor)` usage in `test_gnn_smoke.py`, `datetime.utcnow()`). | Low | Use `.clone().detach()` for tensor creation and `datetime.now(timezone.utc)`. | Low |
| **backend/stage2_diffusion/ddpm.py** | Missing `torch.no_grad()` in inference paths, inline numpy array allocation inside forward pass. | Medium | Add `@torch.no_grad()` to sampling methods and optimize timestep embedding vectorization. | Low |
| **Global / Config** | Scattered magic numbers (e.g. 12km to 5km scale 2.4, threshold 50.0mm, earth radius 111km). | Low | Centralize common domain constants into `backend/common/constants.py` or `configs/demo.yaml`. | Low |
| **Documentation / Comments** | Repetitive LLM-style comments explaining obvious code lines ("# Loop through events", "# Convert to numpy"). | Low | Remove redundant trivial comments; refine docstrings to explain scientific rationale (WHY vs WHAT). | Low |

---

## Action Plan & Verification Criteria

1. **Step 1: Baseline Recording**: Verify clean runs of `python -m pytest`, `python -m pipeline.run --config configs/demo.yaml`, and `npm run build`.
2. **Step 2: Architecture & Data Pipeline Refactoring**: Clean up duplicate implementations, replace hardcoded metric proxies with live calculations.
3. **Step 3: PyTorch & Data Optimizations**: Fix tensor warnings, ensure proper `torch.no_grad()` decoration and device memory management.
4. **Step 4: Error Handling & Logging**: Standardize `logging` over `print` statements in core backend components; clean up SQLite connection handling.
5. **Step 5: Code Quality & Performance Documentation**: Generate `docs/performance.md` and `docs/code_quality_report.md`.
6. **Step 6: Final Verification**: Re-run full test suite, pipeline execution, frontend build, and `git diff --check`.
