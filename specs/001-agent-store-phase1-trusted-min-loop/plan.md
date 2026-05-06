---
related_doc:
  - "/Users/sinclairpan/project/AI-Native底座开发文档/Agent_Store_AgentOps_AiSDLC_应用底座顶层规划_PRD.md"
  - "/Users/sinclairpan/project/AI-Native底座开发文档/Agent_Store_项目_PRD.md"
baseline_id: "agent-platform-baseline-2026-05-v1.4.2"
---

# 实施计划：Agent Store 阶段 1 可信最小闭环

**编号**：`001-agent-store-phase1-trusted-min-loop`  
**日期**：2026-05-05  
**规格**：`specs/001-agent-store-phase1-trusted-min-loop/spec.md`

## 1. 概述

本计划将阶段 1 收敛为 Agent Store 侧可信最小闭环：先落 Agent Registry 草案和 Ai_AutoSDLC 官方只读页，再落手动企业激活状态和 AgentOps 摘要回显契约。计划不进入完整安装器、上架向导或质量评分。

## 2. 技术背景

| 项 | 结论 |
|---|---|
| 语言/版本 | Python 3.11+，来自 `.ai-sdlc/profiles/tech-stack.yml` |
| 主要依赖 | design 阶段不强制框架；execute 阶段可选择 FastAPI/Pydantic 或等价 typed API |
| 存储 | 关系型数据库或等价持久层；阶段 1 可使用 mock repository 验证 contract |
| 测试 | contract test 优先，覆盖 schema、错误码、幂等、签名、状态降级 |
| 目标平台 | 企业内部 Agent Store Web/API 服务 |
| 约束 | 不计算质量、不保存证据原文、不签发 Capability Grant、不阻断 Ai_AutoSDLC standalone |

## 3. 宪章检查

| 宪章门禁 | 计划响应 |
|---|---|
| Persist decisions to the repository | 规格、调研、数据模型和契约均落在 `specs/001-agent-store-phase1-trusted-min-loop/` |
| Prefer contract-level verification before closure | AS-CT-001、003、004、005、006、007 必须先形成 contract test |
| Keep docs and code traceable | 后续任务必须引用 FR、SC、AS-CT 编号 |

## 4. 项目结构

```text
specs/001-agent-store-phase1-trusted-min-loop/
├── spec.md
├── research.md
├── data-model.md
├── plan.md
└── contracts/
    ├── agent-registry.openapi.yaml
    ├── installation-bootstrap.openapi.yaml
    └── agentops-summary.openapi.yaml
```

execute 阶段的源码结构留到 decompose 阶段结合实际技术选型确定。

## 5. 阶段计划

### Phase 0：契约冻结

**目标**：冻结 API、schema、错误码和状态枚举。  
**产物**：`contracts/`、contract test 计划。  
**验证方式**：schema lint、示例请求响应校验、错误码覆盖检查。  
**回退方式**：回退到只读官方页，不开放企业激活入口。

### Phase 1：Registry 草案与官方页

**目标**：支持 `framework.ai-autosdlc` 草案登记和官方只读详情页渲染。  
**产物**：Agent / AgentVersion repository、官方页 view model。  
**验证方式**：AS-CT-001、官方页首屏字段测试。  
**回退方式**：官方页降级为静态只读草案。

### Phase 2：manual_installable-preview 与 bootstrap

**目标**：生成企业激活命令，创建 installation / device binding / signed assertion。  
**产物**：Installation API、Device Binding API、Signed Assertion API。  
**验证方式**：AS-CT-003、AS-CT-007、hash mismatch 和过期断言测试。  
**回退方式**：展示“可手动安装，未可信激活”，不展示实际 L5。

### Phase 3：AgentOps 摘要回显

**目标**：消费 Quality / Evidence、Approval、Runtime Policy、Credential Bootstrap summary。  
**产物**：summary client、summary cache、官方页状态卡。  
**验证方式**：AS-CT-004、AS-CT-005、valid_until 过期降级测试。  
**回退方式**：显示证据待同步、审批状态不可用或策略待刷新。

### Phase 4：standalone 边界保护

**目标**：确保 Ai_AutoSDLC 本地独立使用不依赖 Agent Store / AgentOps。  
**产物**：standalone 页面分支、contract test。  
**验证方式**：AS-CT-006。  
**回退方式**：继续展示本地 README/命令，不展示企业质量结论。

## 6. 关键路径验证策略

| 关键路径 | 主验证方式 | 次验证方式 |
|---|---|---|
| Agent Registry 草案 | AS-CT-001 | 数据库唯一约束测试 |
| Installation / Device Binding | AS-CT-003 | 幂等重试测试 |
| Signed Assertion | AS-CT-007 | 签名/过期/issuer 测试 |
| AgentOps Summary | AS-CT-004、AS-CT-005 | mock AgentOps 降级测试 |
| Standalone 边界 | AS-CT-006 | UI 文案和 API 参数检查 |

## 7. 实施顺序建议

1. 先实现 contract schema 和 mock contract tests。
2. 再实现 Agent / AgentVersion / Installation / DeviceBinding 数据层。
3. 再实现官方页 view model 和状态注册表。
4. 再对接 AgentOps summary client。
5. 最后补 standalone 防过度耦合测试和降级体验测试。

## 8. 设计阶段结论

本计划可以进入 decompose。下一阶段必须生成正式 `tasks.md`，并确保每个任务都有精确文件路径、依赖关系和验证命令。
