(function () {
  var id = "p0-contrast-fix";
  if (document.getElementById(id)) return;
  var style = document.createElement("style");
  style.id = id;
  style.textContent = ".table,.table tr,.table th,.table td{background:transparent!important;color:var(--text)!important;box-shadow:none!important}.table th{color:var(--muted)!important}";
  document.head.appendChild(style);
})();
