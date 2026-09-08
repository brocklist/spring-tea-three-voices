# 三板块 UI 改版与三维地图验收

日期：2026-09-08

## 最终范围

- 数智茶鸣依照用户最后修订恢复原驾驶舱布局，仅更换地图与相关加载、演示标识。
- 新地图是约 19,000 顶点的三维起伏网格，具有连续山坡、立体边壁和底座；贴图只提供地表色彩。支持旋转、滚轮缩放、片区选择/高度跟随聚焦、原有重置、无 WebGL 静态点位降级。
- 香途畅鸣采用杂志式布局、茶品资料抽屉、四章图文、媒体画廊；占位视频不呈现播放控件，购买/咨询资料缺失时明确说明。
- 新苗创鸣提供三种资源视图、标签筛选、详情展开、分组表单、持久化与保存失败提示。
- 保留原有路由、存储键、匹配算法、首焦/序章及本轮前未提交的粒子引擎工作。

## 验收

- npm run typecheck / npm run build：通过。Three.js 独立懒加载包仍有超过 500 kB 的 Vite 提示。
- Playwright Chromium：1440×1000、834×1112、390×844 三路由均无横向溢出；已保存桌面/手机/平板截图到 output/playwright。
- 地图：真实拖动旋转、缩远、片区选择、键盘 Enter 选择后焦点保持、重置、无 WebGL 降级选择/重置均通过。
- 病虫害演示样本切换通过；天气正常获取及请求失败提示通过；减少动态效果模式通过。
- 两类表单保存、刷新持久化、共同标签匹配、筛选空结果、长内容显示、手机抽屉、Esc 关闭及焦点返回通过。
- 模拟 LocalStorage 写入异常：明确报告仅本次页面会话保留，未误报持久化成功。
- 独立 review：修复持久化误报、点位焦点丢失、远裁剪面、关怀模式演示标签；最终复审未发现新实质性回归。
- Sites 发布：原 project_id 的 get_site 返回 project_not_found，未创建替代项目、未发布。本地预览地址 http://127.0.0.1:5173/production。

## 地图资产

使用内置 image_gen 生成，非 CLI。最终资产：public/assets/production/chunjian-tea-terrain-v3.png。

完整生成提示词：

```text
Use case: stylized-concept
Asset type: high-quality map texture for a tea garden dashboard, to be draped on a shallow 3D terrain.
Primary request: Wide 16:9 high-resolution orthographic directly overhead landscape texture of lush Chinese tea hills, sculpted terraces with meticulously ordered tea rows, ridgelines, narrow pale paths, and a small white-walled dark-roof hamlet near lower center.
Style/medium: Refined stylized landscape visualization with rich, finely detailed natural textures and clear orderly tea terraces.
Composition/framing: Strictly vertical top-down orthographic view. Landscape fills the rectangular frame edge to edge. No sky, no horizon, no perspective convergence, no isometric bevel. Avoid baked strong oblique perspective.
Lighting/mood: Soft natural morning light, gentle relief and restrained shadows.
Color palette: Forest green, jade, and warm lime.
Constraints: Fictional schematic inspired by tea country, not factual GIS. No UI, lettering, labels, borders, pins, logos, or watermark.
```

山体高度为程序化示意数据，不代表春建乡真实测绘地形。
