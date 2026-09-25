FROM python:3.11-slim

WORKDIR /app

# Copy requirements & install CPU-optimized PyTorch dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy backend source code
COPY backend/ ./backend/

EXPOSE 8000

ENV PYTHONPATH=/app/backend

CMD ["python", "-m", "uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
