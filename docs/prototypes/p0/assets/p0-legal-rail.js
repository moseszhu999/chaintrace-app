(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"legal-dashboard":1,"legal-case-review":1,"legal-evidence-package":1,"legal-result":1};
  if(!pages[page]||document.getElementById("p0-legal-rail"))return;
  var data={
    "legal-dashboard":{title:"法务升级队列",did:["读取未关闭争议","识别合同和证据缺口","聚合相关 proof","记录 P0 无真实法律动作"],wait:["等待法务人员打开案件"],human:["法务人员判断是否需要证据包"]},
    "legal-case-review":{title:"合同与争议核验",did:["对齐合同、PO、发票和质检结果","标记缺失条款","生成责任方摘要","保留原始事实不可修改"],wait:["等待生成证据包"],human:["判断争议是否需要补材料或升级"]},
    "legal-evidence-package":{title:"证据包整理",did:["生成证据包索引","区分事实、解释和建议","标记缺失材料","准备审计摘要读取"],wait:["等待记录法务处理结果"],human:["确认证据包是否可交给外部专业人士审阅"]},
    "legal-result":{title:"法务结果交接",did:["记录证据包 ready","记录无法律提交","同步争议台和审计摘要","保留事实不变"],wait:["等待后续补材料或审计读取"],human:["真实法律判断由专业机构完成"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-legal-rail-style"))return;var s=document.createElement("style");s.id="p0-legal-rail-style";s.textContent=".legal-rail{border:1px solid rgba(244,114,182,.30);background:linear-gradient(135deg,rgba(244,114,182,.10),rgba(245,158,11,.07));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.legal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.legal-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.legal-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-legal-rail";sec.className="section legal-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">法务层只整理证据、时间线和责任边界，不提供法律意见、不发起真实法律流程。</p></div><span class="badge warn">legal evidence preview</span></div><div class="content legal-grid"><div class="legal-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="legal-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="legal-card"><h3>人类必须判断</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();