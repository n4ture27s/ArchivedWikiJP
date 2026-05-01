const list = document.querySelector(".weapon-list");
const cards = Array.from(document.querySelectorAll(".weapon-card"));

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

        // 全リセット
        sortButtons.forEach(b => {
            b.classList.remove("active", "asc", "desc");
        });

        // 状態付与
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
    document.querySelectorAll(".weapon-card").forEach(card => {
        const statsBox = card.querySelector(".weapon-stats");

        const dmg = card.dataset.damage;
        const type = typeMap[card.dataset.type];
        const speed = card.dataset.speed;

        statsBox.innerHTML = "";

        statsBox.append(
            createStat("ダメージ", dmg, "damage"),
            createStat("ダメタイプ", type, "type"),
            createStat("攻撃速度", speed, "speed")
        );
    });
}

window.addEventListener("load", () => {
    currentSort = "damage";
    asc = false;

    const btn = document.querySelector('[data-sort="damage"]');
    btn.classList.add("active", "desc");
    updateUI();
    initWeapons();
});