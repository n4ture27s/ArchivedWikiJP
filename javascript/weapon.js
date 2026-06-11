// ===== weapon_list.js =====

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
        location.href = `/arsenal/weapon_detail.html?id=${id}`
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

    // performance: DocumentFragmentを使用して再描画を1回にまとめる
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

/* ===== Events ===== */

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

/* ===== Common ===== */

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

/* ===== JSON loading ===== */

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

/* ===== Association simplified display (accordion style) ===== */

function createSimplifiedWeaponCard(id, data) {
    const card = document.createElement("div");
    card.classList.add("weapon-card-simple");

    const typeText = (typeof typeMap !== 'undefined' && typeMap[data.type]) || data.type || "";
    const getNum = s => parseInt(s.replace(/\D/g, '')) || 0;
    const format = (text) => (typeof formatText === 'function' ? formatText(text) : text);
    const imageUrl = data.basic && data.basic.image ? data.basic.image : '';

    let attacksHtml = "";

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
                <a href="/arsenal/weapon_detail.html?id=${id}" class="detail-link">詳細ページへ</a>
            </div>
        </div>
    `;

    card.addEventListener("click", (e) => {
        if (e.target.closest('.detail-link')) return;
        card.classList.toggle("expanded");
    });

    return card;
}

function renderSimplifiedWeaponList(containerOrId, filter = null) {
    const container = typeof containerOrId === "string" ? document.getElementById(containerOrId) : containerOrId;
    if (!container) return;

    container.innerHTML = "";
    container.classList.add("weapon-list-simplified");

    Object.entries(allWeaponsData).forEach(([id, weapon]) => {
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

// ===== weapon_detail.js =====

function setFormattedText(el, text) {
    if (!el) return;
    el.innerHTML = formatText(text);
}

(function () {

    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    if (!id) {
        console.warn("idが指定されていません。");
        return;
    }

    fetch("/javascript/json/weapon.json")
        .then(res => {
            if (!res.ok) throw new Error("JSON読み込み失敗");
            return res.json();
        })
        .then(data => {

            const w = data[id];
            console.log("w:", w);
            const criticals = Object.keys(w)
                .filter(key => key.startsWith("critical"));

            console.log("criticals:", criticals);

            if (!w) {
                console.warn("該当データなし:", id);
                return;
            }

            /* ===== Basic Info ===== */
            const nameEn = document.getElementById("name-en");
            const nameJp = document.getElementById("name-jp");

            if (nameEn) nameEn.textContent = w.name_en ?? "unknown";
            if (nameJp) nameJp.textContent = w.name_jp ?? "";

            document.title = w.name_en ?? "weapon";

            /* ===== Stats ===== */
            const stats = document.getElementById("stats");

            if (stats) {
                stats.innerHTML = "";

                const typeText = typeMap[w.type] || w.type || "不明";

                stats.append(
                    createStat("必要条件", w.req ?? "-"),
                    createStat("ダメージ", w.damage ?? "-"),
                    createStat("ダメージタイプ", typeText, w.type),
                    createStat("振り速", w.speed ?? "-")
                );
            }

            /* ===== Basic Attack ===== */
            if (w.basic) {
                const vid = document.getElementById("basic-vid");
                const desc = document.getElementById("basic-desc");
                const effect = document.getElementById("basic-effect");

                if (vid && w.basic.image) vid.src = w.basic.image;

                setFormattedText(desc, w.basic.desc);

                if (w.basic.effect) {
                    setFormattedText(effect, w.basic.effect);
                } else if (effect) {
                    effect.style.display = "none";
                }
            }

            /* ===== Critical ===== */
            renderCriticals(w);

            /* ===== Gun ===== */
            renderGuns(w);

            /* ===== tooltip re-apply ===== */
            if (typeof applyAllStyles === "function") {
                applyAllStyles();
            }
            if (typeof applyCombatModuleColor === "function") applyCombatModuleColor();

        })
        .catch(err => {
            console.error(err);
        });
})();


function renderCriticals(w) {
    const container = document.getElementById("critical-container");
    if (!container) return;

    container.innerHTML = "";

    const getNum = s => parseInt(s.replace(/\D/g, '')) || 0;
    const criticals = Object.keys(w)
        .filter(key => key.startsWith("critical"))
        .sort((a, b) => {
            return getNum(a) - getNum(b);
        });


    criticals.forEach((key, index) => {
        const c = w[key];
        if (!c) return;

        const section = document.createElement("div");
        section.classList.add("weapon-section");

        section.innerHTML = `
            <h2>Critical ${index + 1}</h2>
            <div class="attack-box">
                <video class="attack-vid" autoplay loop muted> </video>
                <div class="attack-info">
                    <p class="crit-desc"></p>
                    <p class="crit-ct"></p>
                    <p class="crit-effect effect"></p>
                </div>
            </div>
        `;

        const vid = section.querySelector(".attack-vid");
        const desc = section.querySelector(".crit-desc");
        const effect = section.querySelector(".crit-effect");
        const ct = section.querySelector(".crit-ct");

        if (vid && c.image) vid.src = c.image;

        setFormattedText(desc, c.desc);

        if (c.ct) {
            ct.textContent = `CT: ${c.ct}`;
        } else {
            ct.style.display = "none";
        }

        if (c.effect) {
            setFormattedText(effect, c.effect);
        } else {
            effect.style.display = "none";
        }

        container.appendChild(section);
    });
}

function renderGuns(w) {
    const container = document.getElementById("gun-container");
    if (!container) return;

    container.innerHTML = "";

    const getNum = s => parseInt(s.replace(/\D/g, '')) || 0;
    const guns = Object.keys(w)
        .filter(key => key.startsWith("gun"))
        .sort((a, b) => {
            return getNum(a) - getNum(b);
        });

    guns.forEach((key, index) => {
        const c = w[key];
        if (!c) return;

        const section = document.createElement("div");
        section.classList.add("weapon-section");

        section.innerHTML = `
            <h2>${c.title}</h2>
            <div class="attack-box">
                <video class="attack-vid" autoplay loop muted> </video>
                <div class="attack-info">
                    <p class="gun-desc"></p>
                    <p class="gun-effect effect"></p>
                </div>
            </div>
        `;

        const vid = section.querySelector(".attack-vid");
        const desc = section.querySelector(".gun-desc");
        const effect = section.querySelector(".gun-effect");

        if (vid && c.image) vid.src = c.image;

        setFormattedText(desc, c.desc);

        if (c.effect) {
            setFormattedText(effect, c.effect);
        } else {
            effect.style.display = "none";
        }

        container.appendChild(section);
    });
}
