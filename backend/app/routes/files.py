import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

router = APIRouter()

LEADS_DIR = "Leads"
SMTPS_DIR = "SMTPs"
LOGOS_DIR = "logos"

for _d in (LEADS_DIR, SMTPS_DIR, LOGOS_DIR):
    os.makedirs(_d, exist_ok=True)


def _scan(folder: str, extensions: tuple = (".txt",)) -> List[dict]:
    if not os.path.isdir(folder):
        return []
    results = []
    for f in sorted(os.listdir(folder)):
        if f.lower().endswith(extensions):
            path = os.path.join(folder, f)
            results.append({
                "name": f,
                "path": path,
                "size": os.path.getsize(path),
            })
    return results


@router.get("/leads")
def list_leads():
    return _scan(LEADS_DIR)


@router.get("/smtps")
def list_smtps():
    return _scan(SMTPS_DIR)


@router.get("/logos")
def list_logos():
    return _scan(LOGOS_DIR, (".png", ".jpg", ".jpeg", ".gif", ".webp"))


@router.post("/upload/{folder}")
async def upload_file(folder: str, file: UploadFile = File(...)):
    if folder == "leads":
        target = LEADS_DIR
    elif folder == "smtps":
        target = SMTPS_DIR
    elif folder == "logos":
        target = LOGOS_DIR
    else:
        raise HTTPException(400, f"Unknown folder: {folder}")
    dest = os.path.join(target, file.filename)
    content = await file.read()
    with open(dest, "wb") as fh:
        fh.write(content)
    return {"saved": dest, "size": len(content)}


@router.delete("/{folder}/{filename}")
def delete_file(folder: str, filename: str):
    if folder == "leads":
        target = LEADS_DIR
    elif folder == "smtps":
        target = SMTPS_DIR
    elif folder == "logos":
        target = LOGOS_DIR
    else:
        raise HTTPException(400, f"Unknown folder: {folder}")
    path = os.path.join(target, filename)
    if not os.path.isfile(path):
        raise HTTPException(404, "File not found")
    os.unlink(path)
    return {"deleted": path}
