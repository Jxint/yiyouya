# AI 协作提示词模板

## 前端 UI 任务

```text
我负责前端 UI。
只允许修改 src/styles.css、src/components/、public/assets/，以及页面中的 className 和布局结构。
禁止修改 src/routes、src/store、src/services、src/types、src/mock 数据结构、TravelSession 状态机、按钮核心函数绑定。
目标：优化视觉表现，不改变数据、不改变状态、不改变路由、不改变接口。
完成后运行 npm run build。
```

## 后端 API 任务

```text
我负责后端 API。
只允许修改 backend/ 或后端相关文档。
不要修改 src/components、src/styles.css、前端页面布局。
目标：补充服务端接口，并通过既有 src/services 边界与前端对接。
如需新增接口字段，先写入接口说明并与前端确认。
```

## AI/skill 接入任务

```text
我负责 AI/skill 接入。
不要把 AI provider 调用写进 UI 组件。
请在后端封装 skill/AI 调用，并提供清晰的入参、返回值、错误格式。
前端只通过 service 层调用。
```
