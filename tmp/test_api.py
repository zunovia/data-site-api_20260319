import requests
import json
import sys

APP_ID = "6f7e88733e47d2ae3ddc010642412f04d8ca594c"
BASE = "https://api.e-stat.go.jp/rest/3.0/app/json"

def test_get_stats_list():
    """統計表情報取得 — 人口推計の統計表一覧"""
    url = f"{BASE}/getStatsList"
    params = {
        "appId": APP_ID,
        "searchWord": "人口推計",
        "limit": 5,
    }
    r = requests.get(url, params=params, timeout=15)
    return r.json()

def test_get_meta_info(stats_data_id):
    """メタ情報取得"""
    url = f"{BASE}/getMetaInfo"
    params = {
        "appId": APP_ID,
        "statsDataId": stats_data_id,
    }
    r = requests.get(url, params=params, timeout=15)
    return r.json()

def test_get_stats_data(stats_data_id, limit=10):
    """統計データ取得"""
    url = f"{BASE}/getStatsData"
    params = {
        "appId": APP_ID,
        "statsDataId": stats_data_id,
        "limit": limit,
        "metaGetFlg": "Y",
    }
    r = requests.get(url, params=params, timeout=15)
    return r.json()

print("=" * 60)
print("TEST 1: 統計表情報取得 (人口推計)")
print("=" * 60)
try:
    result = test_get_stats_list()
    status = result.get("GET_STATS_LIST", {}).get("RESULT", {})
    print(f"Status: {status.get('STATUS')} - {status.get('ERROR_MSG')}")
    
    tables = result.get("GET_STATS_LIST", {}).get("DATALIST_INF", {}).get("TABLE_INF", [])
    if isinstance(tables, dict):
        tables = [tables]
    
    print(f"\n取得件数: {len(tables)}")
    for i, t in enumerate(tables[:5]):
        print(f"\n--- Table {i+1} ---")
        stat_name = t.get("STAT_NAME", {})
        title = t.get("TITLE", "")
        if isinstance(title, dict):
            title = title.get("$", "")
        if isinstance(stat_name, dict):
            stat_name = stat_name.get("$", "")
        print(f"  ID: {t.get('@id', 'N/A')}")
        print(f"  統計名: {stat_name}")
        print(f"  表題: {title[:80]}")
        print(f"  調査日: {t.get('SURVEY_DATE', 'N/A')}")
except Exception as e:
    print(f"ERROR: {e}")

