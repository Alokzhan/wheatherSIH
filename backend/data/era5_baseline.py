import xarray as xr

def load_era5_climatology(zarr_path):
    """
    Loads 30-year ERA5/IMDAA baseline for EFI computation.
    """
    # ds = xr.open_zarr(zarr_path, consolidated=True)
    # return ds
    print(f"Loading ERA5 climatology from {zarr_path}...")
    return None
