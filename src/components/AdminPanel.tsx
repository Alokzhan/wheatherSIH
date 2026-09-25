import React, { useState } from 'react';
import { 
  Settings, 
  Upload, 
  Play, 
  Sliders, 
  Key, 
  Terminal, 
  RefreshCw
} from 'lucide-react';
import { INITIAL_MODEL_CONFIG } from '../data/mockData';
import type { ModelConfig } from '../types/weather';

export const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<ModelConfig>(INITIAL_MODEL_CONFIG);
  const [isRunningModel, setIsRunningModel] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM INIT] AstraWatch AI Admin Control Center Ready.',
    '[METEOROLOGY] Climatology baseline ERA5 loaded (1991-2020 window).',
    '[MODEL CONFIG] Spatial resolution set to 5.0 km downscaled grid.',
  ]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleWeightChange = (key: keyof ModelConfig, val: number) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setSelectedFile(fileName);
      setLogs(prev => [
        `[INGESTION] Forecast file uploaded: ${fileName}`,
        ...prev
      ]);
    }
  };

  const handleRunModel = () => {
    setIsRunningModel(true);
    setLogs(prev => [
      `[MODEL TRIGGER] Manual execution requested by Administrator.`,
      `[PREPROCESSING] Xarray regridding NetCDF inputs to 5km grid...`,
      ...prev
    ]);

    setTimeout(() => {
      setLogs(prev => [
        `[STAGE 1] Anomaly engine calculated EFI score = 0.92`,
        `[STAGE 1 GNN] Detected 4 threat objects; tracked centroid speed 18.5 km/h`,
        ...prev
      ]);
    }, 1500);

    setTimeout(() => {
      setLogs(prev => [
        `[STAGE 2 U-NET] Downscaling 12km coarse grid to 5km grid using moisture consistency loss...`,
        `[SUCCESS] 5 km Probabilistic Risk Grid successfully updated in PostGIS database!`,
        ...prev
      ]);
      setIsRunningModel(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">SYSTEM ADMINISTRATION &amp; CONTROL</span>
            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Settings className="h-6 w-6 text-cyan-400" />
              Admin Control Center &amp; AI Model Configurator
            </h2>
            <p className="text-xs text-slate-400">
              Manage NetCDF/GRIB2 uploads, trigger downscaling pipeline inference, and tune composite risk score loss weights.
            </p>
          </div>

          <button
            onClick={handleRunModel}
            disabled={isRunningModel}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isRunningModel
                ? 'bg-amber-600 text-slate-950 animate-pulse cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
          >
            {isRunningModel ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningModel ? 'Running Pipeline...' : 'Trigger Model Run (/api/v1/admin/run-model)'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config Sliders & Upload */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dataset Upload Simulator */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Upload className="h-5 w-5 text-cyan-400" />
              Ingest Weather Dataset (NetCDF `.nc`, GRIB2 `.grib2`, CSV)
            </h3>

            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 text-center space-y-3 transition-colors bg-slate-950/60">
              <Upload className="h-8 w-8 text-slate-400 mx-auto" />
              <div>
                <span className="text-xs text-slate-300 font-semibold block">
                  {selectedFile ? `Selected: ${selectedFile}` : 'Drag & Drop Forecast Dataset or Click to Browse'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Supports NEPS-G, NCUM, ERA5, IMDAA gridded binary files up to 500 MB
                </span>
              </div>
              <input
                type="file"
                accept=".nc,.grib,.grib2,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer"
              >
                Browse Local File
              </label>
            </div>
          </div>

          {/* Configurable Composite Risk Score Loss Weights */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-cyan-400" />
                Composite Risk Score Weight Tuning
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono">
                Formula: RiskScore = w1*EFI + w2*P(prob) + w3*Severity + w4*Vulnerability
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* w1 */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">w1 - EFI-inspired Anomaly Weight:</span>
                  <span className="font-mono text-cyan-300 font-bold">{config.w1_efi_anomaly}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={config.w1_efi_anomaly}
                  onChange={(e) => handleWeightChange('w1_efi_anomaly', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* w2 */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">w2 - Threshold Exceedance Probability P(&gt;50mm) Weight:</span>
                  <span className="font-mono text-cyan-300 font-bold">{config.w2_prob_exceedance}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={config.w2_prob_exceedance}
                  onChange={(e) => handleWeightChange('w2_prob_exceedance', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* w3 */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">w3 - Peak Intensity Severity Magnitude Weight:</span>
                  <span className="font-mono text-cyan-300 font-bold">{config.w3_severity_magnitude}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={config.w3_severity_magnitude}
                  onChange={(e) => handleWeightChange('w3_severity_magnitude', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* w4 */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">w4 - Terrain Vulnerability &amp; Exposure Weight:</span>
                  <span className="font-mono text-cyan-300 font-bold">{config.w4_vulnerability_exposure}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.05"
                  value={config.w4_vulnerability_exposure}
                  onChange={(e) => handleWeightChange('w4_vulnerability_exposure', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Logs & API Keys */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time System Logs Console */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 font-mono uppercase">
              <Terminal className="h-4 w-4 text-cyan-400" />
              Real-time Model Execution Console Logs
            </h3>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] h-64 overflow-y-auto space-y-1.5 text-slate-300">
              {logs.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-cyan-400 font-bold">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>

          {/* API Keys & RBAC Management */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              API Key Management &amp; Rate Limits
            </h3>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono">astrawatch_live_sec_8f92k</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">Active</span>
              </div>
              <p className="text-[11px] text-slate-500">Rate limit: 100 requests/sec • JWT Token Auth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
