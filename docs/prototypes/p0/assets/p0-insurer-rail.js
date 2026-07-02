(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"insurer-dashboard":1,"insurer-risk-review":1,"insurer-coverage-quote":1,"insurer-result":1};
  if(!pages[page]||document.getElementById("p0-insurer-rail"))return;
  var data={
    "insurer-dashboard":{title:"保险承保任务分发",did:["读取可承保候选对象","聚合买方/物流/质检 proof","标记争议和审计状态","生成承保队列"],wait:["等待保险方打开风险核验"],human:["保险方决定是否进入核保"]},
    "insurer-risk-review":{title:"保险风险核验辅助",did:["读取买方确认","读取物流和质检证明","读取争议处理结果","生成风险分类和承保建议"],wait:["等待保险方选择承保方案"],human:["保险方对承保判断负责"]},
    "insurer-coverage-quote":{title:"承保方案预览",did:["生成建议承保额度","标记除外责任","准备费率和前置条件","明确 P0 不出保单"],wait:["等待保险方记录 quote"],human:["保险方确认额度、费率和除外责任"]},
    "insurer-result":{title:"保险结果交接",did:["记录 conditional quote","同步银行和资金方可读摘要","同步审计摘要","记录无真实保单边界"],wait:["等待后续风控或审计读取"],human:["保险方确认真实产品中的承保责任"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-insurer-rail-style"))return;var s=document.createElement("style");s.id="p0-insurer-rail-style";s.textContent=".insurer-rail{border:1px solid rgba(34,197,94,.30);background:linear-gradient(135deg,rgba(34,197,94,.10),rgba(56,189,248,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.insurer-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.insurer-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.insurer-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-insurer-rail";sec.className="section insurer-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">保险层只读取 proof、生成承保建议和风险缓释摘要，不生成真实保单或理赔责任。</p></div><span class="badge warn">insurance preview</span></div><div class="content insurer-grid"><div class="insurer-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="insurer-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="insurer-card"><h3>人类必须决定</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();