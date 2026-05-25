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
            // カンマで分割するが、括弧内のカンマは無視する（rgbaなどのため）
            const parts = [];
            let current = "";
            let depth = 0;
            for (let i = 0; i < inner.length; i++) {
                const char = inner[i];
                if (char === '(') depth++;
                if (char === ')') depth--;
                if (char === ',' && depth === 0) {
                    parts.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }
            parts.push(current.trim());

            const styles = [];
            let content = "";
            let url = "";

            // 新形式 {textsize=1, bold, text=内容} などの解析
            parts.forEach(p => {
                const part = p.trim();
                const eqIndex = part.indexOf('=');
                const key = eqIndex !== -1 ? part.substring(0, eqIndex) : part;
                const val = eqIndex !== -1 ? part.substring(eqIndex + 1) : "";

                if (key === "textsize") {
                    styles.push(`font-size: ${val}em`);
                } else if (part === "bold") {
                    styles.push("font-weight: bold");
                } else if (part === "line-through") {
                    styles.push("text-decoration: line-through");
                } else if (part === "underline") {
                    styles.push("text-decoration: underline");
                } else if (part === "italic") {
                    styles.push("font-style: italic");
                } else if (key === "font-weight") {
                    styles.push(`font-weight: ${val}`);
                } else if (key === "text") {
                    content = val;
                } else if (key === "color") {
                    styles.push(`color: ${val}`);
                } else if (key === "back-color") {
                    styles.push(`background-color: ${val}`);
                } else if (key === "opacity") {
                    styles.push(`opacity: ${val}`);
                } else if (key === "radius") {
                    styles.push(`border-radius: ${val}`);
                } else if (key === "spacing") {
                    styles.push(`letter-spacing: ${val}`);
                } else if (key === "padding") {
                    styles.push(`padding: ${val}`);
                } else if (key === "shadow") {
                    styles.push(`text-shadow: ${val}`);
                } else if (key === "border") {
                    styles.push(`border: ${val}`);
                } else if (key === "url") {
                    url = val;
                }
            });

            if (content) {
                // 内部にさらにツールチップ指定 {key} が含まれる場合を考慮して置換
                content = content.replace(/\{(.*?)\}/g, (__, k) => `<span class="tooltip-target" data-key="${k}"></span>`);
                const styleAttr = styles.length > 0 ? ` style="${styles.join("; ")}"` : "";
                if (url) {
                    return `<a href="${url}"${styleAttr} target="_blank" rel="noreferrer">${content}</a>`;
                }
                return `<span${styleAttr}>${content}</span>`;
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

/**
 * 要素にカラーテーマ（プライマリ・セカンダリ）を適用する
 * @param {HTMLElement} el 対象要素
 * @param {string} primary プライマリカラー
 * @param {string} secondary セカンダリカラー（未指定時はプライマリと同じ）
 * @param {Object} mapping { "CSSプロパティ名または変数名": "primary" | "secondary" }
 * @param {string} fallback デフォルトカラー
 */
function applyColorTheme(el, primary, secondary, mapping = {}, fallback = "#777") {
    if (!el) return { primary: fallback, secondary: fallback };
    const p = primary ? (String(primary).startsWith('#') ? primary : `#${primary}`) : fallback;
    const s = secondary ? (String(secondary).startsWith('#') ? secondary : `#${secondary}`) : p;

    Object.entries(mapping).forEach(([target, type]) => {
        const val = (type === 'primary') ? p : s;
        if (target.startsWith('--')) {
            el.style.setProperty(target, val);
        } else {
            el.style[target] = val;
        }
    });
    return { primary: p, secondary: s };
}

window.DataStore = {
    books: {},
    pages: {},
    skills: {}
};