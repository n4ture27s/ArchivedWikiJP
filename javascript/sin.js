let skillData = {};

function showDetail(key) {
    const data = skillData[key];
    if (!data) return;

    document.getElementById("skill-title").textContent = data.title;
    document.getElementById("skill-desc").textContent = data.desc;

    document.documentElement.style.setProperty(
        "--sin-color",
        data.color || "#d64545"
    );

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

        node.style.borderColor = data.color || "#777";
        node.style.setProperty(
            "--node-color",
            data.color || "#777"
        );

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

    node.style.borderColor = data.color || "#777";

    node.style.setProperty(
        "--node-color",
        data.color || "#777"
    );

    node.addEventListener("click", () => {

        document.querySelectorAll(".node").forEach(n => {
            n.classList.remove("active");
        });

        node.classList.add("active");

        showDetail(key);
    });

    container.appendChild(node);
}

window.addEventListener("load", async () => {

    const res =
        await fetch("/javascript/json/skill_tree.json");

    skillData = await res.json();

    createCircleNodes("skill-tree");
    createCenterNode("skill-tree");
});


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