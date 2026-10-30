# 项目三验证记录

验证日期：2026-10-30。布局沿用用户选择的 A 分析台；本轮根据用户反馈改为炭灰导航、浅灰工作区和白色阅读面板。

配色迭代后重新构建并通过全部浏览器流程检查。`validate-contrast.cjs` 对 11 个桌面/移动页面或弹窗状态中的 930 个渲染文字样本检查文字与背景对比度，未发现低于阈值的样本。普通文字阈值为 4.5:1，大号标题为 3:1；禁用控件不计入。报告为 `contrast-report.json`。截图已重新生成，实际 Chrome 也已通过 huashu-chrome 重新查看。

- 正式前端 `npm run build` 通过。
- 共用后端 `python -m unittest test_writing test_semantics`，11 项测试通过。涵盖字典与规则管理、场景释义、Unicode 位置、优先级与重叠替换、分析快照、重放、证据匹配和错误输入；使用隔离临时数据库。
- `node validate-browser.cjs` 通过。真实浏览器操作验证三个场景、原文引用、缺少依据的问答、修改后暂停问答、术语与规则增删改、历史重放和旧快照、流程开关、导出 JSON、后端断连状态。页面 JavaScript 错误为 0。
- 375、390、768 像素宽度下，工作台、术语与规则、处理记录页面没有整体横向溢出。管理表格在自身区域内横向滚动。
- huashu-chrome 扩展在线，通过其桥接在实际 Chrome 中打开正式前端、执行分析并截图，已人工查看。
- `node validate-live-model.cjs` 使用一段虚构材料检查当前后端配置，摘要返回「实时模型摘要（待核对）」，问答返回「实时模型问答（证据已匹配）」，引用逐字存在于材料中。该验证未打印密钥，结束后已删除自己的分析记录。
- 内网地址 `http://192.168.8.32:8103/api/semantics/catalog` 返回 200；项目一、二的 8101、8102 页面仍返回 200。

截图：`workspace-desktop.png` 为 1440 像素宽度的工作台全页；`workspace-375.png`、`workspace-390.png`、`workspace-768.png` 为对应宽度；`rules-desktop.png` 为正式规则管理页；`huashu-chrome-desktop.png` 为用户实际 Chrome 截图。

花叔设计的 Python 体检和外观账本命令因未安装 Python Playwright 而自动跳过。本次实际渲染、交互、响应式检查使用已有的 Node Playwright 与 huashu-chrome 完成。

浏览器检查脚本会清理自己创建的词条、规则和记录；编辑版本计数保持递增。演示空间保留实际 Chrome 操作生成的虚构合同记录，便于打开历史快照。测试不修改项目一、二的保存数据或 `.env`。
