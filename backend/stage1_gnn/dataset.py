"""
StormTrace AI - PyTorch Dataset for Spherical ST-GNN Training (SIH26078)
"""
import torch
import numpy as np
from torch.utils.data import Dataset
from backend.data.synthetic import generate_synthetic_nwp_tensor

class WeatherSphericalGraphDataset(Dataset):
    """
    Dataset wrapping weather tensors into graph node feature sequences over time.
    """
    def __init__(self, num_samples=10, timesteps=9, num_nodes=42):
        self.num_samples = num_samples
        self.timesteps = timesteps
        self.num_nodes = num_nodes
        self.samples = []

        for s in range(num_samples):
            data = generate_synthetic_nwp_tensor(members=50, timesteps=timesteps, seed=100 + s)
            tensor = data["tensor"] # [50, 9, 6, 30, 30]
            mean_tensor = tensor.mean(axis=0) # [9, 6, 30, 30]
            
            # Subsample grid to graph nodes (42 nodes)
            node_feats = []
            for t in range(timesteps):
                # Spatial pooling to 42 node features
                flat_feats = mean_tensor[t].reshape(6, -1).T # [900, 6]
                indices = np.linspace(0, 899, num_nodes, dtype=int)
                node_feat_t = flat_feats[indices] # [42, 6]
                node_feats.append(node_feat_t)
            
            x_seq = torch.tensor(np.stack(node_feats, axis=0), dtype=torch.float32) # [9, 42, 6]
            y_track = torch.tensor(np.random.normal(0, 0.5, (timesteps, 2)), dtype=torch.float32)
            y_intensity = torch.tensor(np.random.normal(120, 15, (timesteps, 1)), dtype=torch.float32)

            self.samples.append((x_seq, y_track, y_intensity))

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return self.samples[idx]
