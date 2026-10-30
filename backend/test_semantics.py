import json
import os
import socket
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from contextlib import contextmanager
from unittest.mock import patch
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import semantics_service


class SemanticsAPITest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.db_path = str(Path(cls.temp.name) / 'test.sqlite3')
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0)); cls.port = sock.getsockname()[1]
        env = os.environ.copy()
        env.update(HOST='127.0.0.1', PORT=str(cls.port), DB_PATH=cls.db_path, OPENROUTER_API_KEY='')
        cls.process = subprocess.Popen([sys.executable, str(Path(__file__).with_name('server.py'))], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        for _ in range(50):
            try: cls.call('/api/health'); break
            except URLError: time.sleep(.1)
        else: raise RuntimeError('test server failed to start')

    @classmethod
    def tearDownClass(cls):
        cls.process.terminate(); cls.process.wait(timeout=5); cls.temp.cleanup()

    @classmethod
    def call(cls, path, method='GET', data=None):
        if path.startswith('/') and not path.startswith('/api/'):
            path = '/api/semantics' + path
        req = Request(f'http://127.0.0.1:{cls.port}{path}', data=None if data is None else json.dumps(data, ensure_ascii=False).encode(), headers={'Content-Type':'application/json'}, method=method)
        with urlopen(req, timeout=5) as res: return json.load(res)

    @classmethod
    @contextmanager
    def connect(cls):
        conn = sqlite3.connect(cls.db_path); conn.row_factory = sqlite3.Row
        try:
            with conn: yield conn
        finally: conn.close()

    def test_scene_meaning_and_offsets(self):
        meanings=[]
        for scene in ('contract','support','research'):
            terms=self.call('/terms?scene='+scene)
            self.assertGreaterEqual(len(terms),10)
            result=self.call('/analyze','POST',{'scene':scene,'text':'📚合同交付，金额120,000元。'})
            hit=next(t for t in result['terms'] if t['text']=='交付')
            self.assertEqual(result['input'][hit['start']:hit['end']],'交付')
            meanings.append(hit['standard'])
            self.assertTrue(any(e['text']=='120,000元' for e in result['entities']))
        self.assertEqual(len(set(meanings)),3)

    def test_update_replay_and_frozen_history(self):
        original=self.call('/analyze','POST',{'scene':'contract','text':'乙方按期履约。'})
        rule=next(r for r in self.call('/rules?scene=contract') if r['pattern']=='履约')
        self.call('/rules/'+rule['id'],'PUT',{**rule,'replacement':'完成合同责任'})
        replay=self.call('/runs/'+original['id']+'/replay','POST',{})
        self.assertIn('完成合同责任',replay['mappedText'])
        self.assertGreater(replay['versions']['rules'],original['versions']['rules'])
        frozen=self.call('/runs/'+original['id'])
        self.assertEqual(frozen['mappedText'],original['mappedText'])
        self.call('/rules/'+rule['id'],'PUT',rule)

    def test_answers_have_exact_evidence_or_decline(self):
        sample=self.call('/catalog')['samples'][0]
        run=self.call('/analyze','POST',{'scene':'contract','text':sample['text']})
        result=self.call('/ask','POST',{'runId':run['id'],'question':'服务期限是什么？'})
        self.assertTrue(result['evidence'])
        self.assertTrue(all(e in sample['text'] for e in result['evidence']))
        unknown=self.call('/ask','POST',{'runId':run['id'],'question':'老板的生日是哪天？'})
        self.assertEqual(unknown['evidence'],[])
        with patch('semantics_service.model_json',return_value={'answer':'生日为1月1日','evidence':['虚构证据']}):
            invalid=semantics_service.ask({'runId':run['id'],'question':'老板的生日是哪天？','useModel':True},self.connect)
        self.assertEqual(invalid['evidence'],[])
        self.assertNotIn('1月1日',invalid['answer'])

    def test_pipeline_and_validation(self):
        result=self.call('/analyze','POST',{'scene':'support','text':'工单CS-2026-042交付。','pipeline':dict.fromkeys(semantics_service.STEPS,False)})
        self.assertEqual([result[k] for k in ('terms','rules','entities')],[[],[],[]])
        self.assertEqual(result['summary'],'')
        for body in ({'scene':'invalid','text':'文本'},{'scene':'contract','text':''},[]):
            with self.assertRaises(HTTPError) as caught: self.call('/analyze','POST',body)
            self.assertEqual(caught.exception.code,400); caught.exception.close()

    def test_overlapping_rules_do_not_chain(self):
        ids=[]
        try:
            for pattern,replacement,priority in [('甲乙','乙丙',100),('乙丙','再次替换',90),('甲','错误覆盖',10)]:
                item=self.call('/rules','POST',{'scene':'contract','name':'优先级测试','pattern':pattern,'replacement':replacement,'priority':priority,'enabled':True})
                ids.append(item['id'])
            run=self.call('/analyze','POST',{'scene':'contract','text':'甲乙'})
            self.assertEqual(run['mappedText'],'乙丙')
            self.assertEqual(len(run['rules']),1)
        finally:
            for ident in ids: self.call('/rules/'+ident,'DELETE')

    def test_terms_crud(self):
        item=self.call('/terms','POST',{'scene':'research','term':'测试词','standard':'规范说法','definition':'测试释义','aliases':['别名']})
        result=self.call('/analyze','POST',{'scene':'research','text':'文档中出现别名。'})
        self.assertEqual(result['terms'][0]['termId'],item['id'])
        self.call('/terms/'+item['id'],'DELETE')
        semantics_service.init_db(self.connect)
        self.assertFalse(any(t['id']==item['id'] for t in self.call('/terms')))


if __name__=='__main__': unittest.main()
