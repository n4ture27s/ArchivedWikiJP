#!/usr/bin/env python3
"""
Wiki武器効果テキスト変更検知ツール

使い方: python tools/check_weapon_effects.py
初回実行: 全武器のWiki効果テキストを取得してキャッシュに保存
2回目以降: リビジョンIDを比較し、変更があった武器のみ詳細を表示
"""
import json, urllib.request, re, urllib.parse, os, sys
from html import unescape
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_FILE = os.path.join(ROOT, "tools", "wiki_weapon_cache.json")
WEAPON_JSON = os.path.join(ROOT, "javascript", "json", "weapon.json")
USER_AGENT = "ArchivedWikiJP/1.0"

def wiki_api(action, **params):
    params["action"] = action
    params["format"] = "json"
    qs = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    url = f"https://archivedwiki.miraheze.org/w/api.php?{qs}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def get_last_revision(title):
    """Get last revision ID for a page (lightweight)"""
    try:
        data = wiki_api("query", prop="revisions", titles=title, rvprop="ids", rvlimit=1)
        pages = data["query"]["pages"]
        for pid, page in pages.items():
            if pid == "-1":
                return None, None
            revs = page.get("revisions", [])
            if revs:
                return revs[0]["revid"], page.get("title", title)
        return None, None
    except:
        return None, None

def fetch_page_text(title):
    """Fetch full page HTML"""
    try:
        data = wiki_api("parse", page=title, prop="text")
        return data["parse"]["text"]["*"]
    except:
        return None

def extract_effects(html_text):
    """Extract the effect section (Stats and Critical) from a weapon page"""
    if not html_text:
        return ""

    text = re.sub(r'<style[^>]*>.*?</style>', '', html_text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', '\n', text)
    text = unescape(text)
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    # Extract content from "Stats" to next major section or end
    in_stats = False
    in_critical = False
    result_lines = []
    section_end_markers = ["Obtainment", "Gallery", "Trivia", "Notes", "References"]

    for line in lines:
        if line == "Stats":
            in_stats = True
            continue
        if in_stats and line == "Basic Attack":
            continue
        if in_stats and line in ("Critical", "Critical1", "Critical2", "Critical3"):
            in_critical = True
            result_lines.append(f"\n=== {line} ===")
            continue
        if in_stats and line in section_end_markers:
            break
        if in_stats:
            # Skip boilerplate tooltip lines
            if line in ("Image", "Information"):
                continue
            if line.startswith("A Damage Type"):
                continue
            if line.startswith("A Status") or line.startswith("A Mechanic") or line.startswith("A Resource"):
                continue
            if line.startswith("A DoT") or line.startswith("A passive") or line.startswith("Material effect"):
                continue
            if line.startswith("Gives") or line.startswith("Deals"):
                continue
            if "Status used for" in line or "Ability used" in line or "Resource Status" in line:
                continue
            if line.startswith("This condition") or line.startswith("This effect") or line.startswith("This attack"):
                continue
            if line.startswith("Attacks with") or line.startswith("Dice with") or line.startswith("Multihits with"):
                continue
            if line.startswith("Pages") or line.startswith("Weapons") or line.startswith("Outfits"):
                continue
            if line.startswith("[[") or line.startswith("{{"):
                continue
            result_lines.append(line)

    return "\n".join(result_lines)

def main():
    print("=" * 70)
    print("Wiki Weapon Effect Change Detector")
    print("=" * 70)

    # Load weapon.json
    with open(WEAPON_JSON, encoding="utf-8") as f:
        weapons = json.load(f)

    # Load cache
    cache = {}
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, encoding="utf-8") as f:
            cache = json.load(f)
        print(f"Loaded cache: {len(cache)} weapons")
    else:
        print("No cache found. First run - will fetch all weapons.")

    weapon_names = [(key, w["name_en"]) for key, w in weapons.items()]

    changes_detected = []
    unchanged = 0
    errors = []
    new_weapons = []
    updated_weapons = []

    print(f"\nChecking {len(weapon_names)} weapons...\n")

    for key, name_en in sorted(weapon_names):
        # Get last revision ID
        rev_id, actual_title = get_last_revision(name_en)

        if rev_id is None:
            # Try alternate name
            alt_name = name_en.replace("'", "\\'")
            rev_id, actual_title = get_last_revision(alt_name)
        if rev_id is None:
            errors.append(f"  [404] {name_en} ({key})")
            continue

        cached = cache.get(key, {})
        cached_rev = cached.get("rev_id")

        # If revision unchanged, skip
        if cached_rev == rev_id and cached.get("effect_text"):
            unchanged += 1
            continue

        # New or changed - fetch full page
        html = fetch_page_text(actual_title or name_en)
        if html is None:
            errors.append(f"  [FETCH ERROR] {name_en} ({key})")
            continue

        effect_text = extract_effects(html)
        old_effect = cached.get("effect_text", "")

        # Update cache
        cache[key] = {
            "rev_id": rev_id,
            "title": actual_title or name_en,
            "effect_text": effect_text,
            "last_fetched": datetime.now().isoformat(),
        }

        if not cached_rev:
            new_weapons.append(name_en)
            print(f"  [NEW] {name_en}")
        else:
            updated_weapons.append(name_en)
            print(f"  [CHANGED] {name_en} (rev {cached_rev} -> {rev_id})")
            # Show a simple diff indicator
            if old_effect != effect_text:
                changes_detected.append((name_en, old_effect, effect_text))
                print(f"          Effect text changed!")

    # Save cache
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total weapons: {len(weapon_names)}")
    print(f"Unchanged: {unchanged}")
    print(f"New (first fetch): {len(new_weapons)}")
    print(f"Updated (revision changed): {len(updated_weapons)}")
    print(f"Effect text actually changed: {len(changes_detected)}")
    print(f"Errors: {len(errors)}")

    if changes_detected:
        print("\n--- DETAILED CHANGES ---")
        for name, old, new in changes_detected:
            print(f"\n=== {name} ===")
            print("--- OLD (cached) ---")
            print(old[:500] if old else "(empty)")
            print("--- NEW (wiki) ---")
            print(new[:500] if new else "(empty)")
            print("---")

    if errors:
        print("\n--- ERRORS ---")
        for e in errors:
            print(e)

    # Also list new additions for first-time users
    if new_weapons and len(new_weapons) == len(weapon_names):
        print("\n[INFO] First run complete. Cache populated for all weapons.")
        print("Run again later to detect changes.")

if __name__ == "__main__":
    main()
