type Props = {
  zh: boolean;
};

type FunctionPoint = {
  groupZh: string;
  groupEn: string;
  items: Array<{ zh: string; en: string; status: "READY" | "NEXT" | "TODO" }>;
};

const functionPoints: FunctionPoint[] = [
  {
    groupZh: "组织 Proof",
    groupEn: "Organization Proof",
    items: [
      { zh: "快速创建组织 Proof", en: "Quick-create Organization Proof", status: "READY" },
      { zh: "导入 Recovery Kit", en: "Import Recovery Kit", status: "TODO" },
      { zh: "钱包签名 orgProfileHash", en: "Wallet-sign orgProfileHash", status: "TODO" },
      { zh: "查看组织 Proof 状态", en: "View organization proof status", status: "READY" },
    ],
  },
  {
    groupZh: "Trade Case",
    groupEn: "Trade Case",
    items: [
      { zh: "快速创建 Case", en: "Quick-create Case", status: "READY" },
      { zh: "绑定 sellerOrgProfileHash", en: "Bind sellerOrgProfileHash", status: "READY" },
      { zh: "导入 Case Kit", en: "Import Case Kit", status: "TODO" },
      { zh: "查看 caseRootHash", en: "View caseRootHash", status: "READY" },
    ],
  },
  {
    groupZh: "Evidence Hash",
    groupEn: "Evidence Hash",
    items: [
      { zh: "选择本地文件", en: "Select local file", status: "NEXT" },
      { zh: "浏览器计算 fileSha256", en: "Compute fileSha256 in browser", status: "NEXT" },
      { zh: "生成 Evidence Kit", en: "Generate Evidence Kit", status: "NEXT" },
      { zh: "计算 evidenceRootHash", en: "Compute evidenceRootHash", status: "NEXT" },
    ],
  },
  {
    groupZh: "Proof Pack / Passport",
    groupEn: "Proof Pack / Passport",
    items: [
      { zh: "聚合 Org / Case / Evidence Proof", en: "Bundle Org / Case / Evidence Proof", status: "TODO" },
      { zh: "生成 passportRootHash", en: "Generate passportRootHash", status: "TODO" },
      { zh: "钱包签名 Passport Root", en: "Wallet-sign Passport Root", status: "TODO" },
      { zh: "下载 Proof Pack", en: "Download Proof Pack", status: "TODO" },
    ],
  },
  {
    groupZh: "Verify / Share",
    groupEn: "Verify / Share",
    items: [
      { zh: "粘贴 Proof Pack 验证", en: "Paste Proof Pack to verify", status: "TODO" },
      { zh: "上传原文件重验 fileSha256", en: "Upload raw file to re-verify fileSha256", status: "TODO" },
      { zh: "验证钱包签名", en: "Verify wallet signature", status: "TODO" },
      { zh: "生成对外分享结果", en: "Generate shareable verification result", status: "TODO" },
    ],
  },
];

function t(zh: boolean, cn: string, en: string) {
  return zh ? cn : en;
}

export function StartSecondaryFunctionMap({ zh }: Props) {
  return (
    <section className="proof-flow-card">
      <div className="section-heading compact-heading">
        <span>{t(zh, "F-L2 二级功能点", "F-L2 Secondary Functions")}</span>
        <h2>{t(zh, "Start 入口的二级功能地图", "Secondary function map for Start")}</h2>
        <p>{t(zh, "这里先把二级功能点铺出来。后续填肉时，每个二级功能点再变成表单、按钮、状态和权限。", "This section lays out the secondary functions first. As we add flesh, each function becomes a form, action, state, and permission unit.")}</p>
      </div>
      <div className="proof-flow-grid">
        {functionPoints.map((group) => (
          <article className="proof-flow-card" key={group.groupEn}>
            <strong>{t(zh, group.groupZh, group.groupEn)}</strong>
            <div className="table-like-list">
              {group.items.map((item) => (
                <div className="table-like-row" key={item.en}>
                  <div>
                    <strong>{t(zh, item.zh, item.en)}</strong>
                    <span>F-L2 / F-L4</span>
                  </div>
                  <div>
                    <strong>{item.status}</strong>
                    <span>{item.status === "READY" ? "implemented" : item.status === "NEXT" ? "next" : "placeholder"}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
