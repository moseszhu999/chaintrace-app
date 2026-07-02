(function () {
  var langKey = "chaintrace-p0-language";
  var index = { en: 0, zhHans: 1, zhHant: 2, ja: 3, es: 4 };
  var rows = [
    ["Exception to inspect", "要查看的异常", "要查看的異常", "確認する例外", "Excepción a revisar"],
    ["Exporter response preference", "出口商响应偏好", "出口商回應偏好", "輸出者の対応設定", "Preferencia de respuesta"],
    ["Alternative outcomes", "替代结果", "替代結果", "代替結果", "Resultados alternativos"],
    ["Pool insufficient", "资金池不足", "資金池不足", "プール不足", "Pool insuficiente"],
    ["Inspection dispute", "质检争议", "質檢爭議", "検査紛争", "Disputa de inspección"],
    ["Rule blocked", "规则阻断", "規則阻斷", "ルールブロック", "Regla bloqueada"],
    ["Platform paused", "平台暂停", "平台暫停", "プラットフォーム停止", "Plataforma pausada"],
    ["Need materials", "需要材料", "需要材料", "資料が必要", "Necesita materiales"],
    ["Wait and receive updates", "等待并接收更新", "等待並接收更新", "待機して更新を受け取る", "Esperar y recibir actualizaciones"],
    ["Ask Agent for next action", "询问 Agent 下一步", "詢問 Agent 下一步", "Agent に次アクションを確認", "Pedir siguiente acción al Agent"],
    ["Escalate to funder", "升级给资金方", "升級給資金方", "資金提供者へエスカレーション", "Escalar al financiador"],
    ["Close current case", "关闭当前案件", "關閉目前案件", "現在のケースを閉じる", "Cerrar caso actual"],
    ["State", "状态", "狀態", "状態", "Estado"],
    ["Exporter meaning", "出口商含义", "出口商含義", "輸出者向け意味", "Significado para exportador"],
    ["Responsible party", "责任方", "責任方", "責任者", "Parte responsable"],
    ["Recovery condition", "恢复条件", "恢復條件", "回復条件", "Condición de recuperación"],
    ["More evidence or explanation is required.", "需要更多证据或说明。", "需要更多證據或說明。", "追加の証拠または説明が必要です。", "Se requiere más evidencia o explicación."],
    ["Exporter or fact provider", "出口商或事实提供方", "出口商或事實提供方", "輸出者または事実提供者", "Exportador o proveedor de hechos"],
    ["Complete the Agent todo.", "完成 Agent 待办。", "完成 Agent 待辦。", "Agent タスクを完了します。", "Completar la tarea del Agent."],
    ["Goods fact is not clean enough for automatic progress.", "货物事实还不足以自动推进。", "貨物事實還不足以自動推進。", "商品事実が自動進行に十分明確ではありません。", "El hecho de mercancía no es suficiente para avanzar automáticamente."],
    ["Inspector / funder", "质检方 / 资金方", "質檢方 / 資金方", "検査者 / 資金提供者", "Inspector / financiador"],
    ["Manual review or supplemental evidence.", "人工审核或补充证据。", "人工審核或補充證據。", "手動レビューまたは補足証拠。", "Revisión manual o evidencia adicional."],
    ["Reduced", "金额降低", "金額降低", "減額", "Reducido"],
    ["Funder allows less than requested.", "资金方允许金额低于申请金额。", "資金方允許金額低於申請金額。", "資金提供者が申請額より低い金額を許可しました。", "El financiador permite menos de lo solicitado."],
    ["Funder", "资金方", "資金方", "資金提供者", "Financiador"],
    ["Exporter accepts adjusted result or reworks case.", "出口商接受调整结果或重做案件。", "出口商接受調整結果或重做案件。", "輸出者が調整結果を受け入れるかケースを再作成します。", "El exportador acepta el ajuste o rehace el caso."],
    ["Approval exists, but pool cannot execute now.", "已有批准，但资金池当前无法执行。", "已有批准，但資金池目前無法執行。", "承認はありますが、プールが現在実行できません。", "Existe aprobación, pero el pool no puede ejecutar ahora."],
    ["Platform / funder", "平台 / 资金方", "平台 / 資金方", "プラットフォーム / 資金提供者", "Plataforma / financiador"],
    ["Pool recovers or case waits.", "资金池恢复，或案件等待。", "資金池恢復，或案件等待。", "プールが回復するかケースが待機します。", "El pool se recupera o el caso espera."],
    ["Current rule does not allow execution.", "当前规则不允许执行。", "目前規則不允許執行。", "現在のルールでは実行できません。", "La regla actual no permite la ejecución."],
    ["Platform", "平台", "平台", "プラットフォーム", "Plataforma"],
    ["Rule restored, exception handled, or case closed.", "规则恢复、异常处理完成，或案件关闭。", "規則恢復、異常處理完成，或案件關閉。", "ルール復旧、例外処理、またはケース終了。", "Regla restaurada, excepción gestionada o caso cerrado."],
    ["Automation and execution are stopped.", "自动化和执行已停止。", "自動化和執行已停止。", "自動化と実行が停止しています。", "Automatización y ejecución detenidas."],
    ["Platform resumes the affected object.", "平台恢复受影响对象。", "平台恢復受影響物件。", "プラットフォームが対象を再開します。", "La plataforma reanuda el objeto afectado."]
  ];
  function language() { return localStorage.getItem(langKey) || "en"; }
  function rowFor(text) {
    var value = String(text || "").trim();
    for (var i = 0; i < rows.length; i += 1) {
      for (var j = 0; j < rows[i].length; j += 1) {
        if (rows[i][j] === value) return rows[i];
      }
    }
    return null;
  }
  function translate(text, lang) {
    var row = rowFor(text);
    return row ? row[index[lang] || 0] || row[0] : text;
  }
  function apply() {
    var lang = language();
    document.querySelectorAll("body *").forEach(function (el) {
      if (el.children.length > 0) return;
      var current = String(el.textContent || "").trim();
      var next = translate(current, lang);
      if (next !== current) el.textContent = next;
    });
    document.querySelectorAll("option").forEach(function (el) {
      var current = String(el.textContent || "").trim();
      var next = translate(current, lang);
      if (next !== current) el.textContent = next;
    });
  }
  window.ChainTraceP0ResultExceptionsI18n = { apply: apply };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(apply, 0); });
  else setTimeout(apply, 0);
  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-language-select]")) setTimeout(apply, 0);
  });
})();
