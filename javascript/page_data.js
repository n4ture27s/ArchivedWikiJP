// ===== page_book.js =====

let books = {};
let pages = {};

async function loadPageData() {

    const res = await fetch("/javascript/json/book_page/data.json");
    const data = await res.json();
    books = data.books;
    pages = data.pages;

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

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
    const searchInput = document.getElementById("page-search");
    const sortButtons = document.querySelectorAll(".sort-btn");

    searchInput?.addEventListener("input", () => renderPageList(containerId, filterBook));

    sortButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const isActive = btn.classList.contains("active");
            const sortKey = btn.dataset.sort;
            let order = btn.dataset.order;

            sortButtons.forEach(b => {
                if (b !== btn) {
                    b.classList.remove("active", "asc", "desc");
                    b.dataset.order = "asc";
                }
            });

            if (isActive) {
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

function renderPageCard(container, data, book) {
    const div = document.createElement("div");
    div.className = "page-card";

    if (book) {
        applyColorTheme(div, book.color, book.color2, {
            "--book-color": "primary",
            "--book-color-2": "secondary"
        });
    }

    let videoHtml = '';
    const imageList = Array.isArray(data.image) ? data.image : (data.image ? [data.image] : []);
    if (imageList.length > 0) {
        videoHtml = '\n    <div class="page-videos">';
        imageList.forEach(src => {
            videoHtml += `
        <div class="page-video">
            <video autoplay loop muted>
                <source src="${src}">
            </video>
        </div>`;
        });
        videoHtml += '\n    </div>';
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

    const bookName = book ? book.name_jp : "";
    const bookId = data.bookId || (book ? data.sourceBook : "");

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
            ${bookId ? `<div class="page-obtain"><a href="/arsenal/page_detail.html?id=${bookId}">入手:${bookName}</a> </div>` : ""}
            
        </div>
    </div>
        `;

    container.appendChild(div);
}

function renderPageList(containerId, filterBook = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const searchTerm = document.getElementById("page-search")?.value.toLowerCase() || "";
    const activeSortBtn = document.querySelector(".sort-btn.active");
    const sortKey = activeSortBtn?.dataset.sort;
    const sortOrder = activeSortBtn?.dataset.order || "asc";

    container.innerHTML = "";

    let flatPages = [];
    const targetBookIds = filterBook ? [filterBook] : Object.keys(pages);
    
    targetBookIds.forEach(bookId => {
        if (!pages[bookId]) return;
        Object.entries(pages[bookId]).forEach(([pageId, data]) => {
            flatPages.push({ ...data, bookId, pageId });
        });
    });

    if (searchTerm) {
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
            const isBasicMatch = p.name_jp.toLowerCase().includes(searchTerm) ||
                                 p.name_en.toLowerCase().includes(searchTerm) ||
                                 allEffects.some(eff => eff.toLowerCase().includes(searchTerm));
            
            if (isBasicMatch) return true;

            if (matchingStatusKeys.length > 0) {
                return matchingStatusKeys.some(key => {
                    const regex = new RegExp(`\\{[^}]*${key}[^}]*\\}`, 'i');
                    return allEffects.some(eff => regex.test(eff));
                });
            }
            return false;
        });
    }

    if (sortKey) {
        flatPages.sort((a, b) => {
            const valA = parseFloat(a[sortKey]) || 0;
            const valB = parseFloat(b[sortKey]) || 0;
            return sortOrder === "asc" ? valA - valB : valB - valA;
        });
    }

    flatPages.forEach((data) => {
        const book = books[data.bookId];
        renderPageCard(container, data, book);
    });

    applyAllStyles?.();
}

function renderBookList(containerId) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    const classMap = {
        regular_pages: "normal",
        blade_lineage: "blade",
        smiling_faces: "smilingfaces",
        red_mist: "redmist"
    };

    const groupOrder = books.group_order || [];

    const grouped = {};
    Object.entries(books).forEach(([id, data]) => {
        if (id === "group_order") return;
        const g = data.group || "";
        if (!grouped[g]) grouped[g] = [];
        grouped[g].push({ id, order: data.order != null ? data.order : 999 });
    });

    Object.values(grouped).forEach(list => list.sort((a, b) => a.order - b.order));

    const renderGroup = (g) => {
        const list = grouped[g];
        if (!list || list.length === 0) return;
        const groupDiv = document.createElement("div");
        groupDiv.className = "pages" + (g ? " group-" + g : "");
        list.forEach(({ id }) => {
            const data = books[id];
            const div = document.createElement("div");
            const cls = classMap[id] || id;
            div.className = "pages-content " + cls;
            applyColorTheme(div, data.color, data.color2, {
                "--book-color": "primary",
                "--book-color-2": "secondary"
            });
            const iconPath = data.icon ? `/assets/image/${data.icon}.png` : "";
            div.innerHTML = `
                <div class="pages-logo">
                    ${iconPath ? `<img src="${iconPath}" alt="${data.name_en}">` : ""}
                </div>
                <hr class="pages-divider">
                <div class="pages-Text">
                    <a href="/arsenal/page_detail.html?id=${id}">${data.name_jp}</a>
                </div>
            `;
            div.addEventListener("click", (e) => {
                if (e.target.tagName !== 'A') {
                    location.href = `/arsenal/page_detail.html?id=${id}`;
                }
            });
            groupDiv.appendChild(div);
        });
        container.appendChild(groupDiv);
    };

    groupOrder.forEach(renderGroup);
    Object.keys(grouped).filter(g => !groupOrder.includes(g)).forEach(renderGroup);
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

// ===== table.js =====

function createTable(tableId, data, columns) {
    const table = document.getElementById(tableId);
    if (!table) return;

    console.error(tableId)
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    const trHead = document.createElement("tr");

    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label;
        th.dataset.key = col.key;

        th.addEventListener("click", () => {
            const sorted = sortTableData(data, col.key, table);
            createTable(tableId, sorted, columns);
        });

        trHead.appendChild(th);
    });

    thead.appendChild(trHead);

    const fragment = document.createDocumentFragment();
    data.forEach(row => {
        const tr = document.createElement("tr");
        columns.forEach(col => {
            const td = document.createElement("td");
            let value = row[col.key] ?? "";
            td.innerHTML = formatText(value);
            tr.appendChild(td);
        });
        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);

    if (typeof applyAllStyles === "function") {
        applyAllStyles();
    }

    const key = table.dataset.sortKey;
    const asc = table.dataset.asc === "true";

    if (key) {
        updateSortUI(table, key, asc);
    }
}

function sortTableData(data, key, table) {
    const current = table.dataset.sortKey;
    const asc = current === key ? table.dataset.asc !== "true" : true;

    table.dataset.sortKey = key;
    table.dataset.asc = asc;
    updateSortUI(table, key, asc);

    return [...data].sort((a, b) => {
        let A = a[key] ?? "";
        let B = b[key] ?? "";

        const isNum = !isNaN(A) && !isNaN(B) && A !== "" && B !== "";
        if (isNum) {
            return asc ? Number(A) - Number(B) : Number(B) - Number(A);
        }
        return asc ? String(A).localeCompare(String(B), "ja") : String(B).localeCompare(String(A), "ja");
    });
}

function updateSortUI(table, key, asc) {
    const headers = table.querySelectorAll("th");

    headers.forEach(th => {
        th.classList.remove("sort-asc", "sort-desc");

        if (th.dataset.key === key) {
            th.classList.add(asc ? "sort-asc" : "sort-desc");
        }
    });
}

fetch("/javascript/json/table_data.json")
    .then(res => res.json())
    .then(data => {
        const { traits, origins, columns, affiliations } = data;
        
        createTable("atk_trait", traits.atk, columns.trait_atk);
        createTable("def_trait", traits.def, columns.trait_standard);
        createTable("parry_trait", traits.parry, columns.trait_standard);
        createTable("other_trait", traits.other, columns.trait_standard);

        createTable("origin_table", origins, columns.origin_standard);
        createTable("affiliation_table", affiliations, columns.origin_affiliation);
    })
    .catch(err => console.error("データの読み込みに失敗しました:", err));
