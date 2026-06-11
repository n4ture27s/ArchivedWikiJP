// ===== log.js =====

function renderLogs(data) {
    const container = document.querySelector(".update-log");
    if (!container) return;

    container.querySelectorAll("details").forEach(d => d.remove());

    data.logs.forEach(entry => {
        const details = document.createElement("details");

        if (entry.new) details.open = true;

        const summary = document.createElement("summary");
        summary.innerHTML = `
            ${entry.date}
            ${entry.new ? '<span class="new">NEW!</span>' : ''}
        `;

        details.appendChild(summary);

        entry.items.forEach(item => {
            const p = document.createElement("p");
            p.classList.add("log", item.type);

            p.textContent = `[${getLabel(item.type)}] ${item.text}`;

            details.appendChild(p);
        });

        container.appendChild(details);
    });
}

function getLabel(type) {
    const map = {
        add: "追加",
        fix: "修正",
        change: "変更",
        remove: "削除"
    };
    return map[type] || type;
}

//filter
function LogFilter(type) {
    const details = document.querySelectorAll(".update-log details")

    details.forEach(d => {
        const logs = d.querySelectorAll(".log");
        let view = 0;

        logs.forEach(log => {
            if (type === "all" || log.classList.contains(type)) {
                log.style.display = "block"
                view++;
            } else {
                log.style.display = "none"
            }
        })

        d.style.display = view > 0 ? "block" : "none";
    })
}
//filter-2
const buttons = document.querySelectorAll('.filter-buttons button');
buttons.forEach(button => {
    button.addEventListener('click', (ev) => {
        buttons.forEach(allb => {
            allb.classList.remove('pressed')
        })
        button.classList.add("pressed")
    })
})

if (document.body.dataset.page === "update-log") {
    fetch("/javascript/json/logs.json")
        .then(res => res.json())
        .then(data => {
            renderLogs(data);
        });
}

// ===== license.js =====

if (document.body.dataset.page === "license") {
    fetch('/javascript/json/license.json')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('licenses');

        data.forEach(item => {
          const div = document.createElement('div');

          div.innerHTML = `
            <a class="w-subtitle heading" href="${item.url}" id="${item.url}">${item.title}</a>
            <p>著者:<a href="https://archivedwiki.miraheze.org/wiki/Wiki_Staff">Archived Wiki contributors</a></p>
            <p>原文: <a href="${item.source}" target="_blank">${item.source}</a></p>
            <p>ライセンス: <a href="${item.license_url}" target="_blank">${item.license}</a></p>
            <p>変更: ${item.modified}</p>
            
          `;

          container.appendChild(div);
          
        });
      });
}

// ===== sin.js =====

let skillData = {};

function showDetail(key) {
    const data = skillData[key];
    if (!data) return;

    document.getElementById("skill-title").textContent = data.title;
    document.getElementById("skill-desc").textContent = data.desc;

    applyColorTheme(document.documentElement, data.color, null, { "--sin-color": "primary" }, "#d64545");

    const list = document.getElementById("skill-list");
    list.innerHTML = "";

    data.skills.forEach(s => {
        const div = document.createElement("div");

        div.innerHTML = `<details class="skill-item">
        <summary>${s.name}</summary>
        ${s.requirement
                ? `<div class="requirement"> 必要ポイント:${s.requirement}</div>`
                : "" }

    <p>${formatText(s.text)}</p>

</details>
`;

        list.appendChild(div);
    });
    if (typeof applyAllStyles === "function") {
        applyAllStyles();
    }
}

function createCircleNodes(containerId) {

    const container = document.getElementById(containerId);
    const size = container.offsetWidth;

    const cx = size / 2;
    const cy = size / 2;

    const nodeSize = 70;
    const radius = size / 2 - nodeSize;

    const nodes = Object.entries(skillData).filter(([_, data]) => data.position === "outer");

    nodes.forEach(([key, data], i) => {

        const angle =
            (i / nodes.length) * (Math.PI * 2)
            - Math.PI / 2;

        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        const node = document.createElement("div");
        node.className = "node";

        node.innerHTML =
            `<img src="/assets/sin_icon/${data.icon}" alt="">`;

        node.dataset.skill = key;

        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.transform = "translate(-50%, -50%)";
        
        applyColorTheme(node, data.color, null, {
            "borderColor": "primary",
            "--node-color": "primary"
        });

        node.addEventListener("click", () => {

            document.querySelectorAll(".node").forEach(n => {
                n.classList.remove("active");
            });

            node.classList.add("active");

            showDetail(key);
        });

        container.appendChild(node);
    });
}

function createCenterNode(containerId) {

    const container = document.getElementById(containerId);

    const centerEntry =
        Object.entries(skillData)
            .find(([_, data]) => data.position === "center");

    if (!centerEntry) return;

    const [key, data] = centerEntry;

    const node = document.createElement("div");

    node.className = "node center";

    node.innerHTML = `<span>${data.title}</span>`;

    node.dataset.skill = key;

    applyColorTheme(node, data.color, null, {
        "borderColor": "primary",
        "--node-color": "primary"
    });

    node.addEventListener("click", () => {

        document.querySelectorAll(".node").forEach(n => {
            n.classList.remove("active");
        });

        node.classList.add("active");

        showDetail(key);
    });

    container.appendChild(node);
}

if (document.body.dataset.page === "sin") {
    window.addEventListener("load", async () => {

        const res =
            await fetch("/javascript/json/skill_tree.json");

        skillData = await res.json();

        createCircleNodes("skill-tree");
        createCenterNode("skill-tree");
    });
}

// ===== status_list.js =====

if (document.body.dataset.page === "effect") {
    window.addEventListener("load", () => {
        const searchInput = document.querySelector("#status-search");
        const typeFilter = document.querySelector("#status-type-filter");
        const resultCountEl = document.querySelector("#search-result-count");
        const table = document.querySelector("#table-effects");

        const typeMap = { "buff": "バフ", "debuff": "デバフ", "resource": "リソース" };
        const headerHtml = `
            <tr>
                <th style="width: 180px;" data-col="0">名称</th>
                <th style="width: 100px;" data-col="1">種類</th>
                <th data-col="2">効果説明</th>
            </tr>
        `;

        if (table) {
            table.querySelector("thead").innerHTML = headerHtml;
            const noResultsTr = document.createElement("tr");
            noResultsTr.className = "no-results-row";
            noResultsTr.style.display = "none";
            noResultsTr.innerHTML = `<td colspan="3" style="text-align: center; padding: 20px; color: #888;">該当する項目がありません</td>`;
            table.querySelector("tbody").appendChild(noResultsTr);

            table.querySelector("thead").addEventListener("click", (e) => {
                const th = e.target.closest("th");
                if (th) sortTable(table, parseInt(th.dataset.col));
            });
        }

        fetch("/javascript/json/status_data.json")
            .then(res => res.json())
            .then(data => {
                const statusData = data.status;
                const allRows = [];

                Object.keys(statusData).forEach(key => {
                    const item = statusData[key];
                    if (!item.title) return;

                    const tr = document.createElement("tr");

                    const tdName = document.createElement("td");
                    tdName.innerHTML = `<span class="tooltip-target" data-key="${key}">${item.title}</span>`;

                    const tdType = document.createElement("td");
                    tdType.textContent = typeMap[item.type] || "その他";
                    if (item.type) tdType.classList.add(item.type);

                    const tdDesc = document.createElement("td");
                    tdDesc.textContent = item.text;

                    tr.append(tdName, tdType, tdDesc);

                    if (table) table.querySelector("tbody").appendChild(tr);

                    allRows.push({ 
                        element: tr, 
                        type: item.type,
                        searchText: (item.title + item.text + (typeMap[item.type] || "")).toLowerCase() 
                    });
                });

                const applyFilters = () => {
                    const query = searchInput?.value.toLowerCase() || "";
                    const selectedType = typeFilter?.value || "all";
                    let visibleCount = 0;

                    allRows.forEach(row => {
                        const matchesSearch = row.searchText.includes(query);
                        const matchesType = selectedType === "all" || row.type === selectedType;

                        const isVisible = matchesSearch && matchesType;
                        row.element.style.display = isVisible ? "" : "none";
                        if (isVisible) visibleCount++;
                    });

                    updateCountDisplay(visibleCount);

                    if (table) {
                        const noResultsRow = table.querySelector(".no-results-row");
                        if (noResultsRow) noResultsRow.style.display = visibleCount > 0 ? "none" : "";
                    }
                };

                searchInput?.addEventListener("input", applyFilters);
                typeFilter?.addEventListener("change", applyFilters);

                applyFilters();

                if (typeof applyAllStyles === "function") applyAllStyles();
            });

        function updateCountDisplay(count) {
            if (resultCountEl) {
                resultCountEl.textContent = `${count} 件見つかりました`;
            }
        }

        function sortTable(table, colIndex) {
            const tbody = table.querySelector("tbody");
            const ths = table.querySelectorAll("thead th");
            const targetTh = ths[colIndex];
            const isAsc = !targetTh.classList.contains("sort-asc");

            ths.forEach(th => th.classList.remove("sort-asc", "sort-desc"));
            targetTh.classList.add(isAsc ? "sort-asc" : "sort-desc");

            const rows = Array.from(tbody.querySelectorAll("tr:not(.no-results-row)"));
            
            rows.sort((a, b) => {
                let valA = a.cells[colIndex].innerText.trim().toLowerCase();
                let valB = b.cells[colIndex].innerText.trim().toLowerCase();

                const numA = parseFloat(valA);
                const numB = parseFloat(valB);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return isAsc ? numA - numB : numB - numA;
                }

                return isAsc 
                    ? valA.localeCompare(valB, 'ja') 
                    : valB.localeCompare(valA, 'ja');
            });

            const noResultsRow = tbody.querySelector(".no-results-row");
            rows.forEach(row => tbody.appendChild(row));
            if (noResultsRow) tbody.appendChild(noResultsRow);
        }
    });
}
