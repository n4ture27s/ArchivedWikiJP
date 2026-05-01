
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

//sidebarの一斉更新
fetch("/sidebar.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("sidebar-container").innerHTML = data;
    });


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
document.addEventListener("mousemove", (e) => {
    tooltip.style.left = (e.clientX + 12) + "px";
    tooltip.style.top = (e.clientY + 12) + "px";
});
let tooltipData = {};
let combat_module = {};

Promise.all([
    fetch("/javascript/status.json").then(res => res.json()),
    fetch("/javascript/combat_module.json").then(res => res.json())
]).then(([statusData, moduleData]) => {
    tooltipData = statusData;
    combat_module = moduleData;

    applyAllStyles();
});

document.querySelectorAll(".tooltip-target").forEach(el => {
    el.addEventListener("mouseenter", (e) => {
        const key = e.target.dataset.key;

        const data = tooltipData[key];
        const moduleData = combat_module[key];

        // どっちにも無いなら何もしない
        if (!data && !moduleData) return;

        // 表示するテキスト決定（優先順位つける）
        const text =
            moduleData?.text ||  // combat_moduleにtextあれば優先
            data?.text ||        // なければtooltipData
            "";

        tooltip.textContent = text;
        tooltip.style.display = "block";
    });

    el.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });
});

function applyAllStyles() {
    document.querySelectorAll(".tooltip-target").forEach(el => {
        const key = el.dataset.key;

        const data = tooltipData[key];
        const moduleData = combat_module[key];

        if (data?.type) {
            el.classList.add(data.type);
        }

        if (moduleData?.type) {
            el.classList.add(moduleData.type);
        }

        if (moduleData?.color) {
            el.style.color = `#${moduleData.color}`;
        }

        if (data?.icon) {
            const img = document.createElement("img");
            img.src = `/assets/status_icon/${data.icon}.png`;
            img.classList.add("status-icon");
            el.prepend(img);
        }
    });
}