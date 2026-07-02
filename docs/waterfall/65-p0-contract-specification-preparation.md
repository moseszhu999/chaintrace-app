# 65 P0 合约规格准备

## 1. 定位

本文件定义 ChainTrace P0 规格准备阶段中的合约规格准备边界。

它不是 Solidity 代码，不是 ABI，不是函数签名，不是 event 设计，不是 storage 结构，不是部署网络选择，不是链上地址配置，也不是合约测试脚本。

它的作用是：

> 从 `56-p0-smart-contract-business-design.md` 已定义的合约业务角色出发，建立“业务执行条件 / 业务输出 → 合约规格候选”的准备框架，明确后续合约规格应覆盖哪些业务能力、必须保留哪些业务边界、哪些内容仍然不能进入实现。

本文件只做合约规格准备，不写合约实现。

## 2. 输入来源

| 来源文档 | 继承内容 |
|---|---|
| 53-p0-permission-design-boundary | 合约必须尊重角色权限和 Agent 权限继承。 |
| 54-p0-business-action-interface-boundary | 合约相关动作来自业务动作边界。 |
| 55-p0-data-information-domain-design | 合约只使用业务状态和执行条件，不生成事实。 |
| 56-p0-smart-contract-business-design | 合约规格准备的直接输入。 |
| 57-p0-agent-business-design | Agent 不能绕过合约，合约不替 Agent 解释材料。 |
| 58-p0-control-tower-expression-design | 合约输出必须能转成业务语言。 |
| 59-p0-business-acceptance-design | 合约规格必须支持业务验收场景。 |
| 60-p0-design-feedback-and-deferred-scope | 合约越界、P1/P2 和实现细节必须回流或后置。 |
| 63-p0-interface-specification-preparation | 合约相关接口候选的业务边界。 |
| 64-p0-data-model-preparation | 合约相关概念对象和关系语义。 |

## 3. 合约规格准备原则

| 原则 | 说明 |
|---|---|
| 从业务输出派生 | 不凭空设计合约功能，只从 56 的执行条件和业务输出派生。 |
| 合约是约束层 | 只做规则和资金执行约束，不做贸易事实判断。 |
| 不替资金方审批 | 银行辅助路径下，资金方决策不可被合约替代。 |
| 不替事实方确认 | 质检、物流、买方、保险、通关事实不由合约生成。 |
| 输出业务可解释 | 合约结果必须能表达 Allowed、Waiting、Blocked、Failed、Completed 等业务语义。 |
| 尊重平台暂停 | 案件、资金池、规则、执行能力和 Agent 自动化暂停必须被尊重。 |
| 保留路径差异 | 银行辅助、纯 DeFi、低人工、人工升级必须仍可区分。 |
| 不写 Solidity | 当前不写代码、函数、事件、storage、ABI、部署。 |
| 缺口回流 | 新执行条件、新输出、新暂停对象必须回流 56/60。 |

## 4. 合约规格候选分组

| 分组 | 业务目的 | 当前阶段输出 |
|---|---|---|
| 执行条件检查规格候选 | 检查案件是否满足执行条件。 | 条件集合和业务输出候选。 |
| 资金池状态规格候选 | 表达资金池是否可用、足够、暂停或异常。 | 资金池状态语义。 |
| 规则状态规格候选 | 表达规则是否有效、暂停、过期、不适用。 | 规则状态语义。 |
| 平台暂停规格候选 | 表达案件、资金池、规则、执行能力等暂停边界。 | 暂停对象和恢复条件。 |
| 执行结果规格候选 | 表达等待、允许、阻断、失败、完成。 | 业务结果语义。 |
| 路径差异规格候选 | 支持银行辅助、纯 DeFi、低人工、人工升级。 | 路径条件差异。 |
| 审计与追踪规格候选 | 关键执行结果可追踪。 | 留痕要求。 |

## 5. 通用合约规格元信息

后续每个合约规格候选至少要描述以下业务元信息。

| 元信息 | 说明 |
|---|---|
| 业务能力名称 | 该合约规格候选承接哪个业务能力。 |
| 触发来源 | 资金方决策、DeFi 规则路径、Agent 请求、平台运营或系统状态。 |
| 触发前提 | 案件、授权、事实、规则、资金池、暂停等条件。 |
| 输入业务状态 | 业务上需要读取哪些状态，不写字段和 storage。 |
| 输出业务结果 | Allowed、Waiting、Rule blocked、Pool insufficient、Platform paused、Execution failed、Completed 等。 |
| 业务解释 | 输出如何被出口商、资金方、平台和 Agent 理解。 |
| 权限约束 | 哪些角色或 Agent 可以触发或查看结果。 |
| 暂停约束 | 哪些暂停状态必须阻断。 |
| 异常处理 | 失败或阻断时责任方和下一步。 |
| 后置实现项 | Solidity、ABI、函数签名、事件、storage、gas、部署全部后置。 |

## 6. 执行条件检查规格候选

| 条件 | 业务含义 | 不满足时业务输出 |
|---|---|---|
| 角色授权有效 | 触发方必须有权请求执行检查。 | Permission denied / Role mismatch。 |
| 案件状态可执行 | 案件必须进入执行检查阶段。 | Waiting / Rule blocked。 |
| 路径已明确 | 银行辅助或纯 DeFi 路径必须明确。 | Waiting / Need review。 |
| 关键事实存在 | 当前路径所需事实节点已满足最低要求。 | Need materials / Waiting。 |
| 质检状态可接受 | P0 至少明确 pass/fail/dispute/pending。 | Dispute / Rule blocked / Waiting。 |
| 资金方决策或 DeFi 规则满足 | 银行辅助路径需资金方批准；DeFi 路径需规则满足。 | Need review / Rule blocked。 |
| 资金池可用 | 资金池未暂停且资金条件满足。 | Pool insufficient / Platform paused。 |
| 规则有效 | 当前规则未暂停、未过期且适用于案件。 | Rule blocked。 |
| 平台未暂停 | 案件、资金池、规则、合约执行能力未暂停。 | Platform paused。 |
| 无未关闭阻断异常 | 重大 dispute、执行失败、冻结等已处理。 | Need review / Dispute / Rule blocked。 |

边界：

- 这里定义的是业务条件，不是 require 语句。
- 条件集合不等于链上 storage 结构。
- 条件读取来源后续再规格化，当前不定义链上/链下位置。

## 7. 业务输出到规格候选映射

| 业务输出 | 合约规格候选语义 | 控制塔表达 |
|---|---|---|
| Allowed | 当前满足执行条件。 | 可以进入资金执行。 |
| Not allowed | 当前不允许执行。 | 查看阻断原因和责任方。 |
| Waiting | 条件未满足但不是失败。 | 等待事实、资金方、规则或资金池状态。 |
| Need materials | 缺少材料或事实。 | 出口商或事实方补充。 |
| Need review | 自动流程不能继续，需要人工复核。 | 资金方、平台或责任方处理。 |
| Rule blocked | 当前规则不允许继续。 | 查看规则原因和处理路径。 |
| Pool insufficient | 资金池不足或不可用。 | 等待恢复、切换路径或人工处理。 |
| Platform paused | 平台暂停相关对象。 | 等待平台恢复或查看暂停原因。 |
| Dispute | 存在未解决争议。 | 进入人工争议处理。 |
| Execution failed | 执行动作失败。 | 平台或执行责任方处理。 |
| Completed | 执行完成。 | 更新资金结果和案件状态。 |

后续合约规格必须保留这些业务语义，不能压缩成单一 success / fail。

## 8. 资金池状态规格候选

| 资金池状态 | 业务含义 | 对执行的影响 |
|---|---|---|
| Available | 资金池可用。 | 可以继续符合条件的执行。 |
| Low balance | 资金不足。 | 输出 Pool insufficient 或 Waiting。 |
| Currency unsupported | 当前币种不支持。 | 阻断或要求切换路径。 |
| Paused | 平台暂停资金池。 | 输出 Platform paused。 |
| Frozen | 异常冻结。 | 输出 Platform paused / Need review。 |
| Execution backlog | 执行堆积。 | 输出 Waiting，并提醒平台和资金方。 |
| Failed execution | 执行失败。 | 输出 Execution failed。 |

边界：

- 资金池状态只影响执行，不判断案件真实性。
- 出口商不能直接改变资金池状态。
- 资金方批准不能绕过资金池不足。
- 平台暂停或恢复资金池必须留痕。

## 9. 规则状态规格候选

| 规则状态 | 业务含义 | 对执行的影响 |
|---|---|---|
| Active | 规则有效。 | 可用于执行条件检查。 |
| Paused | 规则被暂停。 | 输出 Rule blocked / Platform paused。 |
| Expired | 规则过期。 | 输出 Rule blocked。 |
| Pending upgrade | 规则待升级。 | 输出 Waiting / Need review。 |
| Not applicable | 规则不适用于该案件。 | 输出 Rule blocked 或要求人工处理。 |
| Conflicting | 规则冲突。 | 输出 Need review。 |

边界：

- 规则状态必须有业务适用范围。
- 规则阻断必须能解释原因。
- 规则升级不在本文件写实现。
- 规则不是事实来源。

## 10. 平台暂停规格候选

| 暂停对象 | 业务含义 | 合约规格候选影响 |
|---|---|---|
| Case pause | 单个案件暂停。 | 阻断该案件执行。 |
| Capital pool pause | 资金池暂停。 | 阻断相关资金执行。 |
| Rule pause | 规则暂停。 | 阻断适用该规则的案件。 |
| Contract execution pause | 执行能力暂停。 | 阻断所有相关执行。 |
| Account pause | 角色账户暂停。 | 阻断该账户相关动作。 |
| Agent automation pause | Agent 自动化暂停。 | Agent 不得自动推进。 |

暂停规格候选必须表达：

| 元信息 | 说明 |
|---|---|
| 暂停对象 | 暂停的是案件、资金池、规则、执行能力、账户还是 Agent 自动化。 |
| 暂停原因 | 风险、维护、资金异常、规则问题、执行失败等。 |
| 影响范围 | 影响哪些案件或路径。 |
| 恢复条件 | 什么条件满足后可恢复。 |
| 操作责任方 | 平台方或被授权运营方。 |
| 审计要求 | 暂停和恢复都必须留痕。 |

## 11. 银行辅助路径规格候选

银行辅助路径下，合约规格必须承认资金方决策是前置业务条件之一。

```text
资金方允许融资
→ 执行条件检查
→ 资金池 / 规则 / 暂停状态检查
→ Allowed / Waiting / Blocked / Failed / Completed
```

| 检查项 | 业务含义 | 不满足时输出 |
|---|---|---|
| Funding Decision = allowed | 资金方已批准。 | Need review / Waiting。 |
| Decision still valid | 决策未被撤回、过期或暂停。 | Rule blocked / Need review。 |
| Required facts still acceptable | 质检等事实未变成 fail/dispute 阻断。 | Dispute / Rule blocked。 |
| Capital pool available | 资金池可执行。 | Pool insufficient / Platform paused。 |
| Platform not paused | 平台未暂停。 | Platform paused。 |

一票否决：

```text
合约规格不得替资金方生成 allowed 决策。
```

## 12. 纯 DeFi 路径规格候选

纯 DeFi 路径下，合约规格必须表达事实条件、规则条件和资金池条件，而不是无条件自动放款。

```text
事实条件满足
→ DeFi 规则路径满足
→ 资金池可用
→ 平台未暂停
→ Allowed / Waiting / Blocked / Failed / Completed
```

| 检查项 | 业务含义 | 不满足时输出 |
|---|---|---|
| Required facts satisfied | 必要事实节点满足规则要求。 | Need materials / Waiting / Dispute。 |
| DeFi rule path active | 规则路径有效。 | Rule blocked。 |
| Risk not escalated | 未触发人工升级条件。 | Need review。 |
| Capital pool available | 资金池满足执行条件。 | Pool insufficient。 |
| Platform not paused | 平台未暂停执行。 | Platform paused。 |

一票否决：

```text
纯 DeFi 路径不得无视事实节点和风险升级条件。
```

## 13. 低人工路径规格候选

低人工路径下，合约规格是 Agent 自动推进的边界。

| 条件 | 业务含义 | 不满足时输出 |
|---|---|---|
| Agent authorized | 用户授权半自动或全自动。 | Permission denied / Need confirmation。 |
| Agent role permitted | Agent 所属角色有权触发。 | Role mismatch。 |
| Low risk | 案件未触发高风险条件。 | Need review。 |
| Facts complete | 必要事实完整。 | Need materials / Waiting。 |
| Rule clear | 规则无冲突。 | Rule blocked / Need review。 |
| No platform pause | 未暂停。 | Platform paused。 |

边界：

- Agent 自动推进必须以合约/规则检查为边界。
- 合约不能因为 Agent 请求而放松条件。
- 高风险或 dispute 必须输出 Need review / Dispute。

## 14. 人工升级路径规格候选

当出现以下情况，合约规格候选必须支持阻断或升级语义。

| 触发条件 | 合约输出 | 责任方 |
|---|---|---|
| 高金额或高风险 | Need review | 资金方。 |
| 质检 Fail | Rule blocked / Need review | 资金方、质检方。 |
| 质检 Dispute | Dispute / Need review | 质检方、出口商、资金方。 |
| 金额冲突 | Need materials / Need review | 出口商、资金方。 |
| 买方争议 | Dispute / Need review | 买方、资金方。 |
| 保险不足 | Need review | 保险方、资金方。 |
| 资金池不足 | Pool insufficient | 平台、资金方。 |
| 规则冲突 | Rule blocked / Need review | 平台。 |
| 平台暂停 | Platform paused | 平台。 |
| 执行失败 | Execution failed | 平台、执行责任方。 |

边界：

- 合约不裁决争议，只输出阻断或需要人工。
- 责任方和下一步由控制塔和 Agent 表达。

## 15. 合约规格候选与概念数据对象关系

| 概念对象 | 合约规格如何使用 | 合约不做什么 |
|---|---|---|
| Financing Case | 读取案件执行阶段和路径语义。 | 不创建融资案件。 |
| Trade Material Set | 只使用材料完整性状态。 | 不解析材料真假。 |
| Inspection Fact | 使用 pass/fail/dispute/pending 状态。 | 不生成质检结论。 |
| Funding Decision | 使用资金方 allowed/rejected/need review 等状态。 | 不替资金方审批。 |
| Agent Output | 可使用升级/缺口状态作为阻断提示。 | 不把 Agent 建议当事实。 |
| Capital Pool State | 使用资金池可用性和暂停状态。 | 不管理全部平台运营。 |
| Rule State | 使用规则有效性和适用性。 | 不生成业务事实。 |
| Platform Pause State | 使用暂停状态阻断执行。 | 不替平台判断所有异常。 |
| Exception Case | 使用未关闭阻断异常。 | 不裁决异常。 |
| Audit Record | 产生执行相关留痕。 | 不删除历史。 |

## 16. 合约规格候选与接口候选关系

| 接口候选组 | 合约规格关系 |
|---|---|
| 融资案件接口候选 | 案件进入执行检查阶段后调用合约相关能力。 |
| 资金方决策接口候选 | 资金方 allowed 后进入合约执行条件检查。 |
| Agent 辅助接口候选 | Agent 可在授权范围内请求检查，但不能绕过结果。 |
| 合约/规则执行接口候选 | 直接承接合约规格候选。 |
| 平台运营接口候选 | 暂停/恢复资金池、规则、执行能力影响合约输出。 |
| 控制塔查询接口候选 | 展示合约业务输出和卡点原因。 |
| 异常处理接口候选 | 合约输出 blocked/failed 后触发责任方处理。 |

## 17. 审计与追踪规格候选

合约规格后续必须支持以下业务留痕语义。

| 记录项 | 业务原因 |
|---|---|
| 执行条件检查请求 | 证明谁触发了检查。 |
| 检查结果 | 证明为什么允许、等待、阻断或失败。 |
| 资金池状态影响 | 证明资金池是否影响执行。 |
| 规则状态影响 | 证明规则是否影响执行。 |
| 暂停状态影响 | 证明平台暂停是否生效。 |
| 执行失败 | 证明失败原因和责任方。 |
| 执行完成 | 证明资金执行完成。 |

边界：

- 当前不定义 event。
- 当前不定义链上日志格式。
- 当前只定义业务留痕要求。

## 18. P0 必须准备的合约规格能力

| 能力 | 是否 P0 必须 | 原因 |
|---|---|---|
| 执行条件检查 | 必须 | 支撑资金执行边界。 |
| 资金池状态影响 | 必须 | 解释批准不等于到账。 |
| 规则状态影响 | 必须 | 支撑 DeFi 和规则阻断。 |
| 平台暂停影响 | 必须 | 支撑运营控制。 |
| 银行辅助路径执行检查 | 必须 | 资金方批准后仍需执行约束。 |
| 纯 DeFi 路径执行检查 | 必须 | 保留 Crypto Native 路径。 |
| Agent 自动推进边界 | 必须 | 防止 Agent 越权。 |
| 执行失败和完成输出 | 必须 | 支撑控制塔资金结果。 |
| 审计留痕语义 | 必须 | 支撑可信和验收。 |

## 19. P0 后置的合约规格能力

| 后置能力 | 后置阶段 | P0 处理方式 |
|---|---|---|
| 多资金池路由 | 后续资金市场 / 合约规格 | P0 保留单资金池或基础资金池语义。 |
| 多币种复杂兑换 | 后续资金执行设计 | P0 只表达币种支持/不支持。 |
| 多链执行 | 后续跨链设计 | P0 不做多链。 |
| 保险赔付自动触发 | P1/P2 保险成熟后 | P0 保留保险状态占位。 |
| 买方付款自动结算 | P1 买方路径成熟后 | P0 保留买方确认占位。 |
| 海关数据自动约束 | P2 通关接入后 | P0 保留通关事实占位。 |
| Proof/hash registry | 后续证明产品 | 不作为 P0 主线。 |

## 20. 不得进入的合约实现内容

| 禁止内容 | 后置阶段 |
|---|---|
| Solidity 代码 | 合约实现阶段。 |
| ABI | 合约规格细化或实现阶段。 |
| 函数名和函数签名 | 合约规格细化阶段。 |
| Event 设计 | 合约规格细化或实现阶段。 |
| Storage 结构 | 合约实现阶段。 |
| Modifier / require / revert | 合约实现阶段。 |
| 链上地址 | 部署阶段。 |
| 部署网络 | 部署阶段。 |
| Gas、nonce、transaction | 合约实现和部署阶段。 |
| 单元测试脚本 | 测试实现阶段。 |

## 21. 合约规格准备通过标准

| 检查项 | 通过标准 |
|---|---|
| 来源清楚 | 每个规格候选来自 56 的业务设计。 |
| 条件清楚 | 授权、事实、资金方/DeFi、规则、资金池、暂停状态清楚。 |
| 输出清楚 | Allowed、Waiting、Blocked、Failed、Completed 等业务输出清楚。 |
| 角色边界清楚 | 合约不替资金方、事实方、平台和 Agent。 |
| 路径差异清楚 | 银行辅助、纯 DeFi、低人工、人工升级都被支持。 |
| 控制塔可解释 | 输出能被 58 的控制塔表达。 |
| 验收可覆盖 | 能支撑 59 的验收场景。 |
| 后置清楚 | P1/P2、多链、多资金池、proof/hash 已后置。 |
| 实现细节后置 | 未出现 Solidity、ABI、函数、事件、storage 或部署。 |

## 22. 一票否决项

| 一票否决项 | 原因 |
|---|---|
| 合约规格把合约设计成贸易真实性判断者 | 破坏事实来源边界。 |
| 合约规格让合约替资金方审批银行辅助路径 | 破坏资金方责任。 |
| 合约规格让合约生成质检 pass/fail/dispute | 破坏事实方边界。 |
| 合约规格允许 Agent 绕过执行条件 | 破坏 Agent 边界。 |
| 合约规格允许绕过平台暂停 | 破坏平台运营边界。 |
| 合约输出只有技术 success/fail | 业务不可解释。 |
| 纯 DeFi 路径无事实和规则约束 | 风险边界失败。 |
| 直接写 Solidity、ABI、函数签名、event 或 storage | 阶段越界。 |
| P1/P2、多链、多资金池复杂能力被塞入 P0 必做 | MVP 范围失控。 |
| proof/hash registry 成为 P0 合约主线 | 破坏当前融资主线。 |

## 23. 回流规则

| 发现问题 | 处理方式 |
|---|---|
| 需要新增合约业务输出 | 回流 56。 |
| 需要新增业务动作 | 回流 54。 |
| 需要新增信息域或概念对象 | 回流 55 / 64。 |
| Agent 触发边界不清 | 回流 57。 |
| 控制塔无法解释合约输出 | 回流 58。 |
| 验收场景无法覆盖 | 回流 59。 |
| P1/P2 或实现细节混入 | 回流 60 并后置。 |
| 需要接口候选补充 | 回流 63。 |

## 24. 本步结论

P0 合约规格准备的本质不是“开始写智能合约”。

它的本质是：

> 从 P0 合约业务设计出发，准备后续合约规格必须承接的执行条件、资金池状态、规则状态、平台暂停、路径差异、执行结果和审计语义，同时继续保持合约不判断贸易真实性、不替资金方审批、不替事实方确认、不裁决重大争议。

下一步应进入：

> `66-p0-agent-implementation-preparation.md`

即从 `57-p0-agent-business-design.md` 出发，准备 Agent 实现边界，但仍先做业务能力到实现规格的映射，不直接写模型选择、提示词、工具调用、memory 或自动化代码。
