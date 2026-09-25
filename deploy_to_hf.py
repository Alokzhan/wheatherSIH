import os
import sys
import subprocess

# Ensure UTF-8 output encoding on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("==================================================")
    print("🌩️ StormTrace AI - Automated Hugging Face Space Deployer")
    print("==================================================")

    # 1. Install huggingface_hub if missing
    try:
        from huggingface_hub import HfApi, create_repo, upload_folder
    except ImportError:
        print("📦 Installing huggingface_hub library...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub"])
        from huggingface_hub import HfApi, create_repo, upload_folder

    # 2. Get HF Access Token
    hf_token = os.environ.get("HF_TOKEN")
    if not hf_token:
        hf_token = input("\n🔑 Enter your Hugging Face Access Token (starts with hf_...): ").strip()
    
    if not hf_token:
        print("❌ Error: Hugging Face Access Token is required.")
        print("👉 Get your token in 1 click at: https://huggingface.co/settings/tokens (Role: Write)")
        sys.exit(1)

    api = HfApi(token=hf_token)
    
    # 3. Get User Identity
    try:
        user_info = api.whoami()
        username = user_info['name']
        print(f"✅ Authenticated as Hugging Face User: {username}")
    except Exception as e:
        print(f"❌ Failed to authenticate with Hugging Face Token: {e}")
        print("👉 Please check your token at https://huggingface.co/settings/tokens")
        sys.exit(1)

    repo_id = f"{username}/stormtrace-backend"

    # 4. Create Space Repository
    print(f"\n🚀 Creating/Verifying Hugging Face Space: {repo_id}...")
    try:
        create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            private=False,
            token=hf_token,
            exist_ok=True
        )
        print(f"✅ Space repository '{repo_id}' ready!")
    except Exception as e:
        print(f"⚠️ Repo creation notice: {e}")

    # 5. Prepare Space README with HF Metadata
    space_readme_content = f"""---
title: StormTrace AI Anomaly Tracking API
emoji: 🌩️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# 🌩️ StormTrace AI - Backend API
Extreme Weather Anomaly Tracking and Hyperlocal Impact Downscaling API Service.
"""
    
    # Write temp README.md for the space
    temp_dir = os.path.join(os.path.dirname(__file__), ".hf_space_staging")
    os.makedirs(temp_dir, exist_ok=True)
    
    with open(os.path.join(temp_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write(space_readme_content)

    # Copy Dockerfile
    with open(os.path.join(os.path.dirname(__file__), "Dockerfile"), "r", encoding="utf-8") as f_src:
        with open(os.path.join(temp_dir, "Dockerfile"), "w", encoding="utf-8") as f_dst:
            f_dst.write(f_src.read())

    # Copy backend folder recursively
    import shutil
    backend_src = os.path.join(os.path.dirname(__file__), "backend")
    backend_dst = os.path.join(temp_dir, "backend")
    if os.path.exists(backend_dst):
        shutil.rmtree(backend_dst)
    shutil.copytree(backend_src, backend_dst, ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '*.db'))

    # 6. Upload files to Hugging Face Space
    print(f"📤 Uploading backend code & Dockerfile to Hugging Face Space ({repo_id})...")
    try:
        upload_folder(
            folder_path=temp_dir,
            repo_id=repo_id,
            repo_type="space",
            token=hf_token,
            commit_message="Deploy StormTrace AI FastAPI Backend"
        )
        print("✅ Files uploaded successfully!")
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        sys.exit(1)
    finally:
        # Cleanup staging dir
        shutil.rmtree(temp_dir, ignore_errors=True)

    # 7. Output Result
    live_api_url = f"https://{username.lower()}-stormtrace-backend.hf.space"
    print("\n==================================================")
    print("🎉 DEPLOYMENT SUCCESSFUL!")
    print(f"🔗 Hugging Face Space Dashboard: https://huggingface.co/spaces/{repo_id}")
    print(f"🌐 Live API URL for Vercel VITE_API_URL: {live_api_url}")
    print("==================================================")

if __name__ == "__main__":
    main()
