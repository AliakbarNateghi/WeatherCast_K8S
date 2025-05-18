from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI instance
app = FastAPI(title="K8s Test API", version="1.0.0")

# Configure CORS - allowing React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello from FastAPI in Kubernetes!"}

# Health check endpoint (important for K8s readiness/liveness probes)
@app.get("/health")
async def health():
    return {"status": "healthy"}

# Simple API endpoint that React will call
@app.get("/api/data")
async def get_data():
    return {
        "data": [
            {"id": 1, "name": "Item 1", "description": "First test item"},
            {"id": 2, "name": "Item 2", "description": "Second test item"},
            {"id": 3, "name": "Item 3", "description": "Third test item"}
        ],
        "server": "FastAPI Backend",
        "environment": "Kubernetes"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)