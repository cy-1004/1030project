# 六项目共用后端

这里是六套演示前端共用的后端。已实现产品一的目录和作品接口、产品二的写作接口；产品三语义接口的代码与测试也已准备。使用 Python 标准库和 SQLite，不需要额外安装 Python 依赖。

运行 `python server.py`，默认监听 8000 端口。`backend/.env` 已创建，用户可在其中填写 OpenRouter Key；`.env.example` 是不含密钥的模板。产品一不调用 AI 接口。数据库默认保存在本目录的 `avatar_demo.sqlite3`，包含演示作品与用户保存的作品。

项目二的文字服务包含模板、草稿、版本、收藏、生成和改写接口；正式前端位于 `project-02-writing/frontend/`。默认使用本地演示样稿；配置 `OPENROUTER_API_KEY` 后尝试实时生成。可选配置 `OPENROUTER_MODEL`、`OPENROUTER_BASE_URL`、`OPENROUTER_PROXY`（例如 `http://127.0.0.1:7897`）；密钥仅由后端读取。更改配置后需重启后端。

项目三语义服务代码为 `semantics_service.py`，提供 `/api/semantics/*` 的场景、词库/规则、分析、问答和历史复跑接口；启用需重启共用后端。目前正式前端还在设计选择阶段，8103 端口展示界面初稿。测试命令：`python -m unittest test_writing test_semantics`。
