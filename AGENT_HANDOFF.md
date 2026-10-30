# 六项目 Demo 开发交接

更新日期：2026-10-30，Asia/Shanghai。工作区：`C:\workspace\1030project`。

面向接手开发、调试和演示的后续 Agent。当前已实现项目一、二、三；项目四、五、六只有实现 PRD。最近完成的是项目三的配色调整，接手时应保留最新界面与已有数据，再根据用户的新指令继续。用户本轮只要求整理交接文档。

## 接手先读

1. 本文的「用户目标与最新决定」「当前进度」「项目三」和「已知文档差异」。
2. 将要操作项目的 `README.md`、`实现PRD.md`、`direction-approved.md`（如有）。
3. [六项目总 PRD](./六项目Demo设计PRD.md)，用于了解整体功能和 `tkmax-tools` 复用评估。总 PRD 有早期规划，不能把其中全部内容当成已实现功能。
4. 修改前运行 `git status --short`。目前存在未提交修改和未跟踪文件，包含项目三正式实现、主题文件、检查脚本和截图；应完整保留，不执行清理或还原。

## 用户目标与最新决定

用户最初的要求是：从 [立项验收报告.pdf](./立项验收报告.pdf) 中提炼六个项目的最终功能，制作美观、适合现场演示的 Demo。原话包括「只要求中看不中用，demo级别即可，前端美观复杂好演示，后端越简单越好」。不以报告中的算法、硬件、研发路线和性能指标为实现目标。

- 六个项目各放一个目录，六套前端分别通过独立内网地址访问，共用一个简单后端。
- 用户已说「都按你默认的来」。常规业务和实现选择可采用已记录的默认方案，不要反复询问相同问题。
- 用户希望使用 huashu-design 做前端设计，并允许通过 huashu-chrome 查看实际浏览器表现、迭代界面。
- 原创图片可以使用图像生成能力制作并保存到本地。文字、图片、视频的 API 能力可按需要接入；视频不是当前六项目必须做的交付。
- 网络出问题时，用户明确允许使用本地代理 `http://127.0.0.1:7897`。
- Key 存在 `backend/.env`，由用户填写。项目二、三的真实文字模型调用已成功验证。不要再次索取已有 Key，不要把 Key 放进前端、文档、日志、截图或聊天。
- 用户曾认为项目一「有点假」「连衣服都没穿好」，要求人物尽量使用 3D；目前主舞台已改成真实 GLB 模型，不能换回旧的 SVG 人物方案。
- 项目二选择了 A「纸页工作室」；项目三选择了 A 分析台布局。两次「A」分别适用于各自项目，不代表之后所有项目都选 A。
- 用户对项目三最近的反馈是：**「整体对比度不高，全是蓝色，不太舒服」**。已保留布局，改成炭灰导航、浅灰工作区、白色面板、深灰正文；绿色表示操作与术语，琥珀色表示引用。不要恢复成全屏深蓝。该反馈已按项目三范围写入本机 huashu-design 偏好档案，不要自动理解成六个项目必须全部采用浅色。

## 当前进度与入口

以下 HTTP 状态在交接整理时重新读取确认。内网 IP `192.168.8.32` 是当前电脑地址，换网络或重启后需要重新确认。

| 项目 | 目录 | 当前状态 | 独立入口 |
|---|---|---|---|
| 一 虚拟人物形象 | `project-01-avatar/` | 已实现 ATELIER，主舞台为 3D 模型；HTTP 200 | <http://192.168.8.32:8101> |
| 二 辅助写作 | `project-02-writing/` | 已实现文心工作台；HTTP 200 | <http://192.168.8.32:8102> |
| 三 语义理解 | `project-03-semantics/` | 已实现语析工作台，并完成中性高对比配色；HTTP 200 | <http://192.168.8.32:8103> |
| 四 方言学习 | `project-04-dialect/` | 仅 README 和实现 PRD，未建立前端或接口；当前连接无响应 | 计划 8104 |
| 五 绘画编辑 | `project-05-painting/` | 仅 README 和实现 PRD，未建立前端或接口；当前连接无响应 | 计划 8105 |
| 六 图像巡检 | `project-06-vision/` | 仅 README 和实现 PRD，未建立前端或接口；当前连接无响应 | 计划 8106 |
| 共用后端 | `backend/` | Python 标准库 HTTP 服务和 SQLite；健康检查 HTTP 200 | <http://127.0.0.1:8000/api/health> |

前端均可用 `http://localhost:8101`、`:8102`、`:8103` 在本机访问。不要把 Vite 输出中的虚拟网卡地址当作用户内网地址。

## 运行环境与启动

### 本机环境

- Windows；本机 Node 为 `v24.14.1`，Python 为 `3.14.3`，已使用的可执行文件是 `C:\Python314\python.exe`。
- 前端为 React、TypeScript、Vite；项目一额外使用 Three.js。依赖以各自 `frontend/package.json` 和锁文件为准。
- 本次工具环境默认 PowerShell 启动曾失败。使用 `exec_command` 时指定 `shell: "cmd.exe"`、`login: false`。下方命令适用于 cmd。
- 中文输出偶尔乱码，文件本身使用 UTF-8，不要据终端乱码去改文件编码。
- 服务是当前会话启动的开发/预览进程，不是已安装的系统服务。后续会话先检查端口，不要重复启动同一个端口，也不要整体结束所有 Node/Python 进程。

### 共用后端

```bat
cd /d C:\workspace\1030project\backend
C:\Python314\python.exe -u server.py
```

默认监听 `0.0.0.0:8000`，不需要 pip 安装运行依赖。启动日志目前仍叫 `Avatar demo API`，实际服务同时包含项目一、二、三。

### 三套已实现前端

分别在独立终端运行；已有 `node_modules/` 时不必每次重新安装依赖。

```bat
cd /d C:\workspace\1030project\project-01-avatar\frontend
npm run build
npm run preview
```

```bat
cd /d C:\workspace\1030project\project-02-writing\frontend
npm run build
npm run preview
```

```bat
cd /d C:\workspace\1030project\project-03-semantics\frontend
npm run build
npm run preview
```

开发时用 `npm run dev`，与 preview 使用相同项目端口，不能同时占用。首次安装或依赖变化时执行 `npm install`；网络失败按用户要求使用 `npm install --proxy=http://127.0.0.1:7897`。

各 `vite.config.ts` 同时为 `server` 和 `preview` 设置 `/api` → `http://127.0.0.1:8000` 的代理、`host: 0.0.0.0` 和固定端口。使用 preview 时，修改源代码后要重新 build 才会展示。后续三个前端也应保留同样的同源代理方式。

只读检查示例：

```bat
curl.exe --max-time 3 http://127.0.0.1:8000/api/health
curl.exe --max-time 3 http://127.0.0.1:8103/api/semantics/catalog
netstat -ano -p tcp
```

## 项目一 ATELIER

说明：[README](./project-01-avatar/README.md)、[实现 PRD](./project-01-avatar/实现PRD.md)。

已实现首页、编辑工作台、作品库、展示详情，以及预设、部分脸部参数、肤色、发型、服装、鞋履、场景、撤销重做、作品保存/打开/复制/删除和 PNG 展示卡下载。后端仅保存形象配置，无需模型 Key。

关键文件：

| 文件 | 职责 |
|---|---|
| `frontend/src/App.tsx` | 页面、编辑状态、作品操作与展示卡导出 |
| `frontend/src/Avatar3D.tsx` | Three.js、GLB 加载、形变、染色、遮挡和旋转 |
| `frontend/src/data.ts` | 前端目录、配置、颜色和后端请求 |
| `frontend/src/Avatar.tsx` | 保留的旧 SVG 人物实现，已不是主舞台 |
| `frontend/public/models/` | 本地人体、发型、衣服、鞋和 `clothing.json` |
| `frontend/public/images/` | 模型示意缩略图和生成的展厅背景 |

实际有 3 个预设、6 个发型选项、6 套服装组合、2 款真实鞋履模型、3 组肤色、3 种背景。后端目录保留更多鞋履 ID 以兼容旧作品，不能据此宣称有 6 款不同的真实鞋模。部分脸部参数实际映射到模型已有形变，`smile` 当前映射嘴宽。

模型和服装素材来自 CharacterCreator 的 output 资产，来源与使用说明保存在项目 README 和本地模型元数据；没有引入其 GPL 运行代码。搭配仍可能有侧面穿插，不包含真实布料物理或尺码适配。若继续改进，优先检查衣服覆盖、旋转各视角、旧作品还原和 PNG 导出，不要只看正面缩略图。

## 项目二 文心工作台

说明：[README](./project-02-writing/README.md)、[实现 PRD](./project-02-writing/实现PRD.md)、[A 方向确认](./project-02-writing/direction-approved.md)。

已实现作文、诗歌、心得三种文体，写作要求、模板编辑、正文编辑、选段润色/扩写/缩写/续写、预览替换、草稿保存、版本对比与恢复、好句收藏和插入。使用 A「纸页工作室」，不是项目三的配色。

- 前端主要在 `frontend/src/App.tsx` 与 `style.css`。
- 后端模块 `backend/writing_service.py`，测试 `backend/test_writing.py`。
- 配置 Key 时尝试实时生成；无 Key 或失败时返回明确标注的本地演示样稿。
- 本地样稿的目标字数只是提示；生成请求为普通 HTTP 请求，没有流式输出。
- 取消操作停止前端等待，不代表已经取消上游请求或费用。
- 模板结构会影响新生成请求；版本差异按段落展示，不是逐字 diff。
- 真实文字生成在之前的实际运行中验证成功；本次交接只重新确认页面在线，没有再次付费调用。

## 项目三 语析工作台

说明：[README](./project-03-semantics/README.md)、[实现 PRD](./project-03-semantics/实现PRD.md)、[方向与最新配色决定](./project-03-semantics/direction-approved.md)、[验证记录](./project-03-semantics/validation/README.md)。

这是最近修改的项目。**正式入口是 React 前端 8103；`design-demos/` 是历史初稿，不能用 Python 静态服务器替代正式前端。**

### 已实现行为

- 合同、客服工单、经营研报三个场景，3 份虚构样例、30 个初始词条、6 条初始规则、9 个预设问题。
- 流程开关为术语映射、规则转换、实体提取、摘要整理。
- 原文术语高亮、按场景释义、实体定位、规则命中、标准化文本与摘要。
- 原文问答和可点击定位的逐字引用；本地不能匹配依据时明确提示补充材料。
- 术语与规则增删改查，同义表达、优先级、启停、版本。
- 分析保存为快照，历史可打开、重放和删除，结果可导出 JSON。
- 重放使用当前词典与规则生成新记录，旧快照保持当时结果。
- 场景切换保留正文，方便演示同词异义；「载入样例」才替换正文。切换场景会清除当前分析结果。
- 正文或流程变化时，旧结果标记待重新分析，问答暂停，避免拿旧材料回答新内容。
- 历史打开恢复分析快照，问答区可重新提问；目前没有恢复旧问答会话的界面。

### 文件定位

| 文件 | 职责 |
|---|---|
| `frontend/src/App.tsx` | 导航、场景、数据加载、分析、问答、模型开关、结果状态 |
| `frontend/src/Workspace.tsx` | 原文、结果分类、摘要、实体、规则、问答与导出 |
| `frontend/src/SourceText.tsx` | 术语和证据的原文定位、高亮 |
| `frontend/src/Library.tsx` | 术语/规则管理与编辑弹窗 |
| `frontend/src/RunHistory.tsx` | 历史列表、快照、重放与删除 |
| `frontend/src/types.ts` | API 类型、场景和流程配置、请求封装 |
| `frontend/src/style.css` | 布局、组件结构、响应式；仍含旧颜色定义 |
| `frontend/src/theme.css` | **当前正式配色**，由 `main.tsx` 在 `style.css` 后导入并覆盖颜色 |
| `backend/semantics_data.py` | 三场景、虚构样例、初始术语与规则 |
| `backend/semantics_service.py` | 分析、问答、管理、快照与接口 |
| `backend/test_semantics.py` | 隔离数据库测试 |

调整配色优先修改 `theme.css`。只改 `style.css` 的颜色可能被覆盖；删除 theme 导入会恢复旧深蓝。当前桌面双栏、手机上下排布。

### 必须保留的实现细节

- 后端的 `start/end` 使用 Python Unicode 码点位置。前端高亮使用 `Array.from(text)`，不要直接改成按 UTF-16 下标 `slice`，否则含 emoji 的文本会错位。
- 规则是字面文字匹配，不是正则表达式。重叠位置按优先级处理，所有替换基于原始文本一次应用，替换结果不会继续触发其他规则。
- 术语/规则初始化有固定种子 ID 和 `seeded` 标记，防止重启后恢复用户已删除的记录。版本计数会因测试编辑保持递增，不能通过重置数据库来把它改回 1。
- 默认「实时模型辅助」关闭。术语、规则和实体都是本地处理；只有明确开启时，摘要和问答发送至外部文字模型。
- 本地摘要为场景相关原文摘录，本地问答为关键词证据匹配，不是通用语义模型。
- 模型引用必须逐字出现在输入中；这只能验证引用存在，不能保证答案逻辑完全正确。来源标签和核对提示应保留。
- 模型请求约 30 秒超时，失败回退本地；停止等待不等于取消后端执行。没有 PDF 上传、OCR 或模型训练。

### 当前接口

以下均在 `/api/semantics` 下：

| 方法和路径 | 用途 |
|---|---|
| `GET /catalog` | 场景、样例、流程 |
| `GET /terms`、`POST /terms` | 术语列表与新增，可按 `scene` 查询 |
| `PUT /terms/{id}`、`DELETE /terms/{id}` | 术语修改与删除 |
| `GET /rules`、`POST /rules` | 规则列表与新增，可按 `scene` 查询 |
| `PUT /rules/{id}`、`DELETE /rules/{id}` | 规则修改与删除 |
| `POST /analyze` | `{scene,text,title?,pipeline?,useModel?}` → 分析快照 |
| `POST /ask` | `{runId,question,useModel?}` → 答案、原文证据和来源 |
| `GET /runs`、`GET /runs/{id}` | 最近 100 条记录、完整快照 |
| `POST /runs/{id}/replay` | 用当前配置重放，另存新记录 |
| `DELETE /runs/{id}` | 删除分析及其保存的问答记录 |

## 共用后端与数据

`backend/server.py` 是唯一 HTTP 入口，使用 `ThreadingHTTPServer` 和 SQLite。已注册 `writing_service` 与 `semantics_service`，avatar 接口仍在 server 本体。新增项目沿用独立命名空间和服务模块即可，不必引入整个 FastAPI、登录、计费或调度系统。

`connect()` 已改成会提交/回滚并显式关闭连接的 contextmanager。此前不关闭 SQLite 连接会导致 Windows 临时数据库文件被锁，不能退回旧写法。新增模块保持同样的连接用法和幂等初始化。

| 数据 | 位置 |
|---|---|
| Key 与本地配置 | `backend/.env`，已有文件，保留原值；模板为 `.env.example` |
| 共用数据库 | 默认 `backend/avatar_demo.sqlite3`，名称虽含 avatar，实际保存三个项目的数据 |
| 人物作品 | `avatar_works` |
| 写作数据 | `writing_templates`、`writing_drafts`、`writing_versions`、`writing_favorites` |
| 语义数据 | `semantic_meta`、`semantic_terms`、`semantic_rules`、`semantic_runs`、`semantic_questions` |

已有接口命名空间为 `/api/avatar/*`、`/api/writing/*`、`/api/semantics/*`。后续 PRD 中的 `/api/dialect/*`、`/api/painting/*`、`/api/vision/*` 尚未实现。

不要删除或重建现有数据库，不用「清空数据」解决版本、种子或界面问题。若需要测试，优先使用 `DB_PATH` 指向临时数据库；备份真实数据库时先停止写入或使用 SQLite 一致性备份方式。

### 模型配置

文字服务读取 `OPENROUTER_API_KEY`，可选 `OPENROUTER_MODEL`、`OPENROUTER_BASE_URL`、`OPENROUTER_PROXY`。源码中的默认文字模型名是 `openai/gpt-4o-mini`，实际配置由现有环境决定，不要在未确认时覆盖。图片、视频 Key 的占位不等于对应运行接口已经实现。

`.env` 在 server 启动时读取，已有进程环境变量优先于文件；修改配置后需重启共用后端。不要用输出整个 `.env` 或枚举环境变量的方式排查问题，检查 API 行为或仅检查配置是否存在即可。模型失败应保留本地演示主流程和来源标签。

## 设计与浏览器工具

### huashu-design

已安装在 `.agents/skills/huashu-design/`，本机全局副本在 `C:\Users\Lenovo\.codex\skills\huashu-design/`。接手新设计时读取其 `SKILL.md` 和适用模块。

技能用于高保真原型和设计评审，不能把它当作共用后端框架。新项目先做三个真实可查看的视觉初稿，用户选定后再完整实现；把原话写进该项目 `direction-approved.md`。同一项目已经选定方向后的迭代不用重复选择，例如本次项目三配色调整。用户「按默认」不应被扩大解释为六个新设计都跳过三方向选择。

Python 版设计体检/外观账本因缺少 Python Playwright 而自动跳过，不能宣称这些命令已经完成渲染检查。本项目实际使用 Node Playwright 与 huashu-chrome 验证。没有必要仅为交接重新安装整套检查环境。

本机偏好记录在 `C:\Users\Lenovo\.huashu-design\experience.md`，最新项目三配色反馈已写入。后续新的视觉反馈按其真实适用范围记录。

### huashu-chrome

已安装，近期实际 Chrome 扩展与桥接在线。可执行体检：

```bat
node C:\Users\Lenovo\.dsh\mcp\huashu-chrome\node_modules\huashu-chrome\src\cli.js doctor
```

本会话没有直接暴露对应 MCP 操作工具，因此通过已安装的 `BridgeClient` 调用；实现范例为 `project-03-semantics/review-browser.mjs`。模块路径：

```text
C:/Users/Lenovo/.dsh/mcp/huashu-chrome/node_modules/huashu-chrome/src/lib/rpc.js
```

它以 ESM 导出 `BridgeClient`，可 connect、tabs、snapshot、click、screenshot，结束时调用 `close()`。先读 snapshot 再操作；不要操作无关用户标签页。现有脚本会新建本项目标签页、点击分析并留下一条虚构合同记录，然后保存 Chrome 截图。

### Node Playwright

当前安装在 `project-01-avatar/frontend/node_modules/playwright`，是之前用 `--no-save` 安装的本机检查依赖；项目三脚本通过相对路径复用它。对项目一重新安装或清理依赖可能导致它被移除。需要恢复时在项目一前端执行 `npm install --no-save playwright`，网络失败再加用户代理。

本机 Chromium 路径：

```text
C:\Users\Lenovo\AppData\Local\ms-playwright\chromium-1208\chrome-win64\chrome.exe
```

这些检查脚本依赖本机路径，不是跨机器开箱即用的 CI。换机器应更新 Playwright 解析方式和浏览器路径。

## 已有验证及复查方法

### 共用后端

```bat
cd /d C:\workspace\1030project\backend
C:\Python314\python.exe -m unittest test_writing test_semantics
```

最近一次代码验证为 11 项全部通过，其中写作 4 项、语义 7 项。测试启动隔离服务、使用临时数据库并关闭实际模型 Key。本轮交接未修改运行代码，没有重新重复这些测试。

### 项目三

在 `project-03-semantics/` 目录执行：

| 命令 | 检查范围与副作用 |
|---|---|
| `node validate-browser.cjs` | 三场景、证据与未知问题、变更状态、词条/规则管理、快照与重放、开关、导出、后端不可用、移动溢出；创建测试数据后删除，版本计数会递增 |
| `node validate-contrast.cjs` | 11 个页面/弹窗状态的文字与背景对比度，报告保存为 `validation/contrast-report.json`；创建临时分析后删除 |
| `node capture-final.cjs` | 生成桌面、375/390/768 宽度和规则页干净截图；删除自己创建的分析 |
| `node review-browser.mjs` | huashu-chrome 实际浏览器检查与截图；保留本次样例分析 |
| `node validate-live-model.cjs` | 可选，发送虚构材料至真实外部模型，产生调用费用；仅输出来源与引用匹配元数据，最后删除临时分析 |

配色调整后 build、浏览器流程和对比度检查均通过：页面 JavaScript 错误为 0；375、390、768 宽度下三个主页面没有整体横向溢出；930 个状态内文字样本没有低于检查阈值的条目，普通文字为 4.5:1，大标题为 3:1，禁用控件不计入。这是 DOM 文字颜色检查，不能替代所有图像、透明叠层和交互状态的完整无障碍审计。

`validate-browser.cjs` 当前使用固定测试名称（如「测试短语」「E2E替换规则」）。含同名用户数据的环境中，应先改成唯一测试名或隔离数据库，避免按名称查找产生混淆。不要为了截图反复运行真实模型检查。

截图和详细说明在 `project-03-semantics/validation/`。真实模型摘要和问答此前都成功返回实时来源，引用逐字匹配虚构材料；本轮交接只做只读可用性确认，没有再次调用外部模型。

## 后续项目的接续范围

若用户要求继续六项开发，建议按项目四 → 五 → 六推进。先阅读对应实现 PRD，沿用每项目独立前端、单一共用后端的结构，并用 huashu-design 完成新项目方向选择。

| 项目 | 已记录默认范围 | 接续重点 |
|---|---|---|
| 四 方言学习 | 粤语、闽南语；各问候/服务接待两个场景；每种至少 10 条词句、至少 5 道题、四步对话；8104 | 手机优先；准备核对过的词句/音频；没有可靠音频时清楚标示示例并保留文字训练；手动模拟跟读保证主流程，不承诺真实发音评分 |
| 五 绘画编辑 | 3 个主题，每主题 4 张本地候选、至少 2 个编辑变体；8105 | 先用高质量本地图稳定演示，再接可选实时生图；实现画布、对比、评分、资产保存；参考图重生成不等于精确局部编辑 |
| 六 图像巡检 | 虚构电力设备；至少 6 台设备、8 张样例图、3 类缺陷、2 类图像质量问题；8106 | 本地人工标注和告警/工单闭环先走通；总览统计取自保存记录；任意上传图的实时视觉结果只标疑似并人工确认 |

具体 PRD：[项目四](./project-04-dialect/实现PRD.md)、[项目五](./project-05-painting/实现PRD.md)、[项目六](./project-06-vision/实现PRD.md)。这些表格是待开发范围，不是已完成功能。

### tkmax-tools 与素材复用

用户指定的参考仓库为 `C:\workspace\vultr-proto-framework\tkmax-tools`。此前已走查并在总 PRD 第 10 节列出可复用路径。它有 React/Vite、FastAPI、OpenRouter 文字/图片/视觉/语音等能力，但也有登录、计费、模型管理等较多依赖。当前三个项目采用独立标准库后端，没有搬入原仓库整站。

后续按需要抽取最小的模型请求、图片落盘、上传、音频播放或任务展示方式；修改前先检查目标文件现状。数字人接口是口播视频代理，不能替代人物换装；语音转写不等于可靠方言评分；通用视觉模型不等于工业缺陷检测。

新图片素材使用可用图像生成工具并先读对应 imagegen 技能，结果固化到本项目目录。文本分析界面不需要为了装饰强行生图。若后续确实制作视频，再读取对应视频技能，不能把视频依赖提前扩散到六个普通前端。

## 已知文档差异与未完成的通用规划

| 文档或位置 | 接手时注意 |
|---|---|
| 总 PRD 的项目三视觉说明 | 仍写深蓝青色；以用户最新反馈、项目三确认文件和 `theme.css` 为准 |
| 总 PRD 的建设阶段说明 | 仍有「先建立产品一」等早期文字；实际已实现一至三 |
| 产品一 PRD 的后半部分 | 保留过早的 2D 图层、6 款鞋、暂不做 3D 等规划；以其当前实现状态、README 和代码为准 |
| 项目三 `design-demos/` | A/B/C 是设计初稿，A 仍为旧深蓝，只用于追溯布局选择 |
| 项目三 `style.css` | 包含原蓝色，正式配色由后导入的 `theme.css` 覆盖 |
| 总 PRD 的统一后台、重置、限额和部署描述 | 尚不能视作已完成：没有统一管理重置页面、每日预算控制或六站系统服务安装 |

如发现说明冲突，先核对用户最新指令和实际运行代码，再修订对应文档；不要通过回退代码来匹配旧 PRD。

## 后续 Agent 的交付习惯

先在现有目录继续，不重新搭建已完成项目。按用户指令完成必要工作和实际验证，常规可逆调整直接推进；有新设计方向选择时按技能展示可查看的初稿。过程中用简短中文说明进展，最终提供可访问地址、关键结果和必要的限制。

每次交接更新本文的项目状态、最新用户决定、启动入口和验证结果。保留用户现有 `.env`、SQLite 数据、3D 素材、原创图片，以及所有与当前任务无关的未提交修改。
