import os
from fastapi import APIRouter

router = APIRouter()

LOG_FILE = "smtp_errors.log"


@router.get("/")
def get_logs(lines: int = 50):
    if not os.path.isfile(LOG_FILE):
        return {"lines": [], "total": 0}
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as fh:
            all_lines = fh.readlines()
        tail = [l.rstrip() for l in all_lines[-lines:]]
        return {"lines": tail, "total": len(all_lines)}
    except OSError:
        return {"lines": [], "total": 0}


@router.delete("/")
def clear_logs():
    if os.path.isfile(LOG_FILE):
        open(LOG_FILE, "w").close()
    return {"status": "cleared"}
