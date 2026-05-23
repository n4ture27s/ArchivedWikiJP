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
        location.href = `arsenal/weapon_detail.html?id=${id}`
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

/* ===== Association用 簡易表示 (アコーディオン形式) ===== */

function createSimplifiedWeaponCard(id, data) {
    const card = document.createElement("div");
    card.classList.add("weapon-card-simple");

    const typeText = (typeof typeMap !== 'undefined' && typeMap[data.type]) || data.type || "";
    const getNum = s => parseInt(s.replace(/\D/g, '')) || 0;
    const format = (text) => (typeof formatText === 'function' ? formatText(text) : text);
    const imageUrl = data.basic && data.basic.image ? data.basic.image : ''; // basic.image を取得

    // 各攻撃セクション（Basic, Critical, Gun等）のHTML生成
    let attacksHtml = "";

    // Basic Attack
    if (data.basic) {
        attacksHtml += `
            <div class="simple-attack-section">
                <div class="attack-title">Basic Attack</div>
                <video autoplay loop muted src="${imageUrl}" alt="${data.basic.image}" class="weapon-image-simple"> </video>
                <div class="simple-desc">${format(data.basic.desc)}</div>
                ${data.basic.effect ? `<div class="simple-effect effect">${format(data.basic.effect)}</div>` : ""}
            </div>
        `;
    }

    // Criticals (critical, critical2...)
    Object.keys(data)
        .filter(key => key.startsWith("critical"))
        .sort((a, b) => getNum(a) - getNum(b))
        .forEach((key, index) => {
            const c = data[key];
            attacksHtml += `
                <div class="simple-attack-section">
                    <div class="attack-title">Critical ${index + 1} ${c.ct ? `<span class="ct">(CT: ${c.ct})</span>` : ""}</div>
                    <div class="simple-attack-content">
                        ${c.image ? `<video autoplay loop muted src="${c.image}" class="attack-vid-simple"></video>` : ''}
                        <div class="simple-attack-info">
                            <div class="simple-desc">${format(c.desc)}</div>
                            ${c.effect ? `<div class="simple-effect effect">${format(c.effect)}</div>` : ""}
                        </div>
                    </div>
                </div>
            `;
        });

    // Guns (gun, gun2...)
    Object.keys(data)
        .filter(key => key.startsWith("gun"))
        .sort((a, b) => getNum(a) - getNum(b))
        .forEach((key) => {
            const g = data[key];
            attacksHtml += `
                <div class="simple-attack-section">
                    <div class="attack-title">${g.title || "Special Skill"}</div>
                    <div class="simple-attack-content">
                        ${g.image ? `<video autoplay loop muted src="${g.image}" class="attack-vid-simple"></video>` : ''}
                        <div class="simple-attack-info">
                            <div class="simple-desc">${format(g.desc)}</div>
                            ${g.effect ? `<div class="simple-effect effect">${format(g.effect)}</div>` : ""}
                        </div>
                    </div>
                </div>
            `;
        });

    card.innerHTML = `
        <div class="simple-header">
            <div class="weapon-name">
                <span class="name-en">${data.name_en}</span>
                <span class="name-jp">${data.name_jp}</span>
            </div>
            <div class="weapon-stats-compact">
                <span class="label">必要条件:</span> <span class="value">${data.req} </span>
                <span class="label">速度:</span> <span class="value">${data.speed} </span>
                <span class="label">ダメージ:</span> <span class="value">${data.damage} </span>
                <span class="value" style="margin-left:10px;">${typeText}</span>
            </div>
        </div>
        <div class="simple-body">
            <div class="simple-content-wrapper">
                <div class="simple-info-content">
                    <div class="simple-attacks-container">
                        ${attacksHtml}
                    </div>
                </div>
            </div>
            <div class="simple-footer">
                <a href="arsenal/weapon_detail.html?id=${id}" class="detail-link">詳細ページへ</a>
            </div>
        </div>
    `;

    card.addEventListener("click", (e) => {
        // 詳細ページへのリンククリック時は開閉しない
        if (e.target.closest('.detail-link')) return;
        card.classList.toggle("expanded");
    });

    return card;
}

/**
 * 簡易武器リストを表示する
 * @param {HTMLElement|string} containerOrId 
 * @param {string|Function} filter (bookId または フィルター関数)
 */
function renderSimplifiedWeaponList(containerOrId, filter = null) {
    const container = typeof containerOrId === "string" ? document.getElementById(containerOrId) : containerOrId;
    if (!container) return;

    container.innerHTML = "";
    container.classList.add("weapon-list-simplified");

    Object.entries(allWeaponsData).forEach(([id, weapon]) => {
        // 文字列なら bookId 比較、関数ならカスタムフィルターとして実行
        if (filter) {
            if (typeof filter === "function") {
                if (!filter(weapon, id)) return;
            } else if (weapon.book !== filter) {
                return;
            }
        }

        const card = createSimplifiedWeaponCard(id, weapon);
        container.appendChild(card);
    });

    if (typeof applyAllStyles === "function") applyAllStyles();
}