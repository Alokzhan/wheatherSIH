import React from 'react';
import { ShieldAlert, Cpu, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-200 text-sm">AstraWatch AI</span>
          </div>
          <p className="text-slate-400 leading-relaxed mb-3">
            From coarse weather forecasts to precise, probability-based local disaster alerts. Built for Smart India Hackathon (SIH 2026).
          </p>
          <div className="text-[11px] text-cyan-400 font-mono">
            MVP Focus: Uttar Pradesh / Prayagraj Region
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-cyan-400" />
            AI &amp; Meteorology Pipeline
          </h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>• NEPS-G &amp; NCUM 12km Ensemble Inputs</li>
            <li>• ERA5 &amp; IMDAA Climatology Engine</li>
            <li>• U-Net / ResNet 5km Spatial Downscaling</li>
            <li>• GNN Threat Footprint Trajectory Tracker</li>
            <li>• EFI (Extreme Forecast Index) Anomaly Engine</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyan-400" />
            High-Risk Districts Covered
          </h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>• Prayagraj (Sangam, Phulpur, Naini, Handia)</li>
            <li>• Varanasi (Middle Ganges Plain)</li>
            <li>• Mirzapur (Vindhyachal Escarpment)</li>
            <li>• Kaushambi &amp; Pratapgarh</li>
            <li>• Jaunpur &amp; Bhadohi</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3">SIH Compliance Notice</h4>
          <p className="text-slate-400 leading-relaxed mb-3">
            AstraWatch AI is a decision-support system designed to complement official IMD / NCMRWF weather products. It does not replace official statutory warnings.
          </p>
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-mono text-[11px]">System Status: Operational (5 km Grid)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <div>
          © 2026 AstraWatch AI Project • Developed for SIH • Uttar Pradesh Disaster Management Intelligence
        </div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span className="hover:text-slate-300 cursor-pointer">Architecture Spec</span>
          <span className="hover:text-slate-300 cursor-pointer">API OpenAPI Schema</span>
          <span className="hover:text-slate-300 cursor-pointer">Data Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};
