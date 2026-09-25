import numpy as np
from scipy import integrate

def compute_efi_1d(forecast_values, climatology_values):
    """
    Computes Extreme Forecast Index (EFI) for a single grid point using the real formula.
    EFI = (2/pi) * integral_0^1 (F(p) - p) / sqrt(p(1-p)) dp
    """
    clim_sorted = np.sort(climatology_values)
    fcst_sorted = np.sort(forecast_values)
    
    n_clim = len(clim_sorted)
    n_fcst = len(fcst_sorted)
    
    if n_clim == 0 or n_fcst == 0:
        return 0.0
        
    # p ranges from 0.01 to 0.99 to avoid division by zero at bounds
    p_values = np.linspace(0.01, 0.99, 99)
    
    # M-climate quantiles for each p
    q_values = np.quantile(clim_sorted, p_values)
    
    # F(p): Proportion of forecast members below the M-climate quantile
    F_p = np.array([np.sum(fcst_sorted <= q) / n_fcst for q in q_values])
    
    # Calculate Integrand
    integrand = (F_p - p_values) / np.sqrt(p_values * (1.0 - p_values))
    
    # Integrate using trapezoidal rule
    efi = (2.0 / np.pi) * integrate.trapezoid(integrand, p_values)
    
    # Return bounded EFI [-1, 1]
    return float(np.clip(efi, -1.0, 1.0))

def compute_efi(forecast_ensemble, era5_climatology):
    """
    Mock wrapper for grid-level xarray integration if needed.
    """
    # Simply using the 1D function on the flattened/meaned array for demo purposes
    if not isinstance(forecast_ensemble, np.ndarray):
        forecast_ensemble = np.array(forecast_ensemble)
    if not isinstance(era5_climatology, np.ndarray):
        era5_climatology = np.array(era5_climatology)
    return compute_efi_1d(forecast_ensemble, era5_climatology)
