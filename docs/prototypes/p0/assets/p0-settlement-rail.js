(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"settlement-dashboard":1,"settlement-route":1,"settlement-reconciliation":1,"settlement-result":1};
  if(!pages[page]||document.getElementById("p0-settlement-rail"))return;
  var data={
    "settlement-dashboard":{title:"结算总览轨迹",did:["读取资金池承诺状态","读取候选对象额度","识别 USD / USDC 双路径","标记 P0 不执行资金动作"],wait:["等待用户查看结算路径"],human:["资金方和合规人员确认真实结算前置条件"]},
    "settlement-route":{title:"USD / USDC 路径预览",did:["生成 Pool → Exporter 路线","展示源钱包和目标钱包","检查 buyer ack / bank cap / pool pause","阻止真实钱包交易"],wait:["等待对账视图读取路径"],human:["真实产品中由资金方钱包确认交易"]},
    "settlement-reconciliation":{title:"链上 / 链下对账预览",did:["对齐 candidate cap 与预期转账金额","标记 pool tx / bank payment 均为空","生成非执行对账说明","同步审计摘要"],wait:["等待记录结算结果"],human:["合规或财务确认对账口径"]},
    "settlement-result":{title:"结算结果边界记录",did:["记录 route-ready 状态","记录无真实转账","记录无银行付款","准备审计摘要读取"],wait:["等待审计导出或出口商结果页读取"],human:["确认 P0 未放款叙事边界"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-settlement-rail-style"))return;var s=document.createElement("style");s.id="p0-settlement-rail-style";s.textContent=".settlement-rail{border:1px solid rgba(34,211,238,.30);background:linear-gradient(135deg,rgba(34,211,238,.11),rgba(52,211,153,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.settlement-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.settlement-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.settlement-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-settlement-rail";sec.className="section settlement-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">结算层只展示 route-ready、USDC 路径、法币对账和非执行边界，不触发真实资金流。</p></div><span class="badge warn">settlement preview</span></div><div class="content settlement-grid"><div class="settlement-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="settlement-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="settlement-card"><h3>人类必须确认</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();