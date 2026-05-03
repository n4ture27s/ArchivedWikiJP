const typeMap = {
    slash: "斬撃",
    pierce: "貫通",
    blunt: "打撃"
};

// 改行対応
function setTextWithBreak(el, text) {
    if (!el) return;
    el.innerHTML = (text || "").replace(/\n/g, "<br>");
}

// ステータス生成
function createStat(label, value, className = "") {
    const row = document.createElement("div");
    row.classList.add("stat-row");

    row.innerHTML = `
        <span class="label">${label}</span>
        <span class="value ${className}">${value}</span>
    `;

    return row;
}

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

            // ===== 基本情報 =====
            const nameEn = document.getElementById("name-en");
            const nameJp = document.getElementById("name-jp");

            nameEn.textContent = w.name_en ?? "unknown";
            nameJp.textContent = w.name_jp ?? "";

            document.title = w.name_en ?? "weapon";

            // ===== ステータス統合 =====
            const stats = document.getElementById("stats");
            if (stats) {
                stats.innerHTML = "";

                const typeText = typeMap[w.type] || w.type || "不明";

                const typeRow = createStat("タイプ", typeText, w.type);
                stats.append(
                    createStat("ダメージ", w.damage ?? "-"),
                    typeRow,
                    createStat("振り速", w.speed ?? "-")
                );
            }

        })
        .catch(err => {
            console.error(err);
        });
});