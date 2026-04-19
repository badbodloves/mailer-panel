import os
import time
import sqlite3
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import psutil

from .. import state

router = APIRouter()


def _read_config_db_path() -> str:
    import configparser
    cp = configparser.ConfigParser()
    if os.path.isfile("config.ini"):
        cp.read("config.ini", encoding="utf-8")
    return cp.get("database", "db_path", fallback="mailer.db")


def _db_stats() -> dict:
    db_path = _read_config_db_path()
    r = {"PENDING": 0, "SENT": 0, "FAILED": 0, "IN_PROGRESS": 0, "total": 0}
    if not os.path.isfile(db_path):
        return r
    try:
        conn = sqlite3.connect(db_path, timeout=5)
        conn.execute("PRAGMA busy_timeout=5000")
        for s, n in conn.execute("SELECT state, COUNT(*) FROM leads GROUP BY state").fetchall():
            r[s] = n
        r["total"] = conn.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        conn.close()
    except Exception:
        pass
    return r


@router.get("/")
def get_stats():
    stats = _db_stats()
    elapsed = time.time() - state.started_at if state.running else 0
    processed = stats["SENT"] + stats["FAILED"]
    speed = processed / elapsed if elapsed > 0 else 0
    remaining = (stats["total"] - processed) / speed if speed > 0 else 0
    return {
        **stats,
        "running": state.running,
        "elapsed": round(elapsed, 1),
        "speed": round(speed, 2),
        "eta_seconds": round(remaining, 0) if speed > 0 else None,
        "cpu_percent": psutil.cpu_percent(interval=0),
        "ram_percent": psutil.virtual_memory().percent,
    }


@router.websocket("/ws")
async def stats_websocket(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            stats = _db_stats()
            elapsed = time.time() - state.started_at if state.running else 0
            processed = stats["SENT"] + stats["FAILED"]
            speed = processed / elapsed if elapsed > 0 else 0
            remaining = (stats["total"] - processed) / speed if speed > 0 else 0
            await ws.send_json({
                **stats,
                "running": state.running,
                "elapsed": round(elapsed, 1),
                "speed": round(speed, 2),
                "eta_seconds": round(remaining, 0) if speed > 0 else None,
                "cpu_percent": psutil.cpu_percent(interval=0),
                "ram_percent": psutil.virtual_memory().percent,
                "last_error": state.last_error,
            })
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
