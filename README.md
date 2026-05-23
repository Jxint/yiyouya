# 替我去看世界

AI 宠物旅行陪伴 Web Demo。当前仓库采用前后端职责分离协作：前端负责 UI、交互入口和页面流程展示；后端同学后续补充接口、数据库、AI/skill 能力和部署能力。

## 项目分区

- `src/`：前端 React/Vite 代码，由前端 UI 负责人维护。
- `public/`：前端静态资源，包括首页背景、宠物视觉、mock 图片。
- `backend/`：后端协作占位目录，后端同学在这里补充服务端实现或接入说明。
- `docs/`：团队协作边界、AI 输入规范、UI 改动说明。

## 前端边界

前端 UI 改动只允许影响视觉层：

- `src/styles.css`
- `src/components/layout/`
- `src/components/home/`
- `src/components/modals/`
- `src/components/travel/`
- 页面组件中的 `className`、布局结构、视觉层级、动效、图片资源

不要改动：

- `src/routes/`
- `src/store/`
- `src/services/`
- `src/types/`
- `src/mock/` 的数据结构
- TravelSession 状态机、页面跳转逻辑、按钮绑定的核心函数、API/service 调用方式

## 本次 UI 改造说明

首页已经改造成暗色紫金、旅行书房背景、透明玻璃拟态三栏布局。背景图来自桌面文件并复制到：

`public/assets/travel-study-bg.png`

核心视觉入口仍然保持原业务函数绑定，例如 `Start Journey` 继续触发原有 `onStartJourney`，历史记录继续读取原有 `travelHistory`。

## 本地运行

```bash
npm install
npm run dev
npm run build
```

## 团队协作建议

每位队友单独开分支，不要直接改他人负责目录：

- 前端 UI：`codex/frontend-ui`
- 后端 API：`feature/backend-api`
- 数据库/持久化：`feature/database`
- AI/skill 接入：`feature/ai-skill`
- 部署/CI：`feature/deploy-ci`

合并前必须执行：

```bash
npm run build
```
