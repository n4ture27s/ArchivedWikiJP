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

const buttons = document.querySelectorAll('.filter-buttons button');
buttons.forEach(button => {
    button.addEventListener('click', (ev) => {
        buttons.forEach(allb => {
            allb.classList.remove('pressed')
        })
        button.classList.add("pressed")
    })
})

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


const tooltip = document.getElementById("tooltip");
let tooltipData = {};

fetch("/javascript/status.json")
    .then(res => res.json())
    .then(data => {
        tooltipData = data;
        applyTooltipStyles();
    });
document.addEventListener("mousemove", (e) => {
    tooltip.style.left = (e.clientX + 12) + "px";
    tooltip.style.top = (e.clientY + 12) + "px";
});

document.querySelectorAll(".tooltip-target").forEach(el => {
    el.addEventListener("mouseenter", (e) => {
        const key = e.target.dataset.key;
        const data = tooltipData[key];

        if (!data) return;

        tooltip.textContent = data.text;
        tooltip.style.display = "block";
    });

    el.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });
});

function applyTooltipStyles() {
    document.querySelectorAll(".tooltip-target").forEach(el => {
        const key = el.dataset.key;
        const data = tooltipData[key];

        if (!data) return;

        // typeをクラスとして付与
        el.classList.add(data.type);
    });
}