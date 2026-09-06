#!/usr/bin/env python3
"""データの鮮度点検。

data/sources.json だけを見て「そろそろ新しい調査が出ているはずの出典」を洗い出す。
Web は見に行かない（見に行くのは月次ルーチンの仕事）。ここは判断の要らない部分だけを
機械的にやる。

使い方:
    python scripts/check_freshness.py            # 人が読む形で出力
    python scripts/check_freshness.py --markdown # Issue 本文向け
    python scripts/check_freshness.py --json     # 機械向け

終了コード:
    0 = 期限到来なし
    1 = 期限到来あり（GitHub Actions はこれを見て Issue を立てる）
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEDGER = ROOT / "data" / "sources.json"

# 期限の何か月前から知らせるか。公表が数週間ずれても取りこぼさないための猶予。
LEAD_MONTHS = 1


def parse_ym(value: str | None) -> tuple[int, int] | None:
    """"2027-04" や "2027" を (年, 月) にする。読めなければ None。"""
    if not value:
        return None
    parts = str(value).split("-")
    try:
        year = int(parts[0])
    except ValueError:
        return None
    month = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 12
    return year, month


def months_between(a: tuple[int, int], b: tuple[int, int]) -> int:
    """a から b までの月数。b が過去なら負。"""
    return (b[0] - a[0]) * 12 + (b[1] - a[1])


def collect(today: date) -> dict:
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    now = (today.year, today.month)

    due: list[dict] = []
    inventory: list[dict] = []
    ok: list[dict] = []

    for page in ledger["pages"]:
        if page.get("needs_inventory"):
            inventory.append({"page": page["key"], "title": page["title"], "file": page["file"]})

        for src in page.get("sources", []):
            expected = parse_ym(src.get("next_expected"))
            item = {
                "page": page["key"],
                "title": page["title"],
                "file": page["file"],
                "source": src["name"],
                "org": src["org"],
                "url": src.get("url", ""),
                "as_of": src.get("as_of", ""),
                "next_expected": src.get("next_expected"),
                "confidence": src.get("confidence", "unknown"),
                "note": src.get("note", ""),
            }
            if expected is None:
                # next_expected が無いものは常時取得（e-Stat API 等）。点検対象外。
                continue
            remaining = months_between(now, expected)
            item["months_remaining"] = remaining
            (due if remaining <= LEAD_MONTHS else ok).append(item)

    due.sort(key=lambda x: x["months_remaining"])
    return {
        "checked_on": today.isoformat(),
        "due": due,
        "needs_inventory": inventory,
        "up_to_date": ok,
    }


def render_text(r: dict) -> str:
    out = [f"データ鮮度の点検 — {r['checked_on']}", ""]
    if r["due"]:
        out.append(f"■ 確認が必要な出典: {len(r['due'])}件")
        for d in r["due"]:
            late = "期限超過" if d["months_remaining"] < 0 else "まもなく"
            out.append(
                f"  [{late}] {d['title']} / {d['org']}「{d['source']}」"
                f" 掲載値={d['as_of']} 想定={d['next_expected']}"
            )
            if d["url"]:
                out.append(f"        {d['url']}")
    else:
        out.append("■ 確認が必要な出典: なし")

    if r["needs_inventory"]:
        out.append("")
        out.append(f"■ 棚卸しが未了のページ: {len(r['needs_inventory'])}件")
        for p in r["needs_inventory"]:
            out.append(f"  - {p['title']}（{p['file']}）")

    out.append("")
    out.append(f"■ 当面は問題なし: {len(r['up_to_date'])}件")
    return "\n".join(out)


def render_markdown(r: dict) -> str:
    out = [
        "## データ鮮度の点検",
        "",
        f"点検日: **{r['checked_on']}**",
        "",
    ]
    if r["due"]:
        out += [
            f"### 確認が必要な出典（{len(r['due'])}件）",
            "",
            "| 状態 | ページ | 出典 | 掲載値 | 想定 | リンク |",
            "|---|---|---|---|---|---|",
        ]
        for d in r["due"]:
            state = "🔴 期限超過" if d["months_remaining"] < 0 else "🟡 まもなく"
            link = f"[確認]({d['url']})" if d["url"] else "—"
            out.append(
                f"| {state} | {d['title']} | {d['org']}「{d['source']}」"
                f" | {d['as_of']} | {d['next_expected']} | {link} |"
            )
        out += [
            "",
            "**やること**: 上の出典を実際に開き、新しい調査が出ていれば該当ページの数値を更新し、",
            "`data/sources.json` の `as_of` / `next_expected` / `last_updated` を書き換えてください。",
            "",
            "> 数値が変わらなかった場合は `last_checked` だけを更新します。",
            "> **`last_updated` は動かさないでください。** 中身が変わっていないのに更新日を進めると、",
            "> 読む人に『新しい情報だ』と誤解させることになります。",
            "",
        ]
    else:
        out += ["### 確認が必要な出典", "", "今回はありません。", ""]

    if r["needs_inventory"]:
        out += [
            f"### 棚卸しが未了のページ（{len(r['needs_inventory'])}件）",
            "",
            "掲載している数値の出典・調査年が特定できていません。1ページずつ埋めてください。",
            "",
        ]
        for p in r["needs_inventory"]:
            out.append(f"- [ ] {p['title']} — `{p['file']}`")
        out.append("")

    out.append(f"当面は問題なしの出典: {len(r['up_to_date'])}件")
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--markdown", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--today", help="点検日を固定する（テスト用・YYYY-MM-DD）")
    args = ap.parse_args()

    # Windows の既定は cp932 で、日本語やダッシュを出力すると落ちる。UTF-8 に固定する。
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    today = date.fromisoformat(args.today) if args.today else date.today()
    result = collect(today)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.markdown:
        print(render_markdown(result))
    else:
        print(render_text(result))

    return 1 if (result["due"] or result["needs_inventory"]) else 0


if __name__ == "__main__":
    sys.exit(main())
