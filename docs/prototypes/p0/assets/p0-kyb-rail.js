(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"kyb-dashboard":1,"kyb-entity-review":1,"kyb-bank-account":1,"kyb-result":1};
  if(!pages[page]||document.getElementById("p0-kyb-rail"))return;
  var data={
    "kyb-dashboard":{title:"KYB 企业验证队列",did:["识别待验证企业","关联钱包角色和企业角色","读取候选对象合规状态","标记 P0 演示边界"],wait:["等待合规人员打开企业核验"],human:["合规人员决定是否进入身份复核"]},
    "kyb-entity-review":{title:"企业身份核验辅助",did:["对齐企业名称和出口商资料","检查钱包角色绑定","标记授权签署人缺口","隐藏敏感身份信息"],wait:["等待账户匹配检查"],human:["合规人员判断身份资料是否足够"]},
    "kyb-bank-account":{title:"账户匹配检查预览",did:["检查账户名称匹配","生成合规检查占位结果","标记地区风险状态","准备合规决策草稿"],wait:["等待合规人员记录 KYB 结果"],human:["合规人员确认通过、补材料或拒绝"]},
    "kyb-result":{title:"KYB 结果交接",did:["记录条件通过","同步银行和资金方可读合规输入","同步审计摘要","记录 P0 演示边界"],wait:["等待后续金融流程读取"],human:["生产环境补齐授权签署人证明"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-kyb-rail-style"))return;var s=document.createElement("style");s.id="p0-kyb-rail-style";s.textContent=".kyb-rail{border:1px solid rgba(14,165,233,.30);background:linear-gradient(135deg,rgba(14,165,233,.11),rgba(52,211,153,.07));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.kyb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.kyb-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.kyb-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-kyb-rail";sec.className="section kyb-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">KYB 层只验证企业身份、账户匹配和合规输入，不修改贸易事实或审批融资。</p></div><span class="badge warn">KYB preview</span></div><div class="content kyb-grid"><div class="kyb-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="kyb-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="kyb-card"><h3>人类必须判断</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();