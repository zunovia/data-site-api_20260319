# e-Stat API データアーキテクチャ

## appId
```
6f7e88733e47d2ae3ddc010642412f04d8ca594c
```

## サイトで使用するAPI呼び出し一覧

### 1. 人口推計（都道府県別）
- statsCode: 00200524
- statsDataId: 0003448237（月次人口）/ 0003448233（都道府県別人口割合）
- 用途: ヒーロー数値、都道府県ランキング

### 2. 労働力調査
- statsCode: 00200532
- statsDataId: 0003143513
- 用途: 完全失業率

### 3. 消費者物価指数
- statsCode: 00200573
- statsDataId: 0003421913
- 用途: CPI推移チャート

### 4. 社会・人口統計体系（都道府県のすがた）
- statsCode: 00200502
- statsDataId: C0020050213000（高齢化率等）
- 用途: 都道府県比較ダッシュボード

## APIリクエストURL構造

### JSON形式（CORS対応・フロント直接呼出し可）
```
https://api.e-stat.go.jp/rest/3.0/app/json/{endpoint}?appId={appId}&{params}
```

### エンドポイント一覧
| endpoint | 用途 |
|---|---|
| getStatsList | 統計表検索 |
| getMetaInfo | メタ情報（分類コード等） |
| getStatsData | 統計データ本体 |

## JSONレスポンス構造（getStatsData）
```
GET_STATS_DATA
├── RESULT
│   ├── STATUS (0=正常)
│   └── ERROR_MSG
├── PARAMETER
└── STATISTICAL_DATA
    ├── RESULT_INF
    │   ├── TOTAL_NUMBER
    │   └── FROM_NUMBER / TO_NUMBER
    ├── TABLE_INF (統計表メタ)
    ├── CLASS_INF
    │   └── CLASS_OBJ[] (分類定義)
    │       ├── @id: "tab" | "cat01" | "area" | "time"
    │       └── CLASS[]: {code, name, level, unit}
    └── DATA_INF
        └── VALUE[]: {tab, cat01, area, time, $:数値}
```

## 地域コード体系
```
00000 = 全国
01000 = 北海道
02000 = 青森県
...
13000 = 東京都
...
47000 = 沖縄県
```
