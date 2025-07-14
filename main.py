from fastapi import FastAPI
from api import router

app = FastAPI(title="Enhanced BRSR Search API")

@app.get("/")
def root():
    return {"message": "Hello! FastAPI server is running."}

app.include_router(router)
