# UI 改动清单

本文件记录前端 UI 负责人已修改的内容，便于队友和 AI 工具识别哪些属于前端视觉层，避免误改后端或业务逻辑。

## 修改范围

- `src/styles.css`
  - 建立暗色紫金视觉系统。
  - 设置桌面端首页一屏适配。
  - 增加透明毛玻璃、3D 悬浮侧栏、立体 Start Journey 按钮。
  - 使用 `public/assets/travel-study-bg.png` 作为真实首页背景图。
- `src/components/layout/AppLayout.tsx`
  - 调整顶部导航视觉与偏好/宠物入口。
  - 保持原 `openModal` 和 `setPreferenceSaveTarget` 调用方式。
- `src/components/home/HistoryList.tsx`
  - 调整历史足迹面板展示样式。
  - 继续使用传入的 `records` 和 `currentSession`。
- `src/components/home/PetShowcase.tsx`
  - 调整首页主视觉、宠物展示、Start Journey 外观。
  - 移除首页里的“编辑宠物特点”视觉按钮。
  - 保留 `onStartJourney`、宠物切换和原编辑状态能力，不改 props。
- `src/components/home/CommunityHub.tsx`
  - 将社区占位改为玻璃拟态展示面板。
  - 使用静态 MVP 展示，不接真实社区接口。
- `src/pages/TravelDetail/TravelDetailPage.tsx`
  - 调整历史详情页布局。
  - 将“当时的对话”改为右下角“与我的宠物对话”入口，仍展示 `record.messages`。

## 静态资源

- `public/assets/travel-study-bg.png`
  - 首页真实背景图，来自本地桌面文件。
- `public/assets/home-pet-example.svg`
  - 首页宠物主视觉资产。
- `public/mock-images/`
  - mock 目的地和宠物图片，避免页面破图。

## 未修改内容

- 未修改 `src/routes/`。
- 未修改 `src/store/`。
- 未修改 `src/services/`。
- 未修改 `src/types/`。
- 未修改 `src/mock/` 的数据结构。
- 未修改 TravelSession 状态机。
- 未修改 API/service 调用方式。
