const list = document.querySelector(".weapon-list");

let cards = []; 

const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");
const sortButtons = document.querySelectorAll(".sort button");

let currentFilter = "all";
let currentSort = null;
let asc = true;

const typeMap = {
    slash: "斬撃",
    pierce: "貫通",
    blunt: "打撃"
};

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

    card.addEventListener("click", () =>{
        location.href = `weapon_detail.html?id=${id}`
    })

    return card;
}

function updateUI() {
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

    list.innerHTML = "";
    filtered.forEach(card => list.appendChild(card));

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

searchInput.addEventListener("input", updateUI);

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

function createStat(label, value, className) {
    const stat = document.createElement("div");
    stat.classList.add("stat");

    stat.innerHTML = `
        <span class="label">${label}</span>
        <span class="value ${className}">${value}</span>
    `;

    return stat;
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

/* ===== JSON読み込み ===== */

fetch("/javascript/json/weapon.json")
    .then(res => res.json())
    .then(data => {

        Object.entries(data).forEach(([id, weapon]) => {
            const card = createWeaponCard(id, weapon);
            list.appendChild(card);
        });

        cards = Array.from(document.querySelectorAll(".weapon-card"));

        // 初期状態
        currentSort = "damage";
        asc = false;

        loadStateFromURL();
        applyStateToUI();
        initWeapons();
        updateUI();
})