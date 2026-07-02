# 77 P0 实现阶段 7：Agent Assist Layer 计划

## 1. 定位

本文件定义 ChainTrace P0 受控实现阶段的第七个阶段：Agent Assist Layer。

它不是 LLM 模型选型，不是 prompt 模板，不是 tool calling 协议，不是 Agent memory 设计，不是向量库/RAG 方案，不是工作流引擎，不是队列任务设计，不是聊天 UI 组件，也不是 Agent 自动化代码。

它的作用是：

> 在 Phase 1–6 已经建立身份角色、融资案件、材料、质检、资金方审查和合约状态表达之后，细化 P0 Agent Assist Layer 的业务范围：角色上下文、案件摘要、材料缺口、待办生成、请求补充、状态解释、低风险推进、人工升级和行为留痕。

本阶段的核心目标不是“做一个聊天机器人”，而是：

```text
角色工作区
→ Agent 继承角色权限
→ 案件摘要
→ 缺口和风险提示
→ 责任方待办
→ 状态解释
→ 低风险自动推进
→ 高风险/争议/失败人工升级
→ Agent 行为留痕
```

## 2. 本阶段继承的上游边界

| 上游文档 | 本阶段继承内容 |
|---|---|
| 53-p0-permission-design-boundary | Agent 继承所属角色权限，不是独立超级角色。 |
| 54-p0-business-action-interface-boundary | Agent 可辅助或触发的业务动作边界。 |
| 55-p0-data-information-domain-design | Agent 输出不是事实，不覆盖原始材料、质检结论或资金方决策。 |
| 56-p0-smart-contract-business-design | Agent 不得绕过合约/规则/资金池/平台暂停。 |
| 57-p0-agent-business-design | Agent 类型、模式、可做/不可做能力。 |
| 58-p0-control-tower-expression-design | Agent 输出必须能被控制塔解释。 |
| 59-p0-business-acceptance-design | Agent 摘要、缺口、自动推进、人工升级验收。 |
| 63-p0-interface-specification-preparation | Agent 相关接口候选。 |
| 64-p0-data-model-preparation | Agent Output、Agent Task、Automation Record、Escalation Record 概念对象。 |
| 66-p0-agent-implementation-preparation | Agent 实现准备边界。 |
| 67-p0-prototype-implementation-scope | Agent 在角色工作区中的表达范围。 |
| 68-p0-test-plan-preparation | 低人工路径、人工升级路径、权限隔离测试候选。 |
| 70-p0-controlled-implementation-plan | Phase 7 的阶段目标和门禁。 |
| 76-p0-implementation-phase-6-contract-state-facade-plan | Agent 自动推进必须受合约/规则/资金池/暂停状态约束。 |

## 3. Phase 7 阶段目标

Phase 7 必须让系统具备以下基础能力：

| 目标 | 说明 |
|---|---|
| Agent 绑定角色上下文 | 每个 Agent 输出和动作都绑定所属业务角色。 |
| Agent 权限继承 | Agent 可见和可触发范围不得超过所属角色。 |
| 案件摘要可表达 | Agent 帮角色理解案件状态、材料、事实、资金和卡点。 |
| 缺口和风险提示可表达 | Agent 指出材料缺口、质检 dispute、资金池不足、规则阻断等。 |
| 待办可生成 | Agent 将缺口和异常转成责任方、原因和下一步。 |
| 请求补充可表达 | Agent 可在授权范围内请求补材料或补说明。 |
| 状态解释可表达 | Agent 把合约/规则/资金池/暂停状态翻译成业务语言。 |
| 低风险推进可受控 | 仅在授权、低风险、事实完整、规则明确、未暂停时推进。 |
| 人工升级可表达 | 高风险、dispute、失败、置信不足、权限不清必须升级。 |
| Agent 行为可追踪 | 摘要、待办、请求、自动推进、升级必须留痕。 |

## 4. 本阶段非目标

Phase 7 明确不做以下内容：

| 非目标 | 后置阶段 |
|---|---|
| LLM provider / model 选择 | Agent 技术实现阶段。 |
| Prompt / system prompt 模板 | Agent 技术实现阶段。 |
| Tool calling schema | Agent 技术实现阶段。 |
| Agent memory / 长期记忆 | 后续 Agent 扩展。 |
| 向量库 / RAG / embedding | 后续知识检索能力。 |
| 多 Agent 编队 | 后续 Agent 协作能力。 |
| 聊天 UI 组件 | 前端体验阶段。 |
| 自动化工作流引擎 | 工程实现阶段。 |
| 队列 / scheduler | 工程实现阶段。 |
| Agent eval 脚本 | 测试实现阶段。 |
| 高风险自动审批 | 永远禁止。 |
| Agent 裁决 dispute | 永远禁止。 |

## 5. Agent 类型范围

Phase 7 的 P0 Agent 以核心角色为范围。

| Agent 类型 | 所属角色 | Phase 7 必须能力 | 禁止能力 |
|---|---|---|---|
| Exporter Agent | 出口商 | 案件摘要、材料缺口、补材料待办、资金结果解释。 | 伪造材料、替质检、替资金方审批。 |
| Funding Agent | 资金方 | 审查摘要、证据完整性、风险提示、补材料建议。 | 自动批准高风险、修改原始材料、生成质检结论。 |
| Inspection Agent | 质检方 | 任务提醒、报告完整性、补充待办、dispute 升级。 | 生成 Pass/Fail/Dispute。 |
| Platform Agent | 平台方 | 异常汇总、暂停影响、资金池/规则/合约状态解释。 | 替资金方审批、伪造事实、绕过暂停。 |
| Logistics/Insurance/Buyer Agent | P1 占位 | 不进入完整 P0。 | 不得偷渡完整 P1 工作区。 |

## 6. Agent 模式范围

| 模式 | 业务含义 | Phase 7 能力 | 禁止 |
|---|---|---|---|
| Manual | 全人工确认。 | 摘要、解释、建议、待办。 | 自动请求补充、自动推进。 |
| Semi-auto | 半自动托管。 | 自动摘要、缺口、待办、低风险提醒、明确责任方补充请求。 | 高风险审批、dispute 裁决、绕过确认。 |
| Full-auto | 全自动 Agent。 | 授权范围内低风险自动推进。 | 越权、伪造事实、绕过合约/暂停、处理重大争议。 |

关键边界：

```text
Agent 模式改变自动化程度，不改变业务角色，不扩大数据可见范围。
```

## 7. Agent 权限继承范围

| 检查项 | Phase 7 要求 |
|---|---|
| 所属角色 | Agent 必须绑定 Business Account 和 Role Binding。 |
| 可见范围 | Agent 只能读取所属角色可见的案件、材料、事实、状态。 |
| 动作范围 | Agent 只能辅助或触发所属角色有权触发的业务动作。 |
| 自动化授权 | Agent Mode 决定是否可自动执行低风险动作。 |
| 高风险阻断 | 高风险动作必须转人工。 |
| 平台暂停 | 平台暂停时 Agent 自动化必须停止。 |
| 审计留痕 | Agent 行为必须可追踪。 |

一票否决：

```text
Agent 不得以“系统助手”名义跨角色读取或操作。
```

## 8. Agent 输入范围

| 输入类型 | 来源 | Agent 可做 | Agent 不可做 |
|---|---|---|---|
| Financing Case | Phase 2。 | 摘要案件状态和下一步。 | 修改无权案件。 |
| Trade Materials | Phase 3。 | 摘要、检查缺口、指出冲突。 | 伪造或覆盖原始材料。 |
| Inspection Fact | Phase 4。 | 解释 Pass/Fail/Dispute 和卡点。 | 生成或修改质检结论。 |
| Funding Review | Phase 5。 | 摘要资金方状态和下一步。 | 替资金方审批。 |
| Contract State | Phase 6。 | 解释 Allowed/Blocked/Failed 等。 | 绕过合约/规则输出。 |
| Exception Case | 各阶段异常。 | 生成待办和升级。 | 删除或掩盖异常。 |
| Platform State | 平台状态。 | 解释暂停和影响。 | 绕过暂停。 |

## 9. Agent 输出范围

| 输出类型 | 业务含义 | 不等于 |
|---|---|---|
| Agent Summary | 案件、材料、事实、资金、合约状态摘要。 | 原始事实。 |
| Agent Gap | 缺口或冲突。 | 拒绝结论。 |
| Agent Risk Hint | 风险提示。 | 最终风险裁决。 |
| Agent Recommendation | 建议动作。 | 审批。 |
| Agent Task | 待办。 | 已完成动作。 |
| Agent Explanation | 状态解释。 | 法律/监管最终意见。 |
| Agent Automation Record | 自动推进记录。 | 事实证明。 |
| Agent Escalation Record | 人工升级记录。 | 失败结论。 |

每个 Agent 输出必须标识为 Agent 输出，不得伪装成质检事实、资金方决策或合约状态。

## 10. 案件摘要能力

| 角色 | 摘要重点 | 边界 |
|---|---|---|
| 出口商 | 案件状态、缺材料、质检状态、资金方结果、合约卡点、下一步。 | 不展示无权资金方内部信息。 |
| 资金方 | 出口商、买方、商品、金额、材料完整性、质检结论、风险提示。 | 不修改原始材料。 |
| 质检方 | 质检任务、检查要求、报告状态、补充请求。 | 不展示无关资金信息。 |
| 平台方 | 异常队列、资金池、规则、暂停、Agent 自动化状态。 | 不替业务角色作事实/审批。 |

摘要必须能回答：

```text
这个案件现在在哪一步；卡在哪里；谁负责；下一步是什么。
```

## 11. 缺口和风险提示能力

| 缺口/风险 | Agent 应表达 | 责任方 |
|---|---|---|
| 缺贸易材料 | 缺合同、订单、发票、装箱单或说明。 | 出口商。 |
| 材料冲突 | 金额、数量、主体、日期冲突。 | 出口商 / 资金方人工复核。 |
| 质检未完成 | 质检任务未接收、未提交或需补充。 | 质检方。 |
| 质检 Fail | 事实不满足，需要复核或拒绝路径。 | 资金方 / 质检方。 |
| 质检 Dispute | 存在争议，自动推进停止。 | 质检方 / 出口商 / 资金方。 |
| 资金方未决 | 审查未完成。 | 资金方。 |
| 资金池不足 | Pool insufficient。 | 平台 / 资金方。 |
| 规则阻断 | Rule blocked。 | 平台。 |
| 平台暂停 | Platform paused。 | 平台。 |
| 执行失败 | Execution failed。 | 平台 / 执行责任方。 |

缺口和风险提示必须包含原因、责任方、影响和下一步。

## 12. 待办生成能力

| 待办类型 | 来源 | 责任方 | 完成条件 |
|---|---|---|---|
| 补材料 | 材料缺口。 | 出口商。 | 材料补齐或补充说明提交。 |
| 解释冲突 | 金额/数量/主体/日期冲突。 | 出口商。 | 提交解释或进入人工复核。 |
| 补质检说明 | 质检材料不足或 dispute。 | 质检方。 | 补充说明提交。 |
| 资金方复核 | 高风险或证据复杂。 | 资金方。 | 决策更新。 |
| 平台处理资金池 | Pool insufficient / Paused。 | 平台。 | 资金池恢复或明确处理结果。 |
| 平台处理规则 | Rule blocked / Conflicting。 | 平台。 | 规则恢复、继续阻断或人工处理。 |
| 处理执行失败 | Execution failed。 | 平台 / 执行责任方。 | 失败关闭、重试或升级。 |
| 人工升级确认 | Agent 置信不足或权限不清。 | 所属角色。 | 人工确认结果。 |

待办不能分配给无权角色。

## 13. 请求补充能力

| 请求对象 | Agent 是否可自动请求 | 条件 | 边界 |
|---|---|---|---|
| 出口商补材料 | Semi-auto / Full-auto 可。 | 缺口明确且责任方为出口商。 | 不能代替出口商生成材料。 |
| 质检方补说明 | Semi-auto / Full-auto 可。 | 质检任务相关且缺口明确。 | 不能代替质检方出结论。 |
| 资金方人工复核 | 可生成建议或待办。 | 高风险、dispute 或证据复杂。 | 不能替资金方决策。 |
| 平台处理异常 | 可生成平台待办。 | 资金池、规则、暂停、执行失败。 | 高影响操作需平台人工确认。 |
| 物流/保险/买方 | P1 占位。 | P0 只表达占位。 | 不进入 P0 完整工作区。 |

## 14. 状态解释能力

Agent 必须把系统状态解释成业务语言。

| 状态 | Agent 解释 |
|---|---|
| Need materials | 当前还缺材料或事实，补齐后才能继续。 |
| Waiting | 当前不是失败，而是在等待某个前置条件。 |
| Need review | 当前需要人工复核，不能自动继续。 |
| Rule blocked | 当前规则不允许继续，需要查看规则原因或平台处理。 |
| Pool insufficient | 资金方可能已允许，但资金池不足或不可用。 |
| Platform paused | 平台暂停了相关对象，Agent 自动化会停止。 |
| Dispute | 存在争议，需要人工处理。 |
| Execution failed | 执行失败，需要平台或执行责任方处理。 |
| Completed | 资金执行完成，可以查看结果。 |

禁止解释错误：

- Pool insufficient ≠ 拒绝融资。
- Rule blocked ≠ 贸易欺诈。
- Allowed ≠ 已到账。
- Manual review ≠ 失败。
- Dispute ≠ Agent 可以裁决。

## 15. 低风险自动推进能力

低风险自动推进必须同时满足以下条件。

| 条件 | 要求 | 不满足时 |
|---|---|---|
| 用户授权 | Agent Mode 允许自动化。 | 请求人工确认。 |
| 角色有权 | 所属角色有权触发动作。 | 阻断。 |
| 案件可见 | 案件属于角色可见范围。 | 阻断。 |
| 风险低 | 无高金额、高风险、dispute、失败等条件。 | 人工升级。 |
| 事实完整 | 材料、质检、资金方或规则所需事实满足。 | 生成缺口。 |
| 规则明确 | 无规则冲突或不适用。 | Rule blocked / Need review。 |
| 合约允许 | Phase 6 输出允许或等待下一步。 | 停止推进。 |
| 平台未暂停 | 无案件、账户、资金池、规则或 Agent 暂停。 | 停止自动化。 |
| 可追踪 | 自动动作可以留痕。 | 不允许自动推进。 |

可自动推进的范围：

- 生成摘要。
- 生成缺口。
- 生成待办。
- 明确责任方的补充请求。
- 低风险状态推进。
- 合约输出解释。

不可自动推进的范围：

- 高风险融资批准。
- 质检 Pass/Fail/Dispute。
- 重大 dispute 裁决。
- 平台高影响暂停/恢复。
- 绕过合约或规则执行。

## 16. 人工升级能力

| 升级条件 | 升级对象 | 原因 |
|---|---|---|
| 高金额案件 | 资金方。 | 风险高。 |
| 高风险国家/品类/买方 | 资金方 / 平台。 | 需人工判断。 |
| 质检 Fail | 资金方 / 质检方。 | 事实不支持自动推进。 |
| 质检 Dispute | 质检方 / 出口商 / 资金方。 | 争议未解决。 |
| 金额不一致 | 出口商 / 资金方。 | 材料冲突。 |
| 资金池不足 | 平台 / 资金方。 | 执行条件不足。 |
| 规则阻断 | 平台。 | 规则不允许继续。 |
| 平台暂停 | 平台。 | 自动化必须停止。 |
| 执行失败 | 平台 / 执行责任方。 | 需要人工处理。 |
| Agent 置信不足 | 所属角色。 | 不应自动判断。 |
| 权限不清 | 回流 waterfall。 | 设计边界不足。 |

升级记录必须包含：

| 输出项 | 说明 |
|---|---|
| 升级原因 | 为什么不能自动继续。 |
| 责任方 | 谁处理。 |
| 影响范围 | 影响材料、质检、审查、执行或资金结果。 |
| 解除条件 | 满足什么才能继续。 |
| 下一步 | 人要做什么。 |

## 17. 角色工作区表达范围

| 工作区 | Agent 必须表达 |
|---|---|
| 出口商工作区 | 案件摘要、材料缺口、补材料待办、资金结果解释、卡点下一步。 |
| 资金方工作区 | 审查摘要、证据完整性、风险提示、补材料建议、人工复核提醒。 |
| 质检方工作区 | 任务提醒、报告完整性、补充请求、dispute 升级。 |
| 平台工作区 | 异常汇总、资金池/规则/暂停影响、Agent 自动化停止原因。 |

不要求做聊天窗口；Agent 可以作为卡片、提示、待办、解释、状态摘要出现。

## 18. 业务动作范围

Phase 7 包含以下业务动作。

| 业务动作 | 触发方 | 业务结果 |
|---|---|---|
| Generate case summary | Agent / 用户请求 | 案件摘要。 |
| Generate gap analysis | Agent / 用户请求 | 缺口和冲突清单。 |
| Generate next-step tasks | Agent | 责任方待办。 |
| Request supplement | Agent 在授权范围内 | 发送补充请求或生成待办。 |
| Explain status | Agent / 用户请求 | 状态业务解释。 |
| Request low-risk progression | Agent 在授权范围内 | 低风险推进或阻断解释。 |
| Escalate to human | Agent / 系统 | 生成升级记录。 |
| Stop automation | Agent / 系统 | 记录停止原因。 |
| View Agent output | 相关角色 | 按权限查看 Agent 输出。 |
| Block unauthorized Agent action | 系统 | 阻断越权 Agent 动作。 |

当前不写 endpoint、prompt、tool schema、队列、workflow 或代码。

## 19. 概念数据对象映射

| 概念对象 | Phase 7 用途 |
|---|---|
| Business Role Binding | Agent 角色上下文。 |
| Agent Mode | 自动化授权模式。 |
| Agent Output | 摘要、建议、解释等。 |
| Agent Gap | 缺口和风险提示。 |
| Agent Task | 待办。 |
| Agent Recommendation | 建议动作。 |
| Agent Automation Record | 自动推进记录。 |
| Agent Escalation Record | 人工升级记录。 |
| Exception Case | Agent 发现或解释的卡点。 |
| Audit Record | Agent 行为留痕。 |

当前不写字段、表结构、向量库、memory 或消息格式。

## 20. 接口候选映射

| 接口候选 | Phase 7 用途 |
|---|---|
| 请求 Agent 摘要 | 返回角色可见范围内摘要。 |
| 请求 Agent 缺口检查 | 返回缺口、责任方、下一步。 |
| 生成 Agent 待办 | 将缺口转成业务任务。 |
| 请求补充 | Agent 在授权范围内生成补充请求。 |
| 请求状态解释 | 解释案件、质检、资金方、合约或异常状态。 |
| 请求低风险推进 | 在条件满足时推进，否则停止或升级。 |
| 人工升级 | 生成升级原因、责任方、解除条件。 |
| 查看 Agent 输出 | 按角色权限查看。 |
| 阻断 Agent 越权动作 | 阻断无权读取、无权动作、平台暂停、规则阻断等。 |

当前不写 endpoint、请求响应、错误码、tool calling schema 或 prompt。

## 21. 审计和留痕范围

Phase 7 应保留以下业务留痕要求。

| 留痕事件 | 原因 |
|---|---|
| Agent 摘要生成 | 证明摘要来源和角色上下文。 |
| Agent 缺口生成 | 证明缺口依据和责任方。 |
| Agent 待办生成 | 证明待办来源和处理人。 |
| Agent 请求补充 | 证明请求对象、原因和状态。 |
| Agent 状态解释 | 证明解释来源于业务状态。 |
| Agent 自动推进 | 证明授权、条件和动作。 |
| Agent 停止自动化 | 证明规则阻断、平台暂停、dispute、风险等原因。 |
| Agent 人工升级 | 证明不能自动继续的原因。 |
| Agent 越权阻断 | 证明权限继承生效。 |

当前不写日志表、事件结构、追踪系统或监控实现。

## 22. Phase 7 验收场景

| 场景 | 前提 | 期望结果 |
|---|---|---|
| 出口商 Agent 摘要案件 | 出口商查看自己的案件。 | 摘要案件状态、缺口、下一步。 |
| 出口商 Agent 发现缺发票 | 发票缺失。 | 生成缺口和补发票待办。 |
| 资金方 Agent 生成风险建议 | 案件进入审查。 | 输出风险建议，但不形成审批。 |
| 质检方 Agent 提醒补报告 | 质检报告缺失。 | 生成质检补充待办。 |
| 平台 Agent 汇总资金池不足 | 资金池 Low balance。 | 生成平台待办和影响说明。 |
| Semi-auto 请求补材料 | 用户授权，缺口明确。 | 生成补材料请求并留痕。 |
| Agent 遇到质检 Dispute | Dispute 未解决。 | 停止自动推进并升级。 |
| Agent 遇到 Rule blocked | 合约/规则阻断。 | 停止推进并解释。 |
| Agent 遇到 Platform paused | 平台暂停。 | 停止自动化并记录原因。 |
| Agent 尝试审批高风险案件 | 高风险或资金方决策未确认。 | 阻断。 |
| Agent 尝试生成质检 Pass | Agent 非事实来源。 | 阻断。 |
| Agent 查看无关案件 | 所属角色无权。 | 阻断。 |

## 23. Phase 7 通过标准

| 检查项 | 通过标准 |
|---|---|
| 角色绑定 | Agent 输出和动作绑定所属角色。 |
| 权限继承 | Agent 不扩大可见范围和动作范围。 |
| 摘要能力 | 能摘要案件、材料、事实、资金方、合约和卡点。 |
| 缺口能力 | 缺口有原因、责任方和下一步。 |
| 待办能力 | 待办是业务动作，不是技术任务。 |
| 状态解释 | 能解释 Need materials、Rule blocked、Pool insufficient、Platform paused、Execution failed 等。 |
| 低风险推进 | 受授权、权限、风险、事实、规则、资金池、暂停约束。 |
| 人工升级 | 高风险、dispute、失败、置信不足、权限不清能升级。 |
| 审计留痕 | Agent 行为可追踪。 |
| 后置边界 | 未进入模型、prompt、tool、memory、workflow、聊天 UI 或复杂 RAG。 |

## 24. 一票否决项

出现以下任一项，Phase 7 不得通过：

| 一票否决项 | 原因 |
|---|---|
| Agent 可以跨角色查看无权案件 | 权限继承失败。 |
| Agent 可以伪造贸易材料 | 事实可信失败。 |
| Agent 可以生成质检 Pass/Fail/Dispute | 事实来源失败。 |
| Agent 风险建议被当作资金方审批 | Agent 越界。 |
| Agent 自动批准高风险融资 | 风险控制失败。 |
| Agent 自动裁决重大 Dispute | 争议处理失败。 |
| Agent 绕过 Rule blocked | 合约/规则边界失败。 |
| Agent 绕过 Pool insufficient | 资金池边界失败。 |
| Agent 绕过 Platform paused | 平台控制失败。 |
| Agent 输出伪装成原始事实或最终审批 | 责任边界失败。 |
| Phase 7 混入模型、prompt、tool calling、memory、workflow 或聊天 UI 实现 | 阶段越界。 |

## 25. 实现中回流规则

| 发现问题 | 回流目标 |
|---|---|
| 需要新增 Agent 能力 | 57 / 66。 |
| Agent 触发的新业务动作 | 54 / 63。 |
| Agent 可见范围不清 | 53。 |
| Agent 输出对象不足 | 55 / 64。 |
| 自动推进条件不清 | 56 / 65 / 66。 |
| 控制塔无法表达 Agent 输出 | 58 / 67。 |
| 验收场景不足 | 59 / 68。 |
| P1/P2 Agent 能力混入 | 60 后置。 |
| 模型/prompt/tool/memory 实现混入 | 60 后置到 Agent 技术实现阶段。 |

不得通过 prompt 临时补业务权限缺口。

## 26. Phase 7 出口条件

Phase 7 完成后，系统应具备以下能力：

```text
1. Agent 绑定所属业务角色，并继承该角色权限。
2. Agent 可以为出口商、资金方、质检方、平台方生成角色相关摘要。
3. Agent 可以识别材料缺口、质检争议、资金方待处理、规则阻断、资金池不足和平台暂停。
4. Agent 可以生成责任方明确的业务待办。
5. Agent 可以解释案件状态、资金方结果、合约输出和异常卡点。
6. Agent 可以在授权、低风险、事实完整、规则明确、平台未暂停时执行有限自动推进。
7. Agent 遇到高风险、Dispute、执行失败、置信不足或权限不清时必须人工升级。
8. Agent 行为具备留痕语义。
9. Agent 不伪造事实、不替审批、不裁决争议、不绕过合约和平台暂停。
```

满足以上条件后，才允许进入：

> `78-p0-implementation-phase-8-control-tower-projection-plan.md`

即细化 Phase 8：Control Tower Projection，开始把身份、案件、材料、质检、资金方、合约和 Agent 输出投影成角色工作区主链路。

## 27. 本步结论

Phase 7 的本质不是“做 AI 聊天框”。

它的本质是：

> 在 ChainTrace P0 的融资主链路上加入可控 Agent 助理层：Agent 继承角色权限，帮助角色理解案件、发现缺口、生成待办、解释状态、有限推进低风险步骤，并在高风险、争议、失败、权限不清时停止和升级。

只有 Agent Assist Layer 成立，后续 Control Tower Projection 才能真正呈现“人 + Agent + 合约状态 + 业务卡点”的 Agent Native 操作台。
