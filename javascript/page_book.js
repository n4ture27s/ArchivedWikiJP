let books = {};
let pages = {};

async function loadPageData() {

    const [bookRes, pageRes] = await Promise.all([
        fetch("/javascript/json/book_page/books.json"),
        fetch("/javascript/json/book_page/page.json")
    ]);

    books = await bookRes.json();
    pages = await pageRes.json();

    // URLからブックIDを取得 (?id=red_mist など)
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    // 初期表示設定
    const containerId = "page-list-container";
    if (document.getElementById(containerId)) {
        initPageControls(containerId, bookId);
        renderPageList(containerId, bookId);
    }

    if (bookId) {
        renderBookHeader(bookId);
    }
}

function initPageControls(containerId, filterBook = null) {
    const searchInput = document.getElementById("search");
    const sortButtons = document.querySelectorAll(".sort-btn");

    searchInput?.addEventListener("input", () => renderPageList(containerId, filterBook));

    sortButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const isActive = btn.classList.contains("active");
            const sortKey = btn.dataset.sort;
            let order = btn.dataset.order;

            // 他のボタンのステータスをリセット
            sortButtons.forEach(b => {
                if (b !== btn) {
                    b.classList.remove("active", "asc", "desc");
                    b.dataset.order = "asc";
                }
            });

            if (isActive) {
                // 昇順・降順切り替え
                order = order === "asc" ? "desc" : "asc";
            }

            btn.classList.add("active");
            btn.classList.remove("asc", "desc");
            btn.classList.add(order);
            btn.dataset.order = order;

            renderPageList(containerId, filterBook);
        });
    });
}

function getAllEffectValues(data) {
    const effects = [];
    [data.effect, data.effect2, data.effect3, data.effect4, data.effect5].forEach(val => {
        if (typeof val === 'string') {
            effects.push(val);
        } else if (Array.isArray(val)) {
            val.forEach(v => { if (typeof v === 'string') effects.push(v); });
        }
    });
    return effects;
}

function renderPageList(containerId, filterBook = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const searchTerm = document.getElementById("search")?.value.toLowerCase() || "";
    const activeSortBtn = document.querySelector(".sort-btn.active");
    const sortKey = activeSortBtn?.dataset.sort;
    const sortOrder = activeSortBtn?.dataset.order || "asc";

    container.innerHTML = "";

    // データをフラットな配列に変換してフィルタリング・ソートしやすくする
    let flatPages = [];
    const targetBookIds = filterBook ? [filterBook] : Object.keys(pages);
    
    targetBookIds.forEach(bookId => {
        if (!pages[bookId]) return;
        Object.entries(pages[bookId]).forEach(([pageId, data]) => {
            flatPages.push({ ...data, bookId, pageId });
        });
    });

    // 検索フィルタ
    if (searchTerm) {
        // status.json や combat_module.json のタイトル名でも検索をヒットさせるための前処理
        const matchingStatusKeys = [];
        [tooltipData, combat_module].forEach(src => {
            if (src) {
                Object.entries(src).forEach(([key, data]) => {
                    if (data.title && data.title.toLowerCase().includes(searchTerm)) {
                        matchingStatusKeys.push(key);
                    }
                });
            }
        });

        flatPages = flatPages.filter(p => {
            const allEffects = getAllEffectValues(p);
            // 名前(日/英)や生の効果テキストに含まれるか
            const isBasicMatch = p.name_jp.toLowerCase().includes(searchTerm) ||
                                 p.name_en.toLowerCase().includes(searchTerm) ||
                                 allEffects.some(eff => eff.toLowerCase().includes(searchTerm));
            
            if (isBasicMatch) return true;

            // 検索語に関連する内部キー（{bleed}等）が効果テキストに含まれるか
            if (matchingStatusKeys.length > 0) {
                return matchingStatusKeys.some(key => {
                    // {key} または {..., key} の形式を正規表現で探す
                    const regex = new RegExp(`\\{[^}]*${key}[^}]*\\}`, 'i');
                    return allEffects.some(eff => regex.test(eff));
                });
            }
            return false;
        });
    }

    // ソート
    if (sortKey) {
        flatPages.sort((a, b) => {
            const valA = parseFloat(a[sortKey]) || 0;
            const valB = parseFloat(b[sortKey]) || 0;
            return sortOrder === "asc" ? valA - valB : valB - valA;
        });
    }

    // 描画
    flatPages.forEach((data) => {
        const book = books[data.bookId];
        const div = document.createElement("div");
        div.className = "page-card";

        applyColorTheme(div, book.color, book.color2, {
            "--book-color": "primary",
            "--book-color-2": "secondary"
        });

        let videoHtml = '';
        if (data.image) {
            videoHtml += `
    <div class="page-video">
        <video autoplay loop muted>
            <source src="${data.image}">
        </video>
    </div>`;
        }
        let imgIdx = 2;
        while (data[`image${imgIdx}`]) {
            videoHtml += `
    <div class="page-video">
        <video autoplay loop muted>
            <source src="${data[`image${imgIdx}`]}">
        </video>
    </div>`;
            imgIdx++;
        }

        let effectsHtml = '';
        const allEffects = getAllEffectValues(data);
        if (allEffects.length === 0) {
            effectsHtml = `<div class="page-effect">${formatText('')}</div>\n        `;
        } else {
            allEffects.forEach((eff, idx) => {
                const cls = idx === 0 ? 'page-effect' : 'page-effect secondary-effect';
                effectsHtml += `<div class="${cls}">${formatText(String(eff))}</div>\n        `;
            });
        }

        div.innerHTML = `
    ${videoHtml}
    <div class="page-content">
        <div class="page-top">
        <div class="page-name">${data.name_jp} / ${data.name_en}</div>
        </div>
        ${effectsHtml}
        <div class="page-bottom">
            <div class="page-stat"><span class="tooltip-target" data-key="light"></span>:${data.light}</div>
            <div class="page-stat">CT:${data.ct}</div>
            <div class="page-obtain"><a href="/arsenal/page_detail.html?id=${data.bookId}">入手:${book.name_jp}</a> </div>
            
        </div>
    </div>
        `;

        container.appendChild(div);
    });

    applyAllStyles?.();
}

function renderBookList(containerId) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.classList.add("book-list");

    container.innerHTML = "";

    Object.entries(books).forEach(([id, data]) => {

        const div = document.createElement("div");

        div.className = "book-card";

        applyColorTheme(div, data.color, data.color2, {
            "--book-color": "primary",
            "--book-color-2": "secondary"
        });

        div.innerHTML = `
        
        <div class="book-icon-area">

            <img
                src="/assets/image/${data.icon}.png"
                alt="${data.name_en}"
            >

        </div>

        <div class="book-info">

            <div class="book-name_jp">
                ${data.name_jp}
            </div>

            <div class="book-name_en">
                ${data.name_en || ""}
            </div>

        </div>
        `;

        div.addEventListener("click", () => {

            location.href = `/arsenal/page_detail.html?id=${id}`;
        });

        container.appendChild(div);
    });
}


function renderBookHeader(bookId) {

    const data = books[bookId];

    if (!data) return;

    const el = document.getElementById("book-header");

    if (!el) return;

    applyColorTheme(el, data.color, data.color2, {
        "--book-color": "primary",
        "--book-color-2": "secondary"
    });

    el.innerHTML = `

    <div class="book-detail-header">

        <img
            src="/assets/image/${data.icon}.png"
            class="book-detail-icon"
        >

        <div>

            <h1>${data.name_jp}</h1>

            <p>${data.name_en || ""}</p>

        </div>

    </div>
    `;
}