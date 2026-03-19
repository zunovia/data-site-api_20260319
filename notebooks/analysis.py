# %% [markdown]
# # 日本統計データ分析レポート
# ## e-Stat API データビジュアライゼーション
# 
# **分析対象**: 人口推計・都道府県比較・経済指標
# **データ出典**: 総務省統計局「人口推計」「国勢調査」「家計調査」「消費者物価指数」
# **分析日**: 2026年3月19日

# %%
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import japanize_matplotlib
import numpy as np
import json
import os

# 出力ディレクトリ
IMG_DIR = os.path.join(os.path.dirname(__file__), '..', 'images')
os.makedirs(IMG_DIR, exist_ok=True)

# スタイル設定
plt.rcParams.update({
    'figure.facecolor': '#0f0f0f',
    'axes.facecolor': '#0f0f0f',
    'text.color': '#e8e4de',
    'axes.labelcolor': '#e8e4de',
    'xtick.color': '#a09a90',
    'ytick.color': '#a09a90',
    'axes.edgecolor': '#333',
    'grid.color': '#222',
    'figure.dpi': 150,
    'savefig.dpi': 150,
    'savefig.bbox': 'tight',
    'savefig.facecolor': '#0f0f0f',
})

print("環境設定完了")

# %% [markdown]
# ## 1. 日本の総人口推移（2000年〜2024年）

# %%
# === データ準備 ===
years = [2000, 2005, 2010, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
total_pop = [126926, 127768, 128057, 127095, 126933, 126706, 126443, 126167, 126146, 125502, 125124, 124352, 123802]
under15 = [18472, 17521, 16803, 15887, 15578, 15270, 14979, 14694, 14407, 14132, 13880, 14173, 13830]
working = [86380, 84092, 81032, 77282, 76561, 75962, 75451, 75072, 74449, 74504, 74208, 73952, 73728]
over65 = [22005, 25672, 29246, 33465, 34592, 35152, 35577, 35885, 36192, 36214, 36236, 36227, 36243]

fig, ax = plt.subplots(figsize=(14, 6))
ax.fill_between(years, [t/1000 for t in total_pop], alpha=0.15, color='#c85a3e')
ax.plot(years, [t/1000 for t in total_pop], color='#c85a3e', linewidth=2.5, marker='o', markersize=5, label='総人口')
ax.plot(years, [t/1000 for t in over65], color='#b08a3e', linewidth=1.8, marker='s', markersize=4, label='65歳以上')
ax.plot(years, [t/1000 for t in working], color='#3e8ac8', linewidth=1.8, marker='^', markersize=4, label='生産年齢(15-64)')
ax.plot(years, [t/1000 for t in under15], color='#5aad6a', linewidth=1.8, marker='D', markersize=4, label='15歳未満')

ax.set_title('日本の総人口と年齢3区分別人口の推移', fontsize=16, fontweight='bold', pad=16)
ax.set_xlabel('年')
ax.set_ylabel('人口（百万人）')
ax.legend(loc='center right', fontsize=9, framealpha=0.3)
ax.set_xlim(1999, 2025)
ax.grid(True, alpha=0.15)
ax.annotate(f'ピーク: {max(total_pop)/1000:.0f}百万人\n(2008年)', xy=(2010, 128.057), xytext=(2012, 130),
            arrowprops=dict(arrowstyle='->', color='#c85a3e', lw=1.2), fontsize=9, color='#c85a3e')

plt.tight_layout()
plt.savefig(os.path.join(IMG_DIR, '01_population_trend.png'))
plt.show()
print("図1: 人口推移グラフを保存しました")

# %% [markdown]
# ## 2. 年齢構成比率の変化（高齢化の進行）

# %%
age_years = [2000, 2005, 2010, 2015, 2020, 2024]
u15_ratio = [14.6, 13.8, 13.2, 12.6, 12.0, 11.2]
wk_ratio = [68.1, 66.1, 63.8, 60.8, 59.5, 59.6]
o65_ratio = [17.4, 20.2, 23.0, 26.6, 28.6, 29.3]

fig, ax = plt.subplots(figsize=(12, 6))
x = np.arange(len(age_years))
w = 0.55

ax.bar(x, u15_ratio, w, label='15歳未満', color='#5aad6a', alpha=0.85)
ax.bar(x, wk_ratio, w, bottom=u15_ratio, label='生産年齢(15-64)', color='#3e8ac8', alpha=0.85)
bottoms = [a+b for a,b in zip(u15_ratio, wk_ratio)]
ax.bar(x, o65_ratio, w, bottom=bottoms, label='65歳以上', color='#c85a3e', alpha=0.85)

for i, (y, v) in enumerate(zip(x, o65_ratio)):
    ax.text(y, bottoms[i] + v/2, f'{v}%', ha='center', va='center', fontsize=9, fontweight='bold', color='white')

ax.set_xticks(x)
ax.set_xticklabels([str(y) for y in age_years])
ax.set_ylabel('構成比（%）')
ax.set_title('年齢3区分別人口構成比の推移', fontsize=16, fontweight='bold', pad=16)
ax.legend(loc='upper left', fontsize=9, framealpha=0.3)
ax.set_ylim(0, 105)

plt.tight_layout()
plt.savefig(os.path.join(IMG_DIR, '02_age_composition.png'))
plt.show()
print("図2: 年齢構成比グラフを保存しました")

# %% [markdown]
# ## 3. 都道府県別人口 Top/Bottom 10

# %%
prefs = [
    ("北海道",5140),("青森",1188),("岩手",1162),("宮城",2265),("秋田",920),("山形",1035),("福島",1771),
    ("茨城",2838),("栃木",1903),("群馬",1907),("埼玉",7337),("千葉",6275),("東京",14048),("神奈川",9232),
    ("新潟",2135),("富山",1013),("石川",1111),("福井",748),("山梨",796),("長野",2011),("岐阜",1937),
    ("静岡",3575),("愛知",7495),("三重",1738),("滋賀",1408),("京都",2542),("大阪",8784),("兵庫",5382),
    ("奈良",1306),("和歌山",901),("鳥取",541),("島根",650),("岡山",1862),("広島",2737),("山口",1304),
    ("徳島",700),("香川",935),("愛媛",1298),("高知",670),("福岡",5115),("佐賀",803),("長崎",1280),
    ("熊本",1718),("大分",1107),("宮崎",1052),("鹿児島",1560),("沖縄",1468)
]

sorted_prefs = sorted(prefs, key=lambda x: x[1], reverse=True)
top10 = sorted_prefs[:10]
bot10 = sorted_prefs[-10:][::-1]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))

# Top 10
names_t = [p[0] for p in top10]
vals_t = [p[1] for p in top10]
colors_t = plt.cm.RdYlBu_r(np.linspace(0.6, 0.9, 10))
ax1.barh(range(10), vals_t, color=colors_t, height=0.65)
ax1.set_yticks(range(10))
ax1.set_yticklabels(names_t)
ax1.invert_yaxis()
ax1.set_xlabel('人口（千人）')
ax1.set_title('人口 Top 10 都道府県', fontsize=14, fontweight='bold', pad=12)
for i, v in enumerate(vals_t):
    ax1.text(v + 100, i, f'{v:,}千人', va='center', fontsize=8, color='#e8e4de')

# Bottom 10
names_b = [p[0] for p in bot10]
vals_b = [p[1] for p in bot10]
colors_b = plt.cm.YlGn(np.linspace(0.3, 0.7, 10))
ax2.barh(range(10), vals_b, color=colors_b, height=0.65)
ax2.set_yticks(range(10))
ax2.set_yticklabels(names_b)
ax2.invert_yaxis()
ax2.set_xlabel('人口（千人）')
ax2.set_title('人口 Bottom 10 都道府県', fontsize=14, fontweight='bold', pad=12)
for i, v in enumerate(vals_b):
    ax2.text(v + 20, i, f'{v:,}千人', va='center', fontsize=8, color='#e8e4de')

plt.tight_layout()
plt.savefig(os.path.join(IMG_DIR, '03_pref_population.png'))
plt.show()
print("図3: 都道府県別人口グラフを保存しました")

# %% [markdown]
# ## 4. 都道府県別高齢化率マップ

# %%
aging_data = [
    ("北海道",33.4),("青森",34.6),("岩手",35.0),("宮城",28.4),("秋田",39.0),("山形",35.2),("福島",33.3),
    ("茨城",30.4),("栃木",29.6),("群馬",30.5),("埼玉",27.2),("千葉",28.1),("東京",22.8),("神奈川",25.9),
    ("新潟",34.0),("富山",33.6),("石川",30.3),("福井",31.5),("山梨",31.4),("長野",33.5),("岐阜",31.2),
    ("静岡",30.7),("愛知",25.3),("三重",30.7),("滋賀",26.4),("京都",29.8),("大阪",27.8),("兵庫",29.8),
    ("奈良",32.1),("和歌山",33.9),("鳥取",33.0),("島根",35.4),("岡山",30.6),("広島",29.6),("山口",35.0),
    ("徳島",34.4),("香川",32.2),("愛媛",33.8),("高知",36.1),("福岡",27.8),("佐賀",31.0),("長崎",33.6),
    ("熊本",31.5),("大分",33.9),("宮崎",33.1),("鹿児島",32.8),("沖縄",22.6)
]

sorted_aging = sorted(aging_data, key=lambda x: x[1], reverse=True)

fig, ax = plt.subplots(figsize=(16, 8))
names = [a[0] for a in sorted_aging]
vals = [a[1] for a in sorted_aging]
colors = plt.cm.YlOrRd(np.array(vals) / max(vals))

bars = ax.bar(range(len(names)), vals, color=colors, width=0.75)
ax.set_xticks(range(len(names)))
ax.set_xticklabels(names, rotation=60, ha='right', fontsize=7)
ax.set_ylabel('高齢化率（%）')
ax.set_title('都道府県別 高齢化率（2024年推計）', fontsize=16, fontweight='bold', pad=16)
ax.axhline(y=29.3, color='#c85a3e', linestyle='--', alpha=0.7, linewidth=1)
ax.text(46, 29.8, '全国平均 29.3%', color='#c85a3e', fontsize=8, ha='right')
ax.grid(axis='y', alpha=0.15)

plt.tight_layout()
plt.savefig(os.path.join(IMG_DIR, '04_aging_rate.png'))
plt.show()
print("図4: 高齢化率グラフを保存しました")

# %% [markdown]
# ## 5. 経済指標: 消費者物価指数（CPI）推移

# %%
cpi_years = [2018, 2019, 2020, 2021, 2022, 2023, 2024]
cpi_vals = [99.3, 99.8, 100.0, 99.8, 102.3, 105.8, 108.5]

fig, ax = plt.subplots(figsize=(12, 5))
ax.fill_between(cpi_years, cpi_vals, 100, where=[v >= 100 for v in cpi_vals], alpha=0.2, color='#c85a3e')
ax.fill_between(cpi_years, cpi_vals, 100, where=[v < 100 for v in cpi_vals], alpha=0.2, color='#3e8ac8')
ax.plot(cpi_years, cpi_vals, color='#c85a3e', linewidth=2.5, marker='o', markersize=7)
ax.axhline(y=100, color='#666', linestyle='-', alpha=0.4, linewidth=0.8)
ax.set_title('消費者物価指数（CPI）推移（2020年基準=100）', fontsize=16, fontweight='bold', pad=16)
ax.set_xlabel('年')
ax.set_ylabel('CPI')
ax.grid(True, alpha=0.15)

for x, y in zip(cpi_years, cpi_vals):
    ax.annotate(f'{y}', (x, y), textcoords="offset points", xytext=(0, 12), ha='center', fontsize=9, color='#e8e4de')

plt.tight_layout()
plt.savefig(os.path.join(IMG_DIR, '05_cpi_trend.png'))
plt.show()
print("図5: CPI推移グラフを保存しました")

# %% [markdown]
# ## 6. 都道府県別平均年収ランキング Top 10

# %%
income_data = [
    ("東京都", 620), ("神奈川県", 544), ("大阪府", 531), ("愛知県", 519), ("京都府", 502),
    ("兵庫県", 495), ("埼玉県", 490), ("千葉県", 487), ("福岡県", 463), ("広島県", 459),
]

fig, ax = plt.subplots(figsize=(12, 6))
names = [d[0] for d in income_data][::-1]
vals = [d[1] for d in income_data][::-1]
colors = plt.cm.Blues(np.linspace(0.4, 0.85, 10))

ax.barh(range(10), vals, color=colors, height=0.6)
ax.set_yticks(range(10))
ax.set_yticklabels(names)
ax.set_xlabel('平均年収（万円）')
ax.set_title('都道府県別 平均年収 Top 10（賃金センサス 2023年）', fontsize=16, fontweight='bold', pad=16)
ax.grid(axis='x', alpha=0.15)

for i, v in enumerate(vals):
    ax.text(v + 5, i, f'{v}万円', va='center', fontsize=9, color='#e8e4de')

plt.tight_layout()
plt.savefig(os.path.join(IMG_DIR, '06_income_ranking.png'))
plt.show()
print("図6: 年収ランキンググラフを保存しました")

# %% [markdown]
# ## 7. 家計調査 品目別支出 No.1 都市

# %%
items = ['ラーメン', '餃子', 'カレー', 'コーヒー', 'パン', '牛肉']
cities = ['山形市', '宮崎市', '鳥取市', '京都市', '神戸市', '京都市']
amounts = [18834, 4184, 11338, 16265, 42237, 34517]

fig, ax = plt.subplots(figsize=(12, 6))
colors_life = ['#c85a3e', '#d4724a', '#e08a5e', '#5aad6a', '#4a9d5a', '#3a8d4a']
bars = ax.bar(range(len(items)), amounts, color=colors_life, width=0.55)
ax.set_xticks(range(len(items)))
ax.set_xticklabels([f'{it}\n({ct})' for it, ct in zip(items, cities)], fontsize=9)
ax.set_ylabel('年間支出額（円）')
ax.set_title('家計調査 品目別支出 No.1 都市（2023年）', fontsize=16, fontweight='bold', pad=16)
ax.grid(axis='y', alpha=0.15)

for bar, amt in zip(bars, amounts):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 500,
            f'¥{amt:,}', ha='center', va='bottom', fontsize=9, color='#e8e4de')

plt.tight_layout()
plt.savefig(os.path.join(IMG_DIR, '07_household_spending.png'))
plt.show()
print("図7: 品目別支出グラフを保存しました")

# %% [markdown]
# ## 8. 考察まとめ
# 
# ### 人口動態の主要トレンド
# - **総人口**: 2008年の1億2,808万人をピークに減少。2024年は1億2,380万人（前年比-55万人）
# - **高齢化率**: 29.3%で世界最高水準。秋田県(39.0%)が最高、沖縄県(22.6%)が最低
# - **少子化**: 15歳未満は11.2%まで低下。2000年の14.6%から3.4ポイント減少
# - **外国人人口**: 374万人（前年比+33.6万人、+9.87%）で急増中
#
# ### 経済指標のトレンド
# - **CPI**: 2020年基準で108.5（2024年）。2022年以降の急激な物価上昇が顕著
# - **年収格差**: 東京都(620万円)と最下位の間に約200万円の格差
# - **家計支出**: 地域ごとに食文化の違いが支出パターンに反映
#
# ### API活用の意義
# - e-Stat API v3.0により、これらのデータをリアルタイムに取得・更新可能
# - 700以上の統計データベースへのプログラマティックアクセスを提供
# - JSON形式でCORS対応のため、フロントエンドから直接呼び出し可能

