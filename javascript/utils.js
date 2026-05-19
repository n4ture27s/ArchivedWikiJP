function formatText(text) {
    if (!text) return "";

    // セキュリティ: HTMLタグをエスケープしてXSSを防止
    const escape = (str) => str.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);

    let escaped = escape(text);

    let formatted = escaped
        .replace(/\\br/g, "\n")
        .replace(/\n/g, "<br>");

    formatted = formatted.replace(/\{(.*?)\}/g, (_, inner) => {
        // カンマまたは等号が含まれる場合、属性指定のある装飾として扱う
        if (inner.includes(",") || inner.includes("=")) {
            const parts = inner.split(",");
            const styles = [];
            let content = "";

            // 新形式 {textsize=1, bold, text=内容} などの解析
            parts.forEach(p => {
                const part = p.trim();
                if (part.startsWith("textsize=")) {
                    styles.push(`font-size: ${part.split("=")[1]}em`);
                } else if (part === "bold") {
                    styles.push("font-weight: bold");
                } else if (part === "line-through") {
                    styles.push("text-decoration: line-through");
                } else if (part === "underline") {
                    styles.push("text-decoration: underline");
                } else if (part === "italic") {
                    styles.push("font-style: italic");
                } else if (part.startsWith("font-weight=")) {
                    styles.push(`font-weight: ${part.split("=")[1]}`);
                } else if (part.startsWith("text=")) {
                    content = part.substring(5);
                } else if (part.startsWith("color=")) {
                    styles.push(`color: ${part.split("=")[1]}`);
                } else if (part.startsWith("back-color=")) {
                    styles.push(`background-color: ${part.split("=")[1]}`);
                }
            });

            if (content) {
                // 内部にさらにツールチップ指定 {key} が含まれる場合を考慮して置換
                content = content.replace(/\{(.*?)\}/g, (__, k) => `<span class="tooltip-target" data-key="${k}"></span>`);
                return `<span style="${styles.join("; ")}">${content}</span>`;
            }
        }

        // それ以外（単一キーワードなど）は従来通りツールチップとして扱う
        return `<span class="tooltip-target" data-key="${inner}"></span>`;
    });

    return formatted;
}

function createStat(label, value, className = "") {
    const row = document.createElement("div");
    row.classList.add("stat");

    row.innerHTML = `
        <span class="label">${label}</span>
        <span class="value ${className}">${value}</span>
    `;

    return row;
}

window.DataStore = {
    books: {},
    pages: {},
    skills: {}
};