(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"dispute-dashboard":1,"dispute-case-detail":1,"dispute-resolution-action":1,"dispute-result":1};
  if(!pages[page]||document.getElementById("p0-dispute-rail"))return;
  var data={
    "dispute-dashboard":{title:"争议队列自动归类",did:["聚合发票差异、质检争议、物流延误", "识别相关责任方", "冻结高风险案件", "生成可处理争议项"],wait:["等待授权人员打开争议"],human:["决定补证、恢复、冻结或升级"]},
    "dispute-case-detail":{title:"争议事实图谱",did:["对齐 PO、发票、买方确认和银行风险备注", "标记事实责任方", "识别是否需要补证", "生成冲突摘要"],wait:["等待人工选择处理动作"],human:["判断差异归因和恢复条件"]},
    "dispute-resolution-action":{title:"争议处理动作预览",did:["生成处理动作草稿", "生成 conflict map hash", "确认原始事实不被修改", "准备恢复条件"],wait:["等待人工记录处理结果"],human:["记录裁定、补证要求或升级路径"]},
    "dispute-result":{title:"争议结果交接",did:["记录争议结果", "同步银行和平台视图", "保留审计摘要", "解除或维持流程门禁"],wait:["等待后续角色读取结果"],human:["银行继续风险决策，平台继续监控"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-dispute-rail-style"))return;var s=document.createElement("style");s.id="p0-dispute-rail-style";s.textContent=".dispute-rail{border:1px solid rgba(248,113,113,.30);background:linear-gradient(135deg,rgba(248,113,113,.10),rgba(251,191,36,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.dispute-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.dispute-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.dispute-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-dispute-rail";sec.className="section dispute-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">争议处理台只冻结、归因、补证和恢复流程，不修改任何角色提交的原始事实。</p></div><span class="badge warn">dispute workflow</span></div><div class="content dispute-grid"><div class="dispute-card"><h3>Agent 已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="dispute-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="dispute-card"><h3>人类必须决定</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();