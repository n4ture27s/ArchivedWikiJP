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

    // {{key|label}} → tooltip
    formatted = formatted.replace(/\{\{(.*?)\|(.*?)\}\}/g, (_, key, label) => {
        return `<span class="tooltip-target" data-key="${key}">${label}</span>`;
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

window.addEventListener("DOMContentLoaded", () => {

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
            if (w.critical) {
                const vid = document.getElementById("crit-vid");
                const desc = document.getElementById("crit-desc");
                const effect = document.getElementById("crit-effect");
                const ct = document.getElementById("crit-ct");
                

                if (vid && w.critical.image) vid.src = w.critical.image;

                setFormattedText(desc, w.critical.desc);

                if (w.critical.ct) {
                    ct.textContent = `CT: ${w.critical.ct}`;
                } else if (ct) {
                    ct.style.display = "none";
                }
                if (w.critical.effect) {
                    setFormattedText(effect, w.critical.effect);
                } else if (effect) {
                    effect.style.display = "none";
                }


            }

            /* ===== tooltip再適用 ===== */
            if (typeof applyAllStyles === "function") {
                applyAllStyles();
            }
            if (typeof applyCombatModuleColor === "function") applyCombatModuleColor();

        })
        .catch(err => {
            console.error(err);
        });
});

