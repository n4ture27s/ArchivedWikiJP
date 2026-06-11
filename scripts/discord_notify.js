// Usage: node scripts/discord_notify.js
// Requires: WEBHOOK_URL 環境変数にDiscord Webhook URLを設定

const fs = require("fs");
const path = require("path");

const LOGS_PATH = path.join(__dirname, "..", "javascript", "json", "logs.json");
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const TYPE_LABELS = { add: "追加", fix: "修正", change: "変更", remove: "削除" };
const TYPE_COLORS = { add: 0x57f287, fix: 0xfee75c, change: 0x3498db, remove: 0xed4245 };

async function main() {
  if (!WEBHOOK_URL) {
    console.error("WEBHOOK_URL 環境変数が設定されていません");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(LOGS_PATH, "utf-8"));
  let changed = false;

  for (const entry of data.logs) {
    if (!entry.new) continue;

    // Embed作成
    const fields = entry.items.map(item => ({
      name: `[${TYPE_LABELS[item.type] || item.type}]`,
      value: item.text,
      inline: false
    }));

    const embed = {
      title: `📢 更新情報 - ${entry.date}`,
      color: 0x5865f2,
      fields: fields,
      timestamp: new Date().toISOString()
    };

    const payload = {
      content: "更新されました。",
      embeds: [embed]
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error(`Discord送信失敗: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.error(text);
        continue;
      }
      console.log(`✓ ${entry.date} を送信しました`);
    } catch (err) {
      console.error(`送信エラー (${entry.date}):`, err.message);
      continue;
    }

    entry.new = false;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(LOGS_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
    console.log("logs.json の new フラグを false に更新しました");
  } else {
    console.log("送信すべき新規ログはありませんでした");
  }
}

main();
