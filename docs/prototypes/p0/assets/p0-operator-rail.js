(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"operator-dashboard":1,"operator-case-monitor":1,"operator-rule-control":1,"operator-incident-result":1};
  if(!pages[page]||document.getElementById("p0-operator-rail"))return;
  var data={
    "operator-dashboard":["聚合全局案件状态","识别异常队列","显示 Agent 自动处理结果","提示人工运营入口"],
    "operator-case-monitor":["合并出口商、买方、物流、质检状态","读取 proof map","定位当前卡点","给出恢复条件"],
    "operator-rule-control":["读取规则状态","读取暂停范围","准备运营动作草稿","保留责任边界"],
    "operator-incident-result":["记录运营动作","生成审计摘要","确认未修改业务事实","同步后续视图"]
  };
  var notes={"operator-dashboard":"平台运营看全局，不替任何业务方提交事实。","operator-case-monitor":"Operator OS 把多方事实流合并成一个可恢复的案件状态。","operator-rule-control":"平台可以控制流程门禁，但不能伪造贸易、物流、质检或买方事实。","operator-incident-result":"运营动作形成审计记录，而不是链上交易或业务事实变更。"};
  function st(){if(document.getElementById("p0-operator-rail-style"))return;var s=document.createElement("style");s.id="p0-operator-rail-style";s.textContent=".operator-rail{border:1px solid rgba(251,191,36,.30);background:linear-gradient(135deg,rgba(251,191,36,.10),rgba(56,189,248,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.operator-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}.operator-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.operator-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'guard':'audit')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-operator-rail";sec.className="section operator-rail";sec.innerHTML='<div class="section-head"><div><h2>Operator OS Control Rail</h2><p class="section-sub">'+notes[page]+'</p></div><span class="badge warn">platform operator</span></div><div class="content operator-grid"><div class="operator-card"><h3>Operator 已读取</h3><ul class="list">'+li(data[page],"ok")+'</ul></div><div class="operator-card"><h3>平台门禁</h3><ul class="list">'+li(["规则状态可见","暂停范围可见","恢复条件可见","业务事实只读"],"warn")+'</ul></div><div class="operator-card"><h3>P0 边界</h3><ul class="list">'+li(["不改真实后台","不写链上 registry","不替业务方签名","不伪造事实"],"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();