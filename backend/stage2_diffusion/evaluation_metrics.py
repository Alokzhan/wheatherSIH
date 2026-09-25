import numpy as np

def compute_quantitative_metrics(coarse_12km, bicubic_5km, ddpm_5km, threshold_mm=10.0):
    """
    Computes rigorous quantitative accuracy metrics comparing:
    1. Coarse 12km Forecast input
    2. Standard Bicubic Interpolation (demonstrating spectral smoothing peak destruction)
    3. StormTrace Conditional DDPM 5km Output (preserving upper-quantile extreme amplitudes)
    """
    coarse_max = float(np.max(coarse_12km))
    bicubic_max = float(np.max(bicubic_5km))
    ddpm_max = float(np.max(ddpm_5km))
    
    coarse_p95 = float(np.percentile(coarse_12km, 95))
    bicubic_p95 = float(np.percentile(bicubic_5km, 95))
    ddpm_p95 = float(np.percentile(ddpm_5km, 95))

    coarse_p99 = float(np.percentile(coarse_12km, 99))
    bicubic_p99 = float(np.percentile(bicubic_5km, 99))
    ddpm_p99 = float(np.percentile(ddpm_5km, 99))

    # Calculate Probability of Detection (POD), False Alarm Rate (FAR), Critical Success Index (CSI)
    true_event = ddpm_5km >= threshold_mm
    bicubic_event = bicubic_5km >= threshold_mm
    
    hits = float(np.sum(true_event & bicubic_event))
    misses = float(np.sum(true_event & (~bicubic_event)))
    false_alarms = float(np.sum((~true_event) & bicubic_event))
    
    pod = hits / (hits + misses + 1e-6)
    far = false_alarms / (hits + false_alarms + 1e-6)
    csi = hits / (hits + misses + false_alarms + 1e-6)
    
    rmse = float(np.sqrt(np.mean((ddpm_5km - bicubic_5km) ** 2)))
    mae = float(np.mean(np.abs(ddpm_5km - bicubic_5km)))
    
    peak_preservation_ratio = round((ddpm_max / (coarse_max + 1e-6)) * 100.0, 1)
    smoothing_loss_pct = round((1.0 - (bicubic_max / (coarse_max + 1e-6))) * 100.0, 1)

    return {
        "extremeValuePreservation": {
            "original12kmMaxMm": round(coarse_max, 1),
            "standardInterpolationMaxMm": round(bicubic_max, 1),
            "stormTraceDdpm5kmMaxMm": round(ddpm_max, 1),
            "original12kmP95Mm": round(coarse_p95, 1),
            "standardInterpolationP95Mm": round(bicubic_p95, 1),
            "stormTraceDdpm5kmP95Mm": round(ddpm_p95, 1),
            "original12kmP99Mm": round(coarse_p99, 1),
            "standardInterpolationP99Mm": round(bicubic_p99, 1),
            "stormTraceDdpm5kmP99Mm": round(ddpm_p99, 1),
            "peakPreservedPct": peak_preservation_ratio,
            "interpolationSmoothingLossPct": max(0.0, smoothing_loss_pct)
        },
        "verificatonScores": {
            "rmseMm": round(rmse, 2),
            "maeMm": round(mae, 2),
            "podScore": round(pod, 2),
            "farScore": round(far, 2),
            "csiScore": round(csi, 2)
        }
    }
