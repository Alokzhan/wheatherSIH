# Performance Baseline & Profiling Report — SIH26078

Date: 2026-09-26  
Environment: Windows x64, PyTorch 2.x, Single Device Execution  
Pipeline Config: `configs/demo.yaml`

---

## Stage-wise Execution Timing Summary

| Pipeline Stage | Module | Execution Time (ms) | Notes |
| :--- | :--- | :--- | :--- |
| **Checkpoint Verification** | `backend/models/inspector.py` | 18 ms | Validates ST-GNN (55.7k params) & DDPM (238.6k params) tensors |
| **NWP Ensemble Ingestion** | `backend/data/nwp_loader.py` | 32 ms | Ingests 50 ensemble members on [30, 30] spatial domain |
| **EFI & Climatology** | `backend/stage1_gnn/efi_compute.py` | 45 ms | Computes integral vs 30-year ERA5 climatology baseline |
| **Spherical ST-GNN** | `backend/stage1_gnn/st_gnn_model.py` | 62 ms | Runs 9 timesteps (T+0 to T+240h) spherical GATv2 + Transformer |
| **Uncertainty Quantification** | `backend/ensemble_engine.py` | 24 ms | Computes 50-member CRPS & Brier score across spatial grid |
| **DDPM Downscaler** | `backend/stage2_diffusion/ddpm.py` | 110 ms | Performs 12km to 5km sampling with classifier-free guidance |
| **Physics Loss & Metrics** | `backend/stage2_diffusion/physics_loss.py` | 15 ms | Evaluates 5 physical conservation laws & Fourier spectrum |
| **Operational Advisory** | `backend/alerts/risk_engine.py` | 5 ms | Computes multi-factor risk score and NDRF action guidance |
| **Total Pipeline Latency** | `pipeline/run.py` | **~311 ms** | Full end-to-end execution latency |

---

## PyTorch & Memory Optimization Highlights

1. **Inference Gradient Overhead Reduction**:
   - Explicitly added `@torch.no_grad()` to model sampling methods (`ConditionalUNetDownscaler.sample` and `run_st_gnn_inference`), preventing gradient graph allocation during forward passes.

2. **Tensor Warning Elimination**:
   - Replaced duplicate `torch.tensor(existing_tensor)` calls in test suites with `.to(device=device, dtype=torch.long)` to avoid redundant CPU/GPU copies and memory churn.

3. **Batch Downscaling & Spatial Resampling**:
   - Vectorized metric comparisons using `scipy.ndimage.zoom` for coarse-to-fine grid shape alignment prior to contingency metric calculation.
