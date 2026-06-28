import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const traceNodes = [
  {
    id: "UY-BEEF-01",
    titleEn: "Ranch and animal identity",
    titleZh: "牧场与牛只身份",
    locationEn: "Tacuarembó, Uruguay",
    locationZh: "乌拉圭塔夸伦博牧场",
    evidenceEn: "Ranch registration, animal ID, feeding record, health status, movement permit.",
    evidenceZh: "牧场登记、牛只编号、饲养记录、健康状态、转场许可。",
    riskEn: "The importer cannot verify whether the animal really came from an approved origin.",
    riskZh: "进口商无法确认牛只是否真的来自合规来源。",
  },
  {
    id: "UY-BEEF-02",
    titleEn: "Slaughter and quarantine inspection",
    titleZh: "屠宰与检疫检验",
    locationEn: "Approved meat plant, Uruguay",
    locationZh: "乌拉圭合规屠宰加工厂",
    evidenceEn: "Plant approval, slaughter lot, veterinary inspection, carcass grade, sanitary certificate draft.",
    evidenceZh: "工厂资质、屠宰批次、兽医检验、胴体等级、卫生证书草稿。",
    riskEn: "Batch mixing can break the chain between animal origin and exported meat cartons.",
    riskZh: "批次混装会切断牛只来源与出口箱肉之间的关系。",
  },
  {
    id: "UY-BEEF-03",
    titleEn: "Cutting, packing, and carton labels",
    titleZh: "分割、包装与箱标",
    locationEn: "Cold processing line",
    locationZh: "冷链分割包装线",
    evidenceEn: "Cut type, production date, carton label, net weight, storage temperature, QR or lot code.",
    evidenceZh: "部位、生产日期、箱标、净重、仓储温度、二维码或批次码。",
    riskEn: "A carton label may be copied, altered, or disconnected from the production lot.",
    riskZh: "箱标可能被复制、篡改，或与真实生产批次脱节。",
  },
  {
    id: "UY-BEEF-04",
    titleEn: "Cold-chain container loading",
    titleZh: "冷链集装箱装柜",
    locationEn: "Montevideo cold warehouse",
    locationZh: "蒙得维的亚冷库",
    evidenceEn: "Container number, seal number, loading photos, pallet list, temperature logger start record.",
    evidenceZh: "柜号、封条号、装柜照片、托盘清单、温度记录仪启动记录。",
    riskEn: "A temperature break or wrong seal can make the shipment commercially risky.",
    riskZh: "断冷或封条异常会让整票货产生商业风险。",
  },
  {
    id: "UY-BEEF-05",
    titleEn: "Ocean shipping and documents",
    titleZh: "海运与单证",
    locationEn: "Montevideo → China port",
    locationZh: "蒙得维的亚港 → 中国港口",
    evidenceEn: "Bill of lading, invoice, packing list, certificate of origin, sanitary certificate, voyage data.",
    evidenceZh: "提单、发票、装箱单、原产地证、卫生证书、航次信息。",
    riskEn: "Trade finance or customs review can stall if documents do not reconcile.",
    riskZh: "单证不一致会导致融资、清关或验货流程卡住。",
  },
  {
    id: "UY-BEEF-06",
    titleEn: "China customs, CIQ, and bonded warehouse",
    titleZh: "中国海关、检验检疫与保税仓",
    locationEn: "Shanghai / Tianjin / Shenzhen port scenario",
    locationZh: "上海 / 天津 / 深圳口岸场景",
    evidenceEn: "Import declaration, inspection release, tax record, warehouse entry, temperature handover.",
    evidenceZh: "进口报关、检验放行、税费记录、入库单、温度交接记录。",
    riskEn: "The downstream buyer may not know whether the imported beef cleared properly.",
    riskZh: "下游买家无法快速判断这批牛肉是否真实合规入境。",
  },
  {
    id: "UY-BEEF-07",
    titleEn: "Distribution to restaurant or retailer",
    titleZh: "分销到餐饮或零售",
    locationEn: "Importer warehouse → downstream buyer",
    locationZh: "进口商仓库 → 下游买家",
    evidenceEn: "Sales order, delivery note, receiving confirmation, acceptance record, final QR trace page.",
    evidenceZh: "销售订单、出库单、签收单、验收记录、终端二维码溯源页。",
    riskEn: "The final buyer sees a brand claim but not the full fact chain behind it.",
    riskZh: "终端买家看到品牌宣传，却看不到背后的完整事实链。",
  },
];

const proofPacks = [
  {
    nameEn: "Origin Proof Pack",
    nameZh: "原产地证明包",
    itemsEn: ["Ranch record", "Animal ID", "Movement permit", "Origin certificate"],
    itemsZh: ["牧场记录", "牛只编号", "转场许可", "原产地证"],
    status: "Ready",
  },
  {
    nameEn: "Processing Proof Pack",
    nameZh: "加工证明包",
    itemsEn: ["Plant approval", "Slaughter lot", "Inspection result", "Carton label"],
    itemsZh: ["工厂资质", "屠宰批次", "检验结果", "箱标"],
    status: "Ready",
  },
  {
    nameEn: "Cold-chain Proof Pack",
    nameZh: "冷链证明包",
    itemsEn: ["Container number", "Seal number", "Loading photo", "Temperature logger"],
    itemsZh: ["柜号", "封条号", "装柜照片", "温度记录仪"],
    status: "Missing evidence",
  },
  {
    nameEn: "China Import Proof Pack",
    nameZh: "中国进口证明包",
    itemsEn: ["Customs declaration", "CIQ release", "Tax record", "Warehouse entry"],
    itemsZh: ["报关单", "检验放行", "税费记录", "入库单"],
    status: "Pending",
  },
];

const stakeholderViews = [
  {
    roleEn: "Uruguayan exporter",
    roleZh: "乌拉圭出口商",
    valueEn: "Shows that the beef comes from a traceable origin and an approved processing chain.",
    valueZh: "证明牛肉来自可追溯来源和合规加工链。",
  },
  {
    roleEn: "Chinese importer",
    roleZh: "中国进口商",
    valueEn: "Connects documents, container data, and customs status before paying or distributing goods.",
    valueZh: "在付款和分销前，把单证、柜号、冷链和清关状态串起来。",
  },
  {
    roleEn: "Restaurant / retailer",
    roleZh: "餐饮 / 零售客户",
    valueEn: "Scans one page to see origin, cold-chain, inspection, and import release status.",
    valueZh: "扫码即可看到原产地、冷链、检验和进口放行状态。",
  },
  {
    roleEn: "Financier / insurer / AI agent",
    roleZh: "资金方 / 保险方 / AI Agent",
    valueEn: "Reads structured facts instead of manually checking scattered PDFs and chat screenshots.",
    valueZh: "读取结构化事实，不再人工翻散落的 PDF、聊天截图和表格。",
  },
];

export default async function UruguayBeefChinaCasePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("chaintrace_locale")?.value);
  const zh = locale === "zh-CN";

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div className="landing-grid">
          <div className="hero-copy">
            <div className="eyebrow">{zh ? "复杂案例 · 乌拉圭牛肉进口中国" : "Complex Case · Uruguay Beef to China"}</div>
            <h1>{zh ? "一块牛肉，背后是一条跨国供应链事实链。" : "Behind one cut of beef is a cross-border supply-chain fact chain."}</h1>
            <p>
              {zh
                ? "这个 demo 模拟一票乌拉圭冷冻牛肉从牧场、屠宰、分割、装柜、海运，到中国口岸清关、仓储和终端销售的全过程。ChainTrace 不保存原始商业机密文件，只把关键证据变成可验证、可分享、可审计的事实节点。"
                : "This demo simulates a shipment of frozen Uruguayan beef moving from ranch, slaughter, cutting, container loading, and ocean freight to China customs, warehouse entry, and downstream sale. ChainTrace does not host confidential files; it turns key evidence into verifiable, shareable, auditable fact nodes."}
            </p>
            <div className="hero-actions">
              <Link href="/#create-proof" className="primary-button">{zh ? "记录一个证据节点" : "Record an evidence node"}</Link>
              <Link href="/passport/Example%20Small%20Exporter" className="secondary-button">{zh ? "查看示例企业档案" : "View sample passport"}</Link>
              <Link href="/receivable-pack" className="secondary-button">{zh ? "查看证明包产品" : "View proof pack product"}</Link>
            </div>
            <div className="hero-badges">
              <span className="badge-chip">{zh ? "跨境食品溯源" : "Cross-border food traceability"}</span>
              <span className="badge-chip">{zh ? "冷链证据" : "Cold-chain evidence"}</span>
              <span className="badge-chip">{zh ? "清关与验收" : "Customs + acceptance"}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="atmosphere-orb orb-one" />
            <div className="atmosphere-orb orb-two" />
            <div className="signal-board">
              <div className="signal-board-header">
                <span>{zh ? "案例批次" : "Case batch"}</span>
                <strong>UY-BEEF-CN-2026-0001</strong>
              </div>
              <div className="signal-card-grid">
                <div className="mini-proof-card present"><span>{zh ? "原产地" : "Origin"}</span><strong>Ready</strong></div>
                <div className="mini-proof-card present"><span>{zh ? "屠宰加工" : "Processing"}</span><strong>Ready</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "冷链" : "Cold chain"}</span><strong>Missing</strong></div>
                <div className="mini-proof-card pending"><span>{zh ? "中国进口" : "China import"}</span><strong>Pending</strong></div>
              </div>
              <div className="signal-status-box">
                <span>{zh ? "当前判断" : "Current judgement"}</span>
                <strong>Missing evidence</strong>
                <p>{zh ? "缺少完整温度曲线和中国口岸放行记录，暂时不能显示 Ready。" : "The full temperature curve and China port release record are missing, so this case is not Ready yet."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="clarity-strip">
        <article><span>{zh ? "不是一张二维码" : "Not just one QR code"}</span><strong>{zh ? "它是一条证据链。" : "It is an evidence chain."}</strong></article>
        <article><span>{zh ? "不是替代海关系统" : "Not a customs replacement"}</span><strong>{zh ? "它把分散文件整理成可验证事实。" : "It organizes scattered files into verifiable facts."}</strong></article>
        <article><span>{zh ? "不是暴露商业机密" : "Not exposing secrets"}</span><strong>{zh ? "只公开哈希、状态和必要元数据。" : "Only hashes, status, and necessary metadata are public."}</strong></article>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "端到端溯源路径" : "End-to-end trace path"}</span>
          <h2>{zh ? "从乌拉圭牧场到中国餐桌，拆成 7 个事实节点。" : "From a Uruguayan ranch to a Chinese table, split into seven fact nodes."}</h2>
          <p>{zh ? "每个节点都有位置、证据、风险和 ChainTrace 可记录的证明对象。" : "Each node has a location, evidence, risk, and a proof object ChainTrace can record."}</p>
        </div>
        <div className="story-grid">
          {traceNodes.slice(0, 3).map((node) => (
            <article key={node.id} className="story-card">
              <span>{node.id}</span>
              <strong>{zh ? node.titleZh : node.titleEn}</strong>
              <p>{zh ? node.locationZh : node.locationEn}</p>
            </article>
          ))}
        </div>
        <div className="story-grid">
          {traceNodes.slice(3).map((node) => (
            <article key={node.id} className="story-card">
              <span>{node.id}</span>
              <strong>{zh ? node.titleZh : node.titleEn}</strong>
              <p>{zh ? node.locationZh : node.locationEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="section-heading">
            <span>{zh ? "节点证据详情" : "Node evidence detail"}</span>
            <h2>{zh ? "每一步都回答一个供应链风险问题。" : "Each step answers one supply-chain risk question."}</h2>
            <p>{zh ? "ChainTrace 的价值不是让页面更漂亮，而是把每个风险点变成可验证的证据槽。" : "The value of ChainTrace is not a prettier page; it turns every risk point into a verifiable evidence slot."}</p>
          </div>
          <dl className="proof-details">
            {traceNodes.map((node) => (
              <div key={node.id}>
                <dt>{node.id}</dt>
                <dd>
                  <strong>{zh ? node.titleZh : node.titleEn}</strong>
                  <br />
                  {zh ? node.evidenceZh : node.evidenceEn}
                  <br />
                  <span>{zh ? `风险：${node.riskZh}` : `Risk: ${node.riskEn}`}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <div className="section-heading">
            <span>{zh ? "证明包状态" : "Proof pack status"}</span>
            <h2>{zh ? "不是所有证明包都会同时 Ready。" : "Not every proof pack becomes Ready at the same time."}</h2>
            <p>{zh ? "复杂供应链里，不同参与方会在不同时间补证据。状态必须诚实显示。" : "In a complex supply chain, different parties add evidence at different times. The status must be honest."}</p>
          </div>
          <div className="pack-step-grid">
            {proofPacks.map((pack) => (
              <article key={pack.nameEn} className="pack-step-card">
                <span>{pack.status}</span>
                <strong>{zh ? pack.nameZh : pack.nameEn}</strong>
                <p>{(zh ? pack.itemsZh : pack.itemsEn).join(" · ")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel product-showcase">
        <div className="section-heading">
          <span>{zh ? "谁看这个页面" : "Who reads this page"}</span>
          <h2>{zh ? "同一条事实链，服务不同供应链角色。" : "The same fact chain serves different supply-chain roles."}</h2>
          <p>{zh ? "每个角色关心的问题不一样，但都需要一个共同事实底座。" : "Each role asks different questions, but all of them need a shared fact base."}</p>
        </div>
        <div className="audience-grid">
          {stakeholderViews.map((item) => (
            <article key={item.roleEn} className="audience-card">
              <strong>{zh ? item.roleZh : item.roleEn}</strong>
              <p>{zh ? item.valueZh : item.valueEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel proof-card public-proof-card">
        <div className="proof-card-header">
          <div>
            <span className="proof-type">{zh ? "ChainTrace 案例结论" : "ChainTrace case conclusion"}</span>
            <h3>{zh ? "乌拉圭牛肉溯源不是一个标签，而是一条事实链。" : "Uruguay beef traceability is not a label; it is a fact chain."}</h3>
          </div>
          <div className="status-pill warning">Missing evidence</div>
        </div>
        <dl className="proof-details">
          <div>
            <dt>{zh ? "当前可证明" : "Currently provable"}</dt>
            <dd>{zh ? "原产地、屠宰加工、部分发货和质检节点已具备证据槽。" : "Origin, processing, partial shipment, and inspection nodes have evidence slots."}</dd>
          </div>
          <div>
            <dt>{zh ? "当前缺口" : "Current gap"}</dt>
            <dd>{zh ? "完整冷链温度曲线、中国口岸放行记录、最终买家验收仍未补齐。" : "Full cold-chain temperature curve, China port release, and final buyer acceptance are still missing."}</dd>
          </div>
          <div>
            <dt>{zh ? "产品价值" : "Product value"}</dt>
            <dd>{zh ? "在事实未完整时诚实显示 Missing evidence；在关键证据齐全后自动变成 Ready。" : "Honestly show Missing evidence when facts are incomplete; switch to Ready when the key evidence is complete."}</dd>
          </div>
        </dl>
        <p className="proof-note">
          {zh
            ? "这是一个产品 demo 案例，不是法律、海关或检疫合规意见。真实业务中仍需以合同、海关、检疫、监管和贸易单证要求为准。"
            : "This is a product demo case, not legal, customs, or quarantine compliance advice. Real transactions must still follow contract, customs, inspection, regulatory, and trade-document requirements."}
        </p>
      </section>
    </main>
  );
}
