const version = "1.0.3";

function loadScript(src) {
  const s = document.createElement("script");
  s.src = `${src}?v=${version}`;
  document.body.appendChild(s);
}

loadScript("/javascript/main.js");

if (document.body.dataset.page === "update-log") {
  loadScript("/javascript/log.js");
}

if (document.body.dataset.page === "weapon-list") {
  loadScript("/javascript/weapon_list.js");
}

if (document.body.dataset.page === "weapon-detail") {
  loadScript("/javascript/weapon_detail.js");
}

if (document.body.dataset.page === "trait") {
  loadScript("/javascript/table.js");
}