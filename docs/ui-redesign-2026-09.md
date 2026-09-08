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


## 9 月 8 日原始实体茶山修订

用户否定简化山体后，对照原地图 v1/v2、首焦图和原始 FBX，最终改用 assets-source/intro/tea-mountain.fbx 的实体几何。转换脚本 scripts/build-production-mountain.mjs 保留 181,360 三角面，合并顶点后 90,682 顶点，生产资源约 4.62 MB。新增表面种植材质及实例化细叶；地点从实际三角面射线采样高度。原始 FBX、首焦和粒子引擎工作未修改。

恢复原版地点按钮与四指标信息卡，扩大地图。真实浏览器检查桌面总览、旋转、片区聚焦、重置、320/390 窄屏与 WebGL 降级；独立 review 发现的窄屏镜头持续渲染、降级卡片裁切已修复。减少动态效果下禁用选中卡片入场动画。类型检查及生产构建通过。Sites 原绑定查询仍为 project_not_found，线上未更新。

重新生成的 chunjian-landscape-v4.png 为降级示意插图，不参与三维网格变形，也不代表原 FBX 的精确投影。最终模型属于示意茶山，没有真实 GIS 测绘精度。

本次生成提示词：
```text
Use case: stylized-concept.
Asset type: refined high-detail landscape reference and fallback illustration.
Primary request: Create ONE wide 16:9 image of a substantially detailed, realistic 3D architectural landscape maquette of a Chinese tea mountain valley.
Scene/backdrop: dark forest-green seamless studio backdrop; the ENTIRE organic landscape diorama is visible, with a shallow natural earth cross-section around its organically shaped perimeter. No rectangular photograph sheet or rectangular slab.
Subject: six asymmetrical, gently rolling ridges, progressively taller at the rear, framing a coherent central valley. Build ACTUAL broad horizontal terrace benches cut into the slopes, with readable horizontal flat planting surfaces and modest vertical earthen risers; dense, neatly spaced tea hedgerows follow the terrace contours. Show many crisp individual bushes with fresh small tea-leaf textures. Narrow warm tan paths continuously connect terraces and village without abrupt breaks.
Valley: a clear narrow natural creek runs from rear center toward front center, following the low ground. A small rural village occupies the lower-center/right valley: white plaster buildings, dark gray gabled tiled roofs, small paved yards, level foundations. A short wooden footbridge crosses the creek and connects the paths. Clusters of mature leafy trees line perimeter ridges.
Style/medium: premium realistic 3D landscape maquette, refined architectural visualization, natural physical materials and crisp fine details, credible coherent terrain at a consistent scale.
Composition/framing: elevated near-orthographic camera looking down approximately 45 degrees; wide 16:9 framing; all landscape edges fully in view with modest backdrop margin; rear ridges visibly taller but rounded, foreground open enough to clearly see creek, bridge, village and terraces.
Lighting/mood: warm natural daylight, soft contact shadows, rich fresh natural greens, inviting realism.
Materials/textures: realistic leafy tea hedges, warm packed-earth paths, subtle exposed soil and stone on terrace risers, water reflections, individual roof tiles, white plaster with fine texture, wood footbridge.
Constraints: level building foundations, continuous traversable paths, creek follows the valley; shallow earth section; no steep spikes or sheer mountain cones; no text, no labels, no markers, no UI, no symbols, no logos, no watermarks. This is a standalone illustration, not a texture map.
```
