(function () {
  const langKey = "chaintrace-p0-language";
  const fallback = "en";
  const languages = ["en", "zhHans", "zhHant", "ja", "es"];
  const textRows = [
    ["Exporter Flow", "出口商流程", "出口商流程", "輸出者フロー", "Flujo del exportador"],
    ["Wallet", "钱包", "錢包", "ウォレット", "Billetera"],
    ["Role", "角色", "角色", "ロール", "Rol"],
    ["Bound role", "绑定角色", "綁定角色", "紐づけ角色", "Rol vinculado"],
    ["Case", "案件", "案件", "ケース", "Caso"],
    ["Current case", "当前案件", "目前案件", "現在のケース", "Caso actual"],
    ["Case status", "案件状态", "案件狀態", "ケース状態", "Estado del caso"],
    ["Approved", "已批准", "已批准", "承認済み", "Aprobado"],
    ["Exporter", "出口商", "出口商", "輸出者", "Exportador"],
    ["Draft", "草稿", "草稿", "ドラフト", "Borrador"],
    ["Ready", "就绪", "就緒", "準備完了", "Listo"],
    ["Active exporter", "出口商已激活", "出口商已啟用", "有効な輸出者", "Exportador activo"],
    ["Profile usable", "资料可用", "資料可用", "プロフィール可用", "Perfil utilizable"],
    ["Materials incomplete", "材料不完整", "材料不完整", "資料未完了", "Materiales incompletos"],
    ["Conflict detected", "发现冲突", "發現衝突", "不一致を検出", "Conflicto detectado"],
    ["Pass", "通过", "通過", "Pass", "Aprobado"],
    ["Completed", "已完成", "已完成", "完了", "Completado"],
    ["Allowed", "已允许", "已允許", "許可済み", "Permitido"],
    ["Disabled", "已禁用", "已停用", "無効", "Deshabilitado"],
    ["Done", "已完成", "已完成", "完了", "Hecho"],
    ["Waiting", "等待中", "等待中", "待機中", "Esperando"],
    ["Locked", "锁定", "鎖定", "ロック中", "Bloqueado"],
    ["Pending", "待定", "待定", "保留中", "Pendiente"],
    ["Next", "下一步", "下一步", "次", "Siguiente"],
    ["Review", "审核", "審核", "レビュー", "Revisión"],
    ["Conflict", "冲突", "衝突", "不一致", "Conflicto"],
    ["No result", "无结果", "無結果", "結果なし", "Sin resultado"],
    ["Role Gate", "角色入口", "角色入口", "ロールゲート", "Puerta de rol"],
    ["One wallet maps to one business role. Agent mode is selectable, but it does not change the role boundary.", "一个钱包对应一个业务角色。Agent 模式可以选择，但不会改变角色边界。", "一個錢包對應一個業務角色。Agent 模式可以選擇，但不會改變角色邊界。", "1つのウォレットは1つの業務ロールに対応します。Agent モードは選択できますが、ロール境界は変わりません。", "Una billetera corresponde a un rol de negocio. El modo Agent es seleccionable, pero no cambia el límite del rol."],
    ["Recognized Business Identity", "已识别的业务身份", "已識別的業務身分", "認識済みの事業ID", "Identidad de negocio reconocida"],
    ["Agent Mode", "Agent 模式", "Agent 模式", "Agent モード", "Modo Agent"],
    ["Business meaning:", "业务含义：", "業務含義：", "業務上の意味:", "Significado de negocio:"],
    ["this user can create and manage its own financing cases. It cannot review funding, edit inspection conclusions, or operate platform rules.", "该用户可以创建和管理自己的融资案件，但不能审核融资、编辑质检结论或操作平台规则。", "該使用者可以建立和管理自己的融資案件，但不能審核融資、編輯質檢結論或操作平台規則。", "このユーザーは自分の資金調達ケースを作成・管理できますが、資金審査、検査結論の編集、プラットフォームルールの操作はできません。", "este usuario puede crear y gestionar sus propios casos de financiación. No puede revisar financiación, editar conclusiones de inspección ni operar reglas de plataforma."],
    ["What is not shown here", "这里不展示什么", "這裡不展示什麼", "ここで表示しないもの", "Lo que no se muestra aquí"],
    ["Public marketing homepage", "公开营销首页", "公開行銷首頁", "公開マーケティングページ", "Página pública de marketing"],
    ["Role picker for real users", "真实用户角色选择器", "真實使用者角色選擇器", "実ユーザー向けロール選択", "Selector de rol para usuarios reales"],
    ["Proof/hash product page", "证明/hash 产品页", "證明/hash 產品頁", "proof/hash 製品ページ", "Página de producto proof/hash"],
    ["Funder or platform controls", "资金方或平台控制项", "資金方或平台控制項", "資金提供者または平台操作", "Controles de financiador o plataforma"],
    ["Not P0", "非 P0", "非 P0", "P0 対象外", "No P0"],
    ["Not allowed", "不允许", "不允許", "許可されない", "No permitido"],
    ["Deferred", "延后", "延後", "後回し", "Diferido"],
    ["Out of role", "角色外", "角色外", "ロール範囲外", "Fuera del rol"],
    ["Exporter Profile", "出口商资料", "出口商資料", "輸出者プロフィール", "Perfil del exportador"],
    ["Most inputs are constrained selections. Free text is reserved for business address and special notes.", "大多数输入都是受控选择。自由文本仅用于业务地址和特殊备注。", "大多數輸入都是受控選擇。自由文字僅用於業務地址和特殊備註。", "ほとんどの入力は制約付き選択です。自由記述は事業住所と特記事項に限定されます。", "La mayoría de entradas son selecciones restringidas. El texto libre se reserva para dirección y notas especiales."],
    ["Company Information", "公司信息", "公司資訊", "会社情報", "Información de empresa"],
    ["Business account", "企业账户", "企業帳戶", "事業アカウント", "Cuenta empresarial"],
    ["Registered company name", "注册公司名称", "註冊公司名稱", "登録会社名", "Nombre legal de la empresa"],
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
    ["Save profile and enter workspace", "保存资料并进入工作区", "儲存資料並進入工作區", "プロフィールを保存してワークスペースへ", "Guardar perfil y entrar al espacio"],
    ["Case CT-P0-EX-001", "案件 CT-P0-EX-001", "案件 CT-P0-EX-001", "ケース CT-P0-EX-001", "Caso CT-P0-EX-001"],
    ["Invoice", "发票", "發票", "インボイス", "Factura"],
    ["PO amount", "PO 金额", "PO 金額", "PO 金額", "Importe PO"],
    ["Requested", "申请金额", "申請金額", "申請額", "Solicitado"],
    ["Path", "路径", "路徑", "パス", "Ruta"],
    ["Intent", "意图", "意圖", "意図", "Intención"],
    ["Materials", "材料", "材料", "資料", "Materiales"],
    ["Gap Todo", "缺口待办", "缺口待辦", "ギャップタスク", "Tarea de brecha"],
    ["Agent Assist", "Agent 辅助", "Agent 輔助", "Agent 支援", "Asistencia del Agent"],
    ["Current gap", "当前缺口", "目前缺口", "現在のギャップ", "Brecha actual"],
    ["Invoice mismatch", "发票不匹配", "發票不匹配", "インボイス不一致", "Diferencia de factura"],
    ["Responsible party", "责任方", "責任方", "責任者", "Parte responsable"],
    ["Next action", "下一步动作", "下一步動作", "次のアクション", "Siguiente acción"],
    ["Upload explanation", "上传说明", "上傳說明", "説明をアップロード", "Subir explicación"],
    ["Submit to review", "提交审核", "提交審核", "レビューへ提出", "Enviar a revisión"],
    ["Current task action", "当前任务动作", "目前任務動作", "現在のタスク操作", "Acción de tarea actual"],
    ["Task note", "任务备注", "任務備註", "タスクメモ", "Nota de tarea"],
    ["Start from intent", "从意图开始", "從意圖開始", "意図から開始", "Empezar desde intención"],
    ["Resolve current gap", "解决当前缺口", "解決目前缺口", "現在のギャップを解消", "Resolver brecha actual"],
    ["Financing Intent Draft", "融资意图草稿", "融資意圖草稿", "資金調達意図ドラフト", "Borrador de intención de financiación"],
    ["Financing type", "融资类型", "融資類型", "資金調達タイプ", "Tipo de financiación"],
    ["Settlement currency", "结算币种", "結算幣種", "決済通貨", "Moneda de liquidación"],
    ["Requested amount", "申请金额", "申請金額", "申請額", "Importe solicitado"],
    ["Expected funding time", "期望到账时间", "期望到帳時間", "希望資金化時期", "Tiempo esperado de financiación"],
    ["Buyer", "买方", "買方", "買い手", "Comprador"],
    ["Buyer country", "买方国家", "買方國家", "買い手の国", "País del comprador"],
    ["Goods category", "货物类别", "貨物類別", "商品カテゴリ", "Categoría de mercancía"],
    ["Shipment quantity", "出货数量", "出貨數量", "出荷数量", "Cantidad de envío"],
    ["Trade note", "贸易备注", "貿易備註", "貿易メモ", "Nota comercial"],
    ["Create case and prepare materials", "创建案件并准备材料", "建立案件並準備材料", "ケースを作成して資料を準備", "Crear caso y preparar materiales"],
    ["Back to control tower", "返回控制塔", "返回控制塔", "コントロールタワーへ戻る", "Volver a la torre"],
    ["Agent Setup", "Agent 设置", "Agent 設定", "Agent 設定", "Configuración del Agent"],
    ["Boundary:", "边界：", "邊界：", "境界:", "Límite:"],
    ["Material", "材料", "材料", "資料", "Material"],
    ["Status", "状态", "狀態", "状態", "Estado"],
    ["Business use", "业务用途", "業務用途", "業務用途", "Uso de negocio"],
    ["Uploaded", "已上传", "已上傳", "アップロード済み", "Cargado"],
    ["Purchase contract", "采购合同", "採購合約", "購入契約", "Contrato de compra"],
    ["Purchase order", "采购订单", "採購訂單", "発注書", "Orden de compra"],
    ["Commercial invoice", "商业发票", "商業發票", "商業インボイス", "Factura comercial"],
    ["Packing list", "装箱单", "裝箱單", "梱包明細", "Lista de empaque"],
    ["Inspection report", "质检报告", "質檢報告", "検査レポート", "Informe de inspección"],
    ["Not yet", "尚未", "尚未", "未対応", "Aún no"],
    ["Gap found", "发现缺口", "發現缺口", "ギャップ検出", "Brecha encontrada"],
    ["Responsibility", "责任", "責任", "責任", "Responsabilidad"],
    ["Impact", "影响", "影響", "影響", "Impacto"],
    ["Required recovery", "所需恢复动作", "所需恢復動作", "必要な回復対応", "Recuperación requerida"],
    ["Explanation or corrected invoice", "说明或修正发票", "說明或修正發票", "説明または修正インボイス", "Explicación o factura corregida"],
    ["Agent Todo", "Agent 待办", "Agent 待辦", "Agent タスク", "Tarea del Agent"],
    ["Resolution type", "解决类型", "解決類型", "解決タイプ", "Tipo de resolución"],
    ["Who is responsible", "谁负责", "誰負責", "担当者", "Quién es responsable"],
    ["Supporting file", "支持文件", "支持文件", "補足ファイル", "Archivo de soporte"],
    ["Return target", "返回目标", "返回目標", "戻り先", "Destino de retorno"],
    ["Ready to submit", "可提交", "可提交", "提出可能", "Listo para enviar"],
    ["Manual review", "人工审核", "人工審核", "手動レビュー", "Revisión manual"],
    ["Back to materials", "返回材料", "返回材料", "資料へ戻る", "Volver a materiales"],
    ["Explanation text", "说明文本", "說明文字", "説明テキスト", "Texto de explicación"],
    ["Business reason", "业务原因", "業務原因", "業務理由", "Razón de negocio"],
    ["Responsible role", "责任角色", "責任角色", "責任ロール", "Rol responsable"],
    ["Suggested material", "建议材料", "建議材料", "推奨資料", "Material sugerido"],
    ["Completion standard", "完成标准", "完成標準", "完了基準", "Criterio de cierre"],
    ["Return state", "返回状态", "返回狀態", "戻り状態", "Estado de retorno"],
    ["Submit explanation and re-check", "提交说明并重新检查", "提交說明並重新檢查", "説明を提出して再チェック", "Enviar explicación y revisar de nuevo"],
    ["After Re-check Preview", "重新检查后预览", "重新檢查後預覽", "再チェック後プレビュー", "Vista tras revisión"],
    ["Explained", "已解释", "已解釋", "説明済み", "Explicado"],
    ["Submission readiness", "提交准备度", "提交準備度", "提出準備状況", "Preparación de envío"],
    ["Next node", "下一节点", "下一節點", "次ノード", "Siguiente nodo"],
    ["Inspection task", "质检任务", "質檢任務", "検査タスク", "Tarea de inspección"],
    ["Agent boundary", "Agent 边界", "Agent 邊界", "Agent 境界", "Límite del Agent"],
    ["No fact creation", "不创建事实", "不建立事實", "事実作成なし", "Sin crear hechos"],
    ["Inspection Fact Node", "质检事实节点", "質檢事實節點", "検査事実ノード", "Nodo de hecho de inspección"],
    ["Task Request", "任务请求", "任務請求", "タスク依頼", "Solicitud de tarea"],
    ["Inspection provider", "质检服务商", "質檢服務商", "検査プロバイダー", "Proveedor de inspección"],
    ["Priority", "优先级", "優先級", "優先度", "Prioridad"],
    ["Inspection location", "质检地点", "質檢地點", "検査場所", "Ubicación de inspección"],
    ["Task status", "任务状态", "任務狀態", "タスク状態", "Estado de tarea"],
    ["Closed", "已关闭", "已關閉", "クローズ", "Cerrado"],
    ["Evidence", "证据", "證據", "証拠", "Evidencia"],
    ["Report", "报告", "報告", "レポート", "Informe"],
    ["Submitted", "已提交", "已提交", "提出済み", "Enviado"],
    ["Photos", "照片", "照片", "写真", "Fotos"],
    ["Quantity note", "数量说明", "數量說明", "数量メモ", "Nota de cantidad"],
    ["Matched", "已匹配", "已匹配", "一致", "Coincide"],
    ["Conclusion source", "结论来源", "結論來源", "結論ソース", "Fuente de conclusión"],
    ["Continue to funding path", "继续到融资路径", "繼續到融資路徑", "資金調達パスへ進む", "Continuar a ruta de financiación"],
    ["Funding Path", "融资路径", "融資路徑", "資金調達パス", "Ruta de financiación"],
    ["Preferred path", "偏好路径", "偏好路徑", "希望パス", "Ruta preferida"],
    ["Preferred funder", "偏好资金方", "偏好資金方", "希望資金提供者", "Financiador preferido"],
    ["Accept reduced amount?", "是否接受降低金额？", "是否接受降低金額？", "減額を受け入れるか？", "¿Aceptar importe reducido?"],
    ["Manual review threshold", "人工审核阈值", "人工審核門檻", "手動レビューしきい値", "Umbral de revisión manual"],
    ["Funder", "资金方", "資金方", "資金提供者", "Financiador"],
    ["Funder allowed USD 92,000", "资金方允许 USD 92,000", "資金方允許 USD 92,000", "資金提供者が USD 92,000 を許可", "Financiador permitió USD 92,000"],
    ["Preview exception result", "预览异常结果", "預覽異常結果", "例外结果をプレビュー", "Previsualizar excepción"],
    ["Path Difference Visible", "路径差异可见", "路徑差異可見", "パス差分表示", "Diferencia de ruta visible"],
    ["Bank-assisted", "银行辅助", "銀行輔助", "銀行支援", "Asistido por banco"],
    ["Pure DeFi", "纯 DeFi", "純 DeFi", "純 DeFi", "DeFi puro"],
    ["Low-human", "低人工", "低人工", "低人手", "Baja intervención"],
    ["Manual escalation", "人工升级", "人工升級", "手動エスカレーション", "Escalado manual"],
    ["Execution Condition Check", "执行条件检查", "執行條件檢查", "実行条件チェック", "Verificación de condiciones"],
    ["Case Conditions", "案件条件", "案件條件", "ケース条件", "Condiciones del caso"],
    ["Satisfied", "已满足", "已滿足", "満たす", "Satisfechas"],
    ["Complete", "完整", "完整", "完了", "Completo"],
    ["Funder decision", "资金方决策", "資金方決策", "資金提供者判断", "Decisión del financiador"],
    ["Open dispute", "开放争议", "開放爭議", "未解決紛争", "Disputa abierta"],
    ["None", "无", "無", "なし", "Ninguna"],
    ["Rule and Pool", "规则与资金池", "規則與資金池", "ルールとプール", "Regla y pool"],
    ["Rule version", "规则版本", "規則版本", "ルールバージョン", "Versión de regla"],
    ["Pool status", "资金池状态", "資金池狀態", "プール状態", "Estado del pool"],
    ["Execution Output", "执行输出", "執行輸出", "実行出力", "Salida de ejecución"],
    ["If execution waits", "如果执行等待", "如果執行等待", "実行待ちの場合", "Si la ejecución espera"],
    ["Notification level", "通知级别", "通知級別", "通知レベル", "Nivel de notificación"],
    ["Complete execution", "完成执行", "完成執行", "実行を完了", "Completar ejecución"],
    ["Show blockers", "显示阻断项", "顯示阻斷項", "ブロッカーを表示", "Mostrar bloqueos"],
    ["Funding Result", "资金结果", "資金結果", "資金結果", "Resultado de fondos"],
    ["Funder allowed", "资金方允许", "資金方允許", "資金提供者許可", "Financiador permitió"],
    ["Executed", "已执行", "已執行", "実行済み", "Ejecutado"],
    ["Result", "结果", "結果", "結果", "Resultado"],
    ["Exporter decision on adjusted amount", "出口商对调整金额的决定", "出口商對調整金額的決定", "調整額に対する輸出者判断", "Decisión sobre importe ajustado"],
    ["Case follow-up", "案件后续", "案件後續", "ケースフォロー", "Seguimiento del caso"],
    ["Return to role gate", "返回角色入口", "返回角色入口", "ロールゲートへ戻る", "Volver a puerta de rol"],
    ["Agent Closing Summary", "Agent 收尾摘要", "Agent 收尾摘要", "Agent クロージングサマリー", "Resumen final del Agent"],
    ["Material conflict", "材料冲突", "材料衝突", "資料不一致", "Conflicto de material"],
    ["Funding decision", "融资决策", "融資決策", "資金調達判断", "Decisión de financiación"],
    ["Execution", "执行", "執行", "実行", "Ejecución"],
    ["Exporter closing note", "出口商结案备注", "出口商結案備註", "輸出者クロージングメモ", "Nota final del exportador"],
    ["Exporter-visible Exception States", "出口商可见异常状态", "出口商可見異常狀態", "輸出者に見える例外状態", "Estados de excepción visibles"],
    ["Alternative outcomes", "替代结果", "替代結果", "代替結果", "Resultados alternativos"],
    ["Exception to inspect", "要查看的异常", "要查看的異常", "確認する例外", "Excepción a revisar"],
    ["Exporter response preference", "出口商响应偏好", "出口商回應偏好", "輸出者の対応設定", "Preferencia de respuesta"],
    ["State", "状态", "狀態", "状態", "Estado"],
    ["Exporter meaning", "出口商含义", "出口商含義", "輸出者向け意味", "Significado para exportador"],
    ["Recovery condition", "恢复条件", "恢復條件", "回復条件", "Condición de recuperación"],
    ["Platform", "平台", "平台", "プラットフォーム", "Plataforma"]
  ];

  const indexByLanguage = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  const originalTextAttr = "data-auto-i18n-original";
  const originalValueAttr = "data-auto-i18n-original-value";
  const map = new Map(textRows.map((row) => [row[0], row]));

  function currentLanguage() {
    return localStorage.getItem(langKey) || fallback;
  }

  function translate(original, language) {
    const normalized = String(original || "").trim();
    const row = map.get(normalized);
    if (!row) return original;
    return row[indexByLanguage[language] || 0] || normalized;
  }

  function translateTextNodes(language) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, [data-i18n]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.__chainTraceOriginalText) node.__chainTraceOriginalText = node.nodeValue.trim();
      const translated = translate(node.__chainTraceOriginalText, language);
      const leading = node.nodeValue.match(/^\s*/)?.[0] || "";
      const trailing = node.nodeValue.match(/\s*$/)?.[0] || "";
      node.nodeValue = `${leading}${translated}${trailing}`;
    });
  }

  function translateValues(language) {
    document.querySelectorAll("textarea").forEach((target) => {
      if (!target.hasAttribute(originalValueAttr)) target.setAttribute(originalValueAttr, target.value);
      target.value = translate(target.getAttribute(originalValueAttr), language);
    });
  }

  function applyAutoI18n() {
    const language = currentLanguage();
    translateTextNodes(language);
    translateValues(language);
  }

  function initAutoI18n() {
    setTimeout(applyAutoI18n, 0);
    document.querySelectorAll("[data-language-select]").forEach((select) => {
      if (select.dataset.autoI18nBound === "true") return;
      select.dataset.autoI18nBound = "true";
      select.addEventListener("change", () => setTimeout(applyAutoI18n, 0));
    });
  }

  window.ChainTraceP0AutoI18n = { apply: applyAutoI18n };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoI18n);
  } else {
    initAutoI18n();
  }
})();
