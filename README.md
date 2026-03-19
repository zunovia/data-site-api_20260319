# 日本統計 JAPAN STATS — e-Stat API Data Visualization

政府統計の総合窓口（e-Stat）APIを活用した、日本の人口動態・経済指標・地域比較の視覚化サイト。

## Demo
GitHub Pages: https://zunovia.github.io/data-site-api_20260319/

## Features
- **人口**: 47都道府県グリッドマップ（人口/高齢化率/密度切替）
- **年収**: 都道府県別平均年収ランキング（賃金センサス）
- **暮らし**: 品目別支出No.1都市 + CPI推移
- **API Live**: e-Stat API v3.0にクライアントサイドから直接アクセス

## Tech Stack
- React 18 + TypeScript + Vite
- e-Stat API v3.0 (CORS JSON)
- Cinematic particle hero with Canvas API
- Dark/Light theme

## Structure
```
├── index.html           # メインサイト (bundle)
├── notebooks/           # 分析Notebook
├── レポート/            # Markdownレポート
│   └── html-report/     # プロフェッショナルHTMLレポート
├── images/              # 分析チャート画像
├── src/js/              # API連携モジュール
└── docs/                # データカタログ
```

## Data Sources
- 総務省統計局「人口推計」「国勢調査」「家計調査」「消費者物価指数」
- 厚生労働省「賃金構造基本統計調査」

## Credits
[Sur Communication Inc.](https://www.ryotakaneda.com/)
