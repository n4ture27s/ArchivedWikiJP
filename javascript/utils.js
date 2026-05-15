function formatText(text) {
    if (!text) return "";

    let formatted = text
        .replace(/\\br/g, "\n")
        .replace(/\n/g, "<br>");

    formatted = formatted.replace(/\{(.*?)\}/g, (_, key) => {
        return `<span class="tooltip-target" data-key="${key}"></span>`;
    });

    return formatted;
}

function createStat(label, value) {
    return `
        <div class="stat-row">
            <span>${label}</span>
            <span>${value}</span>
        </div>
    `;
}

window.DataStore = {
    books: {},
    pages: {},
    skills: {}
};