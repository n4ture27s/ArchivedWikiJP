function showDetail(key) {
    const data = skillData[key];
    if (!data) return;

    document.getElementById("skill-title").textContent = data.title;
    document.getElementById("skill-desc").textContent = data.desc;

    const list = document.getElementById("skill-list");
    list.innerHTML = "";

    data.skills.forEach(s => {
        const div = document.createElement("div");
        div.className = "skill-item";

        div.innerHTML = `
  <details class="skill-item">
    <summary>${s.name}</summary>
    <p>${formatText(s.text)}</p>
  </details>
`;

        list.appendChild(div);
    });
}

function createCircleNodes(containerId, nodes) {
    const container = document.getElementById(containerId);
    const size = container.offsetWidth;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 50;

    nodes.forEach((nodeData, i) => {
        const angle = (i / nodes.length) * (Math.PI * 2) - Math.PI / 2;

        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        const node = document.createElement("div");
        node.className = "node";

        node.innerHTML = `<img src="/assets/sin_icon/${nodeData.label}" alt="">`;

        node.dataset.skill = nodeData.key;

        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.transform = "translate(-50%, -50%)";

        node.addEventListener("click", () => {
            showDetail(nodeData.key);
        });

        container.appendChild(node);
    });
}
window.addEventListener("load", () => {
    createCircleNodes("skill-tree", [
        { key: "battle", label: "Bleed.png" },
        { key: "wind", label: "" },
        { key: "resolve", label: "" },
        { key: "wrath", label: "Bleed.png" },
        { key: "battle", label: "" },
        { key: "wind", label: "" },
        { key: "resolve", label: "" }
    ]);
});

const skillData = {
    wrath: {
        title: "Wrath",
        desc: "ダメージを強化するスキルツリー",
        skills: [
            {
                name: "Battle Ignition",
                text: "5回ヒットでダメージ増加"
            },
            {
                name: "Close Call Wind",
                text: "回避時にボーナス"
            }
        ]
    }
};

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