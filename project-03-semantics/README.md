# 产品三：语析工作台

沿用用户选择的 A 分析台布局，并根据「整体对比度不高，全是蓝色，不太舒服」的反馈，调整为炭灰导航、浅灰工作区和白色阅读面板。独立前端入口：<http://localhost:8103>；当前电脑内网入口：<http://192.168.8.32:8103>。与项目一、二共用 `backend/` 的 8000 端口和 SQLite 数据库。

## 启动

两个终端分别运行：

```powershell
cd C:\workspace\1030project\backend
python server.py
```

```powershell
cd C:\workspace\1030project\project-03-semantics\frontend
npm install
npm run build
npm run preview
```

开发时可使用 `npm run dev`。8103 已占用时先关闭该端口现有的本项目进程，再启动。前端通过同源 `/api` 转发到共用后端，局域网设备无需配置 API 地址。

## 演示流程

1. 在「合同审阅」中载入样例并开始分析，点击原文的「交付」或结果术语，查看场景解释。
2. 切换到实体要素、规则命中、转换文本，查看提取和替换结果。实体与回答引用可定位原文。
3. 点击「合同金额是多少？」；自由提问若没有可匹配的原文依据，会明确提示。
4. 保留同一份材料、切换业务场景重新分析，展示「交付」对应成果移交、服务恢复反馈、收入确认节点的不同含义。点击「载入样例」可换成所选场景的材料。
5. 在「术语与规则」中新增、编辑、搜索或删除词条和规则，再到工作台试验；在「处理记录」中重放，也会应用最新配置。原记录保持当时快照。
6. 修改正文或处理开关后，旧结果会标记待更新，并暂停问答，重新分析即可继续。

支持三个场景、30 个初始术语、6 条初始规则、9 个预设问题；词典支持同义表达，规则支持启停和优先级。处理记录可查询、打开、重放、删除，分析结果可导出 JSON。桌面并排阅读，手机纵向排布。

## 模型与数据

默认关闭「实时模型辅助」，使用本地术语、文字替换、固定格式实体提取、原文摘录和问题关键词匹配，无需 Key。可直接粘贴文本，当前没有文件上传或 OCR。

开启实时模型辅助后，仅摘要和问答使用 OpenRouter，当前材料会发送给外部模型。读取现有 `backend/.env` 中的 `OPENROUTER_API_KEY`、`OPENROUTER_MODEL`、`OPENROUTER_BASE_URL`、`OPENROUTER_PROXY`，不新增前端密钥。更改 `.env` 后重启共用后端。模型失败时保留本地结果，页面通过摘要提示或回答来源说明实际使用方式。

模型问答的引用须逐字出现在材料中；引用吻合仍不代表答案逻辑完全正确。样例、组织和金额均为虚构。默认本地模式不承诺通用自然语言理解；未识别的实体格式、问题表达可补充规则或启用模型辅助。

## 验证

在 `backend/` 运行 `python -m unittest test_writing test_semantics`。测试使用隔离临时数据库，并关闭实际模型 Key，不改动用户保存的数据。

`validate-browser.cjs` 为本机浏览器流程检查脚本，使用项目一已有的 Playwright 和本机 Chromium。检查场景释义、证据定位、内容变更状态、词条/规则管理、历史重放与快照、流程开关、导出和移动端溢出；执行后删除脚本自己创建的数据。`review-browser.mjs` 通过 huashu-chrome 在实际 Chrome 中打开并截图。截图存放在 `validation/`。

`capture-final.cjs` 保存干净的桌面与移动端截图。`validate-live-model.cjs` 为可选的真实模型通路检查，会向外部模型发送虚构材料；默认验证不运行此脚本。验证结果见 `validation/README.md`。

配色集中在 `frontend/src/theme.css`。`validate-contrast.cjs` 检查浏览器实际渲染的文字与背景对比度，覆盖工作台、结果分类、管理页、弹窗及移动端；结果写入 `validation/contrast-report.json`。

设计初稿保留在 `design-demos/`，方向选择记录为 `direction-approved.md`，正式前端位于 `frontend/`。
