# 30 P0 业务事件清单

## 1. 定位

本文件定义 ChainTrace P0 阶段的业务事件清单。

业务事件清单不是技术事件总线设计，不是日志格式，不是数据库表，也不是智能合约 event 定义。

它的作用是：

> 用业务语言说明哪些关键变化必须被系统识别、解释、展示和追踪。

本文件不写页面、组件、API、数据库、Solidity、钱包签名、hash 或 proof 细节。

## 2. 业务事件原则

| 原则 | 说明 |
|---|---|
| 事件描述业务变化 | 事件表示状态、事实、授权、阻断、执行或异常发生了变化。 |
| 事件必须有来源 | 每个事件必须能说明由哪个角色、Agent、规则或合约触发。 |
| 事件必须有影响 | 每个事件必须说明影响哪个案件、任务、状态或资金动作。 |
| 事件必须可解释 | 不能只显示技术成功或失败。 |
| 事件不覆盖历史 | 补充、修正、争议和关闭都应形成新记录。 |
| 事件不等于实现 | 当前只定义业务口径，不定义事件存储或发布机制。 |

## 3. 事件分类

| 分类 | 说明 |
|---|---|
| 案件生命周期事件 | 案件创建、提交、关闭、重开等。 |
| 材料和缺口事件 | 材料提交、缺口发现、补材料完成。 |
| 事实确认事件 | 质检、物流、通关、保险、买方事实形成。 |
| Agent 事件 | 摘要生成、待办生成、提醒、自动推进、异常升级。 |
| 银行辅助事件 | 资金方审查、补材料、允许、拒绝、人工复核。 |
| DeFi 执行事件 | 规则检查、资金池检查、执行、阻断、失败、完成。 |
| 平台运营事件 | 规则暂停、资金池暂停、平台恢复、执行失败处理。 |
| 异常和争议事件 | dispute、高风险、事实冲突、法律责任争议。 |

## 4. 案件生命周期事件

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| Case drafted | 出口商 / 业务方 | 融资或结算意图已创建。 | 进入 Draft。 |
| Case submitted | 出口商 / Agent 授权 | 案件已提交处理。 | 进入 Submitted 或 Material checking。 |
| Case returned for materials | Agent / 资金方 / 事实方 | 需要补材料或补说明。 | 进入 Need materials。 |
| Case moved to fact confirmation | Agent / 规则 | 需要事实方确认。 | 进入 Fact confirming。 |
| Case moved to bank review | Agent / 规则 | 场景需要银行辅助。 | 进入 Under review。 |
| Case moved to DeFi checking | Agent / 规则 | 场景不需要银行，进入合约检查。 | 进入 DeFi checking。 |
| Case moved to manual review | Agent / 资金方 / 平台 / 规则 | 异常、争议、高风险或授权需要人工处理。 | 进入 Manual review。 |
| Case closed | 出口商 / 平台 / 规则 | 案件关闭。 | 进入 Closed。 |

## 5. 材料和缺口事件

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| Trade material submitted | 出口商 | 贸易材料已提交。 | Agent 可检查完整性。 |
| Material summary generated | Agent | 材料被整理成业务摘要。 | 相关角色可查看摘要。 |
| Material gap detected | Agent / 资金方 / 事实方 | 发现材料缺口。 | 生成补材料待办。 |
| Material supplement requested | Agent / 资金方 / 事实方 | 已向责任角色请求补充。 | 进入 Need materials。 |
| Material supplement submitted | 出口商 / 事实方 | 责任角色已补充材料。 | 回到检查、事实确认或审查。 |
| Material inconsistency detected | Agent / 资金方 / 平台 | 金额、主体、品类、国家或文件冲突。 | 进入人工复核或补说明。 |

## 6. 事实确认事件

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| Inspection task created | Agent / 出口商 | 需要质检方确认货物事实。 | 质检方收到任务。 |
| Inspection accepted | 质检方 | 质检方接受任务。 | 质检处理中。 |
| Inspection material submitted | 质检方 | 报告、照片或说明已提交。 | Agent 检查完整性。 |
| Inspection passed | 质检方 | 货物事实通过。 | 可进入资金方审查或 DeFi 检查。 |
| Inspection failed | 质检方 | 货物事实不通过。 | 进入人工复核、拒绝或阻断。 |
| Inspection disputed | 质检方 | 质检事实存在争议。 | 进入争议处理。 |
| Logistics fact confirmed | 物流方 | 物流节点或异常已确认。 | 贸易真实性增强或触发异常。 |
| Customs fact confirmed | 海关 / 报关方 | 通关或监管事实已确认。 | 贸易真实性和监管状态更新。 |
| Insurance decision made | 保险公司 | 承保、拒保、加费或补材料结论形成。 | 风险缓释状态更新。 |
| Buyer responsibility confirmed | 买方 / 进口商 | 订单、收货或付款责任被确认。 | 回款可信度增强。 |
| Buyer dispute raised | 买方 / 进口商 | 买方提出争议。 | 进入人工复核或暂停。 |

## 7. Agent 事件

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| Agent summary generated | Agent | 已生成角色可读摘要。 | 角色可快速理解案件。 |
| Agent checklist completed | Agent | 材料或事实检查完成。 | 可提交、补材料或进入下一状态。 |
| Agent todo created | Agent | 已生成明确待办。 | 责任角色收到动作要求。 |
| Agent reminder sent | Agent | 已提醒超时、状态、风险或授权。 | 用户处理下一步。 |
| Agent low-risk step advanced | Agent | 授权范围内推进低风险流程。 | 案件进入下一状态。 |
| Agent escalation triggered | Agent | 发现异常、争议、越权风险或置信不足。 | 进入人工复核或平台处理。 |
| Agent mode changed | 用户 / 平台方 | Agent 模式发生变化。 | 后续自动化边界变化。 |

## 8. 银行辅助事件

银行辅助事件只适用于需要银行或机构参与的场景。

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| Bank review started | 资金方 / Agent | 资金方开始审查。 | 进入 Under review。 |
| Bank material request issued | 资金方 | 资金方要求补材料。 | 生成补材料待办。 |
| Bank manual review requested | 资金方 | 需要人工复核。 | 进入 Manual review。 |
| Bank approved funding | 资金方 | 资金方允许放款。 | 进入 Approved 或 Execution pending。 |
| Bank rejected funding | 资金方 | 资金方拒绝融资。 | 进入 Rejected 或 Closed。 |
| Bank approval expired | 规则 / 资金方 | 授权超过有效期。 | 重新审查或阻断。 |

## 9. DeFi 执行事件

本节只定义业务事件，不定义智能合约 event 或实现。

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| Rule check started | DeFi 智能合约 / 规则 | 开始检查规则。 | 等待规则结果。 |
| Rule check passed | DeFi 智能合约 | 当前规则允许继续。 | 检查资金池或执行条件。 |
| Rule check blocked | DeFi 智能合约 | 规则不允许继续。 | 进入 Blocked。 |
| Pool check passed | DeFi 智能合约 | 资金池可用。 | 可继续执行。 |
| Pool insufficient | DeFi 智能合约 | 资金池不足。 | 等待、阻断或平台处理。 |
| Authorization checked | DeFi 智能合约 | 授权边界已检查。 | 允许或阻断执行。 |
| Collateral condition checked | DeFi 智能合约 | 抵押/保证条件已检查。 | 满足、等待或阻断。 |
| Execution allowed | DeFi 智能合约 | 条件满足，可以执行。 | 进入执行。 |
| Execution blocked | DeFi 智能合约 | 条件不满足。 | 进入 Blocked 并说明原因。 |
| Funds executed | DeFi 智能合约 | 资金动作已执行。 | 到账、锁定、释放或结算完成。 |
| Execution failed | DeFi 智能合约 / 平台方 | 执行失败。 | 平台处理并解释失败原因。 |

## 10. 平台运营事件

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| Rule paused | 平台方 | 规则暂停。 | 相关案件进入等待或阻断。 |
| Rule resumed | 平台方 | 规则恢复。 | 相关案件可重新检查。 |
| Pool paused | 平台方 | 资金池暂停。 | 资金动作等待或阻断。 |
| Pool resumed | 平台方 | 资金池恢复。 | 可重新进入执行检查。 |
| Case paused | 平台方 | 单个案件暂停。 | 案件进入 Blocked 或 Manual review。 |
| Case resumed | 平台方 | 单个案件恢复。 | 回到原流程或重新检查。 |
| Platform incident marked | 平台方 | 系统级异常被标记。 | 影响范围内案件等待。 |
| Platform incident resolved | 平台方 | 系统级异常解除。 | 相关案件恢复处理。 |

## 11. 异常和争议事件

| 事件 | 触发来源 | 业务含义 | 后续影响 |
|---|---|---|---|
| High risk detected | Agent / 资金方 / 平台方 | 案件风险超过自动化边界。 | 进入人工复核。 |
| Fact conflict detected | Agent / 事实方 / 资金方 | 不同事实之间存在冲突。 | 进入补说明或人工复核。 |
| Legal responsibility disputed | 买方 / 出口商 / Agent / 平台方 | 存在重大法律或责任争议。 | 进入人工或约定仲裁。 |
| Unauthorized action attempted | 系统 / 平台方 | 角色尝试越权动作。 | 阻断并记录原因。 |
| Agent overreach detected | 平台方 / 用户 | Agent 可能越权或置信不足。 | 降级模式或进入人工。 |
| Manual review completed | 人工角色 | 人工复核完成。 | 回到审查、执行、拒绝或关闭。 |

## 12. 事件输出要求

每个业务事件至少需要能回答：

| 问题 | 说明 |
|---|---|
| 发生了什么？ | 事件名称和业务含义。 |
| 谁触发的？ | 角色、Agent、规则、平台或合约。 |
| 影响什么？ | 案件、任务、事实、规则、资金池或执行状态。 |
| 为什么发生？ | 材料、事实、规则、授权、风险或平台原因。 |
| 下一步是什么？ | 继续、补材料、等待、阻断、人工复核或关闭。 |

## 13. MVP 范围

### 13.1 P0 必须定义

| 范围 | 说明 |
|---|---|
| 关键业务事件 | 生命周期、材料、事实、Agent、银行、合约、平台、异常事件。 |
| 事件来源 | 角色、Agent、规则、合约或平台。 |
| 事件影响 | 状态、待办、事实、执行或阻断结果。 |
| 事件解释 | 用户能理解原因和下一步。 |
| 历史不覆盖 | 补充和修正形成新事件。 |

### 13.2 暂不做

| 范围 | 原因 |
|---|---|
| 技术事件总线 | 当前不做实现。 |
| 数据库日志表 | 当前不做数据库设计。 |
| 合约 event 定义 | 当前不写 Solidity。 |
| 审计哈希和 proof pack | 当前不进入底层证明细节。 |

## 14. 本步结论

P0 业务事件清单明确：

> ChainTrace 必须能用业务语言追踪案件生命周期、材料缺口、事实确认、Agent 推进、银行辅助决策、DeFi 执行、平台运营和异常争议。事件不是技术实现，而是让每个角色理解“发生了什么、为什么、影响什么、下一步谁处理”的产品口径。

下一步应进入：

> P0 非功能业务要求，重点是可解释性、审计、权限隔离、人工确认和异常升级。
