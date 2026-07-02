# 64 P0 数据模型准备

## 1. 定位

本文件定义 ChainTrace P0 规格准备阶段中的数据模型准备边界。

它不是数据库设计，不是表结构，不是字段清单，不是主键/外键设计，不是索引设计，不是 ORM/entity/schema，不是迁移脚本，也不是链上/链下存储实现。

它的作用是：

> 从 `55-p0-data-information-domain-design.md` 已定义的信息域、事实来源、记录责任和可见范围出发，建立“信息域 → 概念数据对象”的准备框架，为后续数据模型规格提供业务边界。

本文件只做数据模型准备，不写数据库实现。

## 2. 输入来源

| 来源文档 | 继承内容 |
|---|---|
| 52-p0-business-input-to-design-domain-map | 数据模型必须追溯到业务输入。 |
| 53-p0-permission-design-boundary | 数据可见和可操作范围必须继承权限边界。 |
| 54-p0-business-action-interface-boundary | 数据对象必须支撑 P0 业务动作。 |
| 55-p0-data-information-domain-design | 数据模型准备的直接输入。 |
| 56-p0-smart-contract-business-design | 合约输出和资金池/规则状态的数据语义。 |
| 57-p0-agent-business-design | Agent 输出、自动推进和人工升级记录。 |
| 58-p0-control-tower-expression-design | 控制塔状态、节点、卡点和资金结果表达。 |
| 59-p0-business-acceptance-design | 业务验收对数据可追踪性的要求。 |
| 60-p0-design-feedback-and-deferred-scope | 新信息域、P1/P2、实现细节的回流和后置规则。 |
| 63-p0-interface-specification-preparation | 接口候选对数据对象的业务需求。 |

## 3. 数据模型准备原则

| 原则 | 说明 |
|---|---|
| 从信息域派生 | 不凭空设计数据对象，只从 55 的信息域派生。 |
| 先概念对象 | 当前只定义概念数据对象和关系语义，不写表。 |
| 保留事实来源 | 每个事实对象必须知道来源角色。 |
| 保留记录责任 | 谁提交、谁确认、谁可见、谁不能改必须清楚。 |
| 保留历史 | 原始材料、事实结论、决策、执行、暂停和异常不能无痕覆盖。 |
| Agent 输出降级处理 | Agent 摘要、建议、缺口不是事实或审批。 |
| 合约输出降级处理 | 合约输出是执行状态，不是贸易真实性。 |
| 权限可见继承 | 数据对象可见性继承 53，不在模型中扩大权限。 |
| 不写存储实现 | 不写表、字段、索引、ORM、链上/链下拆分。 |
| 缺口回流 | 需要新信息域时回流 55/60。 |

## 4. 概念数据对象总览

| 概念对象 | 对应信息域 | 业务用途 |
|---|---|---|
| Wallet Identity | 身份与角色信息域 | 表达钱包作为入口身份。 |
| Business Account | 身份与角色信息域 | 表达注册账户、角色、账户状态。 |
| Agent Mode | 身份与角色 / Agent 输出 | 表达全人工、半自动、全自动授权模式。 |
| Financing Case | 融资案件信息域 | 表达一笔贸易融资案件。 |
| Trade Material Set | 贸易材料信息域 | 表达合同、订单、发票、装箱单、补充说明的集合。 |
| Material Version Record | 贸易材料信息域 / 审计 | 表达提交版本和补充历史。 |
| Fact Node | 事实节点信息域 | 表达质检、物流、保险、买方、通关等事实节点。 |
| Inspection Fact | 质检事实 | 表达 pass/fail/dispute 和质检材料。 |
| Funding Decision | 资金方决策信息域 | 表达允许、拒绝、补材料、降额、人工复核。 |
| Contract Execution State | 合约业务输出信息域 | 表达 allowed/waiting/blocked/failed/completed。 |
| Capital Pool State | 合约/平台运营信息域 | 表达资金池可用、不足、暂停、异常。 |
| Rule State | 合约/平台运营信息域 | 表达规则有效、暂停、过期、不适用。 |
| Agent Output | Agent 输出信息域 | 表达摘要、缺口、待办、建议、提醒、升级。 |
| Task / Todo | Agent 输出 / 异常信息域 | 表达谁下一步做什么。 |
| Exception Case | 异常信息域 | 表达缺材料、dispute、阻断、失败等卡点。 |
| Platform Operation Record | 平台运营信息域 | 表达暂停、恢复、升级、分派等平台动作。 |
| Audit Record | 审计记录信息域 | 表达关键行为留痕。 |
| Control Tower Projection | 控制塔表达 | 表达角色可见的业务状态投影。 |

## 5. 身份与角色概念模型准备

### 5.1 概念对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Wallet Identity | 钱包连接后的身份入口。 | 不等于业务角色。 |
| Business Account | 完成注册后的业务账户。 | 与钱包绑定，角色不可随意切换。 |
| Business Role Binding | 钱包与唯一角色的绑定关系。 | P0 永久绑定。 |
| Account Status | 未注册、已激活、受限、暂停。 | 状态影响可进入范围。 |
| Agent Mode | 全人工、半自动、全自动。 | 不改变角色权限。 |

### 5.2 关系语义

```text
Wallet Identity
→ Business Account
→ Business Role Binding
→ Role Workspace
→ Agent Mode
```

业务解释：

- 一个钱包最多对应一个 P0 业务账户。
- 一个业务账户绑定一个永久角色。
- Agent 模式属于账户授权状态，不是新角色。
- 账户状态影响能否触发业务动作。

## 6. 融资案件概念模型准备

### 6.1 概念对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Financing Case | 一笔融资案件。 | 由出口商创建。 |
| Financing Intent | 出口商融资意图。 | 不等于资金方批准。 |
| Financing Target | 金额、币种、期望到账等目标。 | 可被资金方建议调整，但原始申请要留痕。 |
| Case Status | 草稿、提交、补材料、审查中、批准、拒绝、放款中、完成等。 | 必须表达卡点和下一步。 |
| Case Participant | 案件相关角色。 | 决定可见范围。 |
| Case Path | 银行辅助、纯 DeFi、低人工、人工升级。 | 路径差异必须保留。 |

### 6.2 关系语义

```text
Business Account(exporter)
→ Financing Case
→ Financing Intent
→ Trade Material Set
→ Fact Nodes
→ Funding Decision or DeFi Rule Path
→ Contract Execution State
→ Funding Result
```

业务解释：

- Financing Case 是 P0 主线核心对象。
- 案件不是单纯文件夹，而是融资状态、事实、决策和执行结果的聚合。
- 案件参与关系决定数据可见范围。
- 案件路径决定后续规则和验收表达。

## 7. 贸易材料概念模型准备

### 7.1 概念对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Trade Material Set | 一笔案件下的贸易材料集合。 | 属于融资案件。 |
| Contract Material | 合同材料。 | 出口商提交。 |
| Purchase Order Material | 订单材料。 | 出口商提交，买方可后续确认。 |
| Invoice Material | 发票材料。 | 金额和付款义务参考。 |
| Packing List Material | 装箱单材料。 | 数量、包装、货物明细。 |
| Supplemental Explanation | 补充说明。 | 解释异常和差异。 |
| Material Version Record | 版本记录。 | 提交和补充不能无痕覆盖。 |
| Material Completeness State | 完整性状态。 | 完整、缺口、冲突、需人工确认。 |

### 7.2 关系语义

```text
Financing Case
→ Trade Material Set
→ Material Items
→ Material Version Record
→ Material Completeness State
→ Agent Gap / Funding Review
```

业务解释：

- 材料对象必须保留原始提交来源。
- Agent 可生成摘要和缺口，但不成为材料来源。
- 资金方可要求补充，但不能修改原始材料。
- 材料完整性影响提交、资金方审查和合约执行前条件。

## 8. 事实节点概念模型准备

### 8.1 Fact Node 总体模型

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Fact Node | 案件中的事实确认节点。 | 来源角色必须清楚。 |
| Fact Source Role | 事实来源角色。 | 质检、物流、保险、买方、海关等。 |
| Fact Status | pending/pass/fail/dispute/confirmed 等业务状态。 | 状态必须可解释。 |
| Fact Evidence | 支撑事实的材料或说明。 | 不写文件存储。 |
| Fact Dispute | 事实争议。 | 必须有责任方和解除条件。 |

### 8.2 P0 质检事实对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Inspection Task | 质检任务。 | 分配给质检方。 |
| Inspection Evidence | 报告、照片、说明等。 | 质检方提交。 |
| Inspection Conclusion | Pass / Fail / Dispute。 | 质检方确认。 |
| Inspection Supplement | 质检补充说明。 | 不覆盖原结论历史。 |

### 8.3 P1/P2 事实占位对象

| 概念对象 | P0 处理方式 | 后置 |
|---|---|---|
| Logistics Fact | 保留状态和材料占位。 | P1 完整物流工作区。 |
| Insurance Fact | 保留承保/拒保/需补材料占位。 | P1 保险流程。 |
| Buyer Confirmation Fact | 保留订单、收货、争议、付款责任占位。 | P1 买方工作区。 |
| Customs Fact | 只保留通关事实价值说明。 | P2 海关/报关接入。 |

## 9. 资金方决策概念模型准备

### 9.1 概念对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Funding Review | 资金方审查过程。 | 资金方可见和操作。 |
| Evidence Completeness View | 证据完整性视图。 | 来自材料和事实，不是新事实。 |
| Risk Suggestion | Agent 风险建议。 | 不等于最终决策。 |
| Funding Decision | 允许、拒绝、补材料、降额、人工复核。 | 资金方确认。 |
| Decision Reason | 决策原因。 | 对外原因和内部判断可分级。 |
| Post Funding State | 贷后状态。 | P0 基础状态，复杂催收后置。 |

### 9.2 关系语义

```text
Financing Case
→ Evidence Completeness View
→ Risk Suggestion
→ Funding Review
→ Funding Decision
→ Contract Execution State
```

业务解释：

- 资金方决策依赖材料、事实和 Agent 辅助，但不被 Agent 替代。
- 资金方批准不是到账完成。
- 批准后仍需合约/规则执行检查。

## 10. 合约与规则概念模型准备

### 10.1 概念对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Contract Execution State | 合约/规则执行状态。 | 不等于贸易真实性。 |
| Execution Condition Set | 执行前条件集合。 | 授权、事实、规则、资金池、暂停状态。 |
| Capital Pool State | 资金池状态。 | 可用、不足、暂停、异常。 |
| Rule State | 规则状态。 | 有效、暂停、过期、不适用。 |
| Platform Pause State | 平台暂停状态。 | 案件、资金池、规则、执行能力等。 |
| Execution Result | Allowed、Waiting、Blocked、Failed、Completed。 | 必须业务可解释。 |

### 10.2 关系语义

```text
Funding Decision or DeFi Rule Path
→ Execution Condition Set
→ Capital Pool State
→ Rule State
→ Platform Pause State
→ Contract Execution State
→ Funding Result
```

业务解释：

- 合约相关对象只表达执行约束。
- 合约不创建贸易材料，不确认质检，不替资金方审批。
- 执行失败必须关联责任方和下一步。

## 11. Agent 输出概念模型准备

### 11.1 概念对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Agent Output | Agent 生成的摘要、建议、解释等输出。 | 不是事实或审批。 |
| Agent Summary | 案件或材料摘要。 | 不替代原始材料。 |
| Agent Gap | 缺口清单。 | 不等于拒绝结论。 |
| Agent Recommendation | 建议下一步。 | 不等于决策。 |
| Agent Task | 待办任务。 | 必须有责任方。 |
| Agent Automation Record | 自动推进记录。 | 必须可追踪。 |
| Agent Escalation Record | 人工升级记录。 | 必须说明原因。 |

### 11.2 关系语义

```text
Role Workspace
→ Agent Mode
→ Agent Output
→ Agent Task / Recommendation / Escalation
→ Human Action or Automated Low-risk Progress
```

业务解释：

- Agent 输出属于所属角色上下文。
- Agent 不产生业务事实，只产生辅助结果。
- Agent 自动推进必须受权限、授权、风险和合约边界约束。

## 12. 异常与卡点概念模型准备

### 12.1 概念对象

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Exception Case | 一个业务异常或卡点。 | 必须有原因、责任方、下一步。 |
| Exception Type | 缺材料、金额冲突、dispute、规则阻断等。 | 类型必须业务可理解。 |
| Responsible Party | 当前责任方。 | 决定待办和可见范围。 |
| Impact Scope | 影响案件、资金、规则、平台或执行。 | 控制塔需要表达。 |
| Resolution Condition | 解除条件。 | 没有解除条件不能闭环。 |
| Exception History | 异常处理历史。 | 不得无痕覆盖。 |

### 12.2 关系语义

```text
Financing Case or Execution State
→ Exception Case
→ Responsible Party
→ Agent Task
→ Resolution Condition
→ Resolved or Still Blocked
```

业务解释：

- 异常对象是控制塔和验收的核心。
- 异常不能只保存技术失败。
- 权限不清的异常必须回流，不应强行建模。

## 13. 平台运营概念模型准备

| 概念对象 | 业务含义 | 关键边界 |
|---|---|---|
| Platform Operation Record | 平台高影响操作记录。 | 暂停、恢复、升级、分派必须可追踪。 |
| Pool Operation State | 资金池运营状态。 | 平台可维护，出口商不可修改。 |
| Rule Operation State | 规则运营状态。 | 平台可暂停/恢复/升级。 |
| Contract Operation State | 合约执行能力状态。 | 平台可暂停/恢复。 |
| Agent Operation State | Agent 自动化状态。 | 正常、失败、堆积、需人工。 |

业务解释：

- 平台运营对象不是逐单审批对象。
- 平台不能通过运营对象伪造事实或替资金方批准。
- 高影响操作必须保留原因、影响范围和恢复条件。

## 14. 审计记录概念模型准备

| 审计对象 | 必须留痕的业务原因 |
|---|---|
| 钱包注册和角色绑定 | 证明单钱包单角色。 |
| Agent 模式设置 | 证明自动化授权范围。 |
| 融资案件创建和提交 | 证明融资意图和提交节点。 |
| 贸易材料提交和补充 | 证明材料来源和版本。 |
| 质检结论提交 | 证明事实来源。 |
| 资金方决策 | 证明资金决策责任。 |
| 合约执行结果 | 证明执行状态和阻断原因。 |
| 平台暂停和恢复 | 证明系统级操作原因。 |
| Agent 自动推进和升级 | 证明自动化没有越权。 |
| 异常发生和解除 | 证明卡点处理过程。 |

边界：

- 审计记录不等于公开信息。
- 审计记录可见范围仍需继承角色权限。
- 审计记录不能被无痕删除。

## 15. 控制塔投影概念模型准备

控制塔不是一个新的事实来源，而是基于案件、材料、事实、决策、合约、Agent、异常等对象生成的角色可见业务投影。

| 投影对象 | 业务含义 |
|---|---|
| Exporter Control Tower Projection | 出口商看到资金结果、卡点、下一步。 |
| Funding Provider Control Tower Projection | 资金方看到证据、风险、决策和执行条件。 |
| Inspection Control Tower Projection | 质检方看到任务、清单、结论和补充请求。 |
| Platform Control Tower Projection | 平台看到资金池、规则、合约、异常、Agent 状态。 |
| Exception Projection | 任意角色看到与自己相关的卡点解释。 |

边界：

- 投影不改变原始数据。
- 投影必须继承角色可见范围。
- 投影必须用业务语言表达，不泄露无关内部细节。

## 16. 概念对象关系总图

```text
Wallet Identity
→ Business Account
→ Business Role Binding
→ Role Workspace
→ Financing Case
  → Trade Material Set
    → Material Version Record
    → Material Completeness State
  → Fact Nodes
    → Inspection Fact
    → Logistics/Insurance/Buyer/Customs Fact placeholders
  → Agent Output
    → Agent Task
    → Agent Escalation Record
  → Funding Review
    → Funding Decision
  → DeFi Rule Path
  → Contract Execution State
    → Capital Pool State
    → Rule State
    → Platform Pause State
    → Execution Result
  → Exception Case
  → Audit Record
  → Control Tower Projection
```

该总图是概念关系，不是数据库关系图。

## 17. P0 必须准备的数据对象

| 概念对象 | 是否 P0 必须 | 原因 |
|---|---|---|
| Wallet Identity | 必须 | 身份入口。 |
| Business Account | 必须 | 注册账户。 |
| Business Role Binding | 必须 | 单钱包单角色。 |
| Financing Case | 必须 | P0 主线核心。 |
| Trade Material Set | 必须 | 融资证据基础。 |
| Material Version Record | 必须 | 防止材料无痕覆盖。 |
| Inspection Fact | 必须 | P0 核心事实节点。 |
| Funding Decision | 必须 | 银行辅助路径核心。 |
| Contract Execution State | 必须 | Crypto Native 执行约束。 |
| Agent Output | 必须 | Agent Native 核心。 |
| Exception Case | 必须 | 控制塔卡点和异常处理。 |
| Platform Operation Record | 必须 | 平台运营边界。 |
| Audit Record | 必须 | 可追踪和可信。 |
| Control Tower Projection | 必须 | 角色可理解业务状态。 |

## 18. P0 后置的数据对象

| 后置对象 | 后置阶段 | P0 占位方式 |
|---|---|---|
| Full Logistics Workspace Model | P1 | 物流事实占位。 |
| Full Insurance Underwriting Model | P1 | 保险状态占位。 |
| Full Buyer Workspace Model | P1 | 买方确认占位。 |
| Customs Integration Model | P2 | 通关事实价值占位。 |
| Multi Funding Marketplace Model | 后续资金市场 | 单资金方/基础路径。 |
| Advanced Post-funding Collection Model | 后续贷后模块 | 基础贷后状态。 |
| Proof/Hash Registry Model | 后续证明产品 | 不作为 P0 主线。 |

## 19. 不得进入的数据实现内容

| 禁止内容 | 后置阶段 |
|---|---|
| 数据库表名 | 数据库设计阶段。 |
| 字段名和字段类型 | 数据库设计阶段。 |
| 主键、外键、索引 | 数据库设计阶段。 |
| ORM/entity/schema | 实现阶段。 |
| migration 脚本 | 实现阶段。 |
| 链上/链下存储拆分 | 架构和实现阶段。 |
| 文件存储路径和桶策略 | 实现阶段。 |
| 加密、脱敏、备份实现 | 安全和实现阶段。 |
| 查询优化 | 实现阶段。 |

## 20. 数据模型准备通过标准

| 检查项 | 通过标准 |
|---|---|
| 来源清楚 | 每个概念对象能追溯到 55 的信息域。 |
| 业务用途清楚 | 每个对象服务明确业务动作或表达。 |
| 事实来源清楚 | 每类事实由谁产生和确认清楚。 |
| 记录责任清楚 | 谁提交、谁确认、谁可见、谁不能改清楚。 |
| 权限继承清楚 | 数据可见不突破 53。 |
| Agent 边界清楚 | Agent 输出不等于事实或审批。 |
| 合约边界清楚 | 合约输出不等于贸易真实性。 |
| 历史和审计清楚 | 关键记录不能无痕覆盖。 |
| 后置范围清楚 | P1/P2 和 proof/hash 数据对象不进入 P0 必做。 |
| 实现细节后置 | 未出现表、字段、索引、ORM、迁移脚本。 |

## 21. 一票否决项

| 一票否决项 | 原因 |
|---|---|
| 概念模型把 Agent 摘要当原始事实 | 破坏事实来源。 |
| 概念模型把合约输出当贸易真实性 | 合约越界。 |
| 概念模型允许资金方修改出口商原始材料 | 破坏证据可信。 |
| 概念模型允许平台删除关键审计记录 | 破坏可信基础。 |
| 概念模型突破角色可见范围 | 数据隔离失败。 |
| 概念模型没有表达异常责任方和解除条件 | 异常不可处理。 |
| 直接写数据库表、字段、索引或 ORM | 阶段越界。 |
| P1/P2 数据对象被塞入 P0 必做 | MVP 范围失控。 |
| 旧 proof/hash registry 数据模型成为 P0 主线 | 破坏产品定位。 |

## 22. 回流规则

| 发现问题 | 处理方式 |
|---|---|
| 需要新增信息域 | 回流 55。 |
| 需要新增业务动作 | 回流 54。 |
| 数据可见范围不清 | 回流 53。 |
| Agent 输出边界不清 | 回流 57。 |
| 合约输出语义不清 | 回流 56。 |
| 控制塔投影不足 | 回流 58。 |
| 验收所需数据缺失 | 回流 59。 |
| P1/P2 或实现内容混入 | 回流 60 并后置。 |

## 23. 本步结论

P0 数据模型准备的本质不是“设计数据库”。

它的本质是：

> 从 P0 信息域出发，建立概念数据对象和关系语义，明确每个对象服务什么业务动作、由谁产生、谁确认、谁可见、谁不能改，以及如何支撑 Agent、合约、控制塔、异常和审计，同时防止当前阶段提前进入表结构、字段、索引、ORM 或链上/链下存储实现。

下一步应进入：

> `65-p0-contract-specification-preparation.md`

即从 `56-p0-smart-contract-business-design.md` 出发，准备合约规格，但仍先做业务输出到合约规格的映射，不直接写 Solidity、ABI、函数签名或部署方案。
