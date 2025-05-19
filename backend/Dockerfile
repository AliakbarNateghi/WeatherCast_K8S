# Development FastAPI with live reload
FROM python:3.11-alpine

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install development dependencies
RUN pip install watchdog

# Copy application code
COPY main.py .

# Expose port
EXPOSE 8000

# For development: mount code as volume and use auto-reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

