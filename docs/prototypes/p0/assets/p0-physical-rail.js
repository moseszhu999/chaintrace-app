(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"physical-dashboard":1,"warehouse-goods-receipt":1,"port-customs-clearance":1,"physical-result":1};
  if(!pages[page]||document.getElementById("p0-physical-rail"))return;
  var data={
    "physical-dashboard":{title:"物理节点证明总览",did:["聚合仓库、港口和放行参考节点","匹配物流与质检上下文","识别待补物理节点","记录 P0 不接真实系统"],wait:["等待用户查看仓库证明"],human:["判断物理节点是否足以支持贸易事实"]},
    "warehouse-goods-receipt":{title:"仓库入库 / 出库证明",did:["对齐入库数量和装箱单","读取出库记录和封条号","标记需要港口匹配","保留质检责任边界"],wait:["等待港口节点匹配封条和装柜"],human:["仓库或运营人员确认物理记录"]},
    "port-customs-clearance":{title:"港口与放行参考证明",did:["匹配集装箱和封条号","记录 gate-in 与装船参考","标记放行信息为参考","阻止官方文件误用"],wait:["等待记录物理节点结果"],human:["物流和合规人员确认用途边界"]},
    "physical-result":{title:"物理节点结果交接",did:["记录仓库和港口支持证明","同步物流/银行/保险可读摘要","同步审计摘要","记录无真实官方动作边界"],wait:["等待后续角色读取"],human:["下游角色自行决定是否采纳支持证明"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-physical-rail-style"))return;var s=document.createElement("style");s.id="p0-physical-rail-style";s.textContent=".physical-rail{border:1px solid rgba(245,158,11,.30);background:linear-gradient(135deg,rgba(245,158,11,.11),rgba(34,211,238,.07));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.physical-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.physical-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.physical-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-physical-rail";sec.className="section physical-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">物理节点层只提供仓库、港口和放行参考证明，不替代物流、质检、买方或官方文件。</p></div><span class="badge warn">physical proof preview</span></div><div class="content physical-grid"><div class="physical-card"><h3>系统已自动完成</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="physical-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="physical-card"><h3>人类必须判断</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();