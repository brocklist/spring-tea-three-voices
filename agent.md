# 一页问茶 · 春声三鸣 Agent Rules

## 项目开发规则

- 严格遵循 `spec.md`，需求变更先更新规划再改代码。
- 当前项目以轻量前端实现为主，避免过度工程化。
- 真实接口、真实上传、支付、登录等能力不得擅自加入。
- 所有 mock data 必须集中管理，不允许散落在组件内部。
- 页面资源位必须使用清晰字段名，方便后续替换图片、视频和文案。

## 代码风格要求

- TypeScript 类型必须明确，避免无意义的 `any`。
- React 组件使用函数组件。
- Tailwind CSS 优先，复杂全局样式再写入 CSS 文件。
- 组件命名使用 PascalCase。
- hooks / utils 使用 camelCase。
- 页面组件放在 `src/pages`，通用组件放在 `src/components`。
- 数据类型放在 `src/types`，mock 数据放在 `src/data`。
- 表单和匹配逻辑拆到可测试的工具函数中。

## 文件组织规范

```text
src/
  assets/
  components/
    layout/
    ui/
    production/
    market/
    matching/
  data/
  lib/
  pages/
  types/
  App.tsx
  main.tsx
  index.css
```

## Git 工作流要求

- 不允许直接 merge 到 `main`。
- 开发时创建独立功能分支，例如 `feature/tea-platform-v1`。
- 完成后 push 到远端分支并创建 Pull Request。
- PR 通过 review 和测试后才能合并。
- 如有冲突或测试失败，先修复再提交。

## Code Review 要求

- 正式编码完成后创建 fresh task-specific review 上下文或 subagent。
- Review 必须对照 `spec.md` 检查实现范围。
- Review 重点：类型安全、路由、响应式、mock data、表单交互、资源替换便利性。
- 不复用旧 review 上下文。
- Review 发现问题后先修复，再重新验证。

## 测试要求

- 必须运行构建检查。
- 必须人工检查三个路由。
- 必须检查移动端和桌面端布局。
- 必须检查表单保存、mock 匹配、mock 病虫害识别。
- 无法运行的测试需要在交付说明中明确说明原因。
