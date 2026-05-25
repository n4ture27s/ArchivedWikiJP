//sidebarの一斉更新
fetch("/sidebar.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("sidebar-container").innerHTML = data;
    });
//sidebarの一斉更新
fetch("/footer.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("footer-container").innerHTML = data;
        document.getElementById("footer-detail").href = `/license.html#${window.location.pathname}`;
    });

document.querySelectorAll('.format-text').forEach(card => {
    card.innerHTML = formatText(card.textContent);
})

document.querySelectorAll('.staff-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.staff-card').forEach(c => {
            if (c !== card) {
                c.classList.remove('open')
            }
        })
        card.classList.toggle('open')
    });
});


//tooltips
const tooltip = document.getElementById("tooltip");
if (tooltip) {
    // パフォーマンス: mousemoveをトップレベルに配置
    document.addEventListener("mousemove", (e) => {
        if (tooltip.style.display === "block") {
            tooltip.style.left = (e.clientX + 12) + "px";
            tooltip.style.top = (e.clientY + 12) + "px";
        }
    });

    // パフォーマンス: 重複登録を防ぐため、mousemoveの外に定義
    document.addEventListener("mouseover", (e) => {
        const el = e.target.closest(".tooltip-target");
        if (!el) return;

        const key = el.dataset.key;
        if (!tooltipData || !combat_module) return;

        const status = tooltipData[key];
        const module = combat_module[key];
        if (!status && !module) return;

        let text = (status?.text || "") + (status?.text && module?.text ? "\n" : "") + (module?.text || "");
        tooltip.textContent = text;
        tooltip.style.display = "block";
    });

    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(".tooltip-target")) {
            tooltip.style.display = "none";
        }
    });
}
let tooltipData = null;
let combat_module = null;

Promise.all([
    fetch("/javascript/json/status.json").then(res => res.json()),
    fetch("/javascript/json/combat_module.json").then(res => res.json())
]).then(([statusData, moduleData]) => {
    tooltipData = statusData;
    combat_module = moduleData;

    applyAllStyles();
});

document.querySelectorAll(".weapon-card").forEach(card => {
    card.addEventListener("click", () => {
        const id = card.dataset.id;
        location.href = `/arsenal/weapon_detail.html?id=${id}`;
    });
});

function applyAllStyles() {
    // ツールチップ用データがロードされるまで処理をスキップ
    if (!tooltipData || !combat_module) return;

    document.querySelectorAll(".tooltip-target").forEach(el => {
        // パフォーマンス: すでに処理済みの要素はスキップ
        if (el.dataset.processed) return;

        const key = el.dataset.key;
        const data = tooltipData[key];
        const moduleData = combat_module[key];

        if (data?.title) {
            el.textContent = `${data.title}`;
        }
        
        if (data?.type) {
            el.classList.add(data.type);
        }

        if (moduleData?.title) {
            el.textContent = `${moduleData.title}`;
        }
        if (moduleData?.color) {
            
            el.classList.add("combat-module");
            applyColorTheme(el, moduleData.color, null, { "color": "primary" });
        }

        if (data?.icon) {
            // 重複追加防止
            el.querySelectorAll(".status-icon").forEach(img => img.remove());
            
            const img = document.createElement("img");
            img.src = `/assets/status_icon/${data.icon}.png`;
            img.classList.add("status-icon");

            img.onerror = () => img.remove();

            el.prepend(img);
        }
        
        el.dataset.processed = "true";
    });
}