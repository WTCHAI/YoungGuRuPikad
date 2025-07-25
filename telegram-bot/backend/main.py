from fastapi import FastAPI
from .config import settings
from .routes import device_routes, blockchain_routes, subscriber_routes

# Create FastAPI app
app = FastAPI(title=settings.app_name)

# Include route modules
app.include_router(device_routes.router)
app.include_router(blockchain_routes.router)
app.include_router(subscriber_routes.router)

@app.get("/")
def read_root():
    return {"message": settings.app_name}

@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.app_name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
