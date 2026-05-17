/**
 * status.json の内容を読み込んでテーブルを表示する
 */

window.addEventListener("load", () => {
    const searchInput = document.querySelector("#status-search");
    const resultCountEl = document.querySelector("#search-result-count");
    const tables = {
        buff: document.querySelector("#table-buff"),
        debuff: document.querySelector("#table-debuff"),
        resource: document.querySelector("#table-resource")
    };

    const typeMap = { "buff": "バフ", "debuff": "デバフ", "resource": "リソース" };
    const headerHtml = `
        <tr>
            <th style="width: 180px;" data-col="0">名称</th>
            <th style="width: 100px;" data-col="1">種類</th>
            <th data-col="2">効果説明</th>
        </tr>
    `;

    // 全てのテーブルのヘッダーを初期化
    Object.values(tables).forEach(table => {
        if (table) {
            table.querySelector("thead").innerHTML = headerHtml;
            // 「該当なし」メッセージ用の行を事前に作成して隠しておく
            const noResultsTr = document.createElement("tr");
            noResultsTr.className = "no-results-row";
            noResultsTr.style.display = "none";
            noResultsTr.innerHTML = `<td colspan="3" style="text-align: center; padding: 20px; color: #888;">該当する項目がありません</td>`;
            table.querySelector("tbody").appendChild(noResultsTr);

            // ヘッダーにクリックイベントを追加（ソート用）
            table.querySelector("thead").addEventListener("click", (e) => {
                const th = e.target.closest("th");
                if (th) sortTable(table, parseInt(th.dataset.col));
            });
        }
    });

    // データの取得と描画
    fetch("/javascript/json/status.json")
        .then(res => res.json())
        .then(data => {
            const allRows = [];

            Object.keys(data).forEach(key => {
                const item = data[key];
                // タイトルがない内部データ（ダイスアイコン等）は表示をスキップ
                if (!item.title) return;

                const tr = document.createElement("tr");

                // 名前カラム（main.jsのapplyAllStylesを利用するためtooltip-targetクラスを付与）
                const tdName = document.createElement("td");
                tdName.innerHTML = `<span class="tooltip-target" data-key="${key}">${item.title}</span>`;

                // 種類カラム
                const tdType = document.createElement("td");
                tdType.textContent = typeMap[item.type] || "その他";
                if (item.type) tdType.classList.add(item.type);

                // 説明カラム
                const tdDesc = document.createElement("td");
                tdDesc.textContent = item.text;

                tr.append(tdName, tdType, tdDesc);

                // 適切なテーブルのtbodyに振り分け
                const targetType = tables[item.type] ? item.type : "resource";
                tables[targetType].querySelector("tbody").appendChild(tr);

                // 検索用にデータを保存
                allRows.push({ 
                    element: tr, 
                    searchText: (item.title + item.text + (typeMap[item.type] || "")).toLowerCase() 
                });
            });

            // 検索フィルタリング機能
            searchInput?.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase();
                let visibleCount = 0;

                allRows.forEach(row => {
                    const isVisible = row.searchText.includes(query);
                    row.element.style.display = isVisible ? "" : "none";
                    if (isVisible) visibleCount++;
                });

                updateCountDisplay(visibleCount);

                // テーブルごとに表示されているデータ行があるかチェック
                Object.values(tables).forEach(table => {
                    if (!table) return;
                    // データ行（メッセージ行以外）の中で表示されているものを探す
                    const hasVisibleData = Array.from(table.querySelectorAll("tbody tr:not(.no-results-row)"))
                        .some(tr => tr.style.display !== "none");
                    
                    const noResultsRow = table.querySelector(".no-results-row");
                    if (noResultsRow) {
                        noResultsRow.style.display = hasVisibleData ? "none" : "";
                    }
                });
            });

            // 初期表示時のチェック（特定のカテゴリが空の場合のため）
            Object.values(tables).forEach(table => {
                if (!table) return;
                const hasData = table.querySelector("tbody tr:not(.no-results-row)");
                const noResultsRow = table.querySelector(".no-results-row");
                if (noResultsRow) noResultsRow.style.display = hasData ? "none" : "";
            });
            
            updateCountDisplay(allRows.length);

            // 要素生成後、main.jsの装飾関数を呼び出してアイコン等を適用する
            if (typeof applyAllStyles === "function") applyAllStyles();
        });

    function updateCountDisplay(count) {
        if (resultCountEl) {
            resultCountEl.textContent = `${count} 件見つかりました`;
        }
    }

    /**
     * テーブルをソートする
     */
    function sortTable(table, colIndex) {
        const tbody = table.querySelector("tbody");
        const ths = table.querySelectorAll("thead th");
        const targetTh = ths[colIndex];
        const isAsc = !targetTh.classList.contains("sort-asc");

        // クラスのクリアと設定
        ths.forEach(th => th.classList.remove("sort-asc", "sort-desc"));
        targetTh.classList.add(isAsc ? "sort-asc" : "sort-desc");

        // データ行（no-results-row以外）を取得してソート
        const rows = Array.from(tbody.querySelectorAll("tr:not(.no-results-row)"));
        
        rows.sort((a, b) => {
            let valA = a.cells[colIndex].innerText.trim().toLowerCase();
            let valB = b.cells[colIndex].innerText.trim().toLowerCase();

            // 数値が含まれる場合の簡易対応（必要なら追加）
            const numA = parseFloat(valA);
            const numB = parseFloat(valB);
            if (!isNaN(numA) && !isNaN(numB)) {
                return isAsc ? numA - numB : numB - numA;
            }

            return isAsc 
                ? valA.localeCompare(valB, 'ja') 
                : valB.localeCompare(valA, 'ja');
        });

        // 並び替えた行を再配置（no-results-rowは常に最後にするため一度全部消してから追加）
        const noResultsRow = tbody.querySelector(".no-results-row");
        rows.forEach(row => tbody.appendChild(row));
        if (noResultsRow) tbody.appendChild(noResultsRow);
    }
});