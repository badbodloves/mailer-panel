import time
import threading
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from .. import state

router = APIRouter()

CONFIG_PATH = "config.ini"


class StartRequest(BaseModel):
    leads_file: str
    smtp_file: str
    overrides: Optional[dict] = None


def _run_mailer(overrides: dict):
    from mailer.mailer_core import MailerCore
    try:
        core = MailerCore(config_path=CONFIG_PATH, overrides=overrides)
        with state.lock:
            state.mailer_core = core
            state.last_error = ""
        core.run()
    except Exception as exc:
        with state.lock:
            state.last_error = str(exc)
    finally:
        with state.lock:
            state.running = False
            state.mailer_core = None


@router.post("/start")
def start_campaign(req: StartRequest):
    with state.lock:
        if state.running:
            raise HTTPException(400, "Campaign already running")
    overrides = {"paths.leads_file": req.leads_file, "paths.smtp_file": req.smtp_file}
    if req.overrides:
        overrides.update(req.overrides)
    with state.lock:
        state.running = True
        state.started_at = time.time()
    t = threading.Thread(target=_run_mailer, args=(overrides,), daemon=True)
    t.start()
    with state.lock:
        state.mailer_thread = t
    return {"status": "started"}


@router.post("/pause")
def pause_campaign():
    with state.lock:
        core = state.mailer_core
    if not core:
        raise HTTPException(400, "No campaign running")
    core.stop()
    return {"status": "paused", "detail": "Pending leads preserved. Use /start to resume."}


@router.post("/stop")
def force_stop_campaign():
    with state.lock:
        core = state.mailer_core
    if not core:
        raise HTTPException(400, "No campaign running")
    core.force_stop()
    with state.lock:
        state.running = False
    return {"status": "stopped", "detail": "IN_PROGRESS reset to PENDING."}


@router.get("/status")
def campaign_status():
    with state.lock:
        return {
            "running": state.running,
            "started_at": state.started_at,
            "elapsed": time.time() - state.started_at if state.running else 0,
            "last_error": state.last_error,
        }
