# Use Python 3.11 slim image for smaller size
FROM docker.io/library/python:3.11-alpine

# Set working directory
WORKDIR /app

# Copy requirements first (Docker layer caching optimization)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Expose port 8000
EXPOSE 8000

# Run the application
# Using uvicorn directly instead of python main.py for better production setup
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]