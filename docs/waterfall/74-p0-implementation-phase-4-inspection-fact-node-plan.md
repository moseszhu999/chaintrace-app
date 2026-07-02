# 74 P0 实现阶段 4：Inspection Fact Node 计划

## 1. 定位

本文件定义 ChainTrace P0 受控实现阶段的第四个阶段：Inspection Fact Node。

它不是质检接口实现，不是数据库表设计，不是文件存储方案，不是质检报告模板，不是 OCR/图片识别算法，不是前端质检页面实现，也不是第三方质检机构集成方案。

它的作用是：

> 在 Phase 3 贸易材料和缺口流程成立之后，细化 Phase 4 的质检任务、质检材料、质检结论、Pass/Fail/Dispute、补充说明、事实来源边界、对融资链路的影响和阶段验收口径，确保 ChainTrace P0 的第一个核心外部事实节点可被可信表达。

本阶段的核心目标不是“上传质检报告”，而是：

```text
融资案件
→ 质检任务
→ 质检材料
→ 质检结论 Pass / Fail / Dispute
→ 质检补充说明
→ 事实来源留痕
→ 影响资金方审查和合约/规则执行条件
```

## 2. 本阶段继承的上游边界

| 上游文档 | 本阶段继承内容 |
|---|---|
| 53-p0-permission-design-boundary | 质检方只能处理自己的质检任务，不能决定放款。 |
| 54-p0-business-action-interface-boundary | 接收质检任务、提交质检材料、给出 pass/fail/dispute、补充质检说明。 |
| 55-p0-data-information-domain-design | 质检事实、事实来源、事实节点状态、事实责任方。 |
| 56-p0-smart-contract-business-design | 合约只读取质检状态，不生成质检结论。 |
| 57-p0-agent-business-design | Agent 可提醒和检查报告完整性，但不能伪造质检事实。 |
| 58-p0-control-tower-expression-design | 质检节点状态、争议、责任方和下一步表达。 |
| 59-p0-business-acceptance-design | 事实来源边界、质检 Fail/Dispute 异常验收。 |
| 63-p0-interface-specification-preparation | 事实确认接口候选中的质检能力。 |
| 64-p0-data-model-preparation | Inspection Task、Inspection Evidence、Inspection Conclusion、Fact Node 概念对象。 |
| 66-p0-agent-implementation-preparation | Agent 可提醒质检方、生成补充待办、升级 dispute。 |
| 67-p0-prototype-implementation-scope | 质检方工作区和控制塔质检节点范围。 |
| 68-p0-test-plan-preparation | 质检来源、Fail、Dispute 和越权测试候选。 |
| 70-p0-controlled-implementation-plan | Phase 4 的阶段目标和门禁。 |
| 73-p0-implementation-phase-3-material-gap-flow-plan | 材料准备完成后进入事实确认节点。 |

## 3. Phase 4 阶段目标

Phase 4 必须让系统具备以下基础能力：

| 目标 | 说明 |
|---|---|
| 质检任务可表达 | 质检任务属于某个融资案件，并分配给质检方。 |
| 质检方工作区可表达 | 质检方能看到自己相关任务。 |
| 质检材料可表达 | 报告、照片、说明等作为质检证据材料。 |
| 质检结论可表达 | Pass、Fail、Dispute 三类结论必须清楚。 |
| 质检来源可追踪 | 结论必须来自质检方，不来自 Agent、资金方、平台或合约。 |
| 质检补充可表达 | 对缺失、争议或资金方/平台要求做补充说明。 |
| 质检对融资链路有影响 | Pass 支持继续；Fail/Dispute 进入阻断、复核或人工路径。 |
| 质检状态能被控制塔表达 | 出口商、资金方、质检方、平台方看到各自可见的业务状态。 |

## 4. 本阶段非目标

Phase 4 明确不做以下内容：

| 非目标 | 后置阶段 |
|---|---|
| 第三方质检 API 集成 | 后续外部系统集成。 |
| 质检报告模板生成 | 后续文档模板能力。 |
| 图片识别、OCR、缺陷检测算法 | 后续智能质检能力。 |
| 完整物流节点确认 | P1 物流工作区。 |
| 保险承保/理赔判断 | P1 保险流程。 |
| 买方收货/付款责任确认 | P1 买方工作区。 |
| 海关/报关/通关数据接入 | P2。 |
| 资金方审查和决策 | Phase 5。 |
| 合约/规则执行 | Phase 6。 |
| Agent 自动裁决争议 | 永远禁止。 |
| hash/proof 产品页 | 后续证明产品。 |

## 5. 质检事实节点范围

Phase 4 的中心对象是 Inspection Fact Node。

| 概念对象 | 本阶段用途 | 边界 |
|---|---|---|
| Inspection Task | 表达一项质检任务。 | 只能由相关质检方处理。 |
| Inspection Evidence | 表达质检报告、照片、说明等证据。 | 不等于贸易材料原件。 |
| Inspection Conclusion | 表达 Pass、Fail、Dispute。 | 只能由质检方确认。 |
| Inspection Supplement | 表达补充说明和争议回应。 | 不覆盖历史结论。 |
| Fact Source Role | 表达事实来源是质检方。 | 不能被 Agent、合约、资金方冒充。 |
| Inspection Status | 表达待接收、处理中、已提交、Pass、Fail、Dispute、需补充。 | 必须控制塔可解释。 |

## 6. 质检任务状态范围

Phase 4 应定义并表达以下质检任务状态。

| 状态 | 业务含义 | 下一步 |
|---|---|---|
| Not assigned | 尚未分配质检任务。 | 平台或系统后续分配。 |
| Assigned | 质检任务已分配给质检方。 | 质检方接收或处理。 |
| Accepted | 质检方已接收任务。 | 准备或提交质检材料。 |
| In inspection | 质检进行中。 | 等待报告、照片或说明。 |
| Evidence submitted | 质检材料已提交。 | 提交结论或补充说明。 |
| Pass | 质检通过。 | 可进入资金方审查或规则检查前置。 |
| Fail | 质检不通过。 | 进入资金方拒绝、复检或人工复核。 |
| Dispute | 质检存在争议。 | 进入人工处理和补充说明。 |
| Need supplement | 需要补充质检材料或说明。 | 质检方补充。 |
| Closed | 质检节点关闭。 | 作为事实记录参与后续链路。 |

禁止只用 complete / failed 表达质检状态。

## 7. 质检结论业务语义

| 结论 | 业务含义 | 对融资链路影响 |
|---|---|---|
| Pass | 质检方认为货物质量、数量、包装或现场状态满足当前要求。 | 支持进入资金方审查或规则路径。 |
| Fail | 质检方认为存在不符合要求的情况。 | 进入拒绝、复检、补充说明或人工复核路径。 |
| Dispute | 质检结论存在争议、证据不足或责任不清。 | 阻断自动推进，进入人工处理。 |

边界：

- Pass 不等于融资批准。
- Fail 不等于最终拒绝，资金方可能要求复核或补充说明。
- Dispute 不能由 Agent 自动裁决。
- 合约只能读取质检状态，不生成结论。

## 8. 质检材料范围

| 质检材料 | 业务用途 | 提交责任方 | Phase 4 要求 |
|---|---|---|---|
| Inspection report | 质检报告。 | 质检方。 | 可表达已提交、需补充、历史留痕。 |
| Inspection photos | 现场或货物照片。 | 质检方。 | 可表达存在/缺失，不做图像识别。 |
| Quantity check note | 数量检查说明。 | 质检方。 | 用于解释数量状态。 |
| Packaging check note | 包装检查说明。 | 质检方。 | 用于解释包装状态。 |
| Defect note | 缺陷或不符合说明。 | 质检方。 | 支撑 Fail/Dispute。 |
| Supplement explanation | 补充说明。 | 质检方。 | 不覆盖原始结论。 |

注意：

```text
Phase 4 不实现图片识别和报告解析，只表达质检事实材料的业务状态。
```

## 9. 质检方工作区范围

Phase 4 中质检方工作区应支持质检任务处理。

| 工作区区域 | Phase 4 表达 |
|---|---|
| 质检任务列表 | 只显示分配给自己的任务。 |
| 任务详情 | 关联融资案件、商品、数量、包装、检查要求。 |
| 材料提交状态 | 报告、照片、说明是否已提交。 |
| 结论提交 | Pass、Fail、Dispute。 |
| 补充请求 | 资金方、平台或 Agent 要求补什么。 |
| 争议说明 | Dispute 原因、责任方和下一步。 |
| 历史留痕 | 质检材料、结论、补充说明的提交历史。 |

禁止：

- 质检方看到无关融资案件。
- 质检方决定放款。
- 质检方修改出口商贸易材料原件。
- 质检方查看资金池内部运营信息。

## 10. 出口商、资金方、平台的质检可见范围

| 角色 | 可见内容 | 不可见/不可做 |
|---|---|---|
| 出口商 | 自己案件的质检状态、Pass/Fail/Dispute、补充需求。 | 修改质检结论。 |
| 资金方 | 分配案件的质检状态、结论、争议和补充说明。 | 冒充质检方出结论。 |
| 平台方 | 异常质检任务、dispute、任务分派和运营状态。 | 替质检方伪造结论。 |
| Agent | 所属角色可见范围内解释质检状态、生成待办。 | 生成 Pass/Fail/Dispute。 |
| 合约/规则层 | 读取质检状态作为执行条件之一。 | 判断质检真实性或生成结论。 |

## 11. Agent 在本阶段的边界

Phase 4 中 Agent 可辅助质检流程，但不能成为事实来源。

| Agent 能力 | 允许 | 禁止 |
|---|---|---|
| 提醒质检方处理任务 | 允许 | 不能代替接收任务。 |
| 检查质检材料完整性 | 允许 | 不能判断质检真实性。 |
| 生成补充待办 | 允许 | 不能伪造报告或照片。 |
| 解释 Pass/Fail/Dispute | 允许 | 不能改写结论。 |
| 升级 Dispute | 允许 | 不能裁决争议。 |
| 提醒资金方人工复核 | 允许 | 不能替资金方决策。 |

一票否决：

```text
Agent 不得生成或修改质检结论。
```

## 12. 业务动作范围

Phase 4 包含以下业务动作。

| 业务动作 | 触发方 | 业务结果 |
|---|---|---|
| Assign inspection task | 系统 / 平台占位 | 质检任务已分配。 |
| View assigned inspection task | 质检方 | 只查看自己的任务。 |
| Accept inspection task | 质检方 | 任务已接收。 |
| Submit inspection evidence | 质检方 | 质检材料已提交。 |
| Submit inspection conclusion | 质检方 | Pass / Fail / Dispute。 |
| Submit inspection supplement | 质检方 | 补充说明已记录。 |
| Request inspection supplement | 资金方 / 平台 / Agent 占位 | 产生补充请求。 |
| View inspection status | 案件相关角色 | 查看可见范围内质检状态。 |
| Block unauthorized conclusion change | 系统 | 阻断非质检方修改结论。 |

当前不写 endpoint、HTTP 方法、JSON 或代码。

## 13. 控制塔表达范围

Phase 4 需要增强控制塔中的事实确认节点。

| 控制塔节点 | Phase 4 表达 |
|---|---|
| Financing intent | 已由 Phase 2 创建。 |
| Materials | 已由 Phase 3 准备。 |
| Inspection fact | Not assigned / Assigned / Accepted / In inspection / Pass / Fail / Dispute / Need supplement。 |
| Agent check | 质检缺口、补充待办、争议升级。 |
| Funding review | Phase 5 接入。 |
| Contract execution | Phase 6 接入。 |
| Funding result | 仍为结果入口或等待状态。 |

控制塔必须能表达：

```text
质检到了哪一步；结论是什么；如果 Fail/Dispute，谁处理；下一步是什么。
```

## 14. 对资金方审查的影响

Phase 4 不实现资金方审查，但必须为 Phase 5 提供质检事实状态。

| 质检状态 | 对资金方的业务影响 |
|---|---|
| Not assigned / Assigned / In inspection | 资金方可等待或要求补充。 |
| Need supplement | 资金方可等待补充或要求人工复核。 |
| Pass | 支持进入审查和可能批准。 |
| Fail | 资金方可拒绝、要求复检或人工复核。 |
| Dispute | 自动推进停止，进入人工处理。 |

边界：

- 质检 Pass 不是资金方批准。
- 质检 Fail 不自动等于最终拒绝。
- 质检 Dispute 必须阻断低人工自动推进。

## 15. 对合约/规则执行的影响

Phase 4 不实现合约执行，但必须为 Phase 6 提供质检条件语义。

| 质检状态 | 合约/规则后续可能输出 |
|---|---|
| Pass | 可满足质检条件。 |
| Pending / In inspection | Waiting。 |
| Need supplement | Need materials / Waiting。 |
| Fail | Rule blocked / Need review。 |
| Dispute | Dispute / Need review。 |

边界：

- 合约不判断质检报告真假。
- 合约不生成质检结论。
- 合约不裁决 Dispute。

## 16. 概念数据对象映射

| 概念对象 | Phase 4 用途 |
|---|---|
| Financing Case | 质检任务属于某一融资案件。 |
| Fact Node | 质检作为事实节点。 |
| Inspection Task | 质检任务。 |
| Inspection Evidence | 质检报告、照片、说明等。 |
| Inspection Conclusion | Pass、Fail、Dispute。 |
| Inspection Supplement | 补充说明。 |
| Fact Source Role | 标识质检方来源。 |
| Exception Case | Fail/Dispute/Need supplement 可能生成异常卡点。 |
| Agent Task | 质检补充待办或人工升级。 |
| Audit Record | 质检材料、结论、补充和越权阻断留痕。 |

当前不写字段、表结构、文件路径或存储策略。

## 17. 接口候选映射

| 接口候选 | Phase 4 用途 |
|---|---|
| 接收质检任务 | 质检方确认处理任务。 |
| 提交质检材料 | 质检方提交报告、照片、说明。 |
| 提交质检结论 | 质检方给出 Pass/Fail/Dispute。 |
| 补充质检说明 | 质检方回应补充请求。 |
| 查看质检状态 | 案件相关角色查看可见范围内状态。 |
| 请求质检补充 | 资金方、平台或 Agent 生成补充请求。 |
| 越权阻断 | 阻断非质检方修改质检结论。 |

当前不写 endpoint、请求响应、错误码、文件上传协议或鉴权 header。

## 18. 审计和留痕范围

Phase 4 应保留以下业务留痕要求。

| 留痕事件 | 原因 |
|---|---|
| 质检任务分配 | 证明任务来源和责任方。 |
| 质检任务接收 | 证明质检方开始处理。 |
| 质检材料提交 | 证明事实证据来源。 |
| 质检结论提交 | 证明 Pass/Fail/Dispute 来源。 |
| 质检补充说明 | 证明争议或缺口回应。 |
| 质检状态变化 | 证明事实节点变化。 |
| Agent 补充待办 | 证明 Agent 没有伪造事实，只生成待办。 |
| 越权修改阻断 | 证明事实来源边界生效。 |

当前不写日志表、事件结构或存储实现。

## 19. Phase 4 验收场景

| 场景 | 前提 | 期望结果 |
|---|---|---|
| 质检方查看自己的任务 | 任务已分配给该质检方。 | 可以查看任务详情。 |
| 质检方提交质检材料 | 任务属于该质检方。 | 质检材料状态更新并留痕。 |
| 质检方提交 Pass | 材料满足要求。 | 质检状态为 Pass，后续可进入资金方/规则路径。 |
| 质检方提交 Fail | 存在不符合情况。 | 状态为 Fail，进入拒绝/复检/人工复核路径。 |
| 质检方提交 Dispute | 证据不足或存在争议。 | 状态为 Dispute，自动推进停止并生成处理卡点。 |
| 出口商查看质检状态 | 案件属于出口商。 | 可以看到自己案件的质检状态和下一步。 |
| 资金方查看质检状态 | 案件分配给资金方。 | 可以看到质检结论和争议。 |
| Agent 解释质检状态 | 所属角色可见该状态。 | 解释结论、卡点和下一步。 |
| Agent 尝试生成 Pass | Agent 非事实来源。 | 阻断。 |
| 资金方尝试修改质检结论 | 资金方非质检来源。 | 阻断。 |
| 平台替质检方提交结论 | 平台非事实来源。 | 阻断或只能分派/处理异常。 |

## 20. Phase 4 通过标准

| 检查项 | 通过标准 |
|---|---|
| 质检任务 | 可分配、可接收、可查看。 |
| 质检材料 | 报告、照片、说明等材料状态可表达。 |
| 质检结论 | Pass、Fail、Dispute 三类结论清楚。 |
| 事实来源 | 结论来源是质检方。 |
| 角色可见 | 出口商、资金方、平台、Agent 可见范围清楚。 |
| Agent 边界 | Agent 只解释、提醒、补充待办和升级，不生成事实。 |
| 合约边界 | 合约只读取状态，不生成结论。 |
| 异常处理 | Fail/Dispute/Need supplement 有责任方和下一步。 |
| 历史留痕 | 材料、结论、补充和状态变化可追踪。 |
| 后置边界 | 未进入物流/保险/买方/海关完整事实，也未进入资金方审批或合约实现。 |

## 21. 一票否决项

出现以下任一项，Phase 4 不得通过：

| 一票否决项 | 原因 |
|---|---|
| Agent 可以生成或修改质检 Pass/Fail/Dispute | 事实来源失败。 |
| 资金方可以修改质检结论 | 事实来源越界。 |
| 平台可以伪造质检结论 | 平台越界。 |
| 质检方可以决定放款 | 角色职责越界。 |
| 质检 Pass 被表达成融资批准 | 资金结果误导。 |
| 质检 Fail 自动等于最终拒绝且无复核路径 | 业务处理过窄。 |
| 质检 Dispute 被 Agent 自动裁决 | Agent 越权。 |
| 质检任务可被无关质检方查看 | 数据隔离失败。 |
| 质检材料或结论可被无痕覆盖 | 审计失败。 |
| Phase 4 混入资金方审批、合约执行、完整物流/保险/买方工作区 | 阶段越界。 |
| 直接写 endpoint、表结构、文件存储、UI 组件或代码 | 当前文档阶段越界。 |

## 22. 实现中回流规则

| 发现问题 | 回流目标 |
|---|---|
| 需要新增质检状态 | 55 / 58 / 64。 |
| 需要新增质检业务动作 | 54 / 63。 |
| 质检可见范围不清 | 53。 |
| Agent 质检辅助边界不清 | 57 / 66。 |
| 合约读取质检条件语义不清 | 56 / 65。 |
| Fail/Dispute 异常处理不足 | 58 / 59 / 68。 |
| 质检材料类型不足 | 55 / 64。 |
| 物流/保险/买方/海关事实被要求进入 P0 | 60 后置。 |
| hash/proof 被要求成为质检主线 | 60 后置。 |

不得通过临时代码补事实来源边界。

## 23. Phase 4 出口条件

Phase 4 完成后，系统应具备以下能力：

```text
1. 质检任务可以关联融资案件并分配给质检方。
2. 质检方只能查看和处理自己的质检任务。
3. 质检方可以提交质检材料和补充说明。
4. 质检方可以给出 Pass / Fail / Dispute 结论。
5. 质检结论来源可追踪，不能由 Agent、资金方、平台或合约伪造。
6. 出口商、资金方、平台方只能在自己权限范围内查看质检状态。
7. Agent 可以解释质检状态、生成补充待办和升级 dispute，但不能裁决。
8. Fail / Dispute / Need supplement 能形成可处理的卡点。
9. 质检状态能作为 Phase 5 资金方审查和 Phase 6 合约/规则执行的输入条件。
```

满足以上条件后，才允许进入：

> `75-p0-implementation-phase-5-funding-review-path-plan.md`

即细化 Phase 5：Funding Review Path，开始定义资金方审查、补材料、允许、拒绝、降额和人工复核的受控实现范围。

## 24. 本步结论

Phase 4 的本质不是“做一个质检报告上传页”。

它的本质是：

> 在融资案件和贸易材料之后，引入第一个可信外部事实节点：质检方负责提交质检材料并给出 Pass/Fail/Dispute，其他角色只能在权限范围内读取和处理该事实状态，Agent 不能伪造或裁决，合约只能读取状态作为执行条件。

只有 Inspection Fact Node 成立，后续资金方审查、DeFi 规则路径、合约执行检查和控制塔卡点表达才有可信的事实基础。
