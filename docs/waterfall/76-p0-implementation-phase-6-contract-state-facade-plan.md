# 76 P0 实现阶段 6：Contract State Facade 计划

## 1. 定位

本文件定义 ChainTrace P0 受控实现阶段的第六个阶段：Contract State Facade。

它不是 Solidity 合约实现，不是 ABI 设计，不是函数签名，不是 event/storage 结构，不是部署网络选择，不是交易签名流程，不是 gas/nonce 方案，也不是链上测试脚本。

它的作用是：

> 在 Phase 5 资金方审查路径成立之后，细化 Phase 6 的合约/规则/资金池/平台暂停状态的业务表达层，让系统能够用业务语言解释“为什么批准以后还不能执行”“为什么 DeFi 路径可以或不可以继续”“资金池/规则/暂停状态如何影响资金结果”。

本阶段的核心目标不是“写智能合约”，而是：

```text
资金方决策或 DeFi 规则路径
→ 执行条件检查
→ 规则状态
→ 资金池状态
→ 平台暂停状态
→ 执行结果业务表达
→ 资金结果或卡点说明
```

## 2. 本阶段继承的上游边界

| 上游文档 | 本阶段继承内容 |
|---|---|
| 53-p0-permission-design-boundary | 合约/规则输出不扩大角色权限，平台暂停必须生效。 |
| 54-p0-business-action-interface-boundary | 请求执行条件检查、查询资金池状态、规则状态、平台暂停影响、输出执行结果。 |
| 55-p0-data-information-domain-design | 合约业务输出信息域、资金池状态、规则状态、执行结果。 |
| 56-p0-smart-contract-business-design | 合约是业务规则和资金执行约束层，不判断贸易真实性。 |
| 57-p0-agent-business-design | Agent 不得绕过合约/规则/资金池/暂停状态。 |
| 58-p0-control-tower-expression-design | 合约输出必须转成出口商、资金方、平台、Agent 都能理解的业务语言。 |
| 59-p0-business-acceptance-design | 合约输出、资金池不足、规则阻断、平台暂停、执行失败验收。 |
| 63-p0-interface-specification-preparation | 合约/规则执行接口候选。 |
| 64-p0-data-model-preparation | Contract Execution State、Capital Pool State、Rule State、Pause State 概念对象。 |
| 65-p0-contract-specification-preparation | 合约规格候选、执行条件、业务输出、路径差异。 |
| 66-p0-agent-implementation-preparation | Agent 可请求检查和解释结果，但不能绕过结果。 |
| 67-p0-prototype-implementation-scope | 合约/规则状态原型表达。 |
| 68-p0-test-plan-preparation | 合约业务输出、纯 DeFi、低人工、平台暂停测试候选。 |
| 70-p0-controlled-implementation-plan | Phase 6 的阶段目标和门禁。 |
| 75-p0-implementation-phase-5-funding-review-path-plan | Funding Decision 是 Phase 6 执行检查前置之一。 |

## 3. Phase 6 阶段目标

Phase 6 必须让系统具备以下基础能力：

| 目标 | 说明 |
|---|---|
| 执行条件可表达 | 授权、案件状态、事实、资金方/DeFi、规则、资金池、暂停状态能形成检查结果。 |
| 合约/规则输出可解释 | Allowed、Waiting、Need materials、Need review、Rule blocked 等必须有业务含义。 |
| 资金池状态可表达 | 可用、不足、暂停、冻结、执行失败等状态影响资金结果。 |
| 规则状态可表达 | Active、Paused、Expired、Not applicable、Conflicting 等影响执行。 |
| 平台暂停可表达 | 案件、资金池、规则、执行能力、账户、Agent 自动化暂停必须被尊重。 |
| 银行辅助路径可承接 | 资金方允许后仍需执行条件检查。 |
| 纯 DeFi 路径可承接 | 没有银行审批，但必须满足事实、规则、资金池、暂停条件。 |
| 执行失败可处理 | 失败必须有原因、责任方、下一步。 |
| 资金结果可更新 | Completed 才能表达执行完成，其他状态都必须表达卡点。 |

## 4. 本阶段非目标

Phase 6 明确不做以下内容：

| 非目标 | 后置阶段 |
|---|---|
| Solidity 代码 | 合约实现阶段。 |
| ABI / 函数签名 / event / storage | 合约详细实现阶段。 |
| 链上部署网络和地址 | 部署阶段。 |
| 真实钱包交易签名 | 钱包/链上执行阶段。 |
| 多链或跨链执行 | 后续跨链设计。 |
| 多资金池复杂路由 | 后续资金市场/合约扩展。 |
| 多币种复杂兑换 | 后续资金执行能力。 |
| 真实银行放款集成 | 后续外部系统集成。 |
| 保险赔付自动触发 | P1/P2 保险能力后。 |
| 买方付款自动结算 | P1 买方路径后。 |
| hash/proof registry 主线 | 后续证明产品。 |

## 5. Contract State Facade 的业务定位

Phase 6 的 Contract State Facade 是一个业务表达层。

它负责表达：

```text
当前案件是否满足执行条件；
如果不能执行，是缺材料、缺事实、资金方未决、规则阻断、资金池不足、平台暂停，还是执行失败；
如果可以执行，是否已完成；
如果没有完成，谁需要处理下一步。
```

它不负责：

- 判断贸易真实性。
- 生成质检结论。
- 替资金方审批。
- 裁决 Dispute。
- 伪造资金池状态。
- 绕过平台暂停。

## 6. 执行条件检查范围

Phase 6 应表达以下执行条件。

| 条件 | 业务含义 | 不满足时输出 |
|---|---|---|
| Role authorized | 触发方有权请求执行检查。 | Permission denied / Role mismatch。 |
| Case executable | 案件已到可执行检查阶段。 | Waiting / Need review。 |
| Path selected | 银行辅助或 DeFi 路径明确。 | Waiting / Need review。 |
| Required materials complete | 材料满足最低要求。 | Need materials。 |
| Inspection acceptable | 质检状态满足当前路径要求。 | Waiting / Dispute / Rule blocked / Need review。 |
| Funding decision or DeFi rule satisfied | 银行路径有资金方允许，DeFi 路径规则满足。 | Need review / Rule blocked。 |
| Capital pool available | 资金池可用且满足执行条件。 | Pool insufficient / Platform paused。 |
| Rule active and applicable | 规则有效且适用于该案件。 | Rule blocked。 |
| Platform not paused | 案件、资金池、规则、执行能力未暂停。 | Platform paused。 |
| No blocking exception | 无未关闭重大异常。 | Dispute / Need review / Rule blocked。 |

当前只定义业务检查语义，不写 require、modifier、revert 或链上状态。

## 7. 合约/规则业务输出范围

| 输出 | 业务含义 | 控制塔表达 |
|---|---|---|
| Allowed | 当前满足执行条件。 | 可以进入资金执行或标记为可执行。 |
| Not allowed | 当前不允许执行。 | 查看阻断原因。 |
| Waiting | 条件尚未满足，但不是失败。 | 等待材料、事实、资金方、规则或资金池。 |
| Need materials | 缺材料或事实。 | 责任方补充。 |
| Need review | 需要人工复核。 | 资金方、平台或责任方处理。 |
| Rule blocked | 当前规则不允许继续。 | 查看规则原因和平台处理路径。 |
| Pool insufficient | 资金池不足或不可用。 | 等待恢复、切换路径或人工处理。 |
| Platform paused | 平台暂停了相关对象。 | 等待平台恢复并查看暂停原因。 |
| Dispute | 存在未解决争议。 | 进入人工争议处理。 |
| Execution failed | 执行动作失败。 | 平台或执行责任方处理。 |
| Completed | 执行完成。 | 更新资金结果。 |

一票否决：

```text
输出不得压缩成只有 success / fail。
```

## 8. 资金池状态范围

| 资金池状态 | 业务含义 | 对资金结果影响 |
|---|---|---|
| Available | 资金池可用。 | 满足其他条件时可执行。 |
| Low balance | 余额不足。 | Pool insufficient。 |
| Currency unsupported | 当前币种不支持。 | Rule blocked / Need review。 |
| Paused | 平台暂停资金池。 | Platform paused。 |
| Frozen | 异常冻结。 | Platform paused / Need review。 |
| Execution backlog | 执行堆积。 | Waiting。 |
| Failed execution | 执行失败。 | Execution failed。 |

边界：

- 资金方批准不能绕过资金池不足。
- Agent 不能绕过资金池状态。
- 平台暂停资金池必须影响执行结果。
- 资金池不足不是贸易欺诈。

## 9. 规则状态范围

| 规则状态 | 业务含义 | 对执行影响 |
|---|---|---|
| Active | 规则有效。 | 可用于执行检查。 |
| Paused | 规则暂停。 | Rule blocked / Platform paused。 |
| Expired | 规则过期。 | Rule blocked。 |
| Pending upgrade | 规则待升级。 | Waiting / Need review。 |
| Not applicable | 规则不适用该案件。 | Rule blocked / Need review。 |
| Conflicting | 规则冲突。 | Need review。 |

边界：

- 规则状态不是事实来源。
- 规则阻断必须可解释。
- 规则升级不在本阶段实现。

## 10. 平台暂停状态范围

| 暂停对象 | 业务含义 | Phase 6 影响 |
|---|---|---|
| Case pause | 单个案件暂停。 | 阻断该案件执行。 |
| Capital pool pause | 资金池暂停。 | 阻断相关资金执行。 |
| Rule pause | 规则暂停。 | 阻断适用规则。 |
| Contract execution pause | 执行能力暂停。 | 阻断执行能力。 |
| Account pause | 账户暂停。 | 阻断相关动作。 |
| Agent automation pause | Agent 自动化暂停。 | Agent 不得自动推进。 |

暂停状态必须表达：

| 表达项 | 说明 |
|---|---|
| 暂停对象 | 案件、资金池、规则、执行能力、账户或 Agent。 |
| 暂停原因 | 风险、维护、资金异常、规则问题、执行失败等。 |
| 影响范围 | 影响哪些案件、角色或路径。 |
| 恢复条件 | 什么条件满足后可恢复。 |
| 当前责任方 | 平台或相关运营责任方。 |

## 11. 银行辅助路径承接

银行辅助路径下，Phase 6 必须表达：

```text
资金方允许融资
→ 执行条件检查
→ 规则 / 资金池 / 暂停状态检查
→ Allowed / Waiting / Blocked / Failed / Completed
```

| 场景 | 期望输出 |
|---|---|
| 资金方已允许，材料和质检满足，资金池可用，规则有效 | Allowed / Completed。 |
| 资金方未决 | Waiting / Need review。 |
| 资金方拒绝 | 不进入执行，显示 Rejected。 |
| 资金方允许但资金池不足 | Pool insufficient。 |
| 资金方允许但规则暂停 | Rule blocked / Platform paused。 |
| 资金方允许但平台暂停案件 | Platform paused。 |
| 资金方允许但执行失败 | Execution failed。 |

关键边界：

```text
资金方允许不是资金到账；必须经过执行条件检查。
```

## 12. 纯 DeFi 路径承接

纯 DeFi 路径下，Phase 6 必须表达：

```text
事实条件满足
→ DeFi 规则路径满足
→ 资金池可用
→ 平台未暂停
→ Allowed / Waiting / Blocked / Failed / Completed
```

| 场景 | 期望输出 |
|---|---|
| 事实完整、规则有效、资金池可用、平台未暂停 | Allowed / Completed。 |
| 材料缺口 | Need materials。 |
| 质检 Dispute | Dispute / Need review。 |
| 规则不适用 | Rule blocked / Need review。 |
| 资金池不足 | Pool insufficient。 |
| 平台暂停 | Platform paused。 |
| 高风险触发人工 | Need review。 |

一票否决：

```text
纯 DeFi 路径不得无视材料、事实、规则和资金池状态自动完成。
```

## 13. 低人工路径和 Agent 边界

Phase 6 为 Phase 7 Agent 自动推进提供执行边界。

| Agent 触发场景 | Phase 6 应如何处理 |
|---|---|
| Agent 请求执行检查 | 检查所属角色授权和案件状态。 |
| Agent 请求低风险推进 | 必须检查事实、规则、资金池、暂停状态。 |
| Agent 遇到 Rule blocked | 停止推进并生成解释。 |
| Agent 遇到 Pool insufficient | 停止推进并生成待办或升级。 |
| Agent 遇到 Platform paused | 停止自动化。 |
| Agent 遇到 Dispute | 升级人工。 |

边界：

- Agent 请求不能放松执行条件。
- Agent 不能绕过 Rule blocked。
- Agent 不能绕过 Platform paused。
- Agent 不能把 Execution failed 解释成 Completed。

## 14. 执行失败处理范围

| 失败类型 | 业务解释 | 责任方 |
|---|---|---|
| Rule check failed | 规则不允许或规则状态异常。 | 平台。 |
| Pool check failed | 资金池不足、暂停或冻结。 | 平台 / 资金方。 |
| Pause check failed | 案件、账户、规则或执行能力被暂停。 | 平台。 |
| Condition mismatch | 材料、质检、资金方决策或路径条件不满足。 | 对应责任方。 |
| Execution failed | 执行动作失败。 | 平台 / 执行责任方。 |
| Unknown execution issue | 原因不明确。 | 平台人工处理。 |

执行失败必须包含：

| 表达项 | 说明 |
|---|---|
| 失败原因 | 为什么失败。 |
| 影响范围 | 影响到账、执行、审查还是自动化。 |
| 责任方 | 谁处理。 |
| 下一步 | 等待、补充、人工复核、恢复或关闭。 |

## 15. 控制塔表达范围

Phase 6 需要增强控制塔中的执行检查节点。

| 控制塔节点 | Phase 6 表达 |
|---|---|
| Financing intent | 已创建。 |
| Materials | 完整 / 缺口 / 冲突。 |
| Inspection fact | Pass / Fail / Dispute。 |
| Funding review | Allowed / Rejected / Need materials / Manual review。 |
| Contract / rule check | Allowed / Waiting / Rule blocked / Pool insufficient / Platform paused / Execution failed / Completed。 |
| Funding result | Completed 才显示执行完成；其他状态显示卡点和下一步。 |

控制塔必须回答：

```text
现在能不能执行；不能执行的原因是什么；谁负责；下一步是什么；资金是否真的完成。
```

## 16. 出口商可见表达

| Phase 6 状态 | 出口商应看到 |
|---|---|
| Allowed | 当前满足执行条件，等待执行或已进入执行。 |
| Waiting | 等待某个条件满足。 |
| Need materials | 还缺材料或事实。 |
| Need review | 需要人工复核。 |
| Rule blocked | 规则阻断，不能继续。 |
| Pool insufficient | 资金池不足或不可用。 |
| Platform paused | 平台暂停相关对象。 |
| Execution failed | 执行失败，需要平台处理。 |
| Completed | 资金执行完成。 |

禁止：

- 把 Rule blocked 显示成欺诈。
- 把 Pool insufficient 显示成拒绝。
- 把 Allowed 显示成已到账。
- 把 Execution failed 显示成 Completed。

## 17. 平台可见表达

平台在 Phase 6 应看到系统级执行状态。

| 平台视角 | Phase 6 表达 |
|---|---|
| 资金池状态 | 可用、不足、暂停、冻结、执行失败。 |
| 规则状态 | 有效、暂停、过期、冲突、不适用。 |
| 执行能力状态 | 正常、暂停、失败、堆积。 |
| 被阻断案件 | 阻断原因、影响范围、责任方。 |
| 失败案件 | 失败类型、下一步、处理责任。 |
| 暂停影响 | 暂停对象影响哪些案件。 |

平台可处理系统级状态，但不能伪造事实或替资金方审批。

## 18. 业务动作范围

Phase 6 包含以下业务动作。

| 业务动作 | 触发方 | 业务结果 |
|---|---|---|
| Request execution condition check | 资金方 / DeFi 路径 / Agent 占位 / 系统 | 输出 Allowed / Waiting / Blocked / Failed 等。 |
| View contract execution state | 案件相关角色 | 查看执行状态和业务解释。 |
| View capital pool state | 平台 / 相关资金方 / 出口商业务影响视图 | 查看资金池是否影响执行。 |
| View rule state | 平台 / 案件相关角色业务影响视图 | 查看规则是否影响执行。 |
| View platform pause impact | 案件相关角色 | 查看暂停原因和影响。 |
| Mark execution completed | 系统 / 合约状态占位 | 资金执行完成。 |
| Mark execution failed | 系统 / 平台 | 执行失败并生成处理路径。 |
| Block execution due to state | 系统 | 由于规则、资金池、暂停或争议阻断。 |

当前不写 endpoint、HTTP 方法、JSON、Solidity 或交易逻辑。

## 19. 概念数据对象映射

| 概念对象 | Phase 6 用途 |
|---|---|
| Financing Case | 执行检查对象。 |
| Funding Decision | 银行辅助路径的前置条件。 |
| Inspection Fact | 事实条件之一。 |
| Material Completeness State | 材料条件之一。 |
| Contract Execution State | 执行检查和结果状态。 |
| Execution Condition Set | 条件集合语义。 |
| Capital Pool State | 资金池可用性。 |
| Rule State | 规则有效性。 |
| Platform Pause State | 暂停状态。 |
| Exception Case | 阻断、失败、争议、暂停形成卡点。 |
| Agent Task | 阻断或失败后生成待办/升级。 |
| Audit Record | 执行检查、结果、阻断和失败留痕。 |

当前不写字段、表结构、链上 storage 或事件结构。

## 20. 接口候选映射

| 接口候选 | Phase 6 用途 |
|---|---|
| 请求执行条件检查 | 得到业务输出。 |
| 查询资金池业务状态 | 判断是否 Pool insufficient / Paused。 |
| 查询规则状态 | 判断是否 Rule blocked / Need review。 |
| 查询平台暂停影响 | 判断是否 Platform paused。 |
| 输出执行结果 | 表达 Completed / Execution failed。 |
| 查询控制塔执行状态 | 角色查看可解释状态。 |
| 异常处理候选 | 阻断或失败后生成责任方和下一步。 |

当前不写 endpoint、请求响应、错误码、ABI 或交易调用。

## 21. 审计和留痕范围

Phase 6 应保留以下业务留痕要求。

| 留痕事件 | 原因 |
|---|---|
| 执行条件检查请求 | 证明谁触发了检查。 |
| 执行条件检查结果 | 证明为什么允许、等待、阻断或失败。 |
| 资金池状态影响 | 证明资金池对执行的影响。 |
| 规则状态影响 | 证明规则对执行的影响。 |
| 平台暂停影响 | 证明暂停状态生效。 |
| 执行失败 | 证明失败原因和责任方。 |
| 执行完成 | 证明资金执行结果。 |
| Agent 停止推进 | 证明 Agent 没有绕过阻断。 |

当前不写链上 event、日志表或交易记录格式。

## 22. Phase 6 验收场景

| 场景 | 前提 | 期望结果 |
|---|---|---|
| 资金方允许且条件满足 | 材料完整、质检 Pass、规则有效、资金池可用。 | Allowed / Completed。 |
| 资金方允许但资金池不足 | Pool Low balance。 | Pool insufficient，出口商看到等待或处理路径。 |
| 资金方允许但规则暂停 | Rule Paused。 | Rule blocked / Platform paused。 |
| 资金方允许但平台暂停案件 | Case pause。 | Platform paused。 |
| 质检 Dispute | Dispute 未解决。 | Dispute / Need review。 |
| 材料缺口 | 材料未完整。 | Need materials。 |
| 纯 DeFi 条件满足 | 事实、规则、资金池、平台状态满足。 | Allowed / Completed。 |
| 纯 DeFi 规则不适用 | Rule not applicable。 | Rule blocked / Need review。 |
| Agent 请求低风险推进但平台暂停 | Agent authorized，但暂停存在。 | Agent 停止，输出 Platform paused。 |
| 执行失败 | 执行状态失败。 | Execution failed，责任方和下一步可见。 |
| Completed | 执行完成。 | 出口商资金结果更新为完成。 |

## 23. Phase 6 通过标准

| 检查项 | 通过标准 |
|---|---|
| 执行条件 | 授权、案件、材料、事实、资金方/DeFi、规则、资金池、暂停状态可表达。 |
| 输出语义 | Allowed、Waiting、Need materials、Need review、Rule blocked、Pool insufficient、Platform paused、Execution failed、Completed 可解释。 |
| 银行辅助 | 资金方允许后仍需执行检查。 |
| 纯 DeFi | 无银行审批但事实、规则、资金池、暂停条件成立。 |
| Agent 边界 | Agent 不能绕过阻断或暂停。 |
| 平台暂停 | 暂停对象影响执行。 |
| 资金结果 | Completed 才是完成，Allowed 不等于到账。 |
| 异常处理 | 阻断和失败有原因、责任方、下一步。 |
| 后置边界 | 未进入 Solidity、ABI、部署、多链、多资金池、真实交易。 |

## 24. 一票否决项

出现以下任一项，Phase 6 不得通过：

| 一票否决项 | 原因 |
|---|---|
| 合约/规则状态被表达成贸易真实性判断 | 合约越界。 |
| 合约替资金方审批 | 资金方责任失败。 |
| 合约生成质检结论 | 事实来源失败。 |
| Agent 绕过 Rule blocked | Agent 越界。 |
| Agent 绕过 Platform paused | 平台控制失败。 |
| 纯 DeFi 无事实和规则约束 | 风险边界失败。 |
| 资金方允许被表达成已到账 | 资金结果误导。 |
| Pool insufficient 被表达成融资拒绝 | 业务语义错误。 |
| 输出只有 success/fail | 控制塔不可解释。 |
| Phase 6 混入 Solidity、ABI、部署、交易签名或多链实现 | 阶段越界。 |
| proof/hash registry 成为合约主线 | 产品定位倒退。 |

## 25. 实现中回流规则

| 发现问题 | 回流目标 |
|---|---|
| 需要新增合约业务输出 | 56 / 65。 |
| 需要新增执行条件 | 56 / 65 / 64。 |
| 资金池状态不足 | 55 / 64 / 65。 |
| 规则状态不足 | 56 / 65。 |
| 暂停对象不足 | 53 / 56 / 65。 |
| Agent 自动推进边界不清 | 57 / 66。 |
| 控制塔无法解释输出 | 58 / 67。 |
| 验收场景不足 | 59 / 68。 |
| 真实链上实现需求混入 | 60 后置或另开合约实现阶段。 |
| 多链、多资金池、proof/hash 混入 | 60 后置。 |

不得通过临时代码绕过执行条件。

## 26. Phase 6 出口条件

Phase 6 完成后，系统应具备以下能力：

```text
1. 系统可以表达案件是否满足执行条件。
2. 资金方允许后仍需规则、资金池、暂停和异常检查。
3. 纯 DeFi 路径可以表达，但必须受事实、规则、资金池和平台暂停约束。
4. 合约/规则输出可以用业务语言解释。
5. 资金池不足、规则阻断、平台暂停、执行失败都能形成可处理卡点。
6. Agent 无法绕过合约/规则/资金池/平台暂停状态。
7. Completed 才表达资金执行完成；Allowed 不等于到账。
8. 执行检查、阻断、失败和完成具备留痕语义。
```

满足以上条件后，才允许进入：

> `77-p0-implementation-phase-7-agent-assist-layer-plan.md`

即细化 Phase 7：Agent Assist Layer，开始定义摘要、待办、状态解释、低风险推进和人工升级的受控实现范围。

## 27. 本步结论

Phase 6 的本质不是“写智能合约”。

它的本质是：

> 在资金方决策和 DeFi 路径之后，建立合约/规则/资金池/平台暂停的业务表达层，让 ChainTrace 能清楚说明资金执行为什么允许、等待、阻断、失败或完成，同时防止合约越界成事实判断者、资金方审批者或争议裁决者。

只有 Contract State Facade 成立，后续 Agent 才能在低风险场景中安全推进，并在规则阻断、资金池不足、平台暂停或执行失败时正确停止和升级。
