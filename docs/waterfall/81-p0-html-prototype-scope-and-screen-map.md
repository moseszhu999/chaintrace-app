# 81 P0 HTML Prototype Scope and Screen Map

## 1. 定位

本文件定义 ChainTrace P0 第一版 HTML 原型图的范围和 screen map。

它不是最终前端实现，不是 React / Next.js / Vue 组件设计，不是页面路由实现，不是 API 对接方案，不是样式系统，不是数据库实现，也不是生产级 UI。

它的作用是：

> 在 `71–80` 已经完成 P0 受控实现计划之后，把身份、角色、融资案件、材料、质检、资金方、合约/规则、Agent、控制塔和平台运营这些业务结构转换成第一版可展示、可讨论、可验收的 HTML 原型页面范围。

第一版 HTML 原型的目标不是“好看”，而是：

```text
能看懂产品主线
能看懂角色差异
能看懂融资闭环
能看懂 Agent Native
能看懂 Crypto Native
能看懂卡点和资金结果
能防止回到旧 proof/hash demo
```

## 2. 原型输入来源

| 输入文档 | 对 HTML 原型的影响 |
|---|---|
| 71 Identity and Role | 顶部钱包/角色/Agent 模式状态条、角色工作区入口。 |
| 72 Financing Case Core | 出口商创建融资案件、案件总览、融资目标。 |
| 73 Material and Gap Flow | 材料状态、缺口、补材料待办。 |
| 74 Inspection Fact Node | 质检任务、质检状态、Pass/Fail/Dispute。 |
| 75 Funding Review Path | 资金方审查区、允许/拒绝/降额/人工复核。 |
| 76 Contract State Facade | 合约/规则/资金池/平台暂停状态。 |
| 77 Agent Assist Layer | Agent 摘要、缺口、待办、解释、自动推进、人工升级。 |
| 78 Control Tower Projection | 中央主链路、角色视图、卡点、资金结果。 |
| 79 Platform Operation Basics | 平台运营、异常队列、资金池、规则、Agent 自动化。 |
| 80 P0 Acceptance Flow | 第一版原型必须覆盖的验收流。 |

## 3. 第一版 HTML 原型目标

第一版 HTML 原型必须让观看者在 3 分钟内理解：

```text
ChainTrace 不是一个 proof/hash demo；
ChainTrace 是 Agent Native + Crypto Native 的供应链融资控制塔；
出口商从跨境贸易材料和融资意图开始；
Agent 帮助补材料、解释状态和推进低风险动作；
质检方提供事实；
资金方或 DeFi 路径判断资金可能性；
合约/规则/资金池/暂停状态决定执行条件；
出口商最终看到资金结果和卡点。
```

## 4. 原型总体布局

第一版 HTML 原型采用单文件、多 screen section 的结构，先不做真实路由。

建议总体布局：

```text
Top Status Bar
  - Wallet / Role / Account Status / Agent Mode / Path Mode

Left Role Navigation
  - Exporter
  - Funder
  - Inspector
  - Platform

Main Control Tower
  - Financing flow timeline
  - Current case state
  - Node cards
  - Funding result

Right Agent Assist Panel
  - Summary
  - Gaps
  - Tasks
  - Recommendations
  - Escalations

Bottom / Side Exception Strip
  - Blocking reason
  - Responsible party
  - Next step
```

原型可用静态假数据，不接真实 API。

## 5. Screen Map 总览

第一版 HTML 原型建议包含以下 screens。

| Screen ID | Screen 名称 | 目的 |
|---|---|---|
| S01 | Entry and Role Gate | 表达钱包、注册、单钱包单角色、角色工作区入口。 |
| S02 | Exporter Control Tower | 出口商融资案件主视图。 |
| S03 | Material and Agent Gap | 材料、缺口、补材料待办。 |
| S04 | Inspection Fact View | 质检状态和事实节点。 |
| S05 | Funder Review Workspace | 资金方审查视图。 |
| S06 | Contract and DeFi State | 合约/规则/资金池/暂停状态。 |
| S07 | Agent Assist Layer | Agent 摘要、待办、解释和升级。 |
| S08 | Platform Operation Console | 平台运营和异常队列。 |
| S09 | Funding Result and Exception States | 资金结果和卡点状态集合。 |
| S10 | P0 Acceptance Storyboard | 串联正常闭环和异常闭环。 |

第一版可以做成一个 HTML 文件中的 10 个 section，也可以后续拆成多个 HTML 文件。

## 6. S01 Entry and Role Gate

### 6.1 Screen 目标

表达 ChainTrace 的入口不是普通账号登录，而是：

```text
Wallet connected
→ Business account recognized
→ Single wallet single role
→ Role workspace gate
→ Agent mode attached
```

### 6.2 关键区块

| 区块 | 内容 |
|---|---|
| Wallet State | Connected / Unregistered / Active / Suspended。 |
| Business Role | Exporter / Funder / Inspector / Platform。 |
| Role Binding Notice | “This wallet is bound to Exporter role.” |
| Account Status | Active / Restricted / Suspended。 |
| Agent Mode | Manual / Semi-auto / Full-auto。 |
| Workspace CTA | Enter Exporter / Funder / Inspector / Platform Workspace。 |
| Blocked Explanation | 未注册、角色不匹配、账户暂停时显示业务原因。 |

### 6.3 必须表达

- 一个钱包只能绑定一个角色。
- Agent 模式不是业务角色。
- 未注册或暂停账户不能进入业务工作区。

## 7. S02 Exporter Control Tower

### 7.1 Screen 目标

这是第一版 HTML 原型的核心 screen。

它必须让人看到：

```text
出口商融资案件正在从贸易材料走向资金结果。
```

### 7.2 关键区块

| 区块 | 内容 |
|---|---|
| Case Header | 案件编号、出口商、买方、金额、币种、融资目标。 |
| Main Flow Timeline | Intent → Materials → Agent Check → Inspection → Funding/DeFi → Contract → Result。 |
| Current Node | 当前卡在哪一步。 |
| Funding Goal | Requested amount、currency、expected settlement。 |
| Evidence Summary | 合同、订单、发票、装箱单、质检状态。 |
| Agent Assist | 缺口、待办、下一步。 |
| Funding Result | Waiting / Allowed / Reduced / Rejected / Blocked / Failed / Completed。 |
| Exception Card | 卡点原因、责任方、解除条件。 |

### 7.3 必须表达

- 案件创建不等于融资成功。
- 材料完整不等于融资批准。
- 资金方允许或合约 Allowed 不等于已到账。
- Completed 才是资金执行完成。

## 8. S03 Material and Agent Gap

### 8.1 Screen 目标

表达 Phase 3 的材料和 Agent 缺口逻辑。

### 8.2 关键区块

| 区块 | 内容 |
|---|---|
| Material Checklist | Contract、PO、Invoice、Packing List、Supplemental Explanation。 |
| Completeness State | Not started / Incomplete / Submitted / Complete / Conflict detected。 |
| Agent Gap List | 缺什么、为什么影响融资。 |
| Material Conflict | 金额、数量、主体、日期冲突。 |
| Todo List | 补合同、补发票、解释金额差异等。 |
| Version Hint | 原始提交和补充提交不能无痕覆盖。 |

### 8.3 必须表达

- 材料不是普通文件列表。
- Agent 发现缺口，但不能伪造材料。
- 补充说明不能覆盖原始材料。

## 9. S04 Inspection Fact View

### 9.1 Screen 目标

表达质检方事实节点。

### 9.2 关键区块

| 区块 | 内容 |
|---|---|
| Inspection Task | 任务状态、商品、数量、包装、检查要求。 |
| Evidence Status | Report、Photos、Quantity Note、Packaging Note、Defect Note。 |
| Conclusion | Pass / Fail / Dispute。 |
| Supplement Request | 需要补报告、补照片、解释 dispute。 |
| Fact Source Badge | “Conclusion submitted by Inspection Provider.” |
| Impact on Funding | Pass supports review; Fail/Dispute blocks automation。 |

### 9.3 必须表达

- 质检结论只能来自质检方。
- Agent、资金方、平台、合约都不能生成 Pass/Fail/Dispute。
- Pass 不是融资批准。

## 10. S05 Funder Review Workspace

### 10.1 Screen 目标

表达资金方审查路径。

### 10.2 关键区块

| 区块 | 内容 |
|---|---|
| Pending Cases | 分配/匹配给资金方的案件。 |
| Review Summary | 出口商、买方、金额、材料、质检、路径。 |
| Evidence Completeness | 材料完整性和缺口。 |
| Agent Risk Hint | 风险提示，不等于审批。 |
| Decision Actions | Need materials / Allow / Reject / Reduce / Manual review。 |
| Decision Reason | 决策原因。 |
| Execution Precondition | 允许后仍需规则/资金池/暂停检查。 |

### 10.3 必须表达

- 资金方不能修改出口商原始材料。
- 资金方不能修改质检结论。
- Allow financing 不等于资金到账。

## 11. S06 Contract and DeFi State

### 11.1 Screen 目标

表达 Crypto Native 的执行条件层。

### 11.2 关键区块

| 区块 | 内容 |
|---|---|
| Path Mode | Bank-assisted / Pure DeFi / Low-human / Human escalation。 |
| Execution Conditions | Materials、Inspection、Funding Decision、Rule、Pool、Pause。 |
| Rule State | Active / Paused / Expired / Conflicting。 |
| Pool State | Available / Low balance / Paused / Frozen / Failed。 |
| Platform Pause | Case / Pool / Rule / Execution / Agent automation pause。 |
| Contract Output | Allowed / Waiting / Need materials / Rule blocked / Pool insufficient / Platform paused / Execution failed / Completed。 |
| Business Explanation | 为什么能或不能继续。 |

### 11.3 必须表达

- 合约/规则层不判断贸易真实性。
- 纯 DeFi 不等于无约束自动放款。
- Pool insufficient 不是融资拒绝。
- Rule blocked 必须有原因。

## 12. S07 Agent Assist Layer

### 12.1 Screen 目标

表达 Agent Native，而不是聊天机器人。

### 12.2 关键区块

| 区块 | 内容 |
|---|---|
| Agent Mode | Manual / Semi-auto / Full-auto。 |
| Agent Summary | 案件摘要。 |
| Agent Gaps | 缺口和冲突。 |
| Agent Tasks | 责任方待办。 |
| Agent Recommendation | 建议动作。 |
| Agent Explanation | 状态解释。 |
| Automation Record | 低风险自动推进记录。 |
| Escalation Record | 人工升级原因。 |
| Stop Reason | Rule blocked / Platform paused / Dispute / Low confidence。 |

### 12.3 必须表达

- Agent 输出必须标识为 Agent 输出。
- Agent 继承角色权限。
- Agent 不能伪造事实、替审批、裁决 dispute、绕过合约或暂停。

## 13. S08 Platform Operation Console

### 13.1 Screen 目标

表达平台基础运营能力。

### 13.2 关键区块

| 区块 | 内容 |
|---|---|
| Operation Overview | 案件、异常、资金池、规则、合约、Agent 自动化状态。 |
| Exception Queue | 缺材料、dispute、规则阻断、资金池不足、执行失败。 |
| Capital Pool Panel | Available、Low balance、Paused、Frozen。 |
| Rule Panel | Active、Paused、Expired、Conflicting。 |
| Execution Panel | Waiting、Blocked、Failed、Completed。 |
| Agent Automation Panel | Running、Stopped、Failed、Backlog、Manual takeover。 |
| Pause / Restore Panel | 暂停对象、原因、影响范围、恢复条件。 |

### 13.3 必须表达

- 平台是运营者，不是审批者。
- 平台不能伪造事实。
- 平台不能删除关键审计记录。

## 14. S09 Funding Result and Exception States

### 14.1 Screen 目标

集中展示资金结果和异常卡点的表达口径。

### 14.2 资金结果状态

| 状态 | 展示文案重点 |
|---|---|
| Not submitted | 尚未提交，暂无资金结果。 |
| Waiting for materials | 需要补材料。 |
| Waiting for inspection | 等待质检事实。 |
| Under review | 资金方或规则路径处理中。 |
| Need review | 需要人工复核。 |
| Allowed | 条件允许，但未必已到账。 |
| Reduced | 可融资金额调整。 |
| Rejected | 融资被拒绝，有原因。 |
| Pool insufficient | 资金池不足。 |
| Rule blocked | 规则阻断。 |
| Platform paused | 平台暂停。 |
| Execution failed | 执行失败。 |
| Completed | 资金执行完成。 |

### 14.3 异常卡点必须字段

| 字段 | 说明 |
|---|---|
| Blocking reason | 为什么卡住。 |
| Responsible party | 谁负责。 |
| Impact | 影响哪个链路节点。 |
| Recovery condition | 如何恢复。 |
| Next action | 下一步动作。 |

## 15. S10 P0 Acceptance Storyboard

### 15.1 Screen 目标

用故事板串联 P0 验收流。

### 15.2 Storyboard

```text
Step 1: Exporter connects wallet and enters workspace.
Step 2: Exporter creates financing intent.
Step 3: Financing case is created.
Step 4: Exporter submits trade materials.
Step 5: Agent detects missing invoice and creates a todo.
Step 6: Exporter supplements invoice.
Step 7: Inspector submits Pass.
Step 8: Funder reviews evidence and allows financing.
Step 9: Contract state checks rule and pool.
Step 10: Funding result becomes Completed.
```

### 15.3 异常故事板

```text
Alternative A: Material conflict → Agent task → Exporter explanation.
Alternative B: Inspection Dispute → automation stops → human escalation.
Alternative C: Funder reduces amount → exporter sees adjusted result.
Alternative D: Pool insufficient → platform handles pool state.
Alternative E: Rule blocked → platform explains rule reason.
Alternative F: Platform paused → all automation stops.
```

## 16. 第一版 HTML 文件建议

第一版可先做一个静态 HTML 文件：

```text
docs/prototypes/p0-control-tower-prototype.html
```

或如果希望保持 waterfall 文档目录内，也可以先放：

```text
docs/waterfall/prototypes/p0-control-tower-prototype.html
```

建议采用：

```text
docs/prototypes/p0-control-tower-prototype.html
```

因为它已经不再是 Markdown 文档，而是可打开的原型页面。

## 17. 第一版 HTML 原型内容边界

第一版 HTML 原型允许：

| 允许内容 | 说明 |
|---|---|
| 单文件 HTML | 方便打开和审阅。 |
| 内嵌 CSS | 方便快速迭代。 |
| 静态 mock data | 不接 API。 |
| 多 section screens | 模拟页面结构。 |
| 角色切换视觉 | 可以用按钮或 tab 表达，但不代表真实权限。 |
| 状态 badge | 展示业务状态。 |
| Flow timeline | 展示主链路。 |
| Agent panel | 展示 Agent 输出。 |
| Exception cards | 展示卡点和责任方。 |

第一版 HTML 原型禁止：

| 禁止内容 | 原因 |
|---|---|
| 真实钱包连接代码 | 后置实现。 |
| 真实 API 调用 | 后置实现。 |
| 数据库字段和表结构 | 后置实现。 |
| Solidity/ABI/交易逻辑 | 后置实现。 |
| proof/hash 主页面 | 防止回到旧 demo。 |
| 大量登录前营销页 | 当前重点是产品操作台。 |
| 复杂图表 BI | 后置运营分析。 |

## 18. 第一版视觉表达原则

| 原则 | 说明 |
|---|---|
| 控制塔优先 | 中央必须是融资主链路，不是卡片墙。 |
| 角色差异明显 | 出口商、资金方、质检方、平台方视图不同。 |
| Agent Native 明显 | 右侧或旁边必须有 Agent Assist。 |
| Crypto Native 明显 | 合约/规则/资金池/暂停状态必须可见。 |
| 资金结果明显 | 出口商必须看到资金结果区域。 |
| 卡点可处理 | 异常卡必须有责任方和下一步。 |
| 业务语言优先 | 少用技术词，多用业务解释。 |
| Demo 数据真实感 | 用跨境贸易、发票、订单、质检、资金池等业务数据。 |

## 19. Mock 数据建议

第一版 HTML 原型可使用固定 mock 数据。

| 数据 | 示例 |
|---|---|
| Exporter | Pacific Export LLC。 |
| Buyer | Northstar Retail GmbH。 |
| Product | Smart wearable shipment。 |
| Invoice amount | USD 128,000。 |
| Requested financing | USD 96,000。 |
| Currency | USDC / USD。 |
| Path | Bank-assisted + DeFi execution check。 |
| Material status | Contract complete, PO complete, Invoice conflict resolved, Packing list complete。 |
| Inspection | Pass。 |
| Funder decision | Allow financing, amount USD 92,000。 |
| Contract state | Allowed, pool available, rule active。 |
| Funding result | Completed / or selected scenario state。 |
| Agent task | Explain invoice amount mismatch / Completed。 |

## 20. 原型验收标准

第一版 HTML 原型通过，必须满足：

| 检查项 | 通过标准 |
|---|---|
| 主链路 | 从融资意图到资金结果一眼可见。 |
| 角色 | 四个 P0 角色视图都能看到。 |
| 出口商核心 | 出口商能看到案件、材料、质检、资金、合约和结果。 |
| 资金方核心 | 资金方能看到审查对象、证据、风险建议、决策。 |
| 质检核心 | 质检方能看到任务和 Pass/Fail/Dispute。 |
| 平台核心 | 平台能看到异常、资金池、规则、Agent 自动化。 |
| Agent | Agent 输出明确可见且不伪装事实。 |
| 合约/DeFi | 规则、资金池、暂停和执行状态可见。 |
| 卡点 | 每个异常有原因、责任方和下一步。 |
| 后置边界 | 没有回到 proof/hash demo 或普通 dashboard。 |

## 21. 一票否决项

出现以下任一项，第一版 HTML 原型不通过：

| 一票否决项 | 原因 |
|---|---|
| 页面中心是 proof/hash，不是融资控制塔 | 产品定位倒退。 |
| 页面中心是普通 dashboard 卡片墙 | 控制塔失败。 |
| 出口商看不到资金结果 | P0 核心失败。 |
| Agent 只是聊天框，没有待办/缺口/状态解释 | Agent Native 失败。 |
| 合约/DeFi 状态不可见 | Crypto Native 失败。 |
| 所有角色视图一样 | 权限和角色失败。 |
| 异常只显示 error | 业务不可处理。 |
| 资金方允许被表达成已到账 | 资金结果误导。 |
| 材料完整被表达成融资成功 | 业务语义错误。 |
| 平台被设计成逐单审批者 | 平台边界失败。 |

## 22. 下一步

完成本文件后，下一步应直接创建第一版 HTML 原型：

```text
docs/prototypes/p0-control-tower-prototype.html
```

第一版 HTML 原型应按本文件的 screen map 实现静态可视化，不接 API，不写业务逻辑，不写真实钱包连接，不写 Solidity，不写数据库。

## 23. 本步结论

第一版 HTML 原型不是展示页，也不是旧 proof/hash demo。

它应该是：

> ChainTrace P0 的可视化操作台草图：用静态 HTML 把出口商融资案件、材料缺口、质检事实、资金方审查、DeFi/合约状态、Agent Assist、平台异常和资金结果放在同一条可理解的业务主链路上。

从本文件完成开始，可以正式生成 HTML 原型文件。
