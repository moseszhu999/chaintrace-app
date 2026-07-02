# 79 P0 实现阶段 9：Platform Operation Basics 计划

## 1. 定位

本文件定义 ChainTrace P0 受控实现阶段的第九个阶段：Platform Operation Basics。

它不是完整后台管理系统，不是运营 BI，不是监控系统，不是告警系统，不是数据库管理台，不是 DevOps 控制台，不是资金池合约实现，也不是平台逐单审批中心。

它的作用是：

> 在 Phase 8 Control Tower Projection 成立之后，细化平台方在 P0 中需要具备的基础运营能力：运行总览、资金池状态、规则状态、合约执行状态、Agent 自动化状态、异常队列、暂停/恢复影响和运营处理边界。

本阶段的核心目标不是“做一个大后台”，而是：

```text
平台工作区
→ 运行总览
→ 资金池状态
→ 规则状态
→ 合约执行状态
→ Agent 自动化状态
→ 异常队列
→ 暂停 / 恢复影响
→ 运营处理记录
```

平台方在 P0 中是系统运营者，不是事实伪造者，也不是资金方审批者。

## 2. 本阶段继承的上游边界

| 上游文档 | 本阶段继承内容 |
|---|---|
| 53-p0-permission-design-boundary | 平台可看运营状态，但不能替资金方审批或伪造事实。 |
| 54-p0-business-action-interface-boundary | 平台处理暂停、恢复、异常、资金池、规则和 Agent 自动化状态的业务动作。 |
| 55-p0-data-information-domain-design | 平台运营状态、异常、暂停、资金池和规则信息域。 |
| 56-p0-smart-contract-business-design | 平台暂停和规则状态会影响合约/执行条件。 |
| 57-p0-agent-business-design | 平台 Agent 可汇总异常，但不能越权处理事实和审批。 |
| 58-p0-control-tower-expression-design | 平台视角的运行总览和异常队列表达。 |
| 59-p0-business-acceptance-design | 平台暂停、资金池不足、规则阻断、执行失败验收口径。 |
| 63-p0-interface-specification-preparation | 平台运营接口候选。 |
| 64-p0-data-model-preparation | Platform Operation State、Exception Case、Pause State、Audit Record 概念对象。 |
| 65-p0-contract-specification-preparation | 资金池、规则、暂停、执行失败对合约业务输出的影响。 |
| 66-p0-agent-implementation-preparation | 平台 Agent 的异常汇总和人工接管边界。 |
| 67-p0-prototype-implementation-scope | 平台工作区原型范围。 |
| 68-p0-test-plan-preparation | 平台运营、异常、暂停和合约输出测试候选。 |
| 76-p0-implementation-phase-6-contract-state-facade-plan | 资金池、规则、平台暂停和执行失败状态。 |
| 77-p0-implementation-phase-7-agent-assist-layer-plan | 平台 Agent 对异常和自动化停止的解释。 |
| 78-p0-implementation-phase-8-control-tower-projection-plan | 平台 Control Tower 投影。 |

## 3. Phase 9 阶段目标

Phase 9 必须让平台方具备以下基础运营表达能力：

| 目标 | 说明 |
|---|---|
| 运行总览可表达 | 平台能看到 P0 系统关键运营状态。 |
| 资金池状态可表达 | 可用、不足、暂停、冻结、失败等状态可见。 |
| 规则状态可表达 | Active、Paused、Expired、Pending upgrade、Conflicting 等可见。 |
| 合约执行状态可表达 | Allowed、Waiting、Blocked、Failed、Completed 的分布和卡点可见。 |
| Agent 自动化状态可表达 | 正常、停止、堆积、失败、需人工接管可见。 |
| 异常队列可表达 | 缺材料、dispute、资金池不足、规则阻断、暂停、执行失败可处理。 |
| 暂停/恢复影响可表达 | 暂停对象、原因、影响范围、恢复条件和责任方清楚。 |
| 平台处理边界可表达 | 平台能处理运营状态，但不能伪造事实或替资金方审批。 |
| 运营留痕可表达 | 暂停、恢复、处理异常、接管 Agent 自动化要留痕。 |

## 4. 本阶段非目标

Phase 9 明确不做以下内容：

| 非目标 | 后置阶段 |
|---|---|
| 完整后台管理系统 | 后续 Admin Console。 |
| 高级运营 BI / 报表 | 后续运营分析。 |
| Prometheus/Grafana/日志平台 | 工程监控阶段。 |
| 真实告警通知系统 | 后续告警实现。 |
| 数据库管理台 | 工程运维工具。 |
| 合约部署和链上管理 | 合约实现/部署阶段。 |
| 真实资金池管理合约 | 资金执行阶段。 |
| 平台逐单审批 | 永远不是平台定位。 |
| 伪造质检、买方、保险、物流事实 | 永远禁止。 |
| 多资金方市场运营 | 后续资金市场。 |
| 复杂贷后催收 | 后续贷后模块。 |

## 5. 平台运行总览范围

平台运行总览应只覆盖 P0 必要运营状态。

| 区域 | 平台应看到 | 边界 |
|---|---|---|
| 案件状态总览 | Draft、Preparing、Under review、Blocked、Completed 等。 | 不逐单替资金方审批。 |
| 异常队列 | dispute、规则阻断、资金池不足、执行失败等。 | 处理运营卡点，不伪造事实。 |
| 资金池状态 | 可用、低余额、暂停、冻结、失败。 | 不等于真实资金调度实现。 |
| 规则状态 | Active、Paused、Expired、Conflicting。 | 不做规则引擎实现。 |
| 合约执行状态 | Allowed、Waiting、Blocked、Failed、Completed。 | 不写合约交易。 |
| Agent 状态 | 自动化正常、停止、堆积、失败、需人工接管。 | 不实现 Agent workflow。 |
| 暂停影响 | 案件、账户、规则、资金池、执行能力、Agent 自动化。 | 暂停必须有原因和恢复条件。 |

## 6. 异常队列范围

平台异常队列是 Phase 9 核心。

| 异常类型 | 来源 | 平台处理方向 |
|---|---|---|
| Missing materials | Phase 3 / Agent。 | 指向出口商补材料，不替出口商补。 |
| Material conflict | Phase 3 / Agent。 | 要求说明或资金方人工复核。 |
| Inspection Fail | Phase 4。 | 进入资金方复核或关闭路径。 |
| Inspection Dispute | Phase 4 / Agent。 | 分派责任方并停止自动推进。 |
| Funding manual review | Phase 5。 | 观察和提醒资金方处理。 |
| Funding rejected | Phase 5。 | 确认出口商可见原因。 |
| Rule blocked | Phase 6。 | 平台处理规则状态或说明阻断原因。 |
| Pool insufficient | Phase 6。 | 资金池恢复、等待或人工处理。 |
| Platform paused | Phase 6 / Platform。 | 管理暂停和恢复条件。 |
| Execution failed | Phase 6。 | 平台处理失败原因和下一步。 |
| Agent automation failed | Phase 7。 | 接管、停止或重新分派。 |

异常队列必须表达：

```text
异常是什么；影响哪个案件；当前责任方是谁；为什么卡住；解除条件是什么；下一步是什么。
```

## 7. 资金池运营状态范围

| 资金池状态 | 平台表达 | 影响 |
|---|---|---|
| Available | 资金池可用。 | 执行可继续。 |
| Low balance | 余额不足。 | Pool insufficient。 |
| Currency unsupported | 币种不支持。 | Rule blocked / Need review。 |
| Paused | 平台暂停资金池。 | 相关执行停止。 |
| Frozen | 异常冻结。 | 相关执行停止并人工处理。 |
| Execution backlog | 执行堆积。 | Waiting。 |
| Failed execution | 资金执行失败。 | Execution failed。 |

平台可做：

- 查看资金池状态。
- 标记运营暂停/恢复意图。
- 解释影响范围。
- 分派异常处理。

平台不可做：

- 把资金池不足改写成资金方拒绝。
- 伪造资金池可用状态。
- 跳过执行条件直接完成资金结果。

## 8. 规则运营状态范围

| 规则状态 | 平台表达 | 影响 |
|---|---|---|
| Active | 规则有效。 | 可用于执行检查。 |
| Paused | 规则暂停。 | Rule blocked / Platform paused。 |
| Expired | 规则过期。 | Rule blocked。 |
| Pending upgrade | 等待升级。 | Waiting / Need review。 |
| Not applicable | 不适用案件。 | Rule blocked / Need review。 |
| Conflicting | 规则冲突。 | Need review。 |

平台可做：

- 查看规则影响。
- 暂停或恢复规则状态的业务表达。
- 标记需要人工处理。
- 解释规则阻断原因。

平台不可做：

- 用规则状态伪造贸易事实。
- 用规则状态替资金方审批。
- 无解释地隐藏规则阻断。

## 9. 合约执行状态运营范围

| 执行状态 | 平台应看到 | 平台处理方向 |
|---|---|---|
| Allowed | 满足执行条件。 | 等待执行或确认执行路径。 |
| Waiting | 等待条件。 | 识别等待对象。 |
| Need materials | 缺材料或事实。 | 指向责任方补充。 |
| Need review | 需要人工复核。 | 分派责任方。 |
| Rule blocked | 规则阻断。 | 处理规则或说明阻断。 |
| Pool insufficient | 资金池不足。 | 处理资金池状态。 |
| Platform paused | 平台暂停。 | 管理恢复条件。 |
| Dispute | 存在争议。 | 停止自动化并分派。 |
| Execution failed | 执行失败。 | 查明原因并处理。 |
| Completed | 执行完成。 | 结果归档。 |

平台不可把 Execution failed 直接改成 Completed。

## 10. Agent 自动化运营范围

| Agent 状态 | 平台表达 | 平台处理方向 |
|---|---|---|
| Running | 自动化正常。 | 观察。 |
| Stopped by rule | 规则阻断停止。 | 平台处理规则或等待。 |
| Stopped by pause | 暂停导致停止。 | 处理暂停状态。 |
| Stopped by dispute | 争议导致停止。 | 分派人工。 |
| Low confidence | 置信不足。 | 分派所属角色人工确认。 |
| Failed | 自动化失败。 | 平台接管或停止。 |
| Backlog | 待办堆积。 | 分派和优先级处理。 |
| Manual takeover | 人工接管。 | 平台或所属角色处理。 |

平台可做：

- 查看 Agent 自动化状态。
- 暂停某类自动化。
- 接管失败队列。
- 分派人工处理。

平台不可做：

- 借接管 Agent 伪造事实。
- 借接管 Agent 替资金方审批。
- 借接管 Agent 绕过合约/规则/暂停。

## 11. 暂停/恢复范围

Phase 9 必须表达以下暂停对象。

| 暂停对象 | 影响 |
|---|---|
| Case pause | 单个案件暂停。 |
| Account pause | 账户动作暂停。 |
| Capital pool pause | 相关资金执行暂停。 |
| Rule pause | 相关规则检查暂停。 |
| Contract execution pause | 执行能力暂停。 |
| Agent automation pause | 自动推进暂停。 |

暂停记录必须包含：

| 字段语义 | 说明 |
|---|---|
| 暂停对象 | 暂停什么。 |
| 暂停原因 | 为什么暂停。 |
| 影响范围 | 影响哪些案件、路径、角色或 Agent。 |
| 责任方 | 谁处理。 |
| 恢复条件 | 何时可以恢复。 |
| 当前状态 | 已暂停、处理中、已恢复。 |

当前不写数据库字段或实现。

## 12. 平台工作区表达范围

| 工作区区域 | Phase 9 表达 |
|---|---|
| 运营状态条 | 案件、资金池、规则、合约、Agent、异常的核心状态。 |
| 异常队列 | 可筛选的异常卡点。 |
| 资金池面板 | 可用、不足、暂停、冻结、失败。 |
| 规则面板 | Active、Paused、Expired、Conflicting。 |
| 合约执行面板 | Allowed、Waiting、Blocked、Failed、Completed。 |
| Agent 自动化面板 | Running、Stopped、Failed、Backlog、Manual takeover。 |
| 暂停/恢复面板 | 暂停对象、原因、影响、恢复条件。 |
| 处理记录 | 平台处理动作和结果。 |

注意：这仍然是业务范围定义，不写 UI。

## 13. 平台 Agent 范围

平台 Agent 作为运营助理，不是超级管理员。

| 能力 | 允许 | 禁止 |
|---|---|---|
| 异常汇总 | 允许。 | 不删除异常。 |
| 资金池影响解释 | 允许。 | 不伪造资金池状态。 |
| 规则阻断解释 | 允许。 | 不绕过规则。 |
| 暂停影响分析 | 允许。 | 不绕过暂停。 |
| Agent 自动化失败汇总 | 允许。 | 不直接高风险重启。 |
| 人工分派建议 | 允许。 | 不替业务角色审批。 |

## 14. 业务动作范围

Phase 9 包含以下业务动作。

| 业务动作 | 触发方 | 业务结果 |
|---|---|---|
| View platform operation overview | 平台方 | 查看运行总览。 |
| View exception queue | 平台方 | 查看异常列表和责任方。 |
| View capital pool state | 平台方 | 查看资金池状态和影响。 |
| View rule state | 平台方 | 查看规则状态和阻断原因。 |
| View execution failures | 平台方 | 查看执行失败和处理路径。 |
| View Agent automation state | 平台方 | 查看 Agent 自动化状态。 |
| Pause object | 平台方 | 暂停案件、资金池、规则、执行能力、账户或 Agent 自动化。 |
| Restore object | 平台方 | 恢复暂停对象。 |
| Assign exception owner | 平台方 | 分派责任方。 |
| Record operation handling | 平台方 | 记录处理动作和结果。 |
| Block platform overreach | 系统 | 阻断平台伪造事实或替审批。 |

当前不写 endpoint、后台实现、权限中间件或 UI 组件。

## 15. 概念数据对象映射

| 概念对象 | Phase 9 用途 |
|---|---|
| Platform Operation State | 平台运行总览。 |
| Exception Case | 异常队列。 |
| Capital Pool State | 资金池运营状态。 |
| Rule State | 规则运营状态。 |
| Contract Execution State | 执行状态和失败。 |
| Platform Pause State | 暂停和恢复。 |
| Agent Automation State | Agent 自动化运行状态。 |
| Operation Handling Record | 运营处理记录。 |
| Audit Record | 平台动作和越权阻断留痕。 |

当前不写字段、表结构、索引、告警事件或监控指标。

## 16. 接口候选映射

| 接口候选 | Phase 9 用途 |
|---|---|
| 查看平台运行总览 | 获取平台运营投影。 |
| 查看异常队列 | 获取异常和责任方。 |
| 查看资金池状态 | 获取资金池业务影响。 |
| 查看规则状态 | 获取规则业务影响。 |
| 查看合约执行状态 | 获取执行卡点和结果。 |
| 查看 Agent 自动化状态 | 获取 Agent 失败、堆积、停止和接管状态。 |
| 暂停对象 | 标记暂停对象和影响范围。 |
| 恢复对象 | 标记恢复条件满足。 |
| 分派异常责任方 | 指定处理人或角色。 |
| 记录平台处理 | 留痕处理结果。 |

当前不写 endpoint、请求响应、错误码、鉴权 header 或后台代码。

## 17. 审计和留痕范围

Phase 9 应保留以下业务留痕要求。

| 留痕事件 | 原因 |
|---|---|
| 平台查看异常 | 证明运营访问。 |
| 资金池状态变化 | 证明执行条件变化来源。 |
| 规则状态变化 | 证明规则影响来源。 |
| 暂停对象 | 证明为什么暂停。 |
| 恢复对象 | 证明为什么恢复。 |
| 分派异常责任方 | 证明谁负责处理。 |
| 处理异常 | 证明处理路径。 |
| Agent 自动化接管 | 证明人机边界。 |
| 平台越权阻断 | 证明平台不能伪造事实或替审批。 |

当前不写日志表、监控系统或审计存储实现。

## 18. Phase 9 验收场景

| 场景 | 前提 | 期望结果 |
|---|---|---|
| 平台查看运行总览 | 平台角色 Active。 | 能看到案件、资金池、规则、合约、Agent 和异常总览。 |
| 平台查看资金池不足 | 存在 Pool insufficient。 | 看到影响案件、责任方和下一步。 |
| 平台查看规则阻断 | 存在 Rule blocked。 | 看到规则原因和处理路径。 |
| 平台暂停资金池 | 资金池异常。 | 相关案件执行进入 Platform paused / Pool insufficient。 |
| 平台恢复资金池 | 恢复条件满足。 | 相关案件可重新进入执行检查。 |
| 平台查看 Agent 自动化失败 | Agent failed。 | 看到失败原因和接管入口。 |
| 平台处理执行失败 | Execution failed。 | 记录原因、责任方和下一步。 |
| 平台尝试替资金方批准 | 平台越权。 | 阻断。 |
| 平台尝试修改质检结论 | 平台非事实来源。 | 阻断。 |
| 平台删除关键审计记录 | 关键记录不可删除。 | 阻断。 |

## 19. Phase 9 通过标准

| 检查项 | 通过标准 |
|---|---|
| 运行总览 | 平台能看到 P0 必要运营状态。 |
| 异常队列 | 异常有原因、责任方、影响、恢复条件和下一步。 |
| 资金池状态 | 可用、不足、暂停、冻结、失败可表达。 |
| 规则状态 | Active、Paused、Expired、Conflicting 可表达。 |
| 合约执行状态 | Allowed、Waiting、Blocked、Failed、Completed 可表达。 |
| Agent 自动化 | Running、Stopped、Failed、Backlog、Manual takeover 可表达。 |
| 暂停/恢复 | 暂停对象、原因、影响范围、恢复条件可表达。 |
| 平台边界 | 平台不能替资金方审批、不能伪造事实、不能删除关键记录。 |
| 后置边界 | 未进入完整后台、BI、监控、告警、DevOps 或合约实现。 |

## 20. 一票否决项

出现以下任一项，Phase 9 不得通过：

| 一票否决项 | 原因 |
|---|---|
| 平台可以替资金方批准融资 | 平台越界。 |
| 平台可以修改质检 Pass/Fail/Dispute | 事实来源失败。 |
| 平台可以伪造出口商材料 | 事实可信失败。 |
| 平台暂停无原因、无影响范围、无恢复条件 | 运营不可审计。 |
| 资金池不足被隐藏或改写成融资拒绝 | 业务语义错误。 |
| 规则阻断没有原因和下一步 | 业务不可处理。 |
| Execution failed 可被直接改为 Completed | 审计失败。 |
| Agent 自动化失败无接管路径 | Agent Native 运营失败。 |
| 平台工作区变成逐单审批中心 | 产品定位失败。 |
| Phase 9 混入完整 BI、监控、告警、DevOps 或后台管理系统 | 阶段越界。 |

## 21. 实现中回流规则

| 发现问题 | 回流目标 |
|---|---|
| 新平台动作 | 54 / 63。 |
| 平台权限不清 | 53。 |
| 新运营状态 | 55 / 64。 |
| 新资金池或规则状态 | 56 / 65 / 76。 |
| Agent 自动化状态不足 | 57 / 66 / 77。 |
| 控制塔无法表达异常 | 58 / 78。 |
| 验收场景不足 | 68 / 80。 |
| 完整 BI/监控/告警混入 | 60 后置。 |
| 平台逐单审批需求出现 | 53 / 60，通常否决。 |

不得通过后台按钮临时绕过业务边界。

## 22. Phase 9 出口条件

Phase 9 完成后，系统应具备以下能力：

```text
1. 平台方可以看到 P0 运行总览。
2. 平台方可以看到异常队列和每个异常的责任方、影响、恢复条件和下一步。
3. 资金池、规则、合约执行、平台暂停和 Agent 自动化状态可表达。
4. 平台可以处理暂停/恢复、分派异常和记录处理结果。
5. 平台不能伪造事实，不能替资金方审批，不能删除关键审计记录。
6. 资金池不足、规则阻断、平台暂停、执行失败和 Agent 自动化失败都能形成可处理卡点。
7. 平台运营能力服务于 P0 融资闭环，而不是变成无限后台系统。
```

满足以上条件后，才允许进入：

> `80-p0-implementation-phase-10-p0-acceptance-flow-plan.md`

即细化 Phase 10：P0 Acceptance Flow，形成正常闭环、路径差异、权限隔离、异常处理和后置范围的最终验收流程。

## 23. 本步结论

Phase 9 的本质不是“做后台管理系统”。

它的本质是：

> 给 ChainTrace P0 提供最低限度的平台运营能力，让资金池、规则、合约执行、Agent 自动化、异常队列和暂停/恢复都能被平台方观察、解释、分派和留痕，同时严格阻止平台变成事实伪造者、资金方审批者或无限扩张的后台。

只有 Platform Operation Basics 成立，P0 Acceptance Flow 才能完整验收正常闭环、异常卡点、路径差异和运营可处理性。
