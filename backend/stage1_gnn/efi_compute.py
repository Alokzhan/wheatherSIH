import xarray as xr
import numpy as np

def compute_efi(forecast_ensemble, era5_climatology):
    """
    Computes Extreme Forecast Index (EFI) vs 30-year ERA5 baseline.
    EFI = (2/pi) * integral_0^1 (F(q) - q) / sqrt(q(1-q)) dq
    """
    # Mocking EFI computation using xarray
    efi = forecast_ensemble.mean(dim='member') - era5_climatology.mean(dim='time')
    # Normalize mock
    efi = efi / efi.std()
    return efi
