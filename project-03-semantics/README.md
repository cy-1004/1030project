# 产品三：智能语义理解

当前阶段：共用后端模块与自动测试已完成，三份可交互的界面初稿位于 `design-demos/`；正式 React 前端将在选定方向后接入后端。

初稿预览：`http://localhost:8103`，内网其他设备使用 `http://<内网IP>:8103`。如需重启预览：

```powershell
cd C:\workspace\1030project
python -m http.server 8103 --bind 0.0.0.0 --directory project-03-semantics/design-demos
```

初稿使用本地虚构样例和简单匹配，未保存处理记录。后端实现位于 `backend/semantics_service.py`，包括三个场景、30 个术语、规则管理、分析、问答、结果快照和复跑；数据使用共用 SQLite 数据库。默认分析不调用模型，只有请求中明确启用模型时才读取现有 `backend/.env` 的 OpenRouter 配置。模型问答的引用必须逐字出现在输入中，引用匹配仍不代表回答语义完全正确，需要用户核对。

后端测试：在 `backend/` 运行 `python -m unittest test_writing test_semantics`。测试使用临时数据库与禁用 Key 的隔离进程，不改动演示数据。
