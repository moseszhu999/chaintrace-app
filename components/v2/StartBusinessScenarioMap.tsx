import Link from "next/link";

type Props = {
  zh: boolean;
};

type ScenarioCard = {
  roleZh: string;
  roleEn: string;
  needZh: string;
  needEn: string;
  actionZh: string;
  actionEn: string;
  resultZh: string;
  resultEn: string;
  href: string;
  ctaZh: string;
  ctaEn: string;
  status: "READY" | "NEXT" | "DESIGN";
};

const scenarios: ScenarioCard[] = [
  {
    roleZh: "我是出口商",
    roleEn: "I am an exporter",
    needZh: "我需要钱，需要把一笔真实贸易整理成可融资案件。",
    needEn: "I need money and want to turn a real trade into a financing-ready case.",
    actionZh: "准备合同、发票、物流、质检等证据，生成 Trade Evidence Passport，提交给资金方。",
    actionEn: "Prepare contract, invoice, logistics, QC evidence, generate a Trade Evidence Passport, and share it with a funder.",
    resultZh: "我想看到：案件可提交、风险是否通过、资金账户是否到账。",
    resultEn: "I want to see: case submitted, risk gates passed or failed, and funds credited to my account.",
    href: "#exporter-financing-flow",
    ctaZh: "开始融资准备",
    ctaEn: "Start financing preparation",
    status: "READY",
  },
  {
    roleZh: "我是质检员",
    roleEn: "I am a QC inspector",
    needZh: "我只需要确认货物是否合格，并留下可验证的质检证据。",
    needEn: "I only need to confirm whether the goods passed inspection and leave verifiable QC evidence.",
    actionZh: "上传 QC 报告或现场照片，生成文件 Hash，签名或提交质检结论。",
    actionEn: "Upload QC report or site photos, generate file hashes, and sign or submit the QC conclusion.",
    resultZh: "我想看到：这个 Case 的质检状态从 pending 变成 pass / fail / dispute。",
    resultEn: "I want to see: QC status for this case moves from pending to pass / fail / dispute.",
    href: "/evidence",
    ctaZh: "进入质检证据",
    ctaEn: "Open QC evidence",
    status: "NEXT",
  },
  {
    roleZh: "我是银行 / 资金方职员",
    roleEn: "I am a bank / funder officer",
    needZh: "我不想看一堆文件，我要看这个案件能不能放款。",
    needEn: "I do not want to inspect random files; I need to know whether this case can be funded.",
    actionZh: "查看 Passport、证据完整性、买方确认、质检结果、风险门槛和智能合约状态。",
    actionEn: "Review passport, evidence completeness, buyer confirmation, QC result, risk gates, and smart contract status.",
    resultZh: "我想看到：允许放款 / 不允许放款 / 缺什么材料 / 合约是否需要维护。",
    resultEn: "I want to see: allow funding / block funding / missing evidence / contract maintenance needed.",
    href: "/business-readiness",
    ctaZh: "查看放款判断",
    ctaEn: "Review funding decision",
    status: "NEXT",
  },
  {
    roleZh: "我是合约 / 平台运营",
    roleEn: "I am a contract / platform operator",
    needZh: "我需要确认智能合约、资金池、规则和异常案件是否需要维护。",
    needEn: "I need to check whether smart contracts, funding pool rules, and exception cases require maintenance.",
    actionZh: "查看链上注册、规则版本、异常队列、资金路径和人工审批记录。",
    actionEn: "Inspect registry status, rule versions, exception queue, fund path, and human approval records.",
    resultZh: "我想看到：系统正常 / 需要维护 / 暂停放款 / 升级合约规则。",
    resultEn: "I want to see: system healthy / maintenance needed / funding paused / contract rule upgrade needed.",
    href: "/dashboard",
    ctaZh: "进入运营台",
    ctaEn: "Open operator console",
    status: "DESIGN",
  },
];

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function StartBusinessScenarioMap({ zh }: Props) {
  return (
    <section className="proof-flow-card">
      <div className="section-heading compact-heading">
        <span>{t(zh, "Scenario-first Entry", "Scenario-first Entry")}</span>
        <h2>{t(zh, "先按角色和目标进入，不按技术 Proof 进入", "Start by role and goal, not by technical proof")}</h2>
        <p>{t(zh, "用户不是来生成 Hash 的。出口商要融资，质检员要确认合格，银行职员要判断能不能放款，运营人员要维护合约和资金规则。", "Users are not here to generate hashes. Exporters need financing, inspectors confirm quality, funders decide funding, and operators maintain contracts and funding rules.")}</p>
      </div>
      <div className="proof-flow-grid">
        {scenarios.map((scenario) => (
          <article className="proof-flow-card" key={scenario.roleEn}>
            <span>{scenario.status}</span>
            <strong>{t(zh, scenario.roleZh, scenario.roleEn)}</strong>
            <p>{t(zh, scenario.needZh, scenario.needEn)}</p>
            <div className="proof-details">
              <div>
                <dt>{t(zh, "我要做什么", "What I do")}</dt>
                <dd>{t(zh, scenario.actionZh, scenario.actionEn)}</dd>
              </div>
              <div>
                <dt>{t(zh, "我要看到什么", "What I need to see")}</dt>
                <dd>{t(zh, scenario.resultZh, scenario.resultEn)}</dd>
              </div>
            </div>
            <Link className={scenario.status === "READY" ? "primary-button" : "secondary-button"} href={scenario.href}>
              {t(zh, scenario.ctaZh, scenario.ctaEn)}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
