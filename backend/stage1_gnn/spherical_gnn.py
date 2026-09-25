import torch
import torch.nn as nn
import dgl.nn.pytorch as dglnn

class SphericalGNN(nn.Module):
    """
    Spherical GNN for tracking 4D-ABBs on an icosahedral mesh.
    Tracks centroids and trajectory cones globally.
    """
    def __init__(self, in_feats, hidden_feats, out_feats):
        super().__init__()
        # GraphSAGE on spherical mesh
        self.conv1 = dglnn.SAGEConv(in_feats, hidden_feats, 'mean')
        self.conv2 = dglnn.SAGEConv(hidden_feats, hidden_feats, 'mean')
        
        # Predicts 4D-ABB (x,y,z,t) bounds and anomaly classification
        self.fc_abb = nn.Linear(hidden_feats, out_feats)
        
    def forward(self, g, features):
        x = torch.relu(self.conv1(g, features))
        x = torch.relu(self.conv2(g, x))
        # 4D Anomaly Bounding Box (x,y,z,t) prediction
        abb_pred = self.fc_abb(x)
        return abb_pred
