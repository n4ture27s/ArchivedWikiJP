// ===== items.js =====

let allItemsData = {};
let itemCards = [];
let itemSearchInput, itemFilterButtons, itemListContainer;
let itemCurrentFilter = "all";

const itemCategoryLabels = {
    basic: "基本素材",
    unique: "ユニーク素材",
    consumable: "消費アイテム",
    book: "書物",
    chip: "チップ",
    misc: "その他"
};

function createItemCard(id, data) {
    const card = document.createElement("div");
    card.classList.add("item-card");
    card.dataset.id = id;
    card.dataset.category = data.category;

    card.innerHTML = `
        <div class="item-icon-placeholder">${data.icon ? `<img src="${data.icon}" alt="${data.name_en}" style="width:40px;height:40px;object-fit:contain;">` : "?"}</div>
        <div class="item-name">${data.name_en}</div>
        <div class="item-name-jp">${data.name_jp || ""}</div>
    `;

    card.addEventListener("click", () => {
        location.href = `/world/item_detail.html?id=${id}`;
    });

    return card;
}

function updateItemUI() {
    if (!itemListContainer) return;

    let filtered = itemCards.filter(card => {
        if (itemCurrentFilter !== "all" && card.dataset.category !== itemCurrentFilter) {
            return false;
        }
        const text = card.textContent.toLowerCase();
        const keyword = itemSearchInput.value.toLowerCase();
        return text.includes(keyword);
    });

    const fragment = document.createDocumentFragment();
    itemListContainer.innerHTML = "";
    filtered.forEach(card => fragment.appendChild(card));
    itemListContainer.appendChild(fragment);
}

function setupItemEventListeners() {
    if (itemSearchInput) itemSearchInput.addEventListener("input", updateItemUI);

    itemFilterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            itemCurrentFilter = btn.dataset.filter;
            itemFilterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            updateItemUI();
        });
    });
}

async function loadItemsData() {
    try {
        const res = await fetch("/javascript/json/items.json");
        allItemsData = await res.json();
    } catch (e) {
        console.error("Failed to load items data:", e);
    }
}

function renderItemList(containerOrId) {
    const container = typeof containerOrId === "string" ? document.getElementById(containerOrId) : containerOrId;
    if (!container) return;

    container.innerHTML = "";
    container.classList.add("item-grid");

    Object.entries(allItemsData).forEach(([id, data]) => {
        const card = createItemCard(id, data);
        container.appendChild(card);
    });

    itemCards = Array.from(container.querySelectorAll(".item-card"));
}

function initItemListPage() {
    itemListContainer = document.querySelector(".item-grid");
    itemSearchInput = document.getElementById("item-search");
    itemFilterButtons = document.querySelectorAll(".item-filters button");

    if (!itemListContainer) return;

    renderItemList(itemListContainer);
    setupItemEventListeners();
}

// ===== item name → ID mapping (for outfit/etc linking) =====

const itemNameToIdMap = null;

function getItemIdByName(name) {
    if (!name || !allItemsData) return null;

    const normalized = name
        .toLowerCase()
        .replace(/['']/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    if (allItemsData[normalized]) return normalized;

    return Object.keys(allItemsData).find(key => {
        const item = allItemsData[key];
        const itemNorm = (item.name_en || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
        return itemNorm === normalized;
    }) || null;
}
