"""FastAPI entry point. Run: uvicorn app.main:app --reload"""
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "mailer"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import campaign, files, config, stats, logs, templates

app = FastAPI(title="Mailer Panel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaign.router, prefix="/api/campaign", tags=["Campaign"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(config.router, prefix="/api/config", tags=["Config"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])

@app.get("/api/health")
def health():
    return {"status": "ok"}
