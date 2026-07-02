(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"oracle-dashboard":1,"oracle-feed-monitor":1,"oracle-data-proof":1,"oracle-result":1};
  if(!pages[page]||document.getElementById("p0-oracle-rail"))return;
  var data={
    "oracle-dashboard":{title:"外部数据源总览",did:["读取外部数据源目录","标记 feed 用途边界","识别过期数据源","记录 P0 无实时 API"],wait:["等待用户查看 feed 监控"],human:["判断哪些数据可以作为参考输入"]},
    "oracle-feed-monitor":{title:"Feed 新鲜度与用途监控",did:["展示汇率、船期、港口和信用参考","标记 stale feed","生成数据源摘要","阻止数据直接触发动作"],wait:["等待用户查看数据证明"],human:["判断 stale feed 是否可用"]},
    "oracle-data-proof":{title:"数据证明与使用边界",did:["生成 feed proof hash","记录 allowed use","记录 blocked use","绑定 audit trail"],wait:["等待记录 Oracle 结果"],human:["确认外部数据不能替代角色事实"]},
    "oracle-result":{title:"Oracle 结果交接",did:["记录 reference bundle","同步银行/保险/投资人/结算可读摘要","记录无自动触发","同步审计摘要"],wait:["等待下游角色读取"],human:["下游角色自行决定是否采用参考数据"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-oracle-rail-style"))return;var s=document.createElement("style");s.id="p0-oracle-rail-style";s.textContent=".oracle-rail{border:1px solid rgba(59,130,246,.30);background:linear-gradient(135deg,rgba(59,130,246,.10),rgba(34,211,238,.07));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.oracle-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.oracle-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.oracle-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-oracle-rail";sec.className="section oracle-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">Oracle 层只提供外部参考数据和证明边界，不替代角色签名事实，也不触发真实交易。</p></div><span class="badge warn">oracle preview</span></div><div class="content oracle-grid"><div class="oracle-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="oracle-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="oracle-card"><h3>人类必须判断</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();