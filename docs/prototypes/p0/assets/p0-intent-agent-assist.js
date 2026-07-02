(function () {
  if (!document.body || document.body.dataset.page !== "new") return;
  if (document.getElementById("p0-intent-agent-assist")) return;

  function style() {
    if (document.getElementById("p0-intent-agent-assist-style")) return;
    var s = document.createElement("style");
    s.id = "p0-intent-agent-assist-style";
    s.textContent = ".intent-agent-assist{border:1px solid rgba(167,139,250,.30);background:linear-gradient(135deg,rgba(167,139,250,.12),rgba(56,189,248,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.intent-agent-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}.intent-agent-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:14px}.intent-json{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.55;white-space:pre-wrap;color:var(--text);background:rgba(3,7,18,.38);border:1px solid rgba(159,178,201,.13);border-radius:10px;padding:12px}@media(max-width:1100px){.intent-agent-grid{grid-template-columns:1fr}}";
    document.head.appendChild(s);
  }

  function makeSection() {
    var section = document.createElement("section");
    section.id = "p0-intent-agent-assist";
    section.className = "section intent-agent-assist";
    section.innerHTML = '<div class="section-head"><div><h2>Agent-assisted Intent Draft</h2><p class="section-sub">Agent 可以先根据出口商资料、历史偏好和贸易上下文预生成融资意图。出口商负责确认、修改和签名。</p></div><span class="badge agent">agent prepared</span></div><div class="content intent-agent-grid"><div class="intent-agent-card"><div class="card-title">Agent 已预填草稿</div><ul class="list"><li><span>融资类型</span><span class="badge ok">出货后应收账款融资</span></li><li><span>建议金额</span><span class="badge info">USD 96,000</span></li><li><span>结算路径</span><span class="badge ok">USD / USDC</span></li><li><span>买方识别</span><span class="badge ok">Northstar Retail GmbH</span></li><li><span>下一步</span><span class="badge warn">等待出口商确认</span></li></ul><div class="action-row"><button class="action primary" type="button" data-intent-fill>使用 Agent 草稿</button><button class="action" type="button" data-intent-explain>查看生成理由</button></div><p class="notice warn" style="margin-top:12px"><strong>边界：</strong>Agent 只能预填和解释，不能替出口商签名，不能提交融资意图。</p></div><div class="intent-agent-card"><div class="card-title">Signature-ready candidate</div><div class="intent-json">{\n  "candidateType": "receivable_financing_intent",\n  "exporterWallet": "0x8F...21A",\n  "buyer": "Northstar Retail GmbH",\n  "requestedAmount": "96000",\n  "settlementRail": "USD/USDC",\n  "agentConfidence": "medium-high",\n  "signatureStatus": "pending_exporter_signature",\n  "p0Boundary": "no_real_signature_no_chain_tx"\n}</div></div></div>';
    return section;
  }

  function bind() {
    var fill = document.querySelector("[data-intent-fill]");
    if (fill) {
      fill.addEventListener("click", function () {
        var note = document.querySelector("textarea.textarea");
        if (note) note.value = "Agent prepared draft: smart wearable shipment under confirmed purchase order. Requested amount is based on 80% of the USD 120,000 PO baseline, with USD/USDC settlement preference from exporter profile.";
        fill.textContent = "已应用 Agent 草稿";
        fill.classList.add("disabled");
      });
    }
    var explain = document.querySelector("[data-intent-explain]");
    if (explain) {
      explain.addEventListener("click", function () {
        alert("Agent generation reason:\n1. Exporter profile prefers post-shipment receivable financing.\n2. Buyer and goods category are reused from recent trade context.\n3. USD 96,000 equals 80% of PO baseline USD 120,000.\n4. Signature is still required from exporter wallet.");
      });
    }
  }

  function run() {
    style();
    var target = document.getElementById("p0-crypto-rail") || document.getElementById("p0-agent-rail") || document.querySelector(".main .hero");
    var section = makeSection();
    if (target && target.parentNode) target.parentNode.insertBefore(section, target.nextSibling);
    else document.querySelector(".main")?.prepend(section);
    bind();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
