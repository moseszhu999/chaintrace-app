(function(){
  var page=document.body?document.body.dataset.page:"";
  var pages={"pilot-scope":1,"pilot-inputs":1,"pilot-success-criteria":1,"pilot-next-ask":1};
  if(!pages[page]||document.getElementById("p0-pilot-rail"))return;
  var data={
    "pilot-scope":{title:"试点范围收口",did:["定义 2 周轻量试点","限制为 1-2 个脱敏案例","明确 2-3 个角色参与","排除真实资金和生产集成"],wait:["等待客户确认试点范围"],human:["销售推动客户给样例和联系人"]},
    "pilot-inputs":{title:"客户输入清单",did:["整理最低输入要求","标记可脱敏字段","排除敏感原件和 API key","准备发送给客户"],wait:["等待客户提供一个案例和两个联系人"],human:["客户确认材料可用性"]},
    "pilot-success-criteria":{title:"试点成功标准",did:["定义 proof mapping 目标","定义 gate explanation 目标","定义 P1 scope 输出","说明失败也有价值"],wait:["等待客户接受成功标准"],human:["双方确认是否进入 P1"]},
    "pilot-next-ask":{title:"下一步行动收口",did:["生成会议收口话术","定义两周时间线","定义 P0/P1/P2 商业门禁","避免继续免费发散"],wait:["等待客户给出试点确认"],human:["销售约定回看会议和 P1 决策点"]}
  };
  var cfg=data[page];
  function st(){if(document.getElementById("p0-pilot-rail-style"))return;var s=document.createElement("style");s.id="p0-pilot-rail-style";s.textContent=".pilot-rail{border:1px solid rgba(16,185,129,.34);background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(251,191,36,.08));border-radius:14px;box-shadow:var(--shadow);overflow:hidden}.pilot-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.pilot-card{border:1px solid rgba(159,178,201,.15);background:rgba(7,17,31,.30);border-radius:12px;padding:12px}@media(max-width:1200px){.pilot-grid{grid-template-columns:1fr}}";document.head.appendChild(s)}
  function li(arr,k){return arr.map(function(x){return'<li><span>'+x+'</span><span class="badge '+k+'">'+(k==='ok'?'done':k==='warn'?'waiting':'human')+'</span></li>'}).join("")}
  function run(){st();var sec=document.createElement("section");sec.id="p0-pilot-rail";sec.className="section pilot-rail";sec.innerHTML='<div class="section-head"><div><h2>'+cfg.title+'</h2><p class="section-sub">Pilot 层把企业演示转成可执行下一步：样例、联系人、成功标准、P1 决策。</p></div><span class="badge ok">next ask</span></div><div class="content pilot-grid"><div class="pilot-card"><h3>系统已整理</h3><ul class="list">'+li(cfg.did,"ok")+'</ul></div><div class="pilot-card"><h3>正在等待</h3><ul class="list">'+li(cfg.wait,"warn")+'</ul></div><div class="pilot-card"><h3>人类必须推进</h3><ul class="list">'+li(cfg.human,"bad")+'</ul></div></div>';var hero=document.querySelector(".main .hero");if(hero&&hero.parentNode)hero.parentNode.insertBefore(sec,hero.nextSibling);else document.querySelector(".main")?.prepend(sec)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();