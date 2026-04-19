import os
import configparser
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

CONFIG_PATH = "config.ini"


def _read() -> dict:
    cp = configparser.ConfigParser()
    if os.path.isfile(CONFIG_PATH):
        cp.read(CONFIG_PATH, encoding="utf-8")
    return {sec: dict(cp[sec]) for sec in cp.sections()}


def _write(data: dict):
    cp = configparser.ConfigParser()
    for sec, vals in data.items():
        cp[sec] = {k: str(v) for k, v in vals.items()}
    with open(CONFIG_PATH, "w", encoding="utf-8") as fh:
        cp.write(fh)


@router.get("/")
def get_config():
    return _read()


class ConfigUpdate(BaseModel):
    sections: Dict[str, Dict[str, str]]


@router.put("/")
def update_config(req: ConfigUpdate):
    current = _read()
    for sec, vals in req.sections.items():
        if sec not in current:
            current[sec] = {}
        current[sec].update(vals)
    _write(current)
    return {"status": "saved"}


@router.get("/{section}")
def get_section(section: str):
    cfg = _read()
    if section not in cfg:
        return {}
    return cfg[section]
