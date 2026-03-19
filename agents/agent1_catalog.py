"""
Agent 1: e-Stat データカタログ調査
- e-Statの分野別データ構成を調査
- 利用可能なExcelファイルの一覧を取得
- 結果を docs/catalog.md に出力
"""
import requests
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "docs")
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# e-Stat API v3.0 (appId不要で統計表一覧は取得不可だが、統計ダッシュボードAPIは登録不要)
DASHBOARD_API = "https://dashboard.e-stat.go.jp/api/1.0"

# 分野一覧（e-Statの17分野）
CATEGORIES = {
    "01": "国土・気象",
    "02": "人口・世帯",
    "03": "労働・賃金",
    "04": "農林水産業",
    "05": "鉱工業",
    "06": "商業・サービス業",
    "07": "企業・家計・経済",
    "08": "住宅・土地・建設",
    "09": "エネルギー・水",
    "10": "運輸・観光",
    "11": "情報通信・科学技術",
    "12": "教育・文化・スポーツ・生活",
    "13": "行財政",
    "14": "司法・安全・環境",
    "15": "社会保障・衛生",
    "16": "国際",
    "99": "その他",
}

# 主要統計一覧（代表的な統計名とコード）
MAJOR_STATS = {
    "00200521": {"name": "国勢調査", "category": "02", "desc": "5年ごとの全数調査。人口・世帯の最も基本的な統計"},
    "00200524": {"name": "人口推計", "category": "02", "desc": "毎月・毎年の人口推計。年齢別・都道府県別"},
    "00200531": {"name": "住民基本台帳人口移動報告", "category": "02", "desc": "都道府県間の人口移動"},
    "00200522": {"name": "人口動態統計", "category": "02", "desc": "出生・死亡・婚姻・離婚"},
    "00200532": {"name": "労働力調査", "category": "03", "desc": "就業・失業の状況。完全失業率等"},
    "00200573": {"name": "消費者物価指数", "category": "07", "desc": "物価の変動を測定"},
    "00200561": {"name": "家計調査", "category": "07", "desc": "世帯の収入・支出"},
    "00200603": {"name": "住宅・土地統計調査", "category": "08", "desc": "住宅の状況"},
    "00200502": {"name": "社会・人口統計体系", "category": "02", "desc": "都道府県・市区町村のすがた。横断的指標"},
}

def fetch_dashboard_series():
    """統計ダッシュボードAPIから系列情報を取得（登録不要）"""
    url = f"{DASHBOARD_API}/Json/getData"
    results = {}
    
    # テスト: 人口関連の系列を取得
    test_indicators = [
        {"code": "0201010000000010010", "name": "総人口"},
        {"code": "0301010000000010000", "name": "完全失業率"},
    ]
    
    for ind in test_indicators:
        try:
            params = {
                "IndicatorCode": ind["code"],
                "Time": "2023000000",
                "RegionalRank": "prefecture",
            }
            r = requests.get(url, params=params, timeout=10)
            if r.status_code == 200:
                data = r.json()
                results[ind["name"]] = {
                    "status": "OK",
                    "sample": str(data)[:500]
                }
            else:
                results[ind["name"]] = {"status": f"HTTP {r.status_code}"}
        except Exception as e:
            results[ind["name"]] = {"status": f"Error: {e}"}
    
    return results

def generate_catalog():
    """カタログ文書を生成"""
    
    # ダッシュボードAPI調査
    print("=== 統計ダッシュボードAPI調査 ===")
    dashboard_results = fetch_dashboard_series()
    
    # カタログ文書生成
    doc = []
    doc.append("# e-Stat データカタログ")
    doc.append(f"\n調査日時: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    
    doc.append("## 1. e-Stat 分野構成 (17分野)\n")
    for code, name in CATEGORIES.items():
        doc.append(f"- **{code}**: {name}")
    
    doc.append("\n## 2. 主要統計一覧\n")
    doc.append("| 政府統計コード | 統計名 | 分野 | 概要 |")
    doc.append("|---|---|---|---|")
    for code, info in MAJOR_STATS.items():
        cat_name = CATEGORIES.get(info["category"], "")
        doc.append(f"| {code} | {info['name']} | {cat_name} | {info['desc']} |")
    
    doc.append("\n## 3. API種別\n")
    doc.append("### e-Stat API (v3.0) — appId必要")
    doc.append("- `getStatsList`: 統計表情報取得")
    doc.append("- `getMetaInfo`: メタ情報取得")
    doc.append("- `getStatsData`: 統計データ取得（JSON/XML/CSV）")
    doc.append("- `getSimpleStatsData`: 簡易統計データ取得（CSV形式）")
    doc.append("- `postDataset`: データセット登録")
    doc.append("- `refDataset`: データセット参照")
    doc.append("- `getDataCatalog`: データカタログ取得")
    
    doc.append("\n### 統計ダッシュボードAPI — 登録不要")
    doc.append("- 約6,000系列のデータを保持")
    doc.append("- 時間軸（月次/四半期/年次）× 地域軸（全国/都道府県/市区町村）")
    doc.append("- JSON, XML, CSV, JSON-stat 形式で出力可能")
    
    doc.append("\n## 4. 統計ダッシュボードAPI テスト結果\n")
    for name, result in dashboard_results.items():
        doc.append(f"### {name}")
        doc.append(f"- Status: {result['status']}")
        if 'sample' in result:
            doc.append(f"- Sample (先頭500文字): `{result['sample'][:200]}...`")
        doc.append("")
    
    doc.append("\n## 5. サイトで利用可能なExcelデータ\n")
    doc.append("e-Statからダウンロード可能な主要Excel:")
    doc.append("- **統計でみる都道府県のすがた** (社会・人口統計体系)")
    doc.append("  - 人口、経済、教育、健康等の横断データ")
    doc.append("  - 都道府県別の多項目データ")
    doc.append("- **統計でみる市区町村のすがた** (社会・人口統計体系)")
    doc.append("  - 市区町村レベルの詳細データ")
    doc.append("- **人口推計** (年次)")
    doc.append("  - 都道府県別、年齢別人口")
    doc.append("- **労働力調査**")
    doc.append("  - 就業者数、完全失業率等")
    doc.append("- **消費者物価指数**")
    doc.append("  - 品目別、地域別物価指数")
    
    output_path = os.path.join(OUTPUT_DIR, "catalog.md")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(doc))
    
    print(f"カタログ生成完了: {output_path}")
    return dashboard_results

if __name__ == "__main__":
    results = generate_catalog()
    print("\n=== 完了 ===")
    for name, result in results.items():
        print(f"  {name}: {result['status']}")
