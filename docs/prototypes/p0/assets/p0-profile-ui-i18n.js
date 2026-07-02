(function () {
  const langKey = "chaintrace-p0-language";
  const fallback = "en";
  const indexes = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  const rows = [
    ["Exporter Profile", "出口商资料", "出口商資料", "輸出者プロフィール", "Perfil del exportador"],
    ["Exporter profile", "出口商资料", "出口商資料", "輸出者プロフィール", "Perfil del exportador"],
    ["Profile usable", "资料可用", "資料可用", "プロフィール可用", "Perfil utilizable"],
    ["Most inputs are constrained selections. Free text is reserved for business address and special notes.", "大多数输入都是受控选择。自由文本仅用于业务地址和特殊备注。", "大多數輸入都是受控選擇。自由文字僅用於業務地址和特殊備註。", "ほとんどの入力は制約付き選択です。自由記述は事業住所と特記事項に限定されます。", "La mayoría de entradas son selecciones restringidas. El texto libre se reserva para dirección y notas especiales."],
    ["Company Information", "公司信息", "公司資訊", "会社情報", "Información de empresa"],
    ["Business account", "企业账户", "企業帳戶", "事業アカウント", "Cuenta empresarial"],
    ["Registered company name", "注册公司名称", "註冊公司名稱", "登録公司名", "Nombre legal de la empresa"],
    ["Country / region", "国家 / 地区", "國家 / 地區", "国 / 地域", "País / región"],
    ["Exporter type", "出口商类型", "出口商類型", "輸出者タイプ", "Tipo de exportador"],
    ["Primary product category", "主要产品类别", "主要產品類別", "主要製品カテゴリ", "Categoría principal"],
    ["Average shipment value", "平均出货金额", "平均出貨金額", "平均出荷額", "Valor medio de envío"],
    ["Preferred settlement currency", "偏好结算币种", "偏好結算幣種", "希望決済通貨", "Moneda de liquidación preferida"],
    ["Contact and Agent Preference", "联系人与 Agent 偏好", "聯絡人與 Agent 偏好", "連絡先と Agent 設定", "Contacto y preferencia del Agent"],
    ["Primary contact", "主要联系人", "主要聯絡人", "主要連絡先", "Contacto principal"],
    ["Contact role", "联系人角色", "聯絡人角色", "連絡先ロール", "Rol del contacto"],
    ["Notification preference", "通知偏好", "通知偏好", "通知設定", "Preferencia de notificación"],
    ["Default financing type", "默认融资类型", "預設融資類型", "標準の資金調達タイプ", "Tipo de financiación predeterminado"],
    ["Agent use:", "Agent 使用：", "Agent 使用：", "Agent 利用:", "Uso del Agent:"],
    ["Agent can use these preferences to prefill case drafts and recommend documents, but cannot change the exporter's role or business facts.", "Agent 可以用这些偏好预填案件草稿并推荐材料，但不能改变出口商角色或业务事实。", "Agent 可以用這些偏好預填案件草稿並推薦材料，但不能改變出口商角色或業務事實。", "Agent はこれらの設定でケース草稿を事前入力し資料を推奨できますが、輸出者ロールや業務事実は変更できません。", "El Agent puede usar estas preferencias para prellenar borradores y recomendar documentos, pero no puede cambiar el rol ni los hechos del exportador."],
    ["Save profile and enter workspace", "保存资料并进入工作区", "儲存資料並進入工作區", "プロフィールを保存してワークスペースへ", "Guardar perfil y entrar al espacio"],
    ["Manufacturer exporter", "生产型出口商", "生產型出口商", "メーカー輸出者", "Exportador fabricante"],
    ["Finance manager", "财务经理", "財務經理", "財務マネージャー", "Gerente financiero"],
    ["Important blockers only", "仅重要阻断项", "僅重要阻斷項", "重要ブロッカーのみ", "Solo bloqueos importantes"],
    ["USD 50k - 150k", "USD 5万 - 15万", "USD 5萬 - 15萬", "USD 5万〜15万", "USD 50 mil - 150 mil"]
  ];

  const map = new Map(rows.map((row) => [row[0], row]));
  function language() { return localStorage.getItem(langKey) || fallback; }
  function t(value, lang) {
    const original = String(value || "").trim();
    const row = map.get(original);
    return row ? row[indexes[lang] || 0] || original : original;
  }
  function apply() {
    const lang = language();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.__p0ProfileOriginal) node.__p0ProfileOriginal = node.nodeValue.trim();
      node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), t(node.__p0ProfileOriginal, lang));
    });
    document.querySelectorAll("option").forEach((option) => {
      if (!option.__p0ProfileOriginal) option.__p0ProfileOriginal = option.textContent.trim();
      option.textContent = t(option.__p0ProfileOriginal, lang);
    });
  }
  window.ChainTraceP0ProfileUiI18n = { apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(apply, 0));
  else setTimeout(apply, 0);
  document.addEventListener("change", (event) => {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
