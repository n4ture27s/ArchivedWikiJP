// ===== outfit.js =====

let allOutfitsData = {};
let outfitCards = [];
let outfitSearchInput, outfitSortButtons, outfitListContainer;
let outfitCurrentSort = null;
let outfitAsc = true;

function formatOutfitText(text) {
    if (!text) return "";
    if (typeof formatText === "function") return formatText(text);
    return text;
}

function renderMaterials(req) {
    if (!req || (Array.isArray(req) && req.length === 0)) return '<span class="req-text">なし</span>';

    const items = Array.isArray(req) ? req : [req];

    return items.map(t => {
        const m = t.match(/^(\d+x)\s*(.*)$/i);
        const name = m ? m[2] : t;
        const qty = m ? m[1] : "";
        const itemId = typeof getItemIdByName === "function" ? getItemIdByName(name) : null;
        if (itemId) {
            const label = qty ? `${qty} ${name}` : name;
            return `<a href="/world/item_detail.html?id=${itemId}" class="req-chip-link"><span class="req-chip">${label}</span></a>`;
        }
        if (m) {
            return `<span class="req-chip">${m[1]} ${m[2]}</span>`;
        }
        return `<span class="req-text">${t}</span>`;
    }).join("");
}

function createExpandedOutfitCard(id, data) {
    const card = document.createElement("div");
    card.classList.add("outfit-card-expanded");

    card.dataset.id = id;
    card.dataset.speed = data.speed;
    const res = data.resistance || {};
    card.dataset.resistance = ((res.blunt ?? 1) + (res.pierce ?? 1) + (res.slash ?? 1)) / 3;

    const resText = `打${res.blunt ?? "?"} / 貫${res.pierce ?? "?"} / 斬${res.slash ?? "?"}`;

    let keypageHtml = "";
    if (data.keypage && data.keypage.length > 0) {
        data.keypage.forEach(kp => {
            keypageHtml += `
                <div class="expanded-keypage">
                    <div class="keypage-title">${kp.title}</div>
                    <div class="keypage-effect">${formatOutfitText(kp.effect)}</div>
                </div>
            `;
        });
    } else {
        keypageHtml = `<div class="expanded-keypage"><div class="keypage-title">N/A</div></div>`;
    }

    card.innerHTML = `
        <div class="expanded-header">
            <div class="outfit-name">
                <span class="name-en">${data.name_en}</span>
                <span class="name-jp">${data.name_jp}</span>
            </div>
        </div>
        <div class="expanded-body">
            <div class="expanded-stats-row">
                <span class="stat-item"><span class="label">速度</span> <span class="value">${data.speed}</span></span>
                <span class="stat-item"><span class="label">耐性</span> <span class="value">${resText}</span></span>
                <span class="stat-item req-materials"><span class="label">入手方法</span> <span class="value">${renderMaterials(data.req)}</span></span>
            </div>
            <div class="expanded-keypages">
                ${keypageHtml}
            </div>
        </div>
    `;

    return card;
}

async function loadOutfitData() {
    try {
        const res = await fetch("/javascript/json/outfit.json");
        allOutfitsData = await res.json();
    } catch (e) {
        console.error("Failed to load outfit data:", e);
    }
}

function renderAllOutfits(containerOrId) {
    const container = typeof containerOrId === "string" ? document.getElementById(containerOrId) : containerOrId;
    if (!container) return;

    container.innerHTML = "";
    container.classList.add("outfit-list-expanded");

    Object.entries(allOutfitsData).forEach(([id, outfit]) => {
        const card = createExpandedOutfitCard(id, outfit);
        container.appendChild(card);
    });

    outfitCards = Array.from(container.querySelectorAll(".outfit-card-expanded"));

    if (typeof applyAllStyles === "function") applyAllStyles();
}

function updateOutfitUI() {
    if (!outfitListContainer) return;

    let filtered = outfitCards.filter(card => {
        const text = card.textContent.toLowerCase();
        const keyword = outfitSearchInput.value.toLowerCase();
        return text.includes(keyword);
    });

    if (outfitCurrentSort) {
        filtered.sort((a, b) => {
            let A, B;
            if (outfitCurrentSort === "speed") {
                A = Number(a.dataset.speed);
                B = Number(b.dataset.speed);
            } else if (outfitCurrentSort === "resistance") {
                A = Number(a.dataset.resistance);
                B = Number(b.dataset.resistance);
            }
            return outfitAsc ? A - B : B - A;
        });
    }

    const fragment = document.createDocumentFragment();
    outfitListContainer.innerHTML = "";
    filtered.forEach(card => fragment.appendChild(card));
    outfitListContainer.appendChild(fragment);

    saveOutfitStateToURL();
}

function saveOutfitStateToURL() {
    const params = new URLSearchParams();
    if (outfitCurrentSort) params.set("sort", outfitCurrentSort);
    if (!outfitAsc) params.set("order", "desc");
    if (outfitSearchInput.value) params.set("search", outfitSearchInput.value);
    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
}

function loadOutfitStateFromURL() {
    const params = new URLSearchParams(location.search);
    outfitCurrentSort = params.get("sort") || null;
    outfitAsc = params.get("order") !== "desc";
    const search = params.get("search") || "";
    if (outfitSearchInput) outfitSearchInput.value = search;
}

function applyOutfitStateToUI() {
    outfitSortButtons.forEach(btn => {
        btn.classList.remove("active", "asc", "desc");
        if (btn.dataset.sort === outfitCurrentSort) {
            btn.classList.add("active");
            btn.classList.add(outfitAsc ? "asc" : "desc");
        }
    });
}

function setupOutfitEventListeners() {
    if (outfitSearchInput) outfitSearchInput.addEventListener("input", updateOutfitUI);

    outfitSortButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.sort;
            if (outfitCurrentSort === type) {
                outfitAsc = !outfitAsc;
            } else {
                outfitCurrentSort = type;
                outfitAsc = true;
            }
            outfitSortButtons.forEach(b => b.classList.remove("active", "asc", "desc"));
            btn.classList.add("active");
            btn.classList.add(outfitAsc ? "asc" : "desc");
            updateOutfitUI();
        });
    });
}

function initOutfitListPage() {
    outfitListContainer = document.querySelector(".outfit-list-expanded");
    outfitSearchInput = document.getElementById("outfit-search");
    outfitSortButtons = document.querySelectorAll(".outfit-sort button");

    if (!outfitListContainer) return;

    renderAllOutfits(outfitListContainer);

    loadOutfitStateFromURL();
    applyOutfitStateToUI();
    setupOutfitEventListeners();
    updateOutfitUI();
}
