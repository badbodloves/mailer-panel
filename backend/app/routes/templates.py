import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

HTML_DIR = "html_bodies"
os.makedirs(HTML_DIR, exist_ok=True)


@router.get("/")
def list_templates():
    if not os.path.isdir(HTML_DIR):
        return []
    return sorted(f for f in os.listdir(HTML_DIR) if f.lower().endswith((".html", ".htm")))


@router.get("/{filename}")
def get_template(filename: str):
    path = os.path.join(HTML_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(404, "Template not found")
    with open(path, "r", encoding="utf-8") as fh:
        return {"filename": filename, "content": fh.read()}


class TemplateSave(BaseModel):
    filename: str
    content: str


@router.put("/")
def save_template(req: TemplateSave):
    path = os.path.join(HTML_DIR, req.filename)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(req.content)
    return {"saved": path}


@router.delete("/{filename}")
def delete_template(filename: str):
    path = os.path.join(HTML_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(404, "Template not found")
    os.unlink(path)
    return {"deleted": path}


class PreviewRequest(BaseModel):
    html: str
    email: str = "preview@example.com"


@router.post("/preview")
def preview_template(req: PreviewRequest):
    try:
        from mailer.content_engine import ContentEngine
        from mailer.antifingerprint import AntiFingerprintEngine
        import configparser
        cp = configparser.ConfigParser()
        if os.path.isfile("config.ini"):
            cp.read("config.ini", encoding="utf-8")
        ce = ContentEngine(
            html_dir=HTML_DIR, attachments_dir="",
            spintax_dir=cp.get("paths", "spintax_dir", fallback="spintaxes"),
            names_file=cp.get("paths", "names_file", fallback=""),
            subjects_file=cp.get("paths", "subjects_file", fallback=""),
        )
        af = AntiFingerprintEngine(enable_classes=False)
        html = af.transform(ce.process(req.html, req.email))
        plain = ContentEngine.html_to_plaintext(html)
        return {"html": html, "plain": plain}
    except Exception as exc:
        raise HTTPException(500, str(exc))
