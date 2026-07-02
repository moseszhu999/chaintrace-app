(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"proof-graph-dashboard":1,"proof-dependency-map":1,"case-state-machine":1,"proof-graph-result":1};
  if(!pages[page]||document.getElementById("p0-proof-graph-rail"))return;
  var data={
    "proof-graph-dashboard":{title:"证明图谱核心状态",did:["聚合 31 个 proof 节点","计算 9 个 passed gate","识别 2 个 blocked gate","输出 disbursement=false"],wait:["等待查看 proof 依赖关系"],human:["判断是否继续人工审核"]},
    "proof-dependency-map":{title:"Proof 依赖关系解释",did:["构建 candidate hash 依赖图","区分原始 proof 与解释 proof","识别 KYB 条件缺口","识别结算执行阻塞"],wait:["等待状态机读取依赖结果"],human:["确认条件缺口和人工责任"]},
    "case-state-machine":{title:"案件状态机读取 gate",did:["生成 REVIEW_ASSISTANT 状态","允许继续人工审核","阻止真实执行路径","记录 P0 非执行边界"],wait:["等待查看状态解释结果"],human:["银行、KYB、资金方继续人工决定"]},
    "proof-graph-result":{title:"状态解释结果",did:["解释为什么可以继续 review","解释为什么不能放款","同步审计摘要","保留原始 proof 不变"],wait:["等待银行或审计读取"],human:["最终风险动作仍由人类负责"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-proof-graph-rail-style"))return;var s=document.createElement("style");s.id="p0-proof-graph-rail-style";s.textContent=".proof-rail{border:1px solid rgba(99,102,241,.34);background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(52,211,153,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.proof-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.proof-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.proof-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-proof-graph-rail";sec.className="section proof-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">核心状态层把 proof、gate、state 和 explanation 串起来，明确当前能做什么、不能做什么、为什么。</p></div><span class="badge warn">core state layer</span></div><div class="content proof-grid"><div class="proof-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="proof-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="proof-card"><h3>人类必须判断</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();