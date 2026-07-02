(function () {
  const key = "chaintrace-p0-agent-mode";
  const langKey = "chaintrace-p0-language";
  const fallback = "Semi-auto";
  const languageFallback = "en";

  const translations = {
    en: {
      "mode.manual": "Manual",
      "mode.semi": "Semi-auto",
      "mode.full": "Full-auto",
      "nav.gate": "Wallet and role gate",
      "nav.profile": "Exporter profile",
      "nav.dashboard": "Exporter control tower",
      "nav.new": "Create financing intent",
      "nav.materials": "Trade evidence package",
      "nav.gap": "Agent gap and todo",
      "nav.inspection": "Inspection status",
      "nav.funding": "Funding path",
      "nav.execution": "DeFi execution check",
      "nav.result": "Funding result",
      "label.role": "Role",
      "label.case": "Case",
      "label.agent": "Agent",
      "label.wallet": "Wallet",
      "label.currentCase": "Current case",
      "action.backDashboard": "Back to dashboard",
      "action.enterWorkspace": "Enter Exporter Workspace",
      "action.continueProfile": "Continue to Exporter Profile",
      "gate.heroTitle": "Wallet recognized. Enter the Exporter workspace.",
      "gate.heroCopy": "This is not a marketing page. The wallet has already been recognized as an active Exporter account, so the prototype opens the business workspace for creating and tracking a financing case.",
      "materials.heroTitle": "Trade evidence is prepared as business evidence, not a file list.",
      "materials.heroCopy": "The exporter sees the core material package and what each document means for financing readiness.",
      "materials.sectionTitle": "Evidence Package",
      "materials.sectionCopy": "This page represents the exporter upload/register screen before Agent checks the package.",
      "materials.uploaded": "Uploaded Materials",
      "materials.type": "Material type",
      "materials.amount": "Business amount",
      "materials.currency": "Currency",
      "materials.file": "Upload file",
      "materials.agentPrecheck": "Agent Pre-check",
      "materials.issue": "Current issue:",
      "materials.issueText": "commercial invoice amount is USD 128,000, while the purchase order amount is USD 120,000. The exporter must explain the difference before submission.",
      "materials.explanation": "Exporter explanation draft",
      "materials.openTodo": "Open Agent gap todo",
      "materials.submitDisabled": "Submit to review disabled",
      "profile.heroTitle": "Complete exporter business profile before creating a case.",
      "profile.heroCopy": "The account is already active. This screen captures the business profile and financing preferences that help Agent prepare cleaner cases with less manual typing later.",
      "dashboard.heroTitle": "Exporter sees one financing case from trade source to funding result.",
      "dashboard.heroCopy": "The first workspace is the exporter control tower: source trade, evidence package, Agent gaps, inspection facts, funding path, DeFi execution check, and final result.",
      "new.heroTitle": "Create financing intent.",
      "new.heroCopy": "The exporter starts with a concrete business request, not a file vault: what trade, how much financing, which timing, and which Agent mode.",
      "gap.heroTitle": "Agent converts the material gap into one exporter todo.",
      "gap.heroCopy": "This page is where the prototype becomes operational: the user can see the gap, reason, owner, completion standard, and where the flow returns.",
      "inspection.heroTitle": "Exporter can see inspection progress, but cannot create the inspection fact.",
      "inspection.heroCopy": "The inspection conclusion is visible because it affects financing readiness. It remains owned by the inspection provider.",
      "funding.heroTitle": "Exporter sees which funding path is active.",
      "funding.heroCopy": "The exporter does not operate the funder workspace, but can see whether the case is on bank-assisted review, pure DeFi, or low-human execution path.",
      "execution.heroTitle": "Approval is not completion. Execution conditions still matter.",
      "execution.heroCopy": "After funder approval, the exporter sees rule, pool, pause, and execution state in business language. No Solidity, ABI, wallet signature, or proof/hash details are shown.",
      "result.heroTitle": "Exporter sees the actual funding result and prior blockers.",
      "result.heroCopy": "This is where the exporter closes the loop: what amount was completed, what path was used, and which blockers were cleared or would stop the flow."
    },
    zhHans: {
      "mode.manual": "人工确认",
      "mode.semi": "半自动",
      "mode.full": "全自动",
      "nav.gate": "钱包与角色入口",
      "nav.profile": "出口商资料",
      "nav.dashboard": "出口商控制塔",
      "nav.new": "创建融资意图",
      "nav.materials": "贸易证据包",
      "nav.gap": "Agent 缺口与待办",
      "nav.inspection": "质检状态",
      "nav.funding": "融资路径",
      "nav.execution": "DeFi 执行检查",
      "nav.result": "资金结果",
      "label.role": "角色",
      "label.case": "案件",
      "label.agent": "Agent",
      "label.wallet": "钱包",
      "label.currentCase": "当前案件",
      "action.backDashboard": "返回控制塔",
      "action.enterWorkspace": "进入出口商工作区",
      "action.continueProfile": "继续完善出口商资料",
      "gate.heroTitle": "钱包已识别，进入出口商工作区。",
      "gate.heroCopy": "这不是营销页。钱包已经被识别为已激活的出口商账户，因此原型直接打开用于创建和跟踪融资案件的业务工作区。",
      "materials.heroTitle": "贸易证据按业务证据准备，而不是普通文件列表。",
      "materials.heroCopy": "出口商可以看到核心材料包，以及每份文件对融资准备度的业务意义。",
      "materials.sectionTitle": "证据包",
      "materials.sectionCopy": "这个页面表示 Agent 检查材料前，出口商上传或登记贸易材料的产品画面。",
      "materials.uploaded": "已上传材料",
      "materials.type": "材料类型",
      "materials.amount": "业务金额",
      "materials.currency": "币种",
      "materials.file": "上传文件",
      "materials.agentPrecheck": "Agent 预检查",
      "materials.issue": "当前问题：",
      "materials.issueText": "商业发票金额为 USD 128,000，但采购订单金额为 USD 120,000。出口商必须在提交前解释差异。",
      "materials.explanation": "出口商说明草稿",
      "materials.openTodo": "打开 Agent 缺口待办",
      "materials.submitDisabled": "提交审核已禁用",
      "profile.heroTitle": "创建案件前先完善出口商业务资料。",
      "profile.heroCopy": "账户已激活。本页收集企业资料和融资偏好，帮助 Agent 后续更少依赖手写输入，生成更干净的案件草稿。",
      "dashboard.heroTitle": "出口商从贸易源头一路看到资金结果。",
      "dashboard.heroCopy": "第一个工作区是出口商控制塔：源头贸易、证据包、Agent 缺口、质检事实、融资路径、DeFi 执行检查和最终结果。",
      "new.heroTitle": "创建融资意图。",
      "new.heroCopy": "出口商从一个具体业务请求开始，而不是文件库：哪笔贸易、融资多少、希望何时到账、使用哪种 Agent 模式。",
      "gap.heroTitle": "Agent 把材料缺口转成一个出口商待办。",
      "gap.heroCopy": "这个页面让原型变成可操作：用户能看到缺口、原因、责任方、完成标准，以及完成后回到哪个流程。",
      "inspection.heroTitle": "出口商可以查看质检进度，但不能制造质检事实。",
      "inspection.heroCopy": "质检结论会影响融资准备度，所以出口商可见；但结论仍由质检机构负责。",
      "funding.heroTitle": "出口商可以看到当前走哪条融资路径。",
      "funding.heroCopy": "出口商不操作资金方工作区，但能看到案件是银行辅助、纯 DeFi，还是低人工执行路径。",
      "execution.heroTitle": "批准不等于完成，执行条件仍然重要。",
      "execution.heroCopy": "资金方批准后，出口商用业务语言看到规则、资金池、暂停和执行状态；不展示 Solidity、ABI、钱包签名或 proof/hash 细节。",
      "result.heroTitle": "出口商看到真实资金结果和之前的卡点。",
      "result.heroCopy": "这里闭合出口商最关心的结果：实际完成金额、使用路径、已解除或可能阻断流程的卡点。"
    },
    zhHant: {
      "mode.manual": "人工確認",
      "mode.semi": "半自動",
      "mode.full": "全自動",
      "nav.gate": "錢包與角色入口",
      "nav.profile": "出口商資料",
      "nav.dashboard": "出口商控制塔",
      "nav.new": "建立融資意圖",
      "nav.materials": "貿易證據包",
      "nav.gap": "Agent 缺口與待辦",
      "nav.inspection": "質檢狀態",
      "nav.funding": "融資路徑",
      "nav.execution": "DeFi 執行檢查",
      "nav.result": "資金結果",
      "label.role": "角色",
      "label.case": "案件",
      "label.agent": "Agent",
      "label.wallet": "錢包",
      "label.currentCase": "目前案件",
      "action.backDashboard": "返回控制塔",
      "action.enterWorkspace": "進入出口商工作區",
      "action.continueProfile": "繼續完善出口商資料",
      "gate.heroTitle": "錢包已識別，進入出口商工作區。",
      "gate.heroCopy": "這不是行銷頁。錢包已被識別為已啟用的出口商帳戶，因此原型直接打開用於建立和追蹤融資案件的業務工作區。",
      "materials.heroTitle": "貿易證據按業務證據準備，而不是普通文件列表。",
      "materials.heroCopy": "出口商可以看到核心材料包，以及每份文件對融資準備度的業務意義。",
      "materials.sectionTitle": "證據包",
      "materials.sectionCopy": "這個頁面表示 Agent 檢查材料前，出口商上傳或登記貿易材料的產品畫面。",
      "materials.uploaded": "已上傳材料",
      "materials.type": "材料類型",
      "materials.amount": "業務金額",
      "materials.currency": "幣種",
      "materials.file": "上傳文件",
      "materials.agentPrecheck": "Agent 預檢查",
      "materials.issue": "目前問題：",
      "materials.issueText": "商業發票金額為 USD 128,000，但採購訂單金額為 USD 120,000。出口商必須在提交前解釋差異。",
      "materials.explanation": "出口商說明草稿",
      "materials.openTodo": "打開 Agent 缺口待辦",
      "materials.submitDisabled": "提交審核已停用",
      "profile.heroTitle": "建立案件前先完善出口商業務資料。",
      "profile.heroCopy": "帳戶已啟用。本頁收集企業資料與融資偏好，幫助 Agent 後續減少手寫輸入，產生更乾淨的案件草稿。",
      "dashboard.heroTitle": "出口商從貿易源頭一路看到資金結果。",
      "dashboard.heroCopy": "第一個工作區是出口商控制塔：源頭貿易、證據包、Agent 缺口、質檢事實、融資路徑、DeFi 執行檢查與最終結果。",
      "new.heroTitle": "建立融資意圖。",
      "new.heroCopy": "出口商從一個具體業務請求開始，而不是文件庫：哪筆貿易、融資多少、希望何時到帳、使用哪種 Agent 模式。",
      "gap.heroTitle": "Agent 把材料缺口轉成一個出口商待辦。",
      "gap.heroCopy": "這個頁面讓原型變成可操作：使用者能看到缺口、原因、責任方、完成標準，以及完成後回到哪個流程。",
      "inspection.heroTitle": "出口商可以查看質檢進度，但不能製造質檢事實。",
      "inspection.heroCopy": "質檢結論會影響融資準備度，所以出口商可見；但結論仍由質檢機構負責。",
      "funding.heroTitle": "出口商可以看到目前走哪條融資路徑。",
      "funding.heroCopy": "出口商不操作資金方工作區，但能看到案件是銀行輔助、純 DeFi，還是低人工執行路徑。",
      "execution.heroTitle": "批准不等於完成，執行條件仍然重要。",
      "execution.heroCopy": "資金方批准後，出口商用業務語言看到規則、資金池、暫停與執行狀態；不展示 Solidity、ABI、錢包簽名或 proof/hash 細節。",
      "result.heroTitle": "出口商看到真實資金結果和之前的卡點。",
      "result.heroCopy": "這裡閉合出口商最關心的結果：實際完成金額、使用路徑、已解除或可能阻斷流程的卡點。"
    },
    ja: {
      "mode.manual": "手動確認",
      "mode.semi": "半自動",
      "mode.full": "全自動",
      "nav.gate": "ウォレットとロール",
      "nav.profile": "輸出者プロフィール",
      "nav.dashboard": "輸出者コントロールタワー",
      "nav.new": "資金調達意図を作成",
      "nav.materials": "貿易証拠パッケージ",
      "nav.gap": "Agent ギャップとタスク",
      "nav.inspection": "検査ステータス",
      "nav.funding": "資金調達パス",
      "nav.execution": "DeFi 実行チェック",
      "nav.result": "資金結果",
      "label.role": "ロール",
      "label.case": "ケース",
      "label.agent": "Agent",
      "label.wallet": "ウォレット",
      "label.currentCase": "現在のケース",
      "action.backDashboard": "コントロールタワーへ戻る",
      "action.enterWorkspace": "輸出者ワークスペースへ",
      "action.continueProfile": "輸出者プロフィールへ進む",
      "gate.heroTitle": "ウォレットを認識しました。輸出者ワークスペースへ進みます。",
      "gate.heroCopy": "これはマーケティングページではありません。ウォレットは有効な輸出者アカウントとして認識済みのため、資金調達ケースを作成・追跡する業務ワークスペースを開きます。",
      "materials.heroTitle": "貿易証拠は単なるファイル一覧ではなく、業務証拠として準備されます。",
      "materials.heroCopy": "輸出者は主要な資料パッケージと、各資料が資金調達準備に与える意味を確認できます。",
      "materials.sectionTitle": "証拠パッケージ",
      "materials.sectionCopy": "この画面は、Agent が資料を確認する前に輸出者が貿易資料をアップロードまたは登録する画面です。",
      "materials.uploaded": "アップロード済み資料",
      "materials.type": "資料タイプ",
      "materials.amount": "業務金額",
      "materials.currency": "通貨",
      "materials.file": "ファイルをアップロード",
      "materials.agentPrecheck": "Agent 事前チェック",
      "materials.issue": "現在の問題:",
      "materials.issueText": "商業インボイス金額は USD 128,000 ですが、発注書金額は USD 120,000 です。輸出者は提出前に差額を説明する必要があります。",
      "materials.explanation": "輸出者説明ドラフト",
      "materials.openTodo": "Agent ギャップタスクを開く",
      "materials.submitDisabled": "レビュー提出は無効",
      "profile.heroTitle": "ケース作成前に輸出者の業務プロフィールを完成します。",
      "profile.heroCopy": "アカウントは有効です。この画面では、Agent がより少ない手入力で正確なケース草稿を準備できるよう、企業情報と資金調達設定を登録します。",
      "dashboard.heroTitle": "輸出者は貿易の起点から資金結果まで一つのケースとして確認できます。",
      "dashboard.heroCopy": "最初のワークスペースは輸出者コントロールタワーです。貿易、証拠パッケージ、Agent ギャップ、検査事実、資金調達パス、DeFi 実行チェック、最終結果を表示します。",
      "new.heroTitle": "資金調達意図を作成します。",
      "new.heroCopy": "輸出者はファイル保管庫ではなく、具体的な業務依頼から開始します。どの貿易か、いくら必要か、いつ必要か、どの Agent モードかを指定します。",
      "gap.heroTitle": "Agent は資料ギャップを輸出者のタスクに変換します。",
      "gap.heroCopy": "このページでプロトタイプは操作可能になります。ギャップ、理由、担当者、完了基準、戻り先の状態を確認できます。",
      "inspection.heroTitle": "輸出者は検査進捗を確認できますが、検査事実は作れません。",
      "inspection.heroCopy": "検査結論は資金調達準備に影響するため表示されます。ただし結論の所有者は検査機関です。",
      "funding.heroTitle": "輸出者は有効な資金調達パスを確認できます。",
      "funding.heroCopy": "輸出者は資金提供者ワークスペースを操作しませんが、銀行補助、純 DeFi、低人手実行のどのパスかを確認できます。",
      "execution.heroTitle": "承認は完了ではありません。実行条件が重要です。",
      "execution.heroCopy": "資金提供者の承認後、輸出者はルール、プール、一時停止、実行状態を業務用語で確認します。Solidity、ABI、署名、proof/hash は表示しません。",
      "result.heroTitle": "輸出者は実際の資金結果と過去のブロッカーを確認します。",
      "result.heroCopy": "ここで輸出者の関心が閉じます。完了金額、使用されたパス、解消済みまたは停止要因となるブロッカーを確認します。"
    },
    es: {
      "mode.manual": "Manual",
      "mode.semi": "Semiautomático",
      "mode.full": "Automático",
      "nav.gate": "Billetera y rol",
      "nav.profile": "Perfil del exportador",
      "nav.dashboard": "Torre de control del exportador",
      "nav.new": "Crear intención de financiación",
      "nav.materials": "Paquete de evidencia comercial",
      "nav.gap": "Brecha y tarea del Agent",
      "nav.inspection": "Estado de inspección",
      "nav.funding": "Ruta de financiación",
      "nav.execution": "Verificación DeFi",
      "nav.result": "Resultado de fondos",
      "label.role": "Rol",
      "label.case": "Caso",
      "label.agent": "Agent",
      "label.wallet": "Billetera",
      "label.currentCase": "Caso actual",
      "action.backDashboard": "Volver a la torre",
      "action.enterWorkspace": "Entrar al espacio del exportador",
      "action.continueProfile": "Continuar al perfil del exportador",
      "gate.heroTitle": "Billetera reconocida. Entrar al espacio del exportador.",
      "gate.heroCopy": "No es una página de marketing. La billetera ya fue reconocida como una cuenta activa de exportador, por lo que el prototipo abre el espacio de trabajo para crear y seguir casos de financiación.",
      "materials.heroTitle": "La evidencia comercial se prepara como evidencia de negocio, no como una lista de archivos.",
      "materials.heroCopy": "El exportador ve el paquete documental principal y lo que cada documento significa para la preparación de financiación.",
      "materials.sectionTitle": "Paquete de evidencia",
      "materials.sectionCopy": "Esta pantalla representa la carga o registro de materiales antes de la revisión del Agent.",
      "materials.uploaded": "Materiales cargados",
      "materials.type": "Tipo de material",
      "materials.amount": "Importe comercial",
      "materials.currency": "Moneda",
      "materials.file": "Subir archivo",
      "materials.agentPrecheck": "Prechequeo del Agent",
      "materials.issue": "Problema actual:",
      "materials.issueText": "la factura comercial es de USD 128,000, mientras que la orden de compra es de USD 120,000. El exportador debe explicar la diferencia antes de enviar.",
      "materials.explanation": "Borrador de explicación del exportador",
      "materials.openTodo": "Abrir tarea de brecha del Agent",
      "materials.submitDisabled": "Envío a revisión deshabilitado",
      "profile.heroTitle": "Complete el perfil del exportador antes de crear un caso.",
      "profile.heroCopy": "La cuenta ya está activa. Esta pantalla captura datos de empresa y preferencias para que el Agent prepare casos más limpios con menos escritura manual.",
      "dashboard.heroTitle": "El exportador ve un caso desde el origen comercial hasta el resultado de fondos.",
      "dashboard.heroCopy": "El primer espacio es la torre de control del exportador: comercio, evidencia, brechas del Agent, inspección, ruta de financiación, verificación DeFi y resultado final.",
      "new.heroTitle": "Crear intención de financiación.",
      "new.heroCopy": "El exportador empieza con una solicitud comercial concreta, no con un repositorio de archivos: qué operación, cuánto financiamiento, cuándo y qué modo de Agent.",
      "gap.heroTitle": "El Agent convierte la brecha documental en una tarea del exportador.",
      "gap.heroCopy": "Esta página vuelve operativo el prototipo: se ve la brecha, razón, responsable, criterio de cierre y estado de retorno.",
      "inspection.heroTitle": "El exportador ve el progreso de inspección, pero no crea el hecho de inspección.",
      "inspection.heroCopy": "La conclusión de inspección es visible porque afecta la preparación de financiación, pero sigue siendo responsabilidad del proveedor de inspección.",
      "funding.heroTitle": "El exportador ve qué ruta de financiación está activa.",
      "funding.heroCopy": "El exportador no opera el espacio del financiador, pero puede ver si el caso va por banco, DeFi puro o ruta de baja intervención humana.",
      "execution.heroTitle": "La aprobación no es finalización. Las condiciones de ejecución importan.",
      "execution.heroCopy": "Después de la aprobación, el exportador ve regla, pool, pausa y estado de ejecución en lenguaje de negocio. No se muestran Solidity, ABI, firma ni proof/hash.",
      "result.heroTitle": "El exportador ve el resultado real de fondos y bloqueos anteriores.",
      "result.heroCopy": "Aquí se cierra el ciclo: importe completado, ruta usada y bloqueos resueltos o posibles."
    }
  };

  function setMode(mode) {
    localStorage.setItem(key, mode);
    document.querySelectorAll("[data-agent-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.agentMode === mode);
    });
    document.querySelectorAll("[data-mode-label]").forEach((target) => {
      target.textContent = mode;
    });
  }

  function initMode() {
    const stored = localStorage.getItem(key) || fallback;
    setMode(stored);
    document.querySelectorAll("[data-agent-mode]").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.agentMode));
    });
  }

  function setLanguage(language) {
    const dictionary = translations[language] || translations[languageFallback];
    localStorage.setItem(langKey, language);
    document.documentElement.lang = language;
    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.value = language;
    });
    document.querySelectorAll("[data-i18n]").forEach((target) => {
      const value = dictionary[target.dataset.i18n];
      if (value) target.textContent = value;
    });
  }

  function initLanguage() {
    const stored = localStorage.getItem(langKey) || languageFallback;
    setLanguage(stored);
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

  document.addEventListener("DOMContentLoaded", () => {
    initMode();
    initLanguage();
    initActivePage();
  });
})();
