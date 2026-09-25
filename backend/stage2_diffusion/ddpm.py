import torch
import torch.nn as nn
from diffusers import DDPMScheduler, UNet2DConditionModel

class ConditionalDDPMDownscaler(nn.Module):
    """
    Conditional DDPM for amplitude-preserving 12->5km downscaling.
    Avoids spectral smoothing inherent in simple U-Net approaches.
    """
    def __init__(self):
        super().__init__()
        # Using huggingface diffusers UNet conditioned on coarse NWP and EFI
        self.unet = UNet2DConditionModel(
            sample_size=64, # 5km resolution patch
            in_channels=1,  # e.g., precipitation
            out_channels=1,
            layers_per_block=2,
            block_out_channels=(64, 128, 256, 512),
            down_block_types=(
                "DownBlock2D", "CrossAttnDownBlock2D", "CrossAttnDownBlock2D", "DownBlock2D"
            ),
            up_block_types=(
                "UpBlock2D", "CrossAttnUpBlock2D", "CrossAttnUpBlock2D", "UpBlock2D"
            ),
            cross_attention_dim=128
        )
        self.scheduler = DDPMScheduler(num_train_timesteps=1000)
        
    def forward(self, x, t, context):
        """
        Forward process for DDPM.
        x: target high-res image
        t: timestep
        context: conditional embeddings (12km coarse input + DEM)
        """
        return self.unet(x, t, encoder_hidden_states=context).sample
