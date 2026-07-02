(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"enterprise-demo-route":1,"demo-executive-3min":1,"demo-operator-8min":1,"demo-full-15min":1};
  if(!pages[page]||document.getElementById("p0-sales-demo-rail"))return;
  var data={
    "enterprise-demo-route":{title:"销售路线选择器",did:["把几十个页面收成 3 条路线","按听众和时长选择演示","统一 proof-to-capital 主线","保留 P0 非执行边界"],wait:["等待选择 3 / 8 / 15 分钟路线"],human:["销售根据客户身份选择路线"]},
    "demo-executive-3min":{title:"3 分钟高管路线",did:["只保留 Proof Graph、状态机和审计","突出战略价值","避免逐页展示","准备 pilot ask"],wait:["等待客户确认是否继续 pilot"],human:["销售提出 2 周脱敏案例 pilot"]},
    "demo-operator-8min":{title:"8 分钟运营路线",did:["串联角色门禁、Agent 辅助和多方 proof","展示异常进入人工处理","展示审计追责","不打开所有页面"],wait:["等待客户指出第一批 pilot 角色"],human:["运营/风控确认真实缺口场景"]},
    "demo-full-15min":{title:"15 分钟完整路线",did:["串联 exporter 到 proof graph","覆盖 KYB、Oracle、物理节点和金融侧","展示争议/法务/审计收口","明确 pilot 输入输出"],wait:["等待客户提供脱敏样例"],human:["客户确认集成范围和优先角色"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-sales-demo-rail-style"))return;var s=document.createElement("style");s.id="p0-sales-demo-rail-style";s.textContent=".sales-demo-rail{border:1px solid rgba(251,191,36,.34);background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(99,102,241,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.sales-demo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.sales-demo-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.sales-demo-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-sales-demo-rail";sec.className="section sales-demo-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">销售路线层把 P0 从页面集合收束成可讲、可控、可成交的企业演示路线。</p></div><span class="badge ok">sales route</span></div><div class="content sales-demo-grid"><div class="sales-demo-card"><h3>系统已整理</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="sales-demo-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="sales-demo-card"><h3>人类必须完成</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();