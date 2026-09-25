import React, { useState } from 'react';
import { 
  Cpu, 
  BarChart2, 
  Play, 
  Zap, 
  Activity, 
  Sparkles
} from 'lucide-react';
import { AI_MODEL_BENCHMARKS } from '../data/mockData';

export const AiModelHub: React.FC = () => {
  const [moistureFlux, setMoistureFlux] = useState<number>(85);
  const [windDivergence, setWindDivergence] = useState<number>(0.75);
  const [terrainElevation, setTerrainElevation] = useState<number>(450);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<{
    downscaledRainMm: number;
    extremeQuantilePreserved: string;
    efiScore: number;
    speedPredictionKmH: number;
  } | null>(null);

  const handleSimulateInference = () => {
    setIsInferring(true);
    setTimeout(() => {
      // Calculate realistic downscaled prediction based on physics parameters
      const rain = Number((moistureFlux * 1.6 + windDivergence * 40 + terrainElevation * 0.05).toFixed(1));
      const preserved = (95.5 + windDivergence * 3.5).toFixed(1);
      const efi = Number((0.70 + (rain / 250) * 0.28).toFixed(2));
      const speed = Number((15 + windDivergence * 12).toFixed(1));

      setInferenceResult({
        downscaledRainMm: rain,
        extremeQuantilePreserved: `${preserved}%`,
        efiScore: Math.min(0.99, efi),
        speedPredictionKmH: speed,
      });
      setIsInferring(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/40 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>DEEP LEARNING METEOROLOGY PIPELINE SPECIFICATION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <Cpu className="h-8 w-8 text-cyan-400" />
              StormTrace AI &amp; ML Model Architecture Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
              Dual-Stage Conditional DDPM/DDIM for 5 km &amp; 1 km Downscaling paired with Spherical Icosahedral GNN for Multi-Hazard Tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
              POD: 95.0% • RMSE: 4.12 mm
            </span>
          </div>
        </div>
      </div>

      {/* Model Pipeline Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stage 1 & Stage 2 Deep Dive */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stage 1: Spherical GNN Tracker */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                  STAGE 1
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Spherical Icosahedral GNN (DGL)</h3>
                  <p className="text-xs text-slate-400">Extreme-event object detection &amp; trajectory prediction engine</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Spherical Mesh
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Standard models use flat 2D projections. StormTrace uses a Spherical Icosahedral GNN mesh (DGL) to avoid spatial distortions, extracting 4D Anomaly Bounding Boxes (4D-ABB) and precise trajectory cones for extreme multi-hazard objects.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Track Speed Accuracy</span>
                <span className="text-cyan-300 font-bold text-sm">96.4% Accuracy</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Centroid Offset Error</span>
                <span className="text-emerald-400 font-bold text-sm">&lt; 1.8 km Offset</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">4D-ABB IoU</span>
                <span className="text-amber-400 font-bold text-sm">0.89 Overlap</span>
              </div>
            </div>
          </div>

          {/* Stage 2: Conditional DDPM Downscaler */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-mono font-bold text-xs">
                  STAGE 2
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Conditional DDPM/DDIM (HuggingFace Diffusers)</h3>
                  <p className="text-xs text-slate-400">12 km to 5 km &amp; 1 km high-resolution downscaling preserving peak extremes</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                DDPM Diffusion
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Standard U-Net models suffer from spectral smoothing. StormTrace uses a Conditional Diffusion process guided by 4 physical laws: Mass, Moisture, Energy, and Vorticity conservation, avoiding blurring and preserving peak extremes.
            </p>

            {/* Rendered Math Formula Block */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 text-center font-mono text-xs text-cyan-300 space-y-2">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-sans">Multi-Objective Physics Loss Function:</span>
              <div className="text-sm font-bold text-cyan-200 py-1 font-mono">
                {'L_total = L_recon + λ1*L_mass + λ2*L_moisture + λ3*L_energy + λ4*L_vorticity'}
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Where physics losses preserve multi-hazard extremes and ensure thermodynamic consistency.
              </p>
            </div>
          </div>

          {/* Model Benchmark Leaderboard Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-cyan-400" />
              Meteorological Verification Leaderboard (Benchmarked against Official Models)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Model Architecture</th>
                    <th className="p-3">Resolution</th>
                    <th className="p-3">RMSE (mm)</th>
                    <th className="p-3">POD (Hit Rate)</th>
                    <th className="p-3">FAR (False Alarms)</th>
                    <th className="p-3">CSI Score</th>
                    <th className="p-3">PSD Preservation %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {AI_MODEL_BENCHMARKS.map((bm, i) => (
                    <tr key={i} className={i === 0 ? 'bg-cyan-950/40 border-l-4 border-cyan-400 font-bold' : 'hover:bg-slate-900/60'}>
                      <td className="p-3 text-slate-100 flex items-center gap-2">
                        {i === 0 && <Sparkles className="h-3.5 w-3.5 text-cyan-400" />}
                        {bm.modelName}
                      </td>
                      <td className="p-3 font-mono text-cyan-300">{bm.resolution}</td>
                      <td className="p-3 font-mono">{bm.rmse}</td>
                      <td className="p-3 font-mono text-emerald-400">{(bm.pod * 100).toFixed(0)}%</td>
                      <td className="p-3 font-mono text-slate-300">{(bm.far * 100).toFixed(0)}%</td>
                      <td className="p-3 font-mono text-cyan-300">{(bm.csi * 100).toFixed(0)}%</td>
                      <td className={`p-3 font-mono ${i === 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}`}>
                        {bm.psdPreservation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Real-Time Tensor Inference Simulator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              Live Diffusion Simulator (DDPM Downscaling)
            </h3>

            <p className="text-xs text-slate-400">
              Adjust input weather parameters to observe instantaneous downscaled tensor inference output:
            </p>

            <div className="space-y-4 text-xs">
              {/* Parameter 1 */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Moisture Flux (q kg/m²):</span>
                  <span className="font-mono text-cyan-300 font-bold">{moistureFlux}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={moistureFlux}
                  onChange={(e) => setMoistureFlux(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Parameter 2 */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Wind Divergence (∇ · u):</span>
                  <span className="font-mono text-cyan-300 font-bold">{windDivergence}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={windDivergence}
                  onChange={(e) => setWindDivergence(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Parameter 3 */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">Terrain Elevation (DEM meters):</span>
                  <span className="font-mono text-cyan-300 font-bold">{terrainElevation} m</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1200"
                  step="25"
                  value={terrainElevation}
                  onChange={(e) => setTerrainElevation(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <button
                onClick={handleSimulateInference}
                disabled={isInferring}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {isInferring ? <Activity className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isInferring ? 'Executing PyTorch Tensor Pass...' : 'Run DDPM Diffusion Pass'}
              </button>
            </div>

            {/* Inference Output Card */}
            {inferenceResult && (
              <div className="bg-cyan-950/50 p-4 rounded-xl border border-cyan-500/50 space-y-2 mt-4 text-xs">
                <span className="text-[10px] text-cyan-400 font-mono block font-bold uppercase">5 KM DOWNSCALED TENSOR OUTPUT</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Predicted Rain</span>
                    <span className="text-red-400 font-bold font-mono text-sm">{inferenceResult.downscaledRainMm} mm/24h</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Peak Preserved</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">{inferenceResult.extremeQuantilePreserved}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">EFI Anomaly Score</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">{inferenceResult.efiScore}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Track Speed</span>
                    <span className="text-cyan-300 font-bold font-mono text-sm">{inferenceResult.speedPredictionKmH} km/h</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
