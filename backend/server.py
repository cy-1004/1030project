"""Six-project demo API, starting with avatar works. Python standard library only."""
from __future__ import annotations

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from contextlib import contextmanager
from urllib.parse import urlparse
import writing_service
import semantics_service

ROOT = Path(__file__).resolve().parent


def load_env() -> None:
    path = ROOT / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env()
DB = ROOT / os.getenv("DB_PATH", "avatar_demo.sqlite3")

CATALOG = {
    "presets": [
        {"id": "mira", "name": "都市漫游者", "subtitle": "优雅 / 松弛", "skinId": "warm", "hairId": "bob", "outfitId": "trench"},
        {"id": "noa", "name": "艺廊策展人", "subtitle": "极简 / 先锋", "skinId": "light", "hairId": "sleek", "outfitId": "blazer"},
        {"id": "sol", "name": "日落旅人", "subtitle": "自由 / 自然", "skinId": "deep", "hairId": "waves", "outfitId": "knit"},
    ],
    "skins": [{"id": "light", "name": "瓷白"}, {"id": "warm", "name": "暖沙"}, {"id": "deep", "name": "琥珀"}],
    "hairs": [
        {"id": "bob", "name": "法式短发", "tag": "随性"}, {"id": "sleek", "name": "利落低束", "tag": "干练"},
        {"id": "waves", "name": "长卷发", "tag": "柔和"}, {"id": "pixie", "name": "精灵短发", "tag": "先锋"},
        {"id": "bun", "name": "高髻", "tag": "精致"}, {"id": "long", "name": "自然长发", "tag": "经典"},
    ],
    "outfits": [
        {"id": "trench", "name": "廓形风衣", "tag": "当季精选"}, {"id": "blazer", "name": "雕塑西装", "tag": "都会"},
        {"id": "knit", "name": "柔雾针织", "tag": "松弛"}, {"id": "dress", "name": "缎面长裙", "tag": "晚宴"},
        {"id": "jacket", "name": "短款夹克", "tag": "街头"}, {"id": "shirt", "name": "极简衬衫", "tag": "日常"},
    ],
    "shoes": [
        {"id": "boots", "name": "长筒靴", "tag": "利落"}, {"id": "heels", "name": "尖头高跟", "tag": "优雅"},
        {"id": "sneakers", "name": "厚底运动鞋", "tag": "舒适"}, {"id": "loafers", "name": "方头乐福", "tag": "通勤"},
        {"id": "ankle", "name": "短靴", "tag": "经典"}, {"id": "sandals", "name": "细带凉鞋", "tag": "轻盈"},
    ],
    "scenes": [
        {"id": "gallery", "name": "光之艺廊"}, {"id": "dusk", "name": "暮色之城"}, {"id": "studio", "name": "象牙摄影棚"},
    ],
}
ALLOWED = {
    "presetId": {x["id"] for x in CATALOG["presets"]},
    "skinId": {x["id"] for x in CATALOG["skins"]},
    "hairId": {x["id"] for x in CATALOG["hairs"]},
    "outfitId": {x["id"] for x in CATALOG["outfits"]},
    "shoesId": {x["id"] for x in CATALOG["shoes"]},
    "sceneId": {x["id"] for x in CATALOG["scenes"]},
}


def config(**changes):
    value = {"presetId": "mira", "skinId": "warm", "hairId": "bob", "hairColor": "espresso",
             "outfitId": "trench", "outfitColor": "sand", "size": "M", "shoesId": "boots",
             "shoesColor": "ink", "sceneId": "gallery",
             "face": {"shape": 2, "eyes": 2, "nose": 2, "smile": 2}}
    value.update(changes)
    return value


SEEDS = [
    ("秋日城市漫游", config()),
    ("午夜艺廊", config(presetId="noa", skinId="light", hairId="sleek", outfitId="blazer", outfitColor="ink", shoesId="heels", shoesColor="ink", sceneId="dusk")),
    ("暖阳假日", config(presetId="sol", skinId="deep", hairId="waves", hairColor="chestnut", outfitId="dress", outfitColor="ivory", shoesId="sandals", shoesColor="sand", sceneId="studio")),
]


@contextmanager
def connect():
    conn = sqlite3.connect(DB, timeout=5)
    conn.row_factory = sqlite3.Row
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def init_db():
    with connect() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS avatar_works (id TEXT PRIMARY KEY, name TEXT NOT NULL, config TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)")
        if conn.execute("SELECT COUNT(*) FROM avatar_works").fetchone()[0] == 0:
            now = datetime.now(timezone.utc).isoformat()
            conn.executemany("INSERT INTO avatar_works VALUES (?, ?, ?, ?, ?)",
                             [(str(uuid.uuid4()), name, json.dumps(conf, ensure_ascii=False), now, now) for name, conf in SEEDS])
    writing_service.init_db(connect)
    semantics_service.init_db(connect)


def row_data(row):
    return {"id": row["id"], "name": row["name"], "config": json.loads(row["config"]),
            "createdAt": row["created_at"], "updatedAt": row["updated_at"]}


def validate(body):
    if not isinstance(body, dict):
        raise ValueError("请求体必须是对象")
    name = str(body.get("name", "")).strip()
    if not 1 <= len(name) <= 60:
        raise ValueError("作品名称需为 1—60 字")
    conf = body.get("config")
    if not isinstance(conf, dict):
        raise ValueError("缺少形象配置")
    for field, ids in ALLOWED.items():
        if conf.get(field) not in ids:
            raise ValueError(f"无效的 {field}")
    for field, choices in {"hairColor": {"espresso", "chestnut", "honey"},
                           "outfitColor": {"sand", "ink", "ivory", "rose"},
                           "shoesColor": {"ink", "sand", "ivory"}, "size": {"S", "M", "L"}}.items():
        if conf.get(field) not in choices:
            raise ValueError(f"无效的 {field}")
    face = conf.get("face")
    if not isinstance(face, dict) or any(type(face.get(k)) is not int or not 0 <= face[k] <= 4 for k in ("shape", "eyes", "nose", "smile")):
        raise ValueError("脸部参数无效")
    return name, conf


class Handler(BaseHTTPRequestHandler):
    def respond(self, code, data):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.respond(200, {})

    def body(self):
        size = int(self.headers.get("Content-Length", "0"))
        if size > 1_000_000:
            raise ValueError("请求内容过大")
        return json.loads(self.rfile.read(size) or b"{}")

    def do_GET(self):
        path = urlparse(self.path).path
        if writing_service.handle(self, 'GET', path, connect):
            return
        if semantics_service.handle(self, 'GET', path, connect):
            return
        if path == "/api/health":
            return self.respond(200, {"ok": True})
        if path == "/api/avatar/catalog":
            return self.respond(200, CATALOG)
        if path == "/api/avatar/works":
            with connect() as conn:
                rows = conn.execute("SELECT * FROM avatar_works ORDER BY updated_at DESC").fetchall()
            return self.respond(200, [row_data(row) for row in rows])
        if path.startswith("/api/avatar/works/"):
            work_id = path.rsplit("/", 1)[-1]
            with connect() as conn:
                row = conn.execute("SELECT * FROM avatar_works WHERE id = ?", (work_id,)).fetchone()
            return self.respond(200, row_data(row)) if row else self.respond(404, {"error": "作品不存在"})
        self.respond(404, {"error": "接口不存在"})

    def do_POST(self):
        path = urlparse(self.path).path
        if writing_service.handle(self, 'POST', path, connect):
            return
        if semantics_service.handle(self, 'POST', path, connect):
            return
        try:
            if path == "/api/avatar/works":
                name, conf = validate(self.body())
            elif path.startswith("/api/avatar/works/") and path.endswith("/copy"):
                work_id = path.split("/")[-2]
                with connect() as conn:
                    row = conn.execute("SELECT * FROM avatar_works WHERE id = ?", (work_id,)).fetchone()
                if not row:
                    return self.respond(404, {"error": "作品不存在"})
                name, conf = row["name"] + " · 副本", json.loads(row["config"])
            else:
                return self.respond(404, {"error": "接口不存在"})
            work_id, now = str(uuid.uuid4()), datetime.now(timezone.utc).isoformat()
            with connect() as conn:
                conn.execute("INSERT INTO avatar_works VALUES (?, ?, ?, ?, ?)", (work_id, name, json.dumps(conf, ensure_ascii=False), now, now))
            self.respond(201, {"id": work_id, "name": name, "config": conf, "createdAt": now, "updatedAt": now})
        except (ValueError, json.JSONDecodeError) as exc:
            self.respond(400, {"error": str(exc)})

    def do_PUT(self):
        path = urlparse(self.path).path
        if writing_service.handle(self, 'PUT', path, connect):
            return
        if semantics_service.handle(self, 'PUT', path, connect):
            return
        if not path.startswith("/api/avatar/works/"):
            return self.respond(404, {"error": "接口不存在"})
        try:
            name, conf = validate(self.body())
        except (ValueError, json.JSONDecodeError) as exc:
            return self.respond(400, {"error": str(exc)})
        work_id, now = path.rsplit("/", 1)[-1], datetime.now(timezone.utc).isoformat()
        with connect() as conn:
            cursor = conn.execute("UPDATE avatar_works SET name = ?, config = ?, updated_at = ? WHERE id = ?",
                                  (name, json.dumps(conf, ensure_ascii=False), now, work_id))
        self.respond(200, {"id": work_id, "name": name, "config": conf, "updatedAt": now}) if cursor.rowcount else self.respond(404, {"error": "作品不存在"})

    def do_DELETE(self):
        path = urlparse(self.path).path
        if writing_service.handle(self, 'DELETE', path, connect):
            return
        if semantics_service.handle(self, 'DELETE', path, connect):
            return
        if not path.startswith("/api/avatar/works/"):
            return self.respond(404, {"error": "接口不存在"})
        with connect() as conn:
            cursor = conn.execute("DELETE FROM avatar_works WHERE id = ?", (path.rsplit("/", 1)[-1],))
        self.respond(200, {"ok": True}) if cursor.rowcount else self.respond(404, {"error": "作品不存在"})


if __name__ == "__main__":
    init_db()
    host, port = os.getenv("HOST", "0.0.0.0"), int(os.getenv("PORT", "8000"))
    print(f"Avatar demo API running at http://{host}:{port}")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
