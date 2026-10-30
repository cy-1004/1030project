# ATELIER 虚拟形象工作室

产品一演示站。支持人物预设、脸部/肤色、发型、服装、鞋履和展示场景编辑，以及作品保存、复制、删除与 PNG 展示卡下载。

## 本机启动

在两个终端分别运行：

```powershell
cd C:\workspace\1030project\backend
python server.py
```

```powershell
cd C:\workspace\1030project\project-01-avatar\frontend
npm install
npm run build
npm run preview
```

访问 `http://localhost:8101`。同一内网设备使用服务器的内网 IP 和端口 `8101`；前端通过 `/api` 连接本机 `8000` 端口的共用后端。启动前请确认这两个端口未被其他服务占用。

后端首次启动会在 `backend/avatar_demo.sqlite3` 中创建三条示例作品。配置文件为 `backend/.env`；`OPENROUTER_API_KEY`、`OPENROUTER_IMAGE_API_KEY`、`OPENROUTER_VIDEO_API_KEY` 留空供后续项目使用，产品一的编辑和展示不需要 Key。修改 `.env` 后重启后端即可。

人物主展示区使用本地 GLB 三维模型，支持鼠标拖动旋转、调整部分面部参数和切换发型/服装。鞋履提供两种真实模型，服装和造型缩略图为预先截取的示意图；旧作品仍可打开。模型为演示级素材，部分搭配和侧面可能存在穿插，不包含布料物理或真实尺码适配。浏览器需支持 WebGL，模型首次加载需要一定时间。

3D 人体、发型和衣服的模型文件来自 [CharacterCreator 的 output 资产](https://github.com/kblood/CharacterCreator/tree/master/output)，该项目说明其生成的模型资产为 CC0；本项目独立编写渲染代码，没有引入其 GPL 运行代码。模型文件保存在 `frontend/public/models/`。展示场景图片由内置图像生成工具制作并保存在 `frontend/public/images/fashion-gallery.png`。生成提示：高级虚拟时装展厅、深色石材与暖金灯光、中央发光圆形背景、无人物及文字。其余场景由本地渐变制作。素材均保存在本机，核心演示无需联网。
