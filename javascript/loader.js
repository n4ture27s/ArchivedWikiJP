function loadScript(src) {
  const s = document.createElement("script");
  s.src = `${src}?v=${APP_VERSION}`;
  document.body.appendChild(s);
}

loadScript("/javascript/utils.js");
loadScript("/javascript/main.js");
loadScript("/javascript/weapon.js");
loadScript("/javascript/outfit.js");
loadScript("/javascript/items.js");
loadScript("/javascript/page_data.js");
loadScript("/javascript/renders.js");

async function init() {

  // JSON読み込み待機
  await Promise.all([
    loadPageData(),
    loadWeaponData(),
    loadOutfitData(),
    loadItemsData()
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
    renderSimplifiedWeaponList("weapon-list", bookId);
  }

  // 武器一覧ページ専用のUI初期化
  if (document.body.dataset.page === "weapon-list") {
    initWeaponListPage();
  }

  // 服一覧ページ
  if (document.body.dataset.page === "outfit-list") {
    initOutfitListPage();
  }

  // アイテム一覧ページ
  if (document.body.dataset.page === "items") {
    initItemListPage();
  }

  // 服詳細ページ
  if (document.body.dataset.page === "outfit-detail") {
    (function() {
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      if (!id || !allOutfitsData[id]) return;
      const outfit = allOutfitsData[id];
      const nameEn = document.getElementById("outfit-name-en");
      const nameJp = document.getElementById("outfit-name-jp");
      const stats = document.getElementById("outfit-stats");
      const keypage = document.getElementById("outfit-keypage-container");
      if (nameEn) nameEn.textContent = outfit.name_en;
      if (nameJp) nameJp.textContent = outfit.name_jp || "";
      document.title = outfit.name_en;
      if (stats) {
        const res = outfit.resistance || {};
        const resText = `打${res.blunt ?? "?"} / 貫${res.pierce ?? "?"} / 斬${res.slash ?? "?"}`;
        stats.innerHTML = `
          <div class="stat"><span class="label">速度</span><span class="value">${outfit.speed}</span></div>
          <div class="stat"><span class="label">耐性</span><span class="value">${resText}</span></div>
          <div class="stat"><span class="label">入手方法</span><span class="value">${renderMaterials(outfit.req)}</span></div>
        `;
      }
      if (keypage && outfit.keypage) {
        keypage.innerHTML = outfit.keypage.map(kp =>
          `<div class="expanded-keypage"><div class="keypage-title">${kp.title}</div><div class="keypage-effect">${formatOutfitText(kp.effect)}</div></div>`
        ).join("");
      }
    })();
  }

  // アイテム詳細ページ
  if (document.body.dataset.page === "item-detail") {
    (function() {
      console.log("[item-detail] init started");
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      console.log("[item-detail] id from URL:", id);
      console.log("[item-detail] allItemsData exists:", typeof allItemsData !== "undefined", "keys:", allItemsData ? Object.keys(allItemsData).length : 0);
      if (!id) { console.warn("[item-detail] no id in URL"); return; }
      if (!allItemsData) { console.error("[item-detail] allItemsData is undefined"); return; }
      if (!allItemsData[id]) { console.warn("[item-detail] id not found in allItemsData:", id, "available keys:", Object.keys(allItemsData)); return; }
      const item = allItemsData[id];
      console.log("[item-detail] item found:", item.name_en);
      const nameEn = document.getElementById("item-name-en");
      const nameJp = document.getElementById("item-name-jp");
      const cat = document.getElementById("item-category");
      const desc = document.getElementById("item-desc");
      const obtain = document.getElementById("item-obtain");
      console.log("[item-detail] DOM elements - nameEn:", !!nameEn, "nameJp:", !!nameJp, "cat:", !!cat, "desc:", !!desc, "obtain:", !!obtain);
      if (nameEn) nameEn.textContent = item.name_en;
      if (nameJp) nameJp.textContent = item.name_jp || "";
      document.title = item.name_en;
      const labels = { basic: "基本素材", unique: "ユニーク素材", consumable: "消費アイテム", book: "書物", chip: "チップ", misc: "その他" };
      if (cat) cat.textContent = labels[item.category] || item.category;
      if (desc) desc.textContent = item.desc || "";
      if (obtain) obtain.textContent = item.obtain || "";
      console.log("[item-detail] basic info populated");

      // このアイテムを使用する服を自動検索
      const usedInOutfits = document.getElementById("item-used-in-outfits");
      console.log("[item-detail] usedInOutfits element:", !!usedInOutfits, "allOutfitsData exists:", typeof allOutfitsData !== "undefined");
      if (usedInOutfits && allOutfitsData) {
        console.log("[item-detail] scanning outfits for item usage, outfits count:", Object.keys(allOutfitsData).length);
        const matched = [];
        Object.entries(allOutfitsData).forEach(([oid, outfit]) => {
          if (!outfit.req) return;
          outfit.req.forEach(r => {
            const m = r.match(/^\d+x\s+(.*)$/);
            const name = m ? m[1] : r;
            const itemId = getItemIdByName ? getItemIdByName(name) : null;
            if (itemId === id && !matched.find(x => x.id === oid)) {
              matched.push({ id: oid, name_en: outfit.name_en });
            }
          });
        });
        console.log("[item-detail] matched outfits:", matched.length, matched);
        if (matched.length > 0) {
          usedInOutfits.innerHTML = matched.map(o =>
            `<a href="/arsenal/outfit_detail.html?id=${o.id}" class="item-used-link">${o.name_en}</a>`
          ).join("");
        } else {
          const label = document.getElementById("item-used-label");
          if (label) label.style.display = "none";
          usedInOutfits.style.display = "none";
        }
      }
      console.log("[item-detail] init complete");
    })();
  }

}

window.addEventListener("load", init);

const typeMap = {
  slash: "斬撃",
  pierce: "貫通",
  blunt: "打撃"
};
