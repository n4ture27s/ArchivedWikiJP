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
        // 文字サイズ変更の判定: {textsize=倍率,テキスト}
        const sizeMatch = inner.match(/^textsize=([\d\.]+),\s*(.*)$/);
        if (sizeMatch) {
            const size = sizeMatch[1];
            let content = sizeMatch[2];
            // 内部にツールチップ指定 {key} が含まれる場合を考慮して置換
            content = content.replace(/\{(.*?)\}/g, (__, k) => `<span class="tooltip-target" data-key="${k}"></span>`);
            return `<span style="font-size: ${size}em;">${content}</span>`;
        }

        return `<span class="tooltip-target" data-key="${inner}"></span>`;
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