import os
import sys
import json
import argparse
import yaml

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.historical_validation import HistoricalValidationEngine

def run_validation_experiment(config_path: str = None):
    print("=" * 80)
    print(" StormTrace AI - SIH26078 Historical Ground-Truth Validation Framework")
    print("=" * 80)

    engine = HistoricalValidationEngine()
    results = engine.evaluate_historical_case_studies()

    export_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "data")
    os.makedirs(export_dir, exist_ok=True)
    export_file = os.path.join(export_dir, "historical_validation_10y_report.json")

    with open(export_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n[SUCCESS] Historical Validation Framework Execution Completed.")
    print(f"   -> Evaluated Disasters: {results['totalHistoricalEvents']} Major Events (2014-2024)")
    print(f"   -> Mean Track Position Error: {results['overallSummaryMetrics']['meanPositionTrackErrorKm']:.2f} km")
    print(f"   -> Critical Success Index (CSI): {results['overallSummaryMetrics']['meanCsiScore']:.3f}")
    print(f"   -> Probability of Detection (POD): {results['overallSummaryMetrics']['meanPodScore']:.3f}")
    print(f"   -> False Alarm Ratio (FAR): {results['overallSummaryMetrics']['meanFarScore']:.3f}")
    print(f"   -> Extreme Peak Preservation: {results['overallSummaryMetrics']['meanPeakPreservationPct']:.1f}%")
    print(f"\n Detailed Evidence Report Saved to: {export_file}")
    print("=" * 80)
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Historical Validation Experiment")
    parser.add_argument("--config", type=str, default="configs/demo.yaml", help="Path to validation config")
    args = parser.parse_args()
    run_validation_experiment(args.config)
