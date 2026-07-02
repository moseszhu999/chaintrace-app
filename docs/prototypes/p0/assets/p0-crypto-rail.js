(function () {
  var page = document.body ? document.body.dataset.page : "";
  var enabled = {
    dashboard: true,
    new: true,
    materials: true,
    gap: true,
    inspection: true,
    funding: true,
    execution: true,
    result: true,
    "bank-dashboard": true,
    "bank-case-review": true,
    "bank-risk-decision": true,
    "bank-decision-result": true,
    "inspector-dashboard": true,
    "inspector-task-detail": true,
    "inspector-evidence-submit": true,
    "inspector-result": true
  };
  if (!enabled[page] || document.getElementById("p0-crypto-rail")) return;

  var common = {
    wallet: [
      ["Exporter wallet", "0x8F...21A", "ok"],
      ["Role-bound account", "Exporter", "ok"],
      ["Signature", "ready in P0", "warn"]
    ],
    proof: [
      ["PO SHA-256", "0xpo...84c", "ok"],
      ["Invoice SHA-256", "0xinv...2ab", "ok"],
      ["Evidence root", "0xroot...91e", "ok"]
    ],
    candidate: [
      ["Candidate ID", "RFC-P0-001", "ok"],
      ["Candidate hash", "0xcand...77f", "ok"],
      ["Registry status", "not submitted", "warn"]
    ],
    execution: [
      ["Settlement rail", "USD / USDC", "ok"],
      ["Chain action", "disabled in P0", "bad"],
      ["Disbursement", "false in P0", "bad"]
    ]
  };

  var pageNotes = {
    dashboard: "控制塔展示的是一个 crypto-native 融资候选对象，而不是普通表单。",
    new: "融资意图被准备成可签名对象，P0 只展示 signature-ready 状态。",
    materials: "贸易材料会形成证据哈希和 evidence root，P0 不上传真实链上记录。",
    gap: "缺口说明会更新候选对象状态，但不会伪造签名或事实。",
    inspection: "质检结论会被链接到证据根，形成可验证事实节点。",
    funding: "银行或 DeFi 路径读取候选对象摘要，不直接读取原始文件夹。",
    execution: "执行检查展示链上准备状态，但 P0 不发起交易。",
    result: "结果页展示业务完成状态和候选对象最终摘要。",
    "bank-dashboard": "银行看到的是可验证的候选案件队列，不是普通附件列表。",
    "bank-case-review": "银行核验证据哈希、事实摘要和候选对象状态。",
    "bank-risk-decision": "银行决策写入业务摘要，不替代链上执行。",
    "bank-decision-result": "银行结果会影响候选对象状态，但 P0 不提交 registry。",
    "inspector-dashboard": "质检任务与候选对象关联，但质检方不拥有融资对象。",
    "inspector-task-detail": "质检方查看任务上下文，不操作钱包签名或融资候选对象。",
    "inspector-evidence-submit": "质检事实会形成可链接的 proof input。",
    "inspector-result": "质检结论成为候选对象中的独立事实节点。"
  };

  function badge(kind) {
    if (kind === "ok") return "ok";
    if (kind === "warn") return "warn";
    return "bad";
  }

  function renderRows(rows) {
    return rows.map(function (row) {
      return '<li><span><span class="small muted">' + row[0] + '</span><br><span class="strong">' + row[1] + '</span></span><span class="badge ' + badge(row[2]) + '">' + row[2] + '</span></li>';
    }).join("");
  }

  function injectStyle() {
    if (document.getElementById("p0-crypto-rail-style")) return;
    var style = document.createElement("style");
    style.id = "p0-crypto-rail-style";
    style.textContent = ".crypto-rail{border:1px solid rgba(52,211,153,.28);background:linear-gradient(135deg,rgba(52,211,153,.10),rgba(56,189,248,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.crypto-rail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.crypto-rail-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}.crypto-rail-card h3{margin:0 0 10px;font-size:15px}.crypto-rail .list li{align-items:flex-start}@media(max-width:1200px){.crypto-rail-grid{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  }

  function build() {
    var section = document.createElement("section");
    section.id = "p0-crypto-rail";
    section.className = "section crypto-rail";
    section.innerHTML = '<div class="section-head"><div><h2>Crypto Native Proof Rail</h2><p class="section-sub">' + (pageNotes[page] || "ChainTrace 将贸易事实整理成钱包绑定、哈希可验证、可签名、可接链上路径的融资候选对象。") + '</p></div><span class="badge ok">wallet + proof + candidate</span></div><div class="content crypto-rail-grid"><div class="crypto-rail-card"><h3>Wallet Identity</h3><ul class="list">' + renderRows(common.wallet) + '</ul></div><div class="crypto-rail-card"><h3>Evidence Proof</h3><ul class="list">' + renderRows(common.proof) + '</ul></div><div class="crypto-rail-card"><h3>Receivable Candidate</h3><ul class="list">' + renderRows(common.candidate) + '</ul></div><div class="crypto-rail-card"><h3>Execution Readiness</h3><ul class="list">' + renderRows(common.execution) + '</ul></div></div>';
    var agent = document.getElementById("p0-agent-rail");
    if (agent && agent.parentNode) {
      agent.parentNode.insertBefore(section, agent.nextSibling);
      return;
    }
    var hero = document.querySelector(".main .hero");
    if (hero && hero.parentNode) hero.parentNode.insertBefore(section, hero.nextSibling);
    else document.querySelector(".main")?.prepend(section);
  }

  function run() {
    injectStyle();
    build();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
