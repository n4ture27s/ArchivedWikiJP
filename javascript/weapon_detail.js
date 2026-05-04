const typeMap = {
    slash: "斬撃",
    pierce: "貫通",
    blunt: "打撃"
};

/* =========================
   テキスト整形
   ========================= */

// 改行 + tooltip変換
function formatText(text) {
    if (!text) return "";

    // 改行
    let formatted = text.replace(/\n/g, "<br>");

    // {key|label} → tooltip
    formatted = formatted.replace(/\{(.*?)\}/g, (_, key) => {
        return `<span class="tooltip-target" data-key="${key}"> </span>`;
    });

    return formatted;
}

// 要素に適用
function setFormattedText(el, text) {
    if (!el) return;
    el.innerHTML = formatText(text);
}

/* =========================
   ステータス生成
   ========================= */

function createStat(label, value, className = "") {
    const row = document.createElement("div");
    row.classList.add("stat-row");

    row.innerHTML = `
        <span class="label">${label}</span>
        <span class="value ${className}">${value}</span>
    `;

    return row;
}

/* =========================
   メイン処理
   ========================= */

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

            /* ===== 基本情報 ===== */
            const nameEn = document.getElementById("name-en");
            const nameJp = document.getElementById("name-jp");

            if (nameEn) nameEn.textContent = w.name_en ?? "unknown";
            if (nameJp) nameJp.textContent = w.name_jp ?? "";

            document.title = w.name_en ?? "weapon";

            /* ===== ステータス統合 ===== */
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

            /* ===== tooltip再適用 ===== */
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

    // critical, critical2, critical3... を全部取得
    const criticals = Object.keys(w)
        .filter(key => key.startsWith("critical"))
        .sort(); // 順番保証


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
