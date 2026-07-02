(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"audit-dashboard":1,"audit-case-trail":1,"audit-proof-view":1,"audit-export":1};
  if(!pages[page]||document.getElementById("p0-audit-rail"))return;
  var data={
    "audit-dashboard":{title:"审计总览轨迹",human:["18 条人类责任动作", "出口商/买方/银行等动作分开记录"],agent:["27 条 Agent 自动动作", "检测差异、生成待办、准备摘要"],system:["34 个 proof 对象", "0 笔真实链上交易"]},
    "audit-case-trail":{title:"单案件责任链",human:["出口商确认融资意图", "买方确认付款义务", "银行人工风控"],agent:["Agent 检测 USD 8k 差异", "Agent 创建出口商待办"],system:["候选对象仍未上链", "P0 不发真实交易"]},
    "audit-proof-view":{title:"证明与动作拆分",human:["Human Action 独立展示", "责任方动作不被 Agent 混淆"],agent:["Agent Action 可解释", "每个自动处理有摘要"],system:["System / Contract State 单独列出", "registry / wallet / pool 均为 P0 禁用"]},
    "audit-export":{title:"审计摘要导出预览",human:["责任方动作进入摘要", "可给银行/合规/内审查看"],agent:["Agent 解释进入摘要", "避免黑箱 AI"],system:["P0 非执行边界高亮", "不生成真实法律文件"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-audit-rail-style"))return;var s=document.createElement("style");s.id="p0-audit-rail-style";s.textContent=".audit-rail{border:1px solid rgba(129,140,248,.30);background:linear-gradient(135deg,rgba(129,140,248,.12),rgba(52,211,153,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.audit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.audit-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.audit-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'human':k==='agent'?'agent':'system')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-audit-rail";sec.className="section audit-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">审计层只读追踪 Human Action、Agent Action 和 System / Contract State，不修改任何业务事实。</p></div><span class="badge info">audit trail</span></div><div class="content audit-grid"><div class="audit-card"><h3>Human Action</h3><ul class="list">'+li(cfg.human,"ok")+'</ul></div><div class="audit-card"><h3>Agent Action</h3><ul class="list">'+li(cfg.agent,"agent")+'</ul></div><div class="audit-card"><h3>System / Contract State</h3><ul class="list">'+li(cfg.system,"warn")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();