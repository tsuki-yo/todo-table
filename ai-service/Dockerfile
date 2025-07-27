# Multi-stage build for optimization
FROM python:3.11-slim as builder

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Download spaCy model (this installs globally and links to user directory)
RUN python -m spacy download ja_core_news_sm
# Create link for user directory access
RUN python -c "import spacy; spacy.cli.link('ja_core_news_sm', 'ja_core_news_sm', force=True, user=False)"

# Production stage
FROM python:3.11-slim

# Install only runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Python packages from builder to home directory
COPY --from=builder /root/.local /home/appuser/.local
# Copy spaCy models from global site-packages
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Create non-root user first
RUN adduser --disabled-password --gecos '' appuser

# Set working directory
WORKDIR /app

# Copy application code
COPY main.py .
COPY .env.example .

# Change ownership of copied files
RUN chown -R appuser:appuser /app /home/appuser/.local

# Switch to non-root user
USER appuser

# Make sure scripts in .local are usable
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/home/appuser/.local/lib/python3.11/site-packages

# Expose port
EXPOSE 3003

# Health check with shorter intervals
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=2 \
  CMD curl -f http://localhost:3003/health || exit 1

# Start the application
CMD ["python", "main.py"]