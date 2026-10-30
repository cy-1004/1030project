"""Writing demo endpoints shared with the avatar backend."""
from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import ProxyHandler, Request, build_opener, urlopen

TEMPLATES = [
    ('essay-story', '记叙文', 'essay', '开头\n经历\n感悟\n结尾'),
    ('essay-argument', '议论文', 'essay', '提出观点\n举例论证\n总结观点'),
    ('poem-free', '自由诗', 'poem', '意象\n情感\n收束'),
    ('poem-classic', '古风短诗', 'poem', '起句\n承句\n转句\n结句'),
    ('reflection-learning', '学习心得', 'reflection', '学习背景\n主要收获\n实践计划\n总结'),
    ('reflection-work', '工作感悟', 'reflection', '背景\n观察\n行动\n展望'),
]


def now():
    return datetime.now(timezone.utc).isoformat()


def init_db(connect):
    with connect() as db:
        db.execute('CREATE TABLE IF NOT EXISTS writing_templates (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, structure TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS writing_drafts (id TEXT PRIMARY KEY, title TEXT NOT NULL, kind TEXT NOT NULL, content TEXT NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS writing_versions (id TEXT PRIMARY KEY, draft_id TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(draft_id) REFERENCES writing_drafts(id))')
        db.execute('CREATE TABLE IF NOT EXISTS writing_favorites (id TEXT PRIMARY KEY, content TEXT NOT NULL, created_at TEXT NOT NULL)')
        db.executemany('INSERT OR IGNORE INTO writing_templates VALUES (?, ?, ?, ?)', TEMPLATES)


def draft(row):
    return {'id': row['id'], 'title': row['title'], 'kind': row['kind'], 'content': row['content'], 'source': row['source'], 'createdAt': row['created_at'], 'updatedAt': row['updated_at']}


def required(body, key, limit=30000):
    value = str(body.get(key, '')).strip()
    if not value or len(value) > limit:
        raise ValueError(f'{key} 不能为空且不能超过 {limit} 字')
    return value


def demo_text(kind, topic, keywords, structure):
    detail = '、'.join(keywords) if keywords else '观察、思考与行动'
    if kind == 'poem':
        return f'{topic}\n\n我把{topic}轻轻写在风里，\n让{detail}穿过安静的日子。\n每一次回望，都是新的出发，\n每一步向前，都有微光相伴。'
    sections = [x.strip() for x in structure.splitlines() if x.strip()] or ['开头', '体会', '行动', '结尾']
    ideas = [f'关于“{topic}”，我想从日常中的一次经历谈起。起初，我只看见眼前的任务，后来才逐渐理解其中更深的意义。',
             f'这次经历让我重新认识了{detail}。真正的收获并不只在结果，更在于遇到问题时愿意停下来观察、交流并调整方法。',
             f'今后，我会把对{topic}的理解落实到具体行动中：先制定小目标，再记录过程，定期回顾哪些做法有效、哪些还需要改进。',
             f'回顾这段经历，我明白成长来自持续的练习。带着这份认识，我愿意在下一次实践中继续尝试。']
    return topic + '\n\n' + '\n\n'.join(section + '\n' + ideas[i % len(ideas)] for i, section in enumerate(sections[:6]))


def generate(body, rewrite=False):
    key = os.getenv('OPENROUTER_API_KEY', '').strip()
    if rewrite:
        original = required(body, 'text')
        action = str(body.get('action', '润色'))[:20]
        prompt = f'请对以下文字执行“{action}”，只返回改写后的正文，保留原意：\n{original}'
        if action in ('扩写', '续写'):
            fallback = original + '\n\n进一步来看，这一经历提醒我们，要把思考落实到具体行动，并在实践中不断改进。'
        elif action == '缩写':
            sentences = [s.strip() for s in original.replace('！', '。').replace('？', '。').split('。') if s.strip()]
            fallback = '。'.join(sentences[:max(1, (len(sentences) + 1) // 2)]) + '。'
        else:
            fallback = '回顾这段经历，' + original.strip().replace('  ', ' ')
    else:
        topic = required(body, 'topic', 200)
        kind = str(body.get('kind', 'essay'))
        if kind not in ('essay', 'poem', 'reflection'):
            raise ValueError('文体无效')
        keywords = body.get('keywords', [])
        if isinstance(keywords, str):
            keywords = [x.strip() for x in keywords.replace('，', ',').split(',') if x.strip()]
        if not isinstance(keywords, list):
            raise ValueError('关键词格式无效')
        keywords = [str(x)[:60] for x in keywords[:8]]
        structure = str(body.get('structure', '开头\n内容\n结尾'))[:2000]
        audience = str(body.get('audience', '一般读者'))[:80]
        length = str(body.get('length', '适中'))[:30]
        prompt = f'请写一篇适合演示的中文{dict(essay="作文",poem="诗歌",reflection="心得体会")[kind]}。主题：{topic}；读者：{audience}；目标字数：{length}；关键词：{"、".join(keywords)}；结构：{structure}；风格：{str(body.get("style", "自然"))[:80]}。输出标题和正文，不附说明。'
        fallback = demo_text(kind, topic, keywords, structure)
    if key:
        payload = json.dumps({'model': os.getenv('OPENROUTER_MODEL', 'openai/gpt-4o-mini'), 'messages': [{'role': 'user', 'content': prompt}], 'max_tokens': 1400}, ensure_ascii=False).encode('utf-8')
        req = Request(os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1').rstrip('/') + '/chat/completions', data=payload, headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'}, method='POST')
        try:
            proxy = os.getenv('OPENROUTER_PROXY', '').strip()
            opener = build_opener(ProxyHandler({'http': proxy, 'https': proxy})) if proxy else None
            with (opener.open(req, timeout=30) if opener else urlopen(req, timeout=30)) as response:
                text = json.load(response)['choices'][0]['message']['content']
            if isinstance(text, str) and text.strip():
                return {'content': text, 'source': '实时生成'}
        except (HTTPError, URLError, TimeoutError, KeyError, IndexError, ValueError, OSError):
            return {'content': fallback, 'source': '演示样稿', 'notice': '实时生成暂不可用，已使用本地样稿。'}
    return {'content': fallback, 'source': '演示样稿', 'notice': '未配置模型 Key，已使用本地样稿。'}


def handle(h, method, path, connect):
    if not path.startswith('/api/writing/'):
        return False
    parts = path.strip('/').split('/')
    try:
        if method == 'GET' and path == '/api/writing/templates':
            with connect() as db:
                rows = db.execute('SELECT * FROM writing_templates ORDER BY rowid').fetchall()
            h.respond(200, [dict(r) for r in rows]); return True
        if method == 'PUT' and len(parts) == 4 and parts[2] == 'templates':
            body = h.body(); name = required(body, 'name', 80); structure = required(body, 'structure', 2000)
            with connect() as db:
                cur = db.execute('UPDATE writing_templates SET name=?, structure=? WHERE id=?', (name, structure, parts[3]))
            h.respond(200 if cur.rowcount else 404, {'ok': bool(cur.rowcount)}); return True
        if method == 'POST' and path in ('/api/writing/generate', '/api/writing/rewrite'):
            h.respond(200, generate(h.body(), path.endswith('/rewrite'))); return True
        if method == 'GET' and path == '/api/writing/drafts':
            with connect() as db:
                rows = db.execute('SELECT * FROM writing_drafts ORDER BY updated_at DESC').fetchall()
            h.respond(200, [draft(r) for r in rows]); return True
        if method == 'POST' and path == '/api/writing/drafts':
            body=h.body(); title=required(body,'title',200); content=required(body,'content'); kind=str(body.get('kind','essay'))
            if kind not in ('essay','poem','reflection'): raise ValueError('文体无效')
            source=str(body.get('source','手动编辑'))[:40]; ident=str(uuid.uuid4()); t=now()
            with connect() as db:
                db.execute('INSERT INTO writing_drafts VALUES (?,?,?,?,?,?,?)',(ident,title,kind,content,source,t,t))
                db.execute('INSERT INTO writing_versions VALUES (?,?,?,?)',(str(uuid.uuid4()),ident,content,t))
            h.respond(201, {'id':ident,'title':title,'kind':kind,'content':content,'source':source,'createdAt':t,'updatedAt':t}); return True
        if len(parts)>=4 and parts[2]=='drafts':
            ident=parts[3]
            with connect() as db:
                row=db.execute('SELECT * FROM writing_drafts WHERE id=?',(ident,)).fetchone()
            if not row: h.respond(404,{'error':'草稿不存在'}); return True
            if method=='GET' and len(parts)==4: h.respond(200,draft(row)); return True
            if method=='GET' and len(parts)==5 and parts[4]=='versions':
                with connect() as db: rows=db.execute('SELECT * FROM writing_versions WHERE draft_id=? ORDER BY created_at DESC',(ident,)).fetchall()
                h.respond(200,[{'id':r['id'],'content':r['content'],'createdAt':r['created_at']} for r in rows]); return True
            if method=='PUT' and len(parts)==4:
                body=h.body(); title=required(body,'title',200); content=required(body,'content'); t=now()
                kind=str(body.get('kind',row['kind'])); source=str(body.get('source',row['source']))[:40]
                if kind not in ('essay','poem','reflection'): raise ValueError('文体无效')
                with connect() as db:
                    db.execute('UPDATE writing_drafts SET title=?,content=?,kind=?,source=?,updated_at=? WHERE id=?',(title,content,kind,source,t,ident))
                    if content!=row['content']: db.execute('INSERT INTO writing_versions VALUES (?,?,?,?)',(str(uuid.uuid4()),ident,content,t))
                h.respond(200,{'id':ident,'title':title,'kind':kind,'content':content,'source':source,'updatedAt':t}); return True
            if method=='DELETE' and len(parts)==4:
                with connect() as db:
                    db.execute('DELETE FROM writing_versions WHERE draft_id=?',(ident,)); db.execute('DELETE FROM writing_drafts WHERE id=?',(ident,))
                h.respond(200,{'ok':True}); return True
        if path=='/api/writing/favorites':
            if method=='GET':
                with connect() as db: rows=db.execute('SELECT * FROM writing_favorites ORDER BY created_at DESC').fetchall()
                h.respond(200,[dict(r) for r in rows]); return True
            if method=='POST':
                content=required(h.body(),'content',2000); ident=str(uuid.uuid4()); t=now()
                with connect() as db: db.execute('INSERT INTO writing_favorites VALUES (?,?,?)',(ident,content,t))
                h.respond(201,{'id':ident,'content':content,'created_at':t}); return True
        h.respond(404,{'error':'接口不存在'}); return True
    except (ValueError, TypeError, json.JSONDecodeError) as exc:
        h.respond(400,{'error':str(exc)}); return True
