fetch("/javascript/json/logs.json")
    .then(res => res.json())
    .then(data => {
        renderLogs(data);
    });
    
function renderLogs(data) {
    const container = document.querySelector(".update-log");
    if (!container) return;

    // 既存ログ削除（ボタンは残す）
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