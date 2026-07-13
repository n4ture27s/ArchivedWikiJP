#!/usr/bin/env python3
"""
参照Wikiの変更をチェックして更新があれば知らせるスクリプト。
使い方: python tools/check_updates.py
"""
import json, os, sys, re, urllib.parse
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError
from html import unescape

API = "https://archivedwiki.miraheze.org/w/api.php"
STATE_FILE = os.path.join(os.path.dirname(__file__), "update_state.json")
WEAPON_CACHE_FILE = os.path.join(os.path.dirname(__file__), "wiki_weapon_cache.json")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEAPON_JSON = os.path.join(ROOT, "javascript", "json", "weapon.json")
USER_AGENT = "ArchivedWikiJP-Updater/1.0"

MONITORED_PAGES = {
    "outfits": "Outfits",
    "items": "Items",
    "weapons": "Weapons",
    "pages": "Pages",
}

def api_request(params):
    params["format"] = "json"
    qs = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    req = Request(f"{API}?{qs}", headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def get_last_revision(title):
    data = api_request({
        "action": "query",
        "prop": "revisions",
        "titles": title,
        "rvlimit": "1",
        "rvprop": "timestamp|ids",
    })
    pages = data.get("query", {}).get("pages", {})
    for pid, info in pages.items():
        if pid == "-1":
            return None
        revs = info.get("revisions", [])
        if revs:
            return revs[0]["timestamp"], revs[0]["revid"]
    return None

# ─── 武器効果テキスト変更検知 ───────────────────────────────

def get_weapon_revision(title):
    """Get revision for an individual weapon page"""
    try:
        data = api_request({
            "action": "query", "prop": "revisions",
            "titles": title, "rvlimit": "1", "rvprop": "ids",
        })
        pages = data.get("query", {}).get("pages", {})
        for pid, info in pages.items():
            if pid == "-1":
                return None
            revs = info.get("revisions", [])
            if revs:
                return revs[0]["revid"]
        return None
    except:
        return None

def fetch_page_text(title):
    try:
        data = api_request({"action": "parse", "page": title, "prop": "text"})
        return data["parse"]["text"]["*"]
    except:
        return None

def extract_effects(html_text):
    if not html_text:
        return ""
    text = re.sub(r'<style[^>]*>.*?</style>', '', html_text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', '\n', text)
    text = unescape(text)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    in_stats = False
    result_lines = []
    stop_markers = {"Obtainment", "Gallery", "Trivia", "Notes", "References"}
    skip_prefixes = {"A Damage Type", "A Status", "A Mechanic", "A Resource", "A DoT",
                     "A passive", "Material effect", "Gives", "Deals", "Status used for",
                     "Ability used", "Resource Status", "This condition", "This effect",
                     "This attack", "Attacks with", "Dice with", "Multihits with",
                     "Pages", "Weapons", "Outfits", "[[", "{{"}

    for line in lines:
        if line == "Stats":
            in_stats = True; continue
        if in_stats and line == "Basic Attack": continue
        if in_stats and line in stop_markers: break
        if not in_stats: continue
        if line in ("Image", "Information"): continue
        if any(line.startswith(p) for p in skip_prefixes): continue
        result_lines.append(line)
    return "\n".join(result_lines)

# ─── メイン ──────────────────────────────────────────────────

def main():
    print(f"=== 更新チェック {datetime.now().strftime('%Y-%m-%d %H:%M')} ===\n")
    state = {}
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            state = json.load(f)

    any_update = False
    report_lines = []

    # ── 1. ページリビジョンチェック ──
    print("[1] ページ更新チェック")
    for key, title in MONITORED_PAGES.items():
        print(f"  [{key}] {title} ... ", end="", flush=True)
        result = get_last_revision(title)
        if result is None:
            print("見つかりません")
            continue
        ts, revid = result
        prev = state.get(key, {})
        prev_revid = prev.get("revid")
        if prev_revid and revid > prev_revid:
            msg = f"更新! (rev {prev_revid} -> {revid}, {ts})"
            print(msg)
            report_lines.append(f"  [{key}] {title}: {msg}")
            any_update = True
        elif not prev_revid:
            print(f"初回 (rev {revid}, {ts})")
        else:
            print("変更なし")
        state[key] = {"timestamp": ts, "revid": revid}

    # ── 2. 武器効果テキスト変更検知 ──
    print("\n[2] 武器効果テキスト変更検知")
    weapon_cache = {}
    if os.path.exists(WEAPON_CACHE_FILE):
        with open(WEAPON_CACHE_FILE, encoding="utf-8") as f:
            weapon_cache = json.load(f)

    if not os.path.exists(WEAPON_JSON):
        print("  weapon.json が見つかりません - スキップ")
    else:
        with open(WEAPON_JSON, encoding="utf-8") as f:
            weapons = json.load(f)

        changed_count = 0
        new_count = 0
        error_count = 0
        for key, w in sorted(weapons.items(), key=lambda x: x[1].get("name_en", "")):
            name_en = w["name_en"]
            rev_id = get_weapon_revision(name_en)
            if rev_id is None:
                error_count += 1
                continue

            cached = weapon_cache.get(key, {})
            cached_rev = cached.get("rev_id")

            if cached_rev == rev_id and cached.get("effect_text"):
                continue  # unchanged

            # New or changed - fetch and extract
            html = fetch_page_text(name_en)
            if html is None:
                error_count += 1
                continue

            effect_text = extract_effects(html)
            old_effect = cached.get("effect_text", "")

            weapon_cache[key] = {
                "rev_id": rev_id,
                "title": name_en,
                "effect_text": effect_text,
                "last_fetched": datetime.now().isoformat(),
            }

            if not cached_rev:
                new_count += 1
            elif old_effect != effect_text:
                changed_count += 1
                msg = f"  効果テキスト変更: {name_en}"
                print(msg)
                report_lines.append(msg)
                any_update = True

        print(f"  取得済: {len(weapon_cache)}, 新規: {new_count}, テキスト変更: {changed_count}, エラー: {error_count}")

        # キャッシュ保存
        os.makedirs(os.path.dirname(WEAPON_CACHE_FILE), exist_ok=True)
        with open(WEAPON_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(weapon_cache, f, ensure_ascii=False, indent=2)

    # ── 3. ブックデータ（ページ）の変更チェック ──
    print("\n[3] ブックデータ変更チェック")
    # Pagesページのリビジョンは[1]でチェック済み。
    # 個別の各書物ページの更新はここではスキップ（必要なら追加）
    print("  [pages] は[1]でチェック済み。個別ページチェックは未実装。")

    # ── 結果保存 ──
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

    print()
    if any_update:
        print("=> 更新があります。")
        print("\n--- 変更詳細 ---")
        for l in report_lines:
            print(l)
        print(f"\n最終更新: {datetime.now().isoformat()}")
        return 1
    else:
        print("=> 全項目変更なし")
        return 0

if __name__ == "__main__":
    sys.exit(main())
