# 产品二：文心工作台

访问 `http://localhost:8102`，同一内网的其他设备使用 `http://<服务器内网IP>:8102`。项目二与项目一使用同一个 8000 端口后端，各自的前端独立运行。

在两个终端分别运行：

```powershell
cd C:\workspace\1030project\backend
python server.py
```

```powershell
cd C:\workspace\1030project\project-02-writing\frontend
npm install
npm run build
npm run preview
```

已运行共用后端时，无需再次启动。写作服务从 `backend/.env` 读取 `OPENROUTER_API_KEY`；可选配置 `OPENROUTER_MODEL`、`OPENROUTER_BASE_URL` 与 `OPENROUTER_PROXY`（例如 `http://127.0.0.1:7897`），更改后重启后端。请在本地文件填写 Key，不需要把 Key 发到聊天中。用户输入在启用实时生成时会发送给模型服务。

未配置 Key 或接口不可用时，系统返回标注为“演示样稿”的本地模板文本。演示样稿的目标字数是提示，长度不保证精确；实时生成也可能偏离目标字数。选中正文文字后可润色、扩写、缩写、续写或收藏；预览确认后替换。保存后可查看按段落高亮的版本对比并恢复历史内容。模板可编辑，修改后对新生成请求生效。

设计方向按用户选择的 A 版实现，原型和确认记录分别在 `design-demos/` 与 `direction-approved.md`。
