import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from unittest.mock import patch

import writing_service


class WritingAPITest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            cls.port = sock.getsockname()[1]
        env = os.environ.copy()
        env.update(HOST='127.0.0.1', PORT=str(cls.port), DB_PATH=str(Path(cls.temp.name) / 'test.sqlite3'), OPENROUTER_API_KEY='')
        cls.process = subprocess.Popen([sys.executable, str(Path(__file__).with_name('server.py'))], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        for _ in range(50):
            try:
                cls.call('/api/health'); break
            except URLError:
                time.sleep(.1)
        else:
            raise RuntimeError('test server failed to start')

    @classmethod
    def tearDownClass(cls):
        cls.process.terminate(); cls.process.wait(timeout=5); cls.temp.cleanup()

    @classmethod
    def call(cls, path, method='GET', data=None):
        raw = None if data is None else json.dumps(data, ensure_ascii=False).encode()
        req = Request(f'http://127.0.0.1:{cls.port}{path}', data=raw, headers={'Content-Type':'application/json'}, method=method)
        with urlopen(req, timeout=5) as res: return json.load(res)

    def test_writing_flow_and_versions(self):
        templates=self.call('/api/writing/templates')
        self.assertGreaterEqual(len(templates),6)
        result=self.call('/api/writing/generate','POST',{'kind':'reflection','topic':'阅读与成长','keywords':['坚持'],'structure':templates[-2]['structure']})
        self.assertEqual(result['source'],'演示样稿'); self.assertIn('阅读与成长',result['content'])
        item=self.call('/api/writing/drafts','POST',{'title':'测试稿','kind':'reflection','content':result['content'],'source':result['source']})
        path='/api/writing/drafts/'+item['id']
        self.call(path,'PUT',{'title':'测试稿','content':result['content']+'\n新段落','kind':'poem','source':'手动编辑'})
        versions=self.call(path+'/versions')
        self.assertEqual(len(versions),2)
        updated=self.call(path)
        self.assertEqual(updated['content'],result['content']+'\n新段落')
        self.assertEqual((updated['kind'],updated['source']),('poem','手动编辑'))
        self.call(path,'DELETE')
        with self.assertRaises(HTTPError) as caught: self.call(path)
        caught.exception.close()

    def test_empty_topic_rejected(self):
        with self.assertRaises(HTTPError) as caught: self.call('/api/writing/generate','POST',{'topic':''})
        self.assertEqual(caught.exception.code,400)
        caught.exception.close()

    def test_template_structure_and_rewrite(self):
        self.call('/api/writing/templates/reflection-work','PUT',{'name':'工作感悟','structure':'新的开头\n新的行动'})
        templates=self.call('/api/writing/templates')
        template=next(x for x in templates if x['id']=='reflection-work')
        result=self.call('/api/writing/generate','POST',{'kind':'reflection','topic':'新目标','structure':template['structure']})
        self.assertIn('新的开头',result['content'])
        rewritten=self.call('/api/writing/rewrite','POST',{'text':'坚持练习。','action':'扩写'})
        self.assertIn('坚持练习',rewritten['content'])
        self.assertEqual(rewritten['source'],'演示样稿')

    def test_model_success_and_failure_are_identified(self):
        response=BytesIO(json.dumps({'choices':[{'message':{'content':'真实生成的测试文本'}}]}).encode())
        with patch.dict(os.environ, {'OPENROUTER_API_KEY':'test-key','OPENROUTER_PROXY':''}), patch('writing_service.urlopen', return_value=response):
            result=writing_service.generate({'kind':'essay','topic':'阅读'})
        self.assertEqual((result['source'],result['content']),('实时生成','真实生成的测试文本'))
        with patch.dict(os.environ, {'OPENROUTER_API_KEY':'test-key','OPENROUTER_PROXY':''}), patch('writing_service.urlopen', side_effect=URLError('offline')):
            result=writing_service.generate({'kind':'essay','topic':'阅读'})
        self.assertEqual(result['source'],'演示样稿')
        self.assertIn('暂不可用',result['notice'])


if __name__ == '__main__':
    unittest.main()
