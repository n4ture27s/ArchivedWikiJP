function createTable(tableId, data, columns) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    // ===== ヘッダー生成 =====
    const trHead = document.createElement("tr");

    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label;
        th.dataset.key = col.key;

        th.addEventListener("click", () => {
            const sorted = sortTableData(data, col.key, table);
            createTable(tableId, sorted, columns);
        });

        trHead.appendChild(th);
    });

    thead.appendChild(trHead);

    // ===== 本体 =====
    data.forEach(row => {
        const tr = document.createElement("tr");

        columns.forEach(col => {
            const td = document.createElement("td");

            let value = row[col.key] ?? "";

            // tooltip対応
            td.innerHTML = formatText(value);

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    if (typeof applyAllStyles === "function") {
        applyAllStyles();
    }

    // ソート状態を復元
    const key = table.dataset.sortKey;
    const asc = table.dataset.asc === "true";

    if (key) {
        updateSortUI(table, key, asc);
    }
}

function sortTableData(data, key, table) {
    const current = table.dataset.sortKey;
    const asc = current === key ? table.dataset.asc !== "true" : true;

    table.dataset.sortKey = key;
    table.dataset.asc = asc;
    updateSortUI(table, key, asc);
    return [...data].sort((a, b) => {
        const A = a[key] ?? "";
        const B = b[key] ?? "";

        return asc
            ? String(A).localeCompare(String(B), "ja")
            : String(B).localeCompare(String(A), "ja");
    });

}

function updateSortUI(table, key, asc) {
    const headers = table.querySelectorAll("th");

    headers.forEach(th => {
        th.classList.remove("sort-asc", "sort-desc");

        if (th.dataset.key === key) {
            th.classList.add(asc ? "sort-asc" : "sort-desc");
        }
    });
}

const trait_atk_data = [
    {
        name: "Coldness",
        alias: "Heartless Execution",
        effect: "ラグドールしない限り、対象を掴む/運ぶ動作はキャンセル不可に",
        tips: ""
    },
    {
        name: "Energetic",
        alias: "Happy Feet",
        effect: "感情レベルを発動するための閾値を下げ、感情レベルの上昇を促進する",
        tips: ""
    },
    {
        name: "Methodical",
        alias: "Swift Execution",
        effect: "ダウンしている対象を処刑するまでの時間を短縮します",
        tips: ""
    },
    {
        name: "Paranoid",
        alias: "Cautious Fury",
        effect: "- {permadeath}サーバー以外（オーバーワールドを含む）での与ダメージを10%減少\n- {permadeath}内での与ダメージを10%増加",
        tips: ""
    },
];

const trait_def_data = [
    {
        name: "Steadfast",
        alias: "Tough Skin",
        effect: "最も脆弱なダメージ耐性を0.1減少させる",
        tips: "・服を変更すると、耐性変更は無効になります。\n(変更がリスポーン時に適用されるためです。)\n・同じ値の耐性が複数ある場合、最も左にあるものが選択されます。"
    },
    {
        name: "Energetic",
        alias: "Happy Feet",
        effect: "- ラグドールキャンセルをより頻繁に使用できる\n- ラグドールキャンセル時に消費するスタミナが増加",
        tips: ""
    },
    {
        name: "Methodical",
        alias: "Swift Execution",
        effect: "- 回避を黒い軌跡を残す、より長く不可視な物に置き換えます\n- 無敵時間がわずかに増加します\n- 回避時にスタミナを10消費します\n- {haste}の影響を受けます\n- 回避のクールダウンが増加します",
        tips: "あるいは、キャラクター作成時に「グループを離脱して全力で逃げる」を選択することで、この特性を獲得することもできます。"
    },
    {
        name: "Resourceful",
        alias: "Quick Recovery",
        effect: "スタミナ回復力を増加させる",
        tips: ""
    },
    {
        name: "Maniacal",
        alias: "Manic",
        effect: "- パリー時のスタミナ回復量増加\n- 正気度回復量減少",
        tips: ""
    },
    {
        name: "Resolute",
        alias: "Iron Will",
        effect: "HPが低い時の速度低下を軽減する",
        tips: ""
    },
    {
        name: "Indomitable",
        alias: "Iron Chin",
        effect: "{stagger}状態中に受けるダメージを軽減する",
        tips: ""
    },
    {
        name: "Immovable",
        alias: "",
        effect: "- パリーした時、またはパリーされた時に、ノックバックしなくなります。",
        tips: ""
    },
    {
        name: "Hypoxic",
        alias: "Adaptive Recovery",
        effect: "- 体力回復速度を大幅に向上させる\n- スタミナ回復速度を大幅に低下させる",
        tips: ""
    },
    {
        name: "Calm",
        alias: "Composed Guard",
        effect: "- ガード時のスタミナダメージを軽減\n- パリーが空振りした際のスタミナ消費量を増加させる",
        tips: "Hot-Headed/Hair-Triggeredと同時適応不可"
    },
];

const trait_parry_data = [
    {
        name: "Coldness",
        alias: "Heartless Execution",
        effect: "ラグドールしない限り、対象を掴む/運ぶ動作はキャンセル不可に",
        tips: ""
    },
    {
        name: "Energetic",
        alias: "Happy Feet",
        effect: "感情レベルを発動するための閾値を下げ、感情レベルの上昇を促進する",
        tips: ""
    },
    {
        name: "Methodical",
        alias: "Swift Execution",
        effect: "ダウンしている対象を処刑するまでの時間を短縮します",
        tips: ""
    },
    {
        name: "Paranoid",
        alias: "Cautious Fury",
        effect: "- {permadeath}サーバー以外（オーバーワールドを含む）での与ダメージを10%減少\n- {permadeath}内での与ダメージを10%増加",
        tips: ""
    },
];

const trait_columns = [
    { key: "name", label: "特性名" },
    { key: "alias", label: "別名" },
    { key: "effect", label: "効果" },
    { key: "tips", label: "Tips" }
];

const trait_atk_columns = [
    { key: "name", label: "特性名" },
    { key: "alias", label: "別名" },
    { key: "effect", label: "効果" }
];
createTable("atk_trait", trait_atk_data, trait_atk_columns);
createTable("def_trait", trait_def_data, trait_columns);
createTable("parry_trait", trait_parry_data, trait_columns);
function formatText(text) {
    if (!text) return "";

    // 改行（\n と \br 両対応）
    let formatted = text
        .replace(/\\br/g, "\n")
        .replace(/\n/g, "<br>");

    // {key} → tooltip
    formatted = formatted.replace(/\{(.*?)\}/g, (_, key) => {
        return `<span class="tooltip-target" data-key="${key}"></span>`;
    });

    return formatted;
}