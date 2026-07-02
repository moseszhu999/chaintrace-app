(function () {
  var page = document.body ? document.body.dataset.page : "";
  var data = {
    dashboard: { title: "Agent 自动处理轨迹", did: ["读取采购订单与商业发票", "比对 PO 金额和发票金额", "发现 USD 8,000 差异", "生成出口商待办"], wait: ["等待出口商补充差异说明"], human: ["出口商确认说明", "银行进行人工审单"] },
    materials: { title: "Agent 材料预检查", did: ["识别材料类型", "抽取金额字段", "检查 PO / Invoice 一致性", "阻止未解释案件提交审核"], wait: ["等待出口商上传说明或修正材料"], human: ["出口商对差异原因负责"] },
    gap: { title: "Agent 缺口处理", did: ["把金额差异转成待办", "判断责任方为出口商", "给出完成标准", "设置返回节点为可提交"], wait: ["等待说明文本和支持材料"], human: ["出口商提交说明", "必要时转人工审核"] },
    inspection: { title: "Agent 质检路由", did: ["把案件送到质检节点", "读取质检状态", "把 Pass 结论同步给后续审核"], wait: ["等待第三方质检事实"], human: ["质检方提交结论"] },
    funding: { title: "Agent 融资路径准备", did: ["整理证据包状态", "合并质检结论", "准备资金方可读摘要"], wait: ["等待资金方决策"], human: ["银行或资金方决定是否允许、降额或退回"] },
    execution: { title: "Agent 条件检查摘要", did: ["读取资金方结果", "检查规则状态", "检查资金池状态", "检查平台暂停状态"], wait: ["等待条件全部满足"], human: ["异常状态由人处理"] },
    result: { title: "Agent 结果解释", did: ["汇总完成金额", "记录前置阻断项", "生成出口商可见摘要"], wait: ["无等待项"], human: ["出口商归档或发起复核"] },
    "bank-dashboard": { title: "Agent 银行审单准备", did: ["聚合待审案件", "标记材料缺口", "识别可进入审核的案件", "提示人工升级案件"], wait: ["等待银行审核员打开案件"], human: ["银行审核员选择案件"] },
    "bank-case-review": { title: "Agent 证据核验辅助", did: ["生成证据清单", "解释 PO / 发票差异", "拉取质检结论", "提示买方邮件证据"], wait: ["等待银行确认材料是否可审"], human: ["银行审核员接受或退回证据"] },
    "bank-risk-decision": { title: "Agent 风险摘要", did: ["合并出口商资料", "合并证据包状态", "合并质检结论", "给出保守金额建议"], wait: ["等待银行人工决策"], human: ["银行决定允许、降额、退回或拒绝"] },
    "bank-decision-result": { title: "Agent 决策交接", did: ["把银行结果转成业务摘要", "保留责任边界", "准备出口商可见状态"], wait: ["等待后续业务节点读取结果"], human: ["银行备注由人工负责"] },
    "inspector-dashboard": { title: "Agent 质检任务分发", did: ["从案件生成质检任务", "提供地点与货物上下文", "标记任务优先级"], wait: ["等待质检方接收任务"], human: ["质检方决定是否接单"] },
    "inspector-task-detail": { title: "Agent 任务上下文", did: ["整理预期货物类别", "整理预期数量", "整理检查要求", "隐藏无关银行信息"], wait: ["等待质检员确认任务范围"], human: ["质检员接收或退回任务"] },
    "inspector-evidence-submit": { title: "Agent 事实录入辅助", did: ["生成结构化字段", "提示数量、包装、照片占位", "限制质检方只提交货物事实"], wait: ["等待质检方提交观察结果"], human: ["质检方对事实结论负责"] },
    "inspector-result": { title: "Agent 质检结果交接", did: ["把质检结论转成事实节点", "同步出口商可见状态", "同步银行可审摘要"], wait: ["等待后续审核流程读取"], human: ["质检方保留事实责任"] },
    "logistics-dashboard": { title: "Agent 物流证明任务分发", did: ["从案件生成运输证明任务", "提供路线和提单上下文", "标记需要的物流证明"], wait: ["等待物流方打开运输任务"], human: ["物流方确认是否可提交证明"] },
    "logistics-shipment-detail": { title: "Agent 运输上下文整理", did: ["整理起运港和目的港", "整理提单号和集装箱号", "整理证明要求", "隐藏无关融资审批信息"], wait: ["等待物流方确认运输节点"], human: ["物流方对运输事实负责"] },
    "logistics-proof-submit": { title: "Agent 物流事实录入辅助", did: ["生成提单、集装箱、ETA 字段", "提示证明文件占位", "限制物流方只提交运输事实"], wait: ["等待物流方提交证明"], human: ["物流方提交并负责物流证明"] },
    "logistics-result": { title: "Agent 物流结果交接", did: ["把物流证明转成运输事实节点", "同步银行可审摘要", "同步资金方 proof input"], wait: ["等待后续审核流程读取"], human: ["物流方保留运输事实责任"] },
    "funder-pool-dashboard": { title: "Agent 资金池候选资产整理", did: ["筛选可读候选资产", "整理 proof root", "标记池子余额", "提示 locked 候选项"], wait: ["等待资金方打开合约面板"], human: ["资金方决定是否承诺流动性"] },
    "funder-contract-console": { title: "Agent 合约交互预览", did: ["读取候选对象 hash", "读取 evidence root", "读取池子可用余额", "准备写入动作预览"], wait: ["等待资金方钱包确认"], human: ["资金方确认或取消合约动作"] },
    "funder-tx-result": { title: "Agent 交易状态解释", did: ["生成模拟交易结果", "解释 P0 未上链边界", "准备执行检查读取状态"], wait: ["等待后续执行检查"], human: ["真实产品中由资金方钱包签名"] }
  };
  var config = data[page];
  if (!config || document.getElementById("p0-agent-rail")) return;
  function list(items, className) { return items.map(function (item) { return '<li><span>' + item + '</span><span class="badge ' + className + '">' + (className === 'ok' ? 'done' : className === 'warn' ? 'waiting' : 'human') + '</span></li>'; }).join(""); }
  function injectStyle() { if (document.getElementById("p0-agent-rail-style")) return; var style = document.createElement("style"); style.id = "p0-agent-rail-style"; style.textContent = ".agent-rail{border:1px solid rgba(56,189,248,.28);background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(167,139,250,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.agent-rail .section-head{border-bottom:1px solid rgba(159,178,201,.14)}.agent-rail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.agent-rail-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.28);border-radius:12px;padding:12px}.agent-rail-card h3{margin:0 0 10px;font-size:15px}.agent-rail-card .list li{align-items:flex-start}@media(max-width:1200px){.agent-rail-grid{grid-template-columns:1fr}}"; document.head.appendChild(style); }
  function build() { var section = document.createElement("section"); section.id = "p0-agent-rail"; section.className = "section agent-rail"; section.innerHTML = '<div class="section-head"><div><h2>' + config.title + '</h2><p class="section-sub">展示 Agent 已自动完成的读取、比对、路由和摘要动作，同时明确哪些动作必须由人负责。</p></div><span class="badge agent">Agent activity</span></div><div class="content agent-rail-grid"><div class="agent-rail-card"><h3>Agent 已自动完成</h3><ul class="list">' + list(config.did, "ok") + '</ul></div><div class="agent-rail-card"><h3>Agent 正在等待</h3><ul class="list">' + list(config.wait, "warn") + '</ul></div><div class="agent-rail-card"><h3>人类必须决定</h3><ul class="list">' + list(config.human, "bad") + '</ul></div></div>'; var hero = document.querySelector(".main .hero"); if (hero && hero.parentNode) hero.parentNode.insertBefore(section, hero.nextSibling); else document.querySelector(".main")?.prepend(section); }
  function run() { injectStyle(); build(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();