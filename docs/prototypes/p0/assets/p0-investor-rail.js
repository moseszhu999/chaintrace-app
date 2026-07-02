(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"investor-dashboard":1,"investor-pool-detail":1,"investor-risk-report":1,"investor-redemption":1};
  if(!pages[page]||document.getElementById("p0-investor-rail"))return;
  var data={
    "investor-dashboard":{title:"RWA 投资人组合总览",did:["读取资产池 NAV","聚合收益和期限指标","计算保险覆盖率","标记 P0 无真实份额"],wait:["等待投资人查看资产池详情"],human:["投资人自行判断是否有兴趣继续了解"]},
    "investor-pool-detail":{title:"资产池组合披露",did:["整理应收账款组合成分","隐藏敏感原始合同","展示 proof-backed 资产摘要","标记集中度和保险状态"],wait:["等待投资人查看风险报告"],human:["投资人理解组合结构和披露边界"]},
    "investor-risk-report":{title:"风险与收益解释",did:["生成收益来源说明","计算风险敞口","识别保险覆盖和未保险资产","高亮无收益承诺"],wait:["等待投资人查看赎回规则"],human:["投资人承担投资判断责任"]},
    "investor-redemption":{title:"赎回意向和流动性约束",did:["生成 redemption intent","检查赎回队列","说明流动性窗口","记录 P0 无付款边界"],wait:["等待结算或审计视图读取"],human:["投资人理解真实赎回受限制"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-investor-rail-style"))return;var s=document.createElement("style");s.id="p0-investor-rail-style";s.textContent=".investor-rail{border:1px solid rgba(168,85,247,.30);background:linear-gradient(135deg,rgba(168,85,247,.10),rgba(34,211,238,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.investor-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.investor-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.investor-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-investor-rail";sec.className="section investor-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">投资人层只读取资产池披露、风险和赎回状态，不构成证券发行、投资建议或收益承诺。</p></div><span class="badge warn">investor disclosure</span></div><div class="content investor-grid"><div class="investor-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="investor-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="investor-card"><h3>人类必须判断</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();