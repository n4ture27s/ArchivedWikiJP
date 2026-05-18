const version = "1.0.6";

function loadScript(src) {
  const s = document.createElement("script");
  s.src = `${src}?v=${version}`;
  document.body.appendChild(s);
}

loadScript("/javascript/utils.js");
loadScript("/javascript/main.js");
loadScript("/javascript/page_book.js");
loadScript("/javascript/weapon_list.js");
loadScript("/javascript/table.js");
if (document.body.dataset.page === "update-log") {
  loadScript("/javascript/log.js");
}

if (document.body.dataset.page === "weapon-detail") {
  loadScript("/javascript/weapon_detail.js");
}

if (document.body.dataset.page === "license") {
  loadScript("/javascript/license.js");
}

if (document.body.dataset.page === "sin") {
  loadScript("/javascript/sin.js");
}

if (document.body.dataset.page === "page_detail") {
  loadScript("/javascript/page_detail.js");
}

if (document.body.dataset.page === "effect") {
  loadScript("/javascript/status_list.js");
}

async function init() {

  // JSON読み込み待機
  await Promise.all([
    loadPageData(),
    loadWeaponData()
  ]);

  // 本一覧ページ
  if (document.body.dataset.page === "books") {

    renderBookList("book-list");
  }

  // 本詳細ページ
  if (document.body.dataset.page === "page_detail") {

    const params =
      new URLSearchParams(location.search);

    const bookId = params.get("id");

    if (!bookId) return;

    renderBookHeader(bookId);

    renderPageList(
      "page-list",
      bookId
    );
  }

  // 協会ページ (特定のBook IDに紐づくページ一覧を表示)
  if (document.body.dataset.page === "avaiablepages") {

    const bookId = document.body.dataset.bookId;

    if (!bookId) return;

    renderPageList("page-list", bookId);
    renderWeaponList("weapon-list", bookId);
  }

  // 武器一覧ページ専用のUI初期化
  if (document.body.dataset.page === "weapon-list") {
    initWeaponListPage();
  }

}

window.addEventListener("load", init);

const typeMap = {
  slash: "斬撃",
  pierce: "貫通",
  blunt: "打撃"
};
