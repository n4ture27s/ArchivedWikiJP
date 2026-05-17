let allWeaponsData = {};
let cards = [];

let currentFilter = "all";
let currentSort = null;
let asc = true;

let searchInput, filterButtons, sortButtons, weaponListContainer;

const typeOrder = {
    slash: 0,
    pierce: 1,
    blunt: 2
};


function createWeaponCard(id, data) {
    const card = document.createElement("div");
    card.classList.add("weapon-card");

    card.dataset.id = id;
    card.dataset.req = data.req;
    card.dataset.type = data.type;
    card.dataset.damage = data.damage;
    card.dataset.speed = data.speed;

    card.innerHTML = `
        <div class="weapon-name">
            <span class="name-en">${data.name_en}</span>
            <span class="name-jp">${data.name_jp}</span>
        </div>
        <div class="weapon-stats"></div>
    `;

    card.addEventListener("click", () => {
        location.href = `/pages/arsenal/weapon_detail.html?id=${id}`
    })

    return card;
}

function updateUI() {
    if (!weaponListContainer || !searchInput) return;

    let filtered = cards.filter(card => {

        if (currentFilter !== "all" && card.dataset.type !== currentFilter) {
            return false;
        }

        const text = card.textContent.toLowerCase();
        const keyword = searchInput.value.toLowerCase();

        return text.includes(keyword);
    });

    if (currentSort) {
        filtered.sort((a, b) => {
            let A, B;

            if (currentSort === "damage") {
                A = Number(a.dataset.damage);
                B = Number(b.dataset.damage);
            } else if (currentSort === "speed") {
                A = Number(a.dataset.speed);
                B = Number(b.dataset.speed);
            } else if (currentSort === "type") {
                A = typeOrder[a.dataset.type];
                B = typeOrder[b.dataset.type];
            }

            return asc ? A - B : B - A;
        });
    }

    // パフォーマンス: DocumentFragmentを使用して再描画を1回にまとめる
    const fragment = document.createDocumentFragment();
    weaponListContainer.innerHTML = "";
    filtered.forEach(card => fragment.appendChild(card));
    weaponListContainer.appendChild(fragment);

    saveStateToURL();
}

function saveStateToURL() {
    const params = new URLSearchParams();

    if (currentFilter !== "all") params.set("filter", currentFilter);
    if (currentSort) params.set("sort", currentSort);
    if (!asc) params.set("order", "desc");
    if (searchInput.value) params.set("search", searchInput.value);

    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
}

function loadStateFromURL() {
    const params = new URLSearchParams(location.search);

    currentFilter = params.get("filter") || "all";
    currentSort = params.get("sort") || null;
    asc = params.get("order") !== "desc";

    const search = params.get("search") || "";
    searchInput.value = search;
}

function applyStateToUI() {
    filterButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === currentFilter);
    });

    sortButtons.forEach(btn => {
        btn.classList.remove("active", "asc", "desc");

        if (btn.dataset.sort === currentSort) {
            btn.classList.add("active");
            btn.classList.add(asc ? "asc" : "desc");
        }
    });
}

/* ===== イベント ===== */

function setupEventListeners() {
    if (searchInput) searchInput.addEventListener("input", updateUI);

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            currentFilter = btn.dataset.filter;
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            updateUI();
        });
    });

    sortButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.sort;
            if (currentSort === type) {
                asc = !asc;
            } else {
                currentSort = type;
                asc = true;
            }
            sortButtons.forEach(b => {
                b.classList.remove("active", "asc", "desc");
            });
            btn.classList.add("active");
            btn.classList.add(asc ? "asc" : "desc");
            updateUI();
        });
    });
}


function initWeapons() {
    cards.forEach(card => {
        const statsBox = card.querySelector(".weapon-stats");

        const req = card.dataset.req;
        const dmg = card.dataset.damage;
        const type = typeMap[card.dataset.type];
        const speed = card.dataset.speed;

        statsBox.innerHTML = "";

        statsBox.append(
            createStat("必要条件", req, "req"),
            createStat("ダメージ", dmg, "damage"),
            createStat("ダメタイプ", type, "type"),
            createStat("振り速", speed, "speed")
        );
    });
}

/* ===== 共通処理 ===== */

async function loadWeaponData() {
    try {
        const res = await fetch("/javascript/json/weapon.json");
        allWeaponsData = await res.json();
    } catch (e) {
        console.error("Failed to load weapon data:", e);
    }
}

function renderWeaponList(containerOrId, filterBook = null) {
    const container = typeof containerOrId === "string" ? document.getElementById(containerOrId) : containerOrId;
    if (!container) return;

    container.innerHTML = "";
    container.classList.add("weapon-list");

    Object.entries(allWeaponsData).forEach(([id, weapon]) => {
        if (filterBook && weapon.book !== filterBook) return;

        const card = createWeaponCard(id, weapon);

        // 各カード内のステータス表示を初期化
        const statsBox = card.querySelector(".weapon-stats");
        statsBox.append(
            createStat("必要条件", weapon.req, "req"),
            createStat("ダメージ", weapon.damage, "damage"),
            createStat("ダメタイプ", typeMap[weapon.type], "type"),
            createStat("振り速", weapon.speed, "speed")
        );

        container.appendChild(card);
    });

    if (typeof applyAllStyles === "function") applyAllStyles();
}

/* ===== JSON読み込み ===== */

function initWeaponListPage() {
    weaponListContainer = document.querySelector(".weapon-list");
    searchInput = document.getElementById("search");
    filterButtons = document.querySelectorAll(".filters button");
    sortButtons = document.querySelectorAll(".sort button");

    renderWeaponList(weaponListContainer);
    cards = Array.from(weaponListContainer.querySelectorAll(".weapon-card"));

    currentSort = "damage";
    asc = false;

    loadStateFromURL();
    applyStateToUI();
    setupEventListeners();
    updateUI();
}