FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install dependencies using uv sync
RUN uv sync --frozen || uv sync

# Copy source code and models
COPY src/ src/
COPY models/ models/
COPY traffic.db .

EXPOSE 8000

CMD ["uv", "run", "src/main.py"]
