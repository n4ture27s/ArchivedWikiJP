function createTable(tableId, data, columns) {
    const table = document.getElementById(tableId);
    if (!table) return;

    console.error(tableId)
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
    const fragment = document.createDocumentFragment();
    data.forEach(row => {
        const tr = document.createElement("tr");
        columns.forEach(col => {
            const td = document.createElement("td");
            let value = row[col.key] ?? "";
            td.innerHTML = formatText(value);
            tr.appendChild(td);
        });
        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);

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
        let A = a[key] ?? "";
        let B = b[key] ?? "";

        // 数値が含まれる場合は数値比較を優先、それ以外はlocaleCompare
        const isNum = !isNaN(A) && !isNaN(B) && A !== "" && B !== "";
        if (isNum) {
            return asc ? Number(A) - Number(B) : Number(B) - Number(A);
        }
        return asc ? String(A).localeCompare(String(B), "ja") : String(B).localeCompare(String(A), "ja");
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

fetch("/javascript/json/table_data.json")
    .then(res => res.json())
    .then(data => {
        const { traits, origins, columns } = data;
        
        // 特性テーブルの生成
        createTable("atk_trait", traits.atk, columns.trait_atk);
        createTable("def_trait", traits.def, columns.trait_standard);
        createTable("parry_trait", traits.parry, columns.trait_standard);
        createTable("other_trait", traits.other, columns.trait_standard);

        // オリジンテーブルの生成
        createTable("origin_table", origins, columns.origin_standard);
    })
    .catch(err => console.error("データの読み込みに失敗しました:", err));