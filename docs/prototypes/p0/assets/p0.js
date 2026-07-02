(function () {
  const modeKey = "chaintrace-p0-agent-mode";
  const langKey = "chaintrace-p0-language";
  const fallbackMode = "Semi-auto";
  const fallbackLanguage = "en";
  const languages = ["en", "zhHans", "zhHant", "ja", "es"];

  const rows = [
    ["mode.manual", "Manual", "人工确认", "人工確認", "手動確認", "Manual"],
    ["mode.semi", "Semi-auto", "半自动", "半自動", "半自動", "Semiautomático"],
    ["mode.full", "Full-auto", "全自动", "全自動", "全自動", "Automático"],
    ["nav.gate", "Wallet and role gate", "钱包与角色入口", "錢包與角色入口", "ウォレットとロール", "Billetera y rol"],
    ["nav.profile", "Exporter profile", "出口商资料", "出口商資料", "輸出者プロフィール", "Perfil del exportador"],
    ["nav.dashboard", "Exporter control tower", "出口商控制塔", "出口商控制塔", "輸出者コントロールタワー", "Torre de control del exportador"],
    ["nav.new", "Create financing intent", "创建融资意图", "建立融資意圖", "資金調達意図を作成", "Crear intención de financiación"],
    ["nav.materials", "Trade evidence package", "贸易证据包", "貿易證據包", "貿易証拠パッケージ", "Paquete de evidencia comercial"],
    ["nav.gap", "Agent gap and todo", "Agent 缺口与待办", "Agent 缺口與待辦", "Agent ギャップとタスク", "Brecha y tarea del Agent"],
    ["nav.inspection", "Inspection status", "质检状态", "質檢狀態", "検査ステータス", "Estado de inspección"],
    ["nav.funding", "Funding path", "融资路径", "融資路徑", "資金調達パス", "Ruta de financiación"],
    ["nav.execution", "DeFi execution check", "DeFi 执行检查", "DeFi 執行檢查", "DeFi 実行チェック", "Verificación DeFi"],
    ["nav.result", "Funding result", "资金结果", "資金結果", "資金結果", "Resultado de fondos"],
    ["action.backDashboard", "Back to dashboard", "返回控制塔", "返回控制塔", "コントロールタワーへ戻る", "Volver a la torre"],
    ["action.enterWorkspace", "Enter Exporter Workspace", "进入出口商工作区", "進入出口商工作區", "輸出者ワークスペースへ", "Entrar al espacio del exportador"],
    ["action.continueProfile", "Continue to Exporter Profile", "继续完善出口商资料", "繼續完善出口商資料", "輸出者プロフィールへ進む", "Continuar al perfil del exportador"],
    ["gate.heroTitle", "Wallet recognized. Enter the Exporter workspace.", "钱包已识别，进入出口商工作区。", "錢包已識別，進入出口商工作區。", "ウォレットを認識しました。輸出者ワークスペースへ進みます。", "Billetera reconocida. Entrar al espacio del exportador."],
    ["gate.heroCopy", "This is not a marketing page. The wallet has already been recognized as an active Exporter account, so the prototype opens the business workspace for creating and tracking a financing case.", "这不是营销页。钱包已经被识别为已激活的出口商账户，因此原型直接打开用于创建和跟踪融资案件的业务工作区。", "這不是行銷頁。錢包已被識別為已啟用的出口商帳戶，因此原型直接打開用於建立和追蹤融資案件的業務工作區。", "これはマーケティングページではありません。ウォレットは有効な輸出者アカウントとして認識済みのため、資金調達ケースを作成・追跡する業務ワークスペースを開きます。", "No es una página de marketing. La billetera ya fue reconocida como una cuenta activa de exportador, por lo que el prototipo abre el espacio de trabajo para crear y seguir casos de financiación."],
    ["profile.heroTitle", "Complete exporter business profile before creating a case.", "创建案件前先完善出口商业务资料。", "建立案件前先完善出口商業務資料。", "ケース作成前に輸出者の業務プロフィールを完成します。", "Complete el perfil del exportador antes de crear un caso."],
    ["profile.heroCopy", "The account is already active. This screen captures the business profile and financing preferences that help Agent prepare cleaner cases with less manual typing later.", "账户已激活。本页收集企业资料和融资偏好，帮助 Agent 后续更少依赖手写输入，生成更干净的案件草稿。", "帳戶已啟用。本頁收集企業資料與融資偏好，幫助 Agent 後續減少手寫輸入，產生更乾淨的案件草稿。", "アカウントは有効です。この画面では、Agent がより少ない手入力で正確なケース草稿を準備できるよう、企業情報と資金調達設定を登録します。", "La cuenta ya está activa. Esta pantalla captura datos de empresa y preferencias para que el Agent prepare casos más limpios con menos escritura manual."],
    ["dashboard.heroTitle", "Exporter sees one financing case from trade source to funding result.", "出口商从贸易源头一路看到资金结果。", "出口商從貿易源頭一路看到資金結果。", "輸出者は貿易の起点から資金結果まで一つのケースとして確認できます。", "El exportador ve un caso desde el origen comercial hasta el resultado de fondos."],
    ["dashboard.heroCopy", "The first workspace is the exporter control tower: source trade, evidence package, Agent gaps, inspection facts, funding path, DeFi execution check, and final result.", "第一个工作区是出口商控制塔：源头贸易、证据包、Agent 缺口、质检事实、融资路径、DeFi 执行检查和最终结果。", "第一個工作區是出口商控制塔：源頭貿易、證據包、Agent 缺口、質檢事實、融資路徑、DeFi 執行檢查與最終結果。", "最初のワークスペースは輸出者コントロールタワーです。貿易、証拠パッケージ、Agent ギャップ、検査事実、資金調達パス、DeFi 実行チェック、最終結果を表示します。", "El primer espacio es la torre de control del exportador: comercio, evidencia, brechas del Agent, inspección, ruta de financiación, verificación DeFi y resultado final."],
    ["new.heroTitle", "Create financing intent.", "创建融资意图。", "建立融資意圖。", "資金調達意図を作成します。", "Crear intención de financiación."],
    ["new.heroCopy", "The exporter starts with a concrete business request, not a file vault: what trade, how much financing, which timing, and which Agent mode.", "出口商从一个具体业务请求开始，而不是文件库：哪笔贸易、融资多少、希望何时到账、使用哪种 Agent 模式。", "出口商從一個具體業務請求開始，而不是文件庫：哪筆貿易、融資多少、希望何時到帳、使用哪種 Agent 模式。", "輸出者はファイル保管庫ではなく、具体的な業務依頼から開始します。どの貿易か、いくら必要か、いつ必要か、どの Agent モードかを指定します。", "El exportador empieza con una solicitud comercial concreta, no con un repositorio de archivos: qué operación, cuánto financiamiento, cuándo y qué modo de Agent."],
    ["materials.heroTitle", "Trade evidence is prepared as business evidence, not a file list.", "贸易证据按业务证据准备，而不是普通文件列表。", "貿易證據按業務證據準備，而不是普通文件列表。", "貿易証拠は単なるファイル一覧ではなく、業務証拠として準備されます。", "La evidencia comercial se prepara como evidencia de negocio, no como una lista de archivos."],
    ["materials.heroCopy", "The exporter sees the core material package and what each document means for financing readiness.", "出口商可以看到核心材料包，以及每份文件对融资准备度的业务意义。", "出口商可以看到核心材料包，以及每份文件對融資準備度的業務意義。", "輸出者は主要な資料パッケージと、各資料が資金調達準備に与える意味を確認できます。", "El exportador ve el paquete documental principal y lo que cada documento significa para la preparación de financiación."],
    ["materials.sectionTitle", "Evidence Package", "证据包", "證據包", "証拠パッケージ", "Paquete de evidencia"],
    ["materials.sectionCopy", "This page represents the exporter upload/register screen before Agent checks the package.", "这个页面表示 Agent 检查材料前，出口商上传或登记贸易材料的产品画面。", "這個頁面表示 Agent 檢查材料前，出口商上傳或登記貿易材料的產品畫面。", "この画面は、Agent が資料を確認する前に輸出者が貿易資料をアップロードまたは登録する画面です。", "Esta pantalla representa la carga o registro de materiales antes de la revisión del Agent."],
    ["materials.uploaded", "Uploaded Materials", "已上传材料", "已上傳材料", "アップロード済み資料", "Materiales cargados"],
    ["materials.type", "Material type", "材料类型", "材料類型", "資料タイプ", "Tipo de material"],
    ["materials.amount", "Business amount", "业务金额", "業務金額", "業務金額", "Importe comercial"],
    ["materials.currency", "Currency", "币种", "幣種", "通貨", "Moneda"],
    ["materials.file", "Upload file", "上传文件", "上傳文件", "ファイルをアップロード", "Subir archivo"],
    ["materials.agentPrecheck", "Agent Pre-check", "Agent 预检查", "Agent 預檢查", "Agent 事前チェック", "Prechequeo del Agent"],
    ["materials.issue", "Current issue:", "当前问题：", "目前問題：", "現在の問題:", "Problema actual:"],
    ["materials.issueText", "commercial invoice amount is USD 128,000, while the purchase order amount is USD 120,000. The exporter must explain the difference before submission.", "商业发票金额为 USD 128,000，但采购订单金额为 USD 120,000。出口商必须在提交前解释差异。", "商業發票金額為 USD 128,000，但採購訂單金額為 USD 120,000。出口商必須在提交前解釋差異。", "商業インボイス金額は USD 128,000 ですが、発注書金額は USD 120,000 です。輸出者は提出前に差額を説明する必要があります。", "la factura comercial es de USD 128,000, mientras que la orden de compra es de USD 120,000. El exportador debe explicar la diferencia antes de enviar."],
    ["materials.explanation", "Exporter explanation draft", "出口商说明草稿", "出口商說明草稿", "輸出者説明ドラフト", "Borrador de explicación del exportador"],
    ["materials.openTodo", "Open Agent gap todo", "打开 Agent 缺口待办", "打開 Agent 缺口待辦", "Agent ギャップタスクを開く", "Abrir tarea de brecha del Agent"],
    ["materials.submitDisabled", "Submit to review disabled", "提交审核已禁用", "提交審核已停用", "レビュー提出は無効", "Envío a revisión deshabilitado"],
    ["gap.heroTitle", "Agent converts the material gap into one exporter todo.", "Agent 把材料缺口转成一个出口商待办。", "Agent 把材料缺口轉成一個出口商待辦。", "Agent は資料ギャップを輸出者のタスクに変換します。", "El Agent convierte la brecha documental en una tarea del exportador."],
    ["gap.heroCopy", "This page is where the prototype becomes operational: the user can see the gap, reason, owner, completion standard, and where the flow returns.", "这个页面让原型变成可操作：用户能看到缺口、原因、责任方、完成标准，以及完成后回到哪个流程。", "這個頁面讓原型變成可操作：使用者能看到缺口、原因、責任方、完成標準，以及完成後回到哪個流程。", "このページでプロトタイプは操作可能になります。ギャップ、理由、担当者、完了基準、戻り先の状態を確認できます。", "Esta página vuelve operativo el prototipo: se ve la brecha, razón, responsable, criterio de cierre y estado de retorno."],
    ["inspection.heroTitle", "Exporter can see inspection progress, but cannot create the inspection fact.", "出口商可以查看质检进度，但不能制造质检事实。", "出口商可以查看質檢進度，但不能製造質檢事實。", "輸出者は検査進捗を確認できますが、検査事実は作れません。", "El exportador ve el progreso de inspección, pero no crea el hecho de inspección."],
    ["inspection.heroCopy", "The inspection conclusion is visible because it affects financing readiness. It remains owned by the inspection provider.", "质检结论会影响融资准备度，所以出口商可见；但结论仍由质检机构负责。", "質檢結論會影響融資準備度，所以出口商可見；但結論仍由質檢機構負責。", "検査結論は資金調達準備に影響するため表示されます。ただし結論の所有者は検査機関です。", "La conclusión de inspección es visible porque afecta la preparación de financiación, pero sigue siendo responsabilidad del proveedor de inspección."],
    ["funding.heroTitle", "Exporter sees which funding path is active.", "出口商可以看到当前走哪条融资路径。", "出口商可以看到目前走哪條融資路徑。", "輸出者は有効な資金調達パスを確認できます。", "El exportador ve qué ruta de financiación está activa."],
    ["funding.heroCopy", "The exporter does not operate the funder workspace, but can see whether the case is on bank-assisted review, pure DeFi, or low-human execution path.", "出口商不操作资金方工作区，但能看到案件是银行辅助、纯 DeFi，还是低人工执行路径。", "出口商不操作資金方工作區，但能看到案件是銀行輔助、純 DeFi，還是低人工執行路徑。", "輸出者は資金提供者ワークスペースを操作しませんが、銀行補助、純 DeFi、低人手実行のどのパスかを確認できます。", "El exportador no opera el espacio del financiador, pero puede ver si el caso va por banco, DeFi puro o ruta de baja intervención humana."],
    ["execution.heroTitle", "Approval is not completion. Execution conditions still matter.", "批准不等于完成，执行条件仍然重要。", "批准不等於完成，執行條件仍然重要。", "承認は完了ではありません。実行条件が重要です。", "La aprobación no es finalización. Las condiciones de ejecución importan."],
    ["execution.heroCopy", "After funder approval, the exporter sees rule, pool, pause, and execution state in business language. No Solidity, ABI, wallet signature, or proof/hash details are shown.", "资金方批准后，出口商用业务语言看到规则、资金池、暂停和执行状态；不展示 Solidity、ABI、钱包签名或 proof/hash 细节。", "資金方批准後，出口商用業務語言看到規則、資金池、暫停與執行狀態；不展示 Solidity、ABI、錢包簽名或 proof/hash 細節。", "資金提供者の承認後、輸出者はルール、プール、一時停止、実行状態を業務用語で確認します。Solidity、ABI、署名、proof/hash は表示しません。", "Después de la aprobación, el exportador ve regla, pool, pausa y estado de ejecución en lenguaje de negocio. No se muestran Solidity, ABI, firma ni proof/hash."],
    ["result.heroTitle", "Exporter sees the actual funding result and prior blockers.", "出口商看到真实资金结果和之前的卡点。", "出口商看到真實資金結果和之前的卡點。", "輸出者は実際の資金結果と過去のブロッカーを確認します。", "El exportador ve el resultado real de fondos y bloqueos anteriores."],
    ["result.heroCopy", "This is where the exporter closes the loop: what amount was completed, what path was used, and which blockers were cleared or would stop the flow.", "这里闭合出口商最关心的结果：实际完成金额、使用路径、已解除或可能阻断流程的卡点。", "這裡閉合出口商最關心的結果：實際完成金額、使用路徑、已解除或可能阻斷流程的卡點。", "ここで輸出者の関心が閉じます。完了金額、使用されたパス、解消済みまたは停止要因となるブロッカーを確認します。", "Aquí se cierra el ciclo: importe completado, ruta usada y bloqueos resueltos o posibles."]
  ];

  const translations = rows.reduce((acc, row) => {
    languages.forEach((language, index) => {
      acc[language] ||= {};
      acc[language][row[0]] = row[index + 1];
    });
    return acc;
  }, {});

  function getLanguage() {
    return localStorage.getItem(langKey) || fallbackLanguage;
  }

  function translateKey(keyName, language = getLanguage()) {
    return translations[language]?.[keyName] || translations[fallbackLanguage]?.[keyName] || keyName;
  }

  function modeLabelKey(mode) {
    if (mode === "Manual") return "mode.manual";
    if (mode === "Full-auto") return "mode.full";
    return "mode.semi";
  }

  function injectP0CssFixes() {
    if (document.getElementById("p0-bootstrap-contrast-fix")) return;
    const style = document.createElement("style");
    style.id = "p0-bootstrap-contrast-fix";
    style.textContent = `
      body, .hero, .section, .card, .card-title, .timeline, .node, .list li, .notice, .table, .table td { color: var(--text) !important; }
      .card { --bs-card-color: var(--text); --bs-card-bg: rgba(23,42,67,.78); }
      .card-title, .section h2, .node h3, .node h4 { color: var(--text) !important; }
      .section-sub, .muted, .metric .label, .node p, .field label, .table th { color: var(--muted) !important; }
      .select option { color: #0b1220; background: #ffffff; }
    `;
    document.head.appendChild(style);
  }

  function setMode(mode) {
    localStorage.setItem(modeKey, mode);
    document.querySelectorAll("[data-agent-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.agentMode === mode);
    });
    document.querySelectorAll("[data-mode-label]").forEach((target) => {
      target.textContent = translateKey(modeLabelKey(mode));
    });
  }

  function setLanguage(language) {
    localStorage.setItem(langKey, language);
    document.documentElement.lang = language;
    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.value = language;
    });
    document.querySelectorAll("[data-i18n]").forEach((target) => {
      const value = translateKey(target.dataset.i18n, language);
      if (value) target.textContent = value;
      else console.warn("Missing i18n key", target.dataset.i18n, language);
    });
    setMode(localStorage.getItem(modeKey) || fallbackMode);
    setTimeout(() => window.ChainTraceP0AutoI18n?.apply?.(), 0);
  }

  function initMode() {
    setMode(localStorage.getItem(modeKey) || fallbackMode);
    document.querySelectorAll("[data-agent-mode]").forEach((button) => {
      button.addEventListener("click", () => setMode(button.datasetAgentMode || button.dataset.agentMode));
    });
  }

  function initLanguage() {
    setLanguage(getLanguage());
    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.addEventListener("change", () => setLanguage(select.value));
    });
  }

  function initActivePage() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll("[data-page-link]").forEach((link) => {
      link.classList.toggle("active", link.dataset.pageLink === page);
    });
  }

  function loadAutoTranslations() {
    if (document.querySelector('script[data-p0-auto-i18n="true"]')) return;
    const script = document.createElement("script");
    script.src = "assets/p0-auto-i18n.js?v=20260702-loader3";
    script.defer = true;
    script.dataset.p0AutoI18n = "true";
    script.onload = () => window.ChainTraceP0AutoI18n?.apply?.();
    document.body.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectP0CssFixes();
    initLanguage();
    initMode();
    initActivePage();
    loadAutoTranslations();
  });
})();
